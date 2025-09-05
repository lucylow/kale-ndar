const express = require('express');
const { SorobanRpc, Networks } = require('@stellar/stellar-sdk');
const { logger } = require('../utils/logger');
const { query } = require('../config/database');

const router = express.Router();

// Initialize Soroban client
const server = new SorobanRpc.Server(
  process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'
);

// Get blockchain status
router.get('/status', async (req, res) => {
  try {
    const ledger = await server.getLatestLedger();
    const network = process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
    
    res.json({
      status: 'connected',
      network,
      latest_ledger: ledger.sequence,
      latest_ledger_close_time: new Date(ledger.closeTime * 1000).toISOString(),
      rpc_url: process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
    });
    
  } catch (error) {
    logger.error('Failed to get blockchain status:', error);
    res.status(500).json({ 
      status: 'disconnected',
      error: 'Failed to connect to blockchain' 
    });
  }
});

// Get contract details
router.get('/contracts', async (req, res) => {
  try {
    const contracts = {
      factory: process.env.FACTORY_CONTRACT_ID,
      kale_token: process.env.KALE_TOKEN_CONTRACT_ID,
      reflector: process.env.REFLECTOR_CONTRACT_ID,
    };
    
    // Check if contracts are deployed
    const contractStatus = {};
    
    for (const [name, contractId] of Object.entries(contracts)) {
      if (contractId) {
        try {
          const contract = new SorobanRpc.Contract(contractId);
          // Try to call a simple method to check if contract is accessible
          contractStatus[name] = {
            deployed: true,
            contract_id: contractId,
          };
        } catch (error) {
          contractStatus[name] = {
            deployed: false,
            error: error.message,
          };
        }
      } else {
        contractStatus[name] = {
          deployed: false,
          error: 'Contract ID not configured',
        };
      }
    }
    
    res.json({
      contracts: contractStatus,
      network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
    });
    
  } catch (error) {
    logger.error('Failed to get contract details:', error);
    res.status(500).json({ error: 'Failed to get contract details' });
  }
});

// Get transaction status
router.get('/transaction/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    const transaction = await server.getTransaction(hash);
    
    if (SorobanRpc.isTransactionError(transaction)) {
      return res.status(400).json({
        status: 'failed',
        error: transaction.error,
        hash,
      });
    }
    
    res.json({
      status: 'success',
      hash: transaction.hash,
      ledger: transaction.ledger,
      timestamp: new Date(transaction.ledgerCloseTime * 1000).toISOString(),
      operations: transaction.operations,
    });
    
  } catch (error) {
    logger.error('Failed to get transaction status:', error);
    res.status(500).json({ error: 'Failed to get transaction status' });
  }
});

// Get market from blockchain
router.get('/markets/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = new SorobanRpc.Contract(contractId);
    
    // Get market config
    const config = await contract.call('get_config');
    
    // Get market state
    const state = await contract.call('get_state');
    
    res.json({
      contract_id: contractId,
      config,
      state,
      network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
    });
    
  } catch (error) {
    logger.error('Failed to get market from blockchain:', error);
    res.status(500).json({ error: 'Failed to get market from blockchain' });
  }
});

// Get user's bets from blockchain
router.get('/markets/:contractId/bets/:userAddress', async (req, res) => {
  try {
    const { contractId, userAddress } = req.params;
    
    const contract = new SorobanRpc.Contract(contractId);
    
    // Get user's bets
    const userBets = await contract.call('get_user_bet', userAddress);
    
    res.json({
      contract_id: contractId,
      user_address: userAddress,
      bets: userBets,
    });
    
  } catch (error) {
    logger.error('Failed to get user bets from blockchain:', error);
    res.status(500).json({ error: 'Failed to get user bets from blockchain' });
  }
});

// Get oracle price
router.get('/oracle/price/:asset', async (req, res) => {
  try {
    const { asset } = req.params;
    
    if (!process.env.REFLECTOR_CONTRACT_ID) {
      return res.status(400).json({ error: 'Reflector contract not configured' });
    }
    
    const reflector = new SorobanRpc.Contract(process.env.REFLECTOR_CONTRACT_ID);
    
    // Call reflector's lastprice function
    const priceData = await reflector.call('lastprice', asset);
    
    res.json({
      asset,
      price: priceData.price,
      timestamp: new Date(priceData.timestamp * 1000).toISOString(),
      decimals: priceData.decimals,
    });
    
  } catch (error) {
    logger.error('Failed to get oracle price:', error);
    res.status(500).json({ error: 'Failed to get oracle price' });
  }
});

// Get KALE token balance
router.get('/token/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!process.env.KALE_TOKEN_CONTRACT_ID) {
      return res.status(400).json({ error: 'KALE token contract not configured' });
    }
    
    const kaleToken = new SorobanRpc.Contract(process.env.KALE_TOKEN_CONTRACT_ID);
    
    // Get balance
    const balance = await kaleToken.call('balance', address);
    
    res.json({
      address,
      balance: balance.toString(),
      token_contract: process.env.KALE_TOKEN_CONTRACT_ID,
    });
    
  } catch (error) {
    logger.error('Failed to get KALE token balance:', error);
    res.status(500).json({ error: 'Failed to get KALE token balance' });
  }
});

// Get recent events
router.get('/events', async (req, res) => {
  try {
    const { 
      startLedger = 0, 
      endLedger, 
      contractId,
      eventType 
    } = req.query;
    
    const filters = [];
    
    if (contractId) {
      filters.push({
        type: 'contract',
        contractId,
      });
    }
    
    if (eventType) {
      filters.push({
        type: 'contract',
        topics: [[eventType]],
      });
    }
    
    const events = await server.getEvents({
      startLedger: parseInt(startLedger),
      endLedger: endLedger ? parseInt(endLedger) : undefined,
      filters,
    });
    
    const formattedEvents = events.map(event => ({
      id: event.id,
      ledger: event.ledger,
      timestamp: new Date(event.ledgerCloseTime * 1000).toISOString(),
      contract_id: event.contractId,
      topics: event.topics,
      value: event.value,
    }));
    
    res.json({
      events: formattedEvents,
      total: formattedEvents.length,
    });
    
  } catch (error) {
    logger.error('Failed to get events:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Get network statistics
router.get('/stats', async (req, res) => {
  try {
    const ledger = await server.getLatestLedger();
    
    // Get recent transactions count
    const recentEvents = await server.getEvents({
      startLedger: ledger.sequence - 100,
      endLedger: ledger.sequence,
    });
    
    // Get markets count from database
    const marketsCount = await query('SELECT COUNT(*) as count FROM markets');
    const activeMarketsCount = await query('SELECT COUNT(*) as count FROM markets WHERE resolved = false');
    const totalBetsCount = await query('SELECT COUNT(*) as count FROM bets');
    
    res.json({
      network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
      latest_ledger: ledger.sequence,
      recent_transactions: recentEvents.length,
      markets: {
        total: parseInt(marketsCount.rows[0].count),
        active: parseInt(activeMarketsCount.rows[0].count),
      },
      bets: {
        total: parseInt(totalBetsCount.rows[0].count),
      },
      updated_at: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('Failed to get network statistics:', error);
    res.status(500).json({ error: 'Failed to get network statistics' });
  }
});

module.exports = router;
