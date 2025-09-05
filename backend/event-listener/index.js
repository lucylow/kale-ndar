const { SorobanRpc } = require('@stellar/stellar-sdk');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { broadcastToAll, broadcastToMarket } = require('../utils/websocket');
require('dotenv').config();

class EventListener {
  constructor() {
    this.rpcUrl = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
    this.server = new SorobanRpc.Server(this.rpcUrl);
    this.factoryContractId = process.env.FACTORY_CONTRACT_ID;
    this.lastLedger = 0;
    this.isRunning = false;
    this.pollInterval = 5000; // 5 seconds
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Event listener is already running');
      return;
    }

    try {
      logger.info('🚀 Starting KALE-ndar event listener...');
      
      // Get current ledger to start from
      const ledger = await this.server.getLatestLedger();
      this.lastLedger = ledger.sequence;
      
      logger.info(`📊 Starting from ledger ${this.lastLedger}`);
      
      this.isRunning = true;
      
      // Start polling
      this.pollEvents();
      
      // Set up interval for continuous polling
      this.pollIntervalId = setInterval(() => {
        this.pollEvents();
      }, this.pollInterval);
      
      logger.info('✅ Event listener started successfully');
      
    } catch (error) {
      logger.error('❌ Failed to start event listener:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    logger.info('🛑 Stopping event listener...');
    
    this.isRunning = false;
    
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
    }
    
    logger.info('✅ Event listener stopped');
  }

  async pollEvents() {
    if (!this.isRunning) return;

    try {
      const currentLedger = await this.server.getLatestLedger();
      
      if (currentLedger.sequence <= this.lastLedger) {
        return;
      }
      
      logger.debug(`Polling events from ledger ${this.lastLedger + 1} to ${currentLedger.sequence}`);
      
      const events = await this.server.getEvents({
        startLedger: this.lastLedger + 1,
        endLedger: currentLedger.sequence,
        filters: [
          // Factory contract events
          {
            type: 'contract',
            contractId: this.factoryContractId,
            topics: [['market_created']]
          },
          // Market contract events
          {
            type: 'contract',
            topics: [['resolved']]
          },
          {
            type: 'contract',
            topics: [['winnings_claimed']]
          },
          {
            type: 'contract',
            topics: [['bet_for']]
          },
          {
            type: 'contract',
            topics: [['bet_against']]
          }
        ]
      });
      
      logger.info(`📡 Found ${events.length} events`);
      
      for (const event of events) {
        await this.handleEvent(event);
      }
      
      this.lastLedger = currentLedger.sequence;
      
    } catch (error) {
      logger.error('Error polling events:', error);
    }
  }

  async handleEvent(event) {
    try {
      const eventType = event.topics[0].toString();
      
      logger.info(`🔄 Processing event: ${eventType}`, {
        ledger: event.ledger,
        contractId: event.contractId,
      });
      
      switch (eventType) {
        case 'market_created':
          await this.handleMarketCreated(event);
          break;
          
        case 'resolved':
          await this.handleMarketResolved(event);
          break;
          
        case 'winnings_claimed':
          await this.handleWinningsClaimed(event);
          break;
          
        case 'bet_for':
        case 'bet_against':
          await this.handleBetPlaced(event);
          break;
          
        default:
          logger.warn(`Unknown event type: ${eventType}`);
      }
      
    } catch (error) {
      logger.error('Error handling event:', error);
    }
  }

  async handleMarketCreated(event) {
    try {
      const marketId = event.value.contract_id;
      const creator = event.topics[1].toString();
      
      logger.info('🏪 New market created:', { marketId, creator });
      
      // Store event in database
      await query(`
        INSERT INTO market_events (market_id, event_type, event_data, block_number, transaction_hash)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        marketId,
        'market_created',
        JSON.stringify({
          creator,
          contract_id: marketId,
          timestamp: new Date(event.ledgerCloseTime * 1000).toISOString(),
        }),
        event.ledger,
        event.transactionHash,
      ]);
      
      // Broadcast to all connected clients
      broadcastToAll({
        type: 'market_created',
        data: {
          id: marketId,
          creator,
          timestamp: new Date(event.ledgerCloseTime * 1000).toISOString(),
        },
      });
      
    } catch (error) {
      logger.error('Error handling market created event:', error);
    }
  }

  async handleMarketResolved(event) {
    try {
      const marketId = event.contractId;
      const outcome = event.value;
      
      logger.info('✅ Market resolved:', { marketId, outcome });
      
      // Update market in database
      await query(`
        UPDATE markets 
        SET resolved = true, outcome = $1
        WHERE id = $2
      `, [outcome, marketId]);
      
      // Store event
      await query(`
        INSERT INTO market_events (market_id, event_type, event_data, block_number, transaction_hash)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        marketId,
        'resolved',
        JSON.stringify({
          outcome,
          timestamp: new Date(event.ledgerCloseTime * 1000).toISOString(),
        }),
        event.ledger,
        event.transactionHash,
      ]);
      
      // Get market details for broadcast
      const marketResult = await query('SELECT * FROM markets WHERE id = $1', [marketId]);
      const market = marketResult.rows[0];
      
      // Broadcast to all clients
      broadcastToAll({
        type: 'market_resolved',
        data: {
          id: marketId,
          outcome,
          description: market?.description,
          total_for: market?.total_for,
          total_against: market?.total_against,
        },
      });
      
    } catch (error) {
      logger.error('Error handling market resolved event:', error);
    }
  }

  async handleWinningsClaimed(event) {
    try {
      const user = event.topics[1].toString();
      const amount = event.value;
      
      logger.info('💰 Winnings claimed:', { user, amount });
      
      // Store event
      await query(`
        INSERT INTO market_events (market_id, event_type, event_data, block_number, transaction_hash)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        event.contractId,
        'winnings_claimed',
        JSON.stringify({
          user,
          amount,
          timestamp: new Date(event.ledgerCloseTime * 1000).toISOString(),
        }),
        event.ledger,
        event.transactionHash,
      ]);
      
      // Update user's total winnings
      await query(`
        UPDATE users 
        SET total_winnings = total_winnings + $1
        WHERE address = $2
      `, [amount, user]);
      
      // Broadcast to all clients
      broadcastToAll({
        type: 'winnings_claimed',
        data: {
          user,
          amount,
          timestamp: new Date(event.ledgerCloseTime * 1000).toISOString(),
        },
      });
      
    } catch (error) {
      logger.error('Error handling winnings claimed event:', error);
    }
  }

  async handleBetPlaced(event) {
    try {
      const user = event.topics[1].toString();
      const amount = event.value;
      const side = event.topics[0].toString() === 'bet_for';
      
      logger.info('🎲 Bet placed:', { user, amount, side });
      
      // Store event
      await query(`
        INSERT INTO market_events (market_id, event_type, event_data, block_number, transaction_hash)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        event.contractId,
        'bet_placed',
        JSON.stringify({
          user,
          amount,
          side,
          timestamp: new Date(event.ledgerCloseTime * 1000).toISOString(),
        }),
        event.ledger,
        event.transactionHash,
      ]);
      
      // Update user's total bets
      await query(`
        UPDATE users 
        SET total_bets = total_bets + $1
        WHERE address = $2
      `, [amount, user]);
      
      // Broadcast to market subscribers
      broadcastToMarket(event.contractId, {
        type: 'bet_placed',
        data: {
          user,
          amount,
          side,
          timestamp: new Date(event.ledgerCloseTime * 1000).toISOString(),
        },
      });
      
    } catch (error) {
      logger.error('Error handling bet placed event:', error);
    }
  }

  // Health check method
  async getStatus() {
    return {
      isRunning: this.isRunning,
      lastLedger: this.lastLedger,
      rpcUrl: this.rpcUrl,
      factoryContractId: this.factoryContractId,
    };
  }
}

// Create singleton instance
const eventListener = new EventListener();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down event listener');
  await eventListener.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down event listener');
  await eventListener.stop();
  process.exit(0);
});

// Start the event listener
if (require.main === module) {
  eventListener.start().catch((error) => {
    logger.error('Failed to start event listener:', error);
    process.exit(1);
  });
}

module.exports = eventListener;
