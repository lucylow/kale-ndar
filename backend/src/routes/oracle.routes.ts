import express from 'express';
import { OracleService } from '../services/oracle.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

const router = express.Router();

// Initialize oracle service
const oracleConfig = {
  reflectorApiUrl: process.env.REFLECTOR_API_URL || 'https://api.reflector.network',
  reflectorWebhookUrl: process.env.REFLECTOR_WEBHOOK_URL || 'https://your-backend.com',
  xrfTokenAddress: process.env.XRF_TOKEN_ADDRESS || '',
  subscriptionBalance: process.env.SUBSCRIPTION_BALANCE || '1000',
  heartbeatInterval: 60,
  priceThreshold: 100, // 1%
};

const oracleService = new OracleService(oracleConfig);

// Validation schemas
const createPriceFeedSubscriptionSchema = Joi.object({
  marketId: Joi.string().uuid().required(),
  baseAsset: Joi.string().required(),
  quoteAsset: Joi.string().required(),
  threshold: Joi.number().min(1).max(10000).optional(),
  heartbeat: Joi.number().min(5).max(1440).optional(),
});

const createEventDataSubscriptionSchema = Joi.object({
  marketId: Joi.string().uuid().required(),
  eventType: Joi.string().required(),
  threshold: Joi.number().min(0).optional(),
});

const getCurrentPriceSchema = Joi.object({
  baseAsset: Joi.string().required(),
  quoteAsset: Joi.string().required(),
});

const cancelSubscriptionSchema = Joi.object({
  subscriptionId: Joi.string().uuid().required(),
});

const renewSubscriptionSchema = Joi.object({
  subscriptionId: Joi.string().uuid().required(),
  additionalBalance: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
});

/**
 * @route POST /api/oracle/subscriptions/price-feed
 * @desc Create a new price feed subscription
 */
router.post('/subscriptions/price-feed', async (req, res) => {
  try {
    const { error, value } = createPriceFeedSubscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const subscription = await oracleService.createPriceFeedSubscription(
      value.marketId,
      value.baseAsset,
      value.quoteAsset,
      value.threshold || 100,
      value.heartbeat || 60
    );

    res.json({
      success: true,
      data: subscription,
      message: 'Price feed subscription created successfully',
    });
  } catch (error) {
    logger.error('Failed to create price feed subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create price feed subscription',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/oracle/subscriptions/event-data
 * @desc Create a new event data subscription
 */
router.post('/subscriptions/event-data', async (req, res) => {
  try {
    const { error, value } = createEventDataSubscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const subscription = await oracleService.createEventDataSubscription(
      value.marketId,
      value.eventType,
      value.threshold
    );

    res.json({
      success: true,
      data: subscription,
      message: 'Event data subscription created successfully',
    });
  } catch (error) {
    logger.error('Failed to create event data subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event data subscription',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/oracle/webhook
 * @desc Handle webhook notifications from Reflector
 */
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.subscriptionId || !payload.eventType) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook payload',
      });
    }

    await oracleService.handleWebhook(payload);

    res.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    logger.error('Failed to handle oracle webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/oracle/price/:baseAsset/:quoteAsset
 * @desc Get current price for an asset pair
 */
router.get('/price/:baseAsset/:quoteAsset', async (req, res) => {
  try {
    const { error, value } = getCurrentPriceSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const priceData = await oracleService.getCurrentPrice(value.baseAsset, value.quoteAsset);

    if (priceData) {
      res.json({
        success: true,
        data: priceData,
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Price data not found',
      });
    }
  } catch (error) {
    logger.error('Failed to get current price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current price',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/oracle/market/:marketId/data
 * @desc Get oracle data for a specific market
 */
router.get('/market/:marketId/data', async (req, res) => {
  try {
    const { marketId } = req.params;

    if (!marketId) {
      return res.status(400).json({
        success: false,
        error: 'Market ID is required',
      });
    }

    const oracleData = await oracleService.getOracleDataForMarket(marketId);

    if (oracleData) {
      res.json({
        success: true,
        data: oracleData,
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Oracle data not found for market',
      });
    }
  } catch (error) {
    logger.error('Failed to get oracle data for market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get oracle data',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/oracle/subscriptions
 * @desc Get all active subscriptions
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await oracleService.getActiveSubscriptions();

    res.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    logger.error('Failed to get active subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscriptions',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/oracle/subscriptions/:subscriptionId/status
 * @desc Get subscription status
 */
router.get('/subscriptions/:subscriptionId/status', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID is required',
      });
    }

    const status = await oracleService.getSubscriptionStatus(subscriptionId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Failed to get subscription status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription status',
      message: error.message,
    });
  }
});

/**
 * @route DELETE /api/oracle/subscriptions/:subscriptionId
 * @desc Cancel a subscription
 */
router.delete('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID is required',
      });
    }

    await oracleService.cancelSubscription(subscriptionId);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    logger.error('Failed to cancel subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/oracle/subscriptions/:subscriptionId/renew
 * @desc Renew subscription balance
 */
router.post('/subscriptions/:subscriptionId/renew', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { error, value } = renewSubscriptionSchema.validate({
      subscriptionId,
      ...req.body,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    await oracleService.renewSubscription(value.subscriptionId, value.additionalBalance);

    res.json({
      success: true,
      message: 'Subscription renewed successfully',
    });
  } catch (error) {
    logger.error('Failed to renew subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to renew subscription',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/oracle/stats
 * @desc Get oracle statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await oracleService.getOracleStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get oracle stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get oracle stats',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/oracle/cleanup-cache
 * @desc Clean up expired cache data
 */
router.post('/cleanup-cache', async (req, res) => {
  try {
    await oracleService.cleanupCache();

    res.json({
      success: true,
      message: 'Oracle cache cleaned up successfully',
    });
  } catch (error) {
    logger.error('Failed to cleanup oracle cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup cache',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/oracle/market/:marketId/valid-data
 * @desc Check if oracle has valid data for a market
 */
router.get('/market/:marketId/valid-data', async (req, res) => {
  try {
    const { marketId } = req.params;

    if (!marketId) {
      return res.status(400).json({
        success: false,
        error: 'Market ID is required',
      });
    }

    const hasValidData = await oracleService.hasValidOracleData(marketId);

    res.json({
      success: true,
      data: {
        marketId,
        hasValidData,
      },
    });
  } catch (error) {
    logger.error('Failed to check oracle data validity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check oracle data validity',
      message: error.message,
    });
  }
});

export default router;
