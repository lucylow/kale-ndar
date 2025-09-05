import { DataLayerService } from '../services/data-layer.service';
import { getDataLayerConfig } from '../config/data-layer.config';
import { logger } from '../utils/logger';

/**
 * Example usage of the KALE-ndar Data Layer
 * This demonstrates how to use TimescaleDB, Redis Cluster, IPFS Cluster, and MongoDB Atlas
 */
export class DataLayerExample {
  private dataLayer: DataLayerService;

  constructor() {
    const config = getDataLayerConfig();
    this.dataLayer = new DataLayerService(config);
  }

  /**
   * Initialize the data layer
   */
  async initialize(): Promise<void> {
    try {
      await this.dataLayer.initialize();
      logger.info('✅ Data layer example initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize data layer example:', error);
      throw error;
    }
  }

  /**
   * Example: Store a farming event with full data layer integration
   */
  async exampleStoreFarmingEvent(): Promise<void> {
    try {
      const farmingEvent = {
        eventTime: new Date(),
        farmer: 'GAFARMERPUBLICKEY123456789012345678901234567890123456789012345678901234567890',
        stakedAmount: '1000000000', // 1000 KALE tokens (assuming 6 decimals)
        workHash: '0xdeadbeefworkhash123456789012345678901234567890123456789012345678901234567890',
        reward: '50000000', // 50 KALE tokens reward
        blockNumber: 12345,
        transactionHash: '0xabcdef123456789012345678901234567890123456789012345678901234567890',
      };

      const result = await this.dataLayer.storeFarmingEvent(farmingEvent);
      
      logger.info('Farming event stored:', {
        timescaleDB: result.timescaleDB.id,
        ipfs: result.ipfs?.cid,
        redis: result.redis,
      });
    } catch (error) {
      logger.error('Failed to store farming event:', error);
    }
  }

  /**
   * Example: Cache leaderboard data
   */
  async exampleCacheLeaderboard(): Promise<void> {
    try {
      const leaderboardData = {
        name: 'top_farmers',
        entries: [
          { address: 'GAFARMER1', score: 1000, rank: 1 },
          { address: 'GAFARMER2', score: 800, rank: 2 },
          { address: 'GAFARMER3', score: 600, rank: 3 },
        ],
        ttl: 300, // 5 minutes
      };

      await this.dataLayer.cacheLeaderboard(leaderboardData);
      logger.info('Leaderboard cached successfully');
    } catch (error) {
      logger.error('Failed to cache leaderboard:', error);
    }
  }

  /**
   * Example: Upload proof to IPFS
   */
  async exampleUploadProof(): Promise<void> {
    try {
      const proofData = {
        farmer: 'GAFARMER1',
        blockNumber: 12345,
        proofData: {
          workHash: '0xproofhash123456789012345678901234567890123456789012345678901234567890',
          nonce: 42,
          timestamp: new Date().toISOString(),
          signature: '0xsig123456789012345678901234567890123456789012345678901234567890',
        },
      };

      const result = await this.dataLayer.uploadProof(proofData);
      logger.info('Proof uploaded to IPFS:', { cid: result.cid });
    } catch (error) {
      logger.error('Failed to upload proof:', error);
    }
  }

  /**
   * Example: Upload log to IPFS
   */
  async exampleUploadLog(): Promise<void> {
    try {
      const logData = {
        type: 'farming_events',
        entries: [
          { farmer: 'GAFARMER1', event: 'stake', amount: '1000', timestamp: new Date().toISOString() },
          { farmer: 'GAFARMER2', event: 'unstake', amount: '500', timestamp: new Date().toISOString() },
          { farmer: 'GAFARMER3', event: 'claim', amount: '100', timestamp: new Date().toISOString() },
        ],
      };

      const result = await this.dataLayer.uploadLog(logData);
      logger.info('Log uploaded to IPFS:', { cid: result.cid });
    } catch (error) {
      logger.error('Failed to upload log:', error);
    }
  }

  /**
   * Example: Manage user profile
   */
  async exampleUserProfile(): Promise<void> {
    try {
      const userAddress = 'GAFARMER1';

      // Create/update user profile
      const userProfile = await this.dataLayer.updateUserProfile(userAddress, {
        username: 'farmmaster',
        email: 'farmmaster@example.com',
        preferences: {
          notifications: true,
          theme: 'dark',
        },
        metadata: {
          joinDate: new Date().toISOString(),
          referralCode: 'FARM123',
        },
      });

      logger.info('User profile updated:', userProfile);

      // Get user profile
      const retrievedProfile = await this.dataLayer.getUserProfile(userAddress);
      logger.info('Retrieved user profile:', retrievedProfile);
    } catch (error) {
      logger.error('Failed to manage user profile:', error);
    }
  }

  /**
   * Example: Store market data
   */
  async exampleMarketData(): Promise<void> {
    try {
      // Store market metadata in MongoDB
      const marketMetadata = await this.dataLayer.storeMarketMetadata({
        market_id: 'market_123',
        creator_address: 'GCREATOR123456789012345678901234567890123456789012345678901234567890',
        description: 'Will KALE price reach $1 by end of month?',
        asset_symbol: 'KALE',
        target_price: '1000000', // $1.00 (assuming 6 decimals)
        condition: 1, // Greater than
        resolve_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        kale_token_address: 'KALE123456789012345678901234567890123456789012345678901234567890',
        reflector_contract_address: 'REFLECTOR123456789012345678901234567890123456789012345678901234567890',
      });

      logger.info('Market metadata stored:', marketMetadata);

      // Store market data point in TimescaleDB
      const marketData = await this.dataLayer.storeMarketData({
        timestamp: new Date(),
        market_id: 'market_123',
        price: '950000', // $0.95
        volume: '5000000000', // 5000 KALE
        liquidity: '10000000000', // 10000 KALE
        participants: 25,
      });

      logger.info('Market data stored:', marketData);

      // Cache market data in Redis
      await this.dataLayer.cacheMarketData('market_123', {
        currentPrice: '950000',
        volume24h: '5000000000',
        liquidity: '10000000000',
        participants: 25,
        lastUpdate: new Date().toISOString(),
      }, 60); // 1 minute TTL

      logger.info('Market data cached in Redis');
    } catch (error) {
      logger.error('Failed to store market data:', error);
    }
  }

  /**
   * Example: Store bet metadata
   */
  async exampleBetMetadata(): Promise<void> {
    try {
      const betMetadata = await this.dataLayer.storeBetMetadata({
        bet_id: 'bet_123',
        market_id: 'market_123',
        user_address: 'GBETTOR123456789012345678901234567890123456789012345678901234567890',
        amount: '100000000', // 100 KALE
        side: true, // For
        transaction_hash: '0xbet123456789012345678901234567890123456789012345678901234567890',
        metadata: {
          odds: '1.5',
          expectedReturn: '150000000',
          timestamp: new Date().toISOString(),
        },
      });

      logger.info('Bet metadata stored:', betMetadata);
    } catch (error) {
      logger.error('Failed to store bet metadata:', error);
    }
  }

  /**
   * Example: Cache price data
   */
  async exampleCachePriceData(): Promise<void> {
    try {
      await this.dataLayer.cachePriceData('KALE', {
        price: '950000', // $0.95
        change24h: '50000', // +$0.05
        changePercent24h: '5.56',
        volume24h: '5000000000',
        marketCap: '95000000000',
        lastUpdate: new Date().toISOString(),
      }, 30); // 30 seconds TTL

      logger.info('Price data cached successfully');

      // Retrieve cached price data
      const cachedPrice = await this.dataLayer.getCachedPriceData('KALE');
      logger.info('Cached price data:', cachedPrice);
    } catch (error) {
      logger.error('Failed to cache price data:', error);
    }
  }

  /**
   * Example: Store block data
   */
  async exampleBlockData(): Promise<void> {
    try {
      const blockData = await this.dataLayer.storeBlockData({
        block_number: 12345,
        timestamp: new Date(),
        hash: '0xblock123456789012345678901234567890123456789012345678901234567890',
        previous_hash: '0xprev123456789012345678901234567890123456789012345678901234567890',
        transactions_count: 150,
        total_fees: '1000000', // 1 KALE
        miner_reward: '5000000', // 5 KALE
      });

      logger.info('Block data stored:', blockData);
    } catch (error) {
      logger.error('Failed to store block data:', error);
    }
  }

  /**
   * Example: Get farming statistics
   */
  async exampleFarmingStats(): Promise<void> {
    try {
      const stats = await this.dataLayer.getFarmingStats(
        'GAFARMER1',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        new Date()
      );

      logger.info('Farming statistics:', stats);
    } catch (error) {
      logger.error('Failed to get farming stats:', error);
    }
  }

  /**
   * Example: Get leaderboard
   */
  async exampleGetLeaderboard(): Promise<void> {
    try {
      const leaderboard = await this.dataLayer.getLeaderboard('farming_rewards', {
        limit: 10,
        withScores: true,
      });

      logger.info('Leaderboard:', leaderboard);
    } catch (error) {
      logger.error('Failed to get leaderboard:', error);
    }
  }

  /**
   * Example: Health check
   */
  async exampleHealthCheck(): Promise<void> {
    try {
      const health = await this.dataLayer.getHealthStatus();
      logger.info('Data layer health:', health);

      const connections = await this.dataLayer.testConnections();
      logger.info('Connection tests:', connections);
    } catch (error) {
      logger.error('Failed to perform health check:', error);
    }
  }

  /**
   * Run all examples
   */
  async runAllExamples(): Promise<void> {
    try {
      logger.info('🚀 Running all data layer examples...');

      await this.exampleStoreFarmingEvent();
      await this.exampleCacheLeaderboard();
      await this.exampleUploadProof();
      await this.exampleUploadLog();
      await this.exampleUserProfile();
      await this.exampleMarketData();
      await this.exampleBetMetadata();
      await this.exampleCachePriceData();
      await this.exampleBlockData();
      await this.exampleFarmingStats();
      await this.exampleGetLeaderboard();
      await this.exampleHealthCheck();

      logger.info('✅ All examples completed successfully');
    } catch (error) {
      logger.error('❌ Examples failed:', error);
    }
  }

  /**
   * Close the data layer
   */
  async close(): Promise<void> {
    try {
      await this.dataLayer.close();
      logger.info('Data layer example closed');
    } catch (error) {
      logger.error('Error closing data layer example:', error);
    }
  }
}

// Example usage
async function main() {
  const example = new DataLayerExample();
  
  try {
    await example.initialize();
    await example.runAllExamples();
  } catch (error) {
    logger.error('Example failed:', error);
  } finally {
    await example.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default DataLayerExample;
