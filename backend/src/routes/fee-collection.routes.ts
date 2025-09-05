import express from 'express';
import Joi from 'joi';
import { StellarRpcService } from '../services/stellar-rpc.service';
import { KaleTokenService } from '../services/kale-token.service';
import { FeeCollectionService } from '../services/fee-collection.service';
import { logger } from '../utils/logger';
import { Keypair } from '@stellar/stellar-sdk';

const router = express.Router();

// Initialize services
const stellarConfig = {
  horizonUrl: process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org',
  networkPassphrase: process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  sorobanRpcUrl: process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  kaleTokenContractId: process.env.KALE_TOKEN_CONTRACT_ID || '',
  kaleIntegrationContractId: process.env.KALE_INTEGRATION_CONTRACT_ID || '',
  feeCollectorAddress: process.env.FEE_COLLECTOR_ADDRESS || '',
};

const kaleConfig = {
  contractId: process.env.KALE_TOKEN_CONTRACT_ID || '',
  issuerAddress: process.env.KALE_ISSUER_ADDRESS || '',
  totalSupply: process.env.KALE_TOTAL_SUPPLY || '1000000000',
  decimals: parseInt(process.env.KALE_DECIMALS || '7'),
  symbol: 'KALE',
  name: 'KALE Token',
};

const stellarRpc = new StellarRpcService(stellarConfig);
const kaleToken = new KaleTokenService(stellarRpc, kaleConfig);
const feeCollection = new FeeCollectionService(stellarRpc, kaleToken, stellarConfig.kaleIntegrationContractId, stellarConfig.feeCollectorAddress);

// Validation schemas
const collectFeesSchema = Joi.object({
  adminSecret: Joi.string().required(),
});

const updateFeeRateSchema = Joi.object({
  adminSecret: Joi.string().required(),
  newFeeRate: Joi.number().min(0).max(1).required(),
});

const updateFeeCollectorSchema = Joi.object({
  adminSecret: Joi.string().required(),
  newFeeCollector: Joi.string().required(),
});

const distributeFeesSchema = Joi.object({
  distributorSecret: Joi.string().required(),
  platformFee: Joi.string().required(),
  creatorFee: Joi.string().required(),
  creatorAddress: Joi.string().required(),
});

const calculateFeesSchema = Joi.object({
  amount: Joi.string().required(),
  feeRate: Joi.number().min(0).max(1).required(),
});

const bulkCollectionSchema = Joi.object({
  adminSecret: Joi.string().required(),
  marketIds: Joi.array().items(Joi.string()).required(),
});

// Collect platform fees (admin only)
router.post('/collect', async (req, res) => {
  try {
    const { error, value } = collectFeesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { adminSecret } = value;
    const adminKeypair = StellarRpcService.createKeypairFromSecret(adminSecret);

    const result = await feeCollection.collectFees(adminKeypair);

    res.json({
      success: true,
      data: result,
      message: 'Fees collected successfully',
    });
  } catch (error) {
    logger.error('Failed to collect fees:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to collect fees',
    });
  }
});

// Get current fee information
router.get('/info', async (req, res) => {
  try {
    const feeInfo = await feeCollection.getFeeInfo();

    res.json({
      success: true,
      data: feeInfo,
    });
  } catch (error) {
    logger.error('Failed to get fee info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fee information',
    });
  }
});

// Update fee rate (admin only)
router.post('/update-rate', async (req, res) => {
  try {
    const { error, value } = updateFeeRateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { adminSecret, newFeeRate } = value;
    const adminKeypair = StellarRpcService.createKeypairFromSecret(adminSecret);

    const result = await feeCollection.updateFeeRate(adminKeypair, newFeeRate);

    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        newFeeRate,
        admin: adminKeypair.publicKey(),
      },
      message: 'Fee rate updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update fee rate:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update fee rate',
    });
  }
});

// Update fee collector address (admin only)
router.post('/update-collector', async (req, res) => {
  try {
    const { error, value } = updateFeeCollectorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { adminSecret, newFeeCollector } = value;
    const adminKeypair = StellarRpcService.createKeypairFromSecret(adminSecret);

    if (!StellarRpcService.isValidAddress(newFeeCollector)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fee collector address',
      });
    }

    const result = await feeCollection.updateFeeCollector(adminKeypair, newFeeCollector);

    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        newFeeCollector,
        admin: adminKeypair.publicKey(),
      },
      message: 'Fee collector updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update fee collector:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update fee collector',
    });
  }
});

// Calculate fees for a transaction
router.post('/calculate', async (req, res) => {
  try {
    const { error, value } = calculateFeesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { amount, feeRate } = value;
    const feeDistribution = feeCollection.calculateFees(amount, feeRate);

    res.json({
      success: true,
      data: {
        amount,
        feeRate,
        feeDistribution,
        platformFeePercentage: (feeRate * 100).toFixed(2) + '%',
        creatorFeePercentage: (feeRate * 50).toFixed(2) + '%',
      },
    });
  } catch (error) {
    logger.error('Failed to calculate fees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate fees',
    });
  }
});

// Distribute fees to stakeholders
router.post('/distribute', async (req, res) => {
  try {
    const { error, value } = distributeFeesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { distributorSecret, platformFee, creatorFee, creatorAddress } = value;
    const distributorKeypair = StellarRpcService.createKeypairFromSecret(distributorSecret);

    if (!StellarRpcService.isValidAddress(creatorAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid creator address',
      });
    }

    const results = await feeCollection.distributeFees(
      distributorKeypair,
      platformFee,
      creatorFee,
      creatorAddress
    );

    res.json({
      success: true,
      data: {
        platformFeeTransaction: results[0],
        creatorFeeTransaction: results[1],
        distributor: distributorKeypair.publicKey(),
        creatorAddress,
      },
      message: 'Fees distributed successfully',
    });
  } catch (error) {
    logger.error('Failed to distribute fees:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to distribute fees',
    });
  }
});

// Get fee collector balance
router.get('/collector-balance', async (req, res) => {
  try {
    const balance = await feeCollection.getFeeCollectorBalance();

    res.json({
      success: true,
      data: {
        address: stellarConfig.feeCollectorAddress,
        balance,
        formattedBalance: kaleToken.fromSmallestUnit(balance),
        symbol: 'KALE',
      },
    });
  } catch (error) {
    logger.error('Failed to get fee collector balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fee collector balance',
    });
  }
});

// Get fee statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await feeCollection.getFeeStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get fee stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fee statistics',
    });
  }
});

// Check if fees can be collected
router.get('/can-collect', async (req, res) => {
  try {
    const canCollect = await feeCollection.canCollectFees();

    res.json({
      success: true,
      data: {
        canCollect,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    logger.error('Failed to check fee collection eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check fee collection eligibility',
    });
  }
});

// Get fee collection requirements
router.get('/requirements', async (req, res) => {
  try {
    const requirements = await feeCollection.getFeeCollectionRequirements();

    res.json({
      success: true,
      data: requirements,
    });
  } catch (error) {
    logger.error('Failed to get fee collection requirements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fee collection requirements',
    });
  }
});

// Schedule automatic fee collection
router.post('/schedule', async (req, res) => {
  try {
    const { intervalMinutes } = req.body;

    if (intervalMinutes && (intervalMinutes < 1 || intervalMinutes > 1440)) {
      return res.status(400).json({
        success: false,
        error: 'Interval must be between 1 and 1440 minutes',
      });
    }

    await feeCollection.scheduleFeeCollection(intervalMinutes || 60);

    res.json({
      success: true,
      data: {
        intervalMinutes: intervalMinutes || 60,
        nextCollection: new Date(Date.now() + (intervalMinutes || 60) * 60 * 1000),
      },
      message: 'Fee collection scheduled successfully',
    });
  } catch (error) {
    logger.error('Failed to schedule fee collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule fee collection',
    });
  }
});

// Process bulk fee collection
router.post('/bulk-collect', async (req, res) => {
  try {
    const { error, value } = bulkCollectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { adminSecret, marketIds } = value;
    const adminKeypair = StellarRpcService.createKeypairFromSecret(adminSecret);

    const results = await feeCollection.processBulkFeeCollection(adminKeypair, marketIds);

    res.json({
      success: true,
      data: {
        totalMarkets: marketIds.length,
        successfulCollections: results.length,
        failedCollections: marketIds.length - results.length,
        results,
      },
      message: 'Bulk fee collection completed',
    });
  } catch (error) {
    logger.error('Failed to process bulk fee collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk fee collection',
    });
  }
});

// Get fee collection history
router.get('/history', async (req, res) => {
  try {
    const { limit } = req.query;
    const historyLimit = limit ? parseInt(limit as string) : 10;

    if (historyLimit < 1 || historyLimit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100',
      });
    }

    const history = await feeCollection.getFeeCollectionHistory(historyLimit);

    res.json({
      success: true,
      data: {
        history,
        count: history.length,
        limit: historyLimit,
      },
    });
  } catch (error) {
    logger.error('Failed to get fee collection history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fee collection history',
    });
  }
});

// Get optimal fee collection timing
router.get('/optimal-timing', async (req, res) => {
  try {
    const timing = await feeCollection.getOptimalCollectionTiming();

    res.json({
      success: true,
      data: timing,
    });
  } catch (error) {
    logger.error('Failed to get optimal collection timing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get optimal collection timing',
    });
  }
});

export default router;
