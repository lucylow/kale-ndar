import express from 'express';
import { MarketResolutionService } from '../services/market-resolution.service';
import { StellarRpcService } from '../services/stellar-rpc.service';
import { MarketCreationService } from '../services/market-creation.service';
import { BettingService } from '../services/betting.service';
import { OracleService } from '../services/oracle.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

const router = express.Router();

// Initialize services (this would typically be done via dependency injection)
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
  decimals: 7,
  symbol: 'KALE',
  name: 'KALE Token',
};

const oracleConfig = {
  reflectorApiUrl: process.env.REFLECTOR_API_URL || 'https://api.reflector.network',
  reflectorWebhookUrl: process.env.REFLECTOR_WEBHOOK_URL || 'https://your-backend.com',
  xrfTokenAddress: process.env.XRF_TOKEN_ADDRESS || '',
  subscriptionBalance: process.env.SUBSCRIPTION_BALANCE || '1000',
  heartbeatInterval: 60,
  priceThreshold: 100, // 1%
};

const stellarRpc = new StellarRpcService(stellarConfig);
const kaleToken = new KaleTokenService(stellarRpc, kaleConfig);
const marketService = new MarketCreationService(stellarRpc, kaleToken, stellarConfig.kaleIntegrationContractId);
const bettingService = new BettingService(stellarRpc, kaleToken, marketService, stellarConfig.kaleIntegrationContractId);
const oracleService = new OracleService(oracleConfig);
const resolutionService = new MarketResolutionService(stellarRpc, marketService, bettingService, oracleService, stellarConfig.kaleIntegrationContractId);

// Validation schemas
const resolveMarketSchema = Joi.object({
  marketId: Joi.string().uuid().required(),
  winningOutcome: Joi.string().valid('for', 'against', 'above', 'below').required(),
  resolutionData: Joi.object().optional(),
  resolverSecret: Joi.string().required(),
  resolutionType: Joi.string().valid('manual', 'oracle', 'timeout').required(),
});

const setupTriggerSchema = Joi.object({
  marketId: Joi.string().uuid().required(),
  triggerType: Joi.string().valid('price_threshold', 'time_based', 'event_based').required(),
  triggerCondition: Joi.object().required(),
});

const setAutoResolveSchema = Joi.object({
  marketId: Joi.string().uuid().required(),
  enabled: Joi.boolean().required(),
  adminSecret: Joi.string().required(),
});

/**
 * @route POST /api/resolution/resolve
 * @desc Resolve a market manually
 */
router.post('/resolve', async (req, res) => {
  try {
    const { error, value } = resolveMarketSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const result = await resolutionService.resolveMarket(value);

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Market resolved successfully' : 'Failed to resolve market',
    });
  } catch (error) {
    logger.error('Failed to resolve market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve market',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/resolution/market/:marketId/info
 * @desc Get resolution information for a market
 */
router.get('/market/:marketId/info', async (req, res) => {
  try {
    const { marketId } = req.params;

    if (!marketId) {
      return res.status(400).json({
        success: false,
        error: 'Market ID is required',
      });
    }

    const resolutionInfo = await resolutionService.getMarketResolutionInfo(marketId);

    res.json({
      success: true,
      data: resolutionInfo,
    });
  } catch (error) {
    logger.error('Failed to get market resolution info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market resolution info',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/resolution/setup-trigger
 * @desc Set up automatic resolution trigger
 */
router.post('/setup-trigger', async (req, res) => {
  try {
    const { error, value } = setupTriggerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    await resolutionService.setupResolutionTrigger(value);

    res.json({
      success: true,
      message: 'Resolution trigger setup successfully',
    });
  } catch (error) {
    logger.error('Failed to setup resolution trigger:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup resolution trigger',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/resolution/process-oracle
 * @desc Process oracle-based resolution
 */
router.post('/process-oracle', async (req, res) => {
  try {
    const { marketId } = req.body;

    if (!marketId) {
      return res.status(400).json({
        success: false,
        error: 'Market ID is required',
      });
    }

    const result = await resolutionService.processOracleResolution(marketId);

    if (result) {
      res.json({
        success: true,
        data: result,
        message: 'Market resolved via oracle',
      });
    } else {
      res.json({
        success: false,
        message: 'Oracle resolution not triggered',
      });
    }
  } catch (error) {
    logger.error('Failed to process oracle resolution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process oracle resolution',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/resolution/process-timeout
 * @desc Process timeout-based resolution
 */
router.post('/process-timeout', async (req, res) => {
  try {
    const { marketId } = req.body;

    if (!marketId) {
      return res.status(400).json({
        success: false,
        error: 'Market ID is required',
      });
    }

    const result = await resolutionService.processTimeoutResolution(marketId);

    if (result) {
      res.json({
        success: true,
        data: result,
        message: 'Market resolved via timeout',
      });
    } else {
      res.json({
        success: false,
        message: 'Timeout resolution not triggered',
      });
    }
  } catch (error) {
    logger.error('Failed to process timeout resolution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process timeout resolution',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/resolution/pending
 * @desc Get all markets pending resolution
 */
router.get('/pending', async (req, res) => {
  try {
    const pendingMarkets = await resolutionService.getMarketsPendingResolution();

    res.json({
      success: true,
      data: pendingMarkets,
      count: pendingMarkets.length,
    });
  } catch (error) {
    logger.error('Failed to get pending markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending markets',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/resolution/process-pending
 * @desc Process all pending resolutions
 */
router.post('/process-pending', async (req, res) => {
  try {
    const results = await resolutionService.processPendingResolutions();

    res.json({
      success: true,
      data: results,
      count: results.length,
      message: `Processed ${results.length} pending resolutions`,
    });
  } catch (error) {
    logger.error('Failed to process pending resolutions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process pending resolutions',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/resolution/set-auto-resolve
 * @desc Enable/disable auto-resolve for a market
 */
router.post('/set-auto-resolve', async (req, res) => {
  try {
    const { error, value } = setAutoResolveSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    await resolutionService.setAutoResolve(value.marketId, value.enabled, value.adminSecret);

    res.json({
      success: true,
      message: `Auto-resolve ${value.enabled ? 'enabled' : 'disabled'} for market`,
    });
  } catch (error) {
    logger.error('Failed to set auto-resolve:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set auto-resolve',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/resolution/market/:marketId/history
 * @desc Get resolution history for a market
 */
router.get('/market/:marketId/history', async (req, res) => {
  try {
    const { marketId } = req.params;

    if (!marketId) {
      return res.status(400).json({
        success: false,
        error: 'Market ID is required',
      });
    }

    const history = await resolutionService.getResolutionHistory(marketId);

    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    logger.error('Failed to get resolution history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get resolution history',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/resolution/can-resolve/:marketId
 * @desc Check if a market can be resolved
 */
router.get('/can-resolve/:marketId', async (req, res) => {
  try {
    const { marketId } = req.params;
    const { type } = req.query;

    if (!marketId) {
      return res.status(400).json({
        success: false,
        error: 'Market ID is required',
      });
    }

    const market = await marketService.getMarketInfo(marketId);
    const resolutionType = (type as string) || 'manual';
    const canResolve = await resolutionService.canResolveMarket(market, resolutionType);

    res.json({
      success: true,
      data: {
        marketId,
        resolutionType,
        canResolve,
      },
    });
  } catch (error) {
    logger.error('Failed to check if market can be resolved:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check market resolution eligibility',
      message: error.message,
    });
  }
});

export default router;
