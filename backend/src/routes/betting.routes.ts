import express from 'express';
import { BettingService } from '../services/betting.service';
import { StellarRpcService } from '../services/stellar-rpc.service';
import { KaleTokenService } from '../services/kale-token.service';
import { MarketCreationService } from '../services/market-creation.service';
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

const stellarRpc = new StellarRpcService(stellarConfig);
const kaleToken = new KaleTokenService(stellarRpc, kaleConfig);
const marketService = new MarketCreationService(stellarRpc, kaleToken, stellarConfig.kaleIntegrationContractId);
const bettingService = new BettingService(stellarRpc, kaleToken, marketService, stellarConfig.kaleIntegrationContractId);

// Validation schemas
const placeBetSchema = Joi.object({
  marketId: Joi.string().uuid().required(),
  userId: Joi.string().required(),
  outcome: Joi.string().valid('for', 'against', 'above', 'below').required(),
  amount: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  userSecret: Joi.string().required(),
});

const getUserBetsSchema = Joi.object({
  userId: Joi.string().required(),
});

const getMarketBetsSchema = Joi.object({
  marketId: Joi.string().uuid().required(),
});

const cancelBetSchema = Joi.object({
  betId: Joi.string().uuid().required(),
  userSecret: Joi.string().required(),
});

/**
 * @route POST /api/betting/place
 * @desc Place a bet on a prediction market
 */
router.post('/place', async (req, res) => {
  try {
    const { error, value } = placeBetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const bet = await bettingService.placeBet(value);

    res.json({
      success: true,
      data: bet,
      message: 'Bet placed successfully',
    });
  } catch (error) {
    logger.error('Failed to place bet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place bet',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/betting/user/:userId
 * @desc Get all bets for a user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { error, value } = getUserBetsSchema.validate({ userId: req.params.userId });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const bets = await bettingService.getUserBets(value.userId);

    res.json({
      success: true,
      data: bets,
      count: bets.length,
    });
  } catch (error) {
    logger.error('Failed to get user bets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user bets',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/betting/market/:marketId
 * @desc Get all bets for a market
 */
router.get('/market/:marketId', async (req, res) => {
  try {
    const { error, value } = getMarketBetsSchema.validate({ marketId: req.params.marketId });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const bets = await bettingService.getBetsForMarket(value.marketId);

    res.json({
      success: true,
      data: bets,
      count: bets.length,
    });
  } catch (error) {
    logger.error('Failed to get market bets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market bets',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/betting/user/:userId/stats
 * @desc Get betting statistics for a user
 */
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { error, value } = getUserBetsSchema.validate({ userId: req.params.userId });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const stats = await bettingService.getUserBettingStats(value.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get user betting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user betting stats',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/betting/market/:marketId/info
 * @desc Get betting information for a market
 */
router.get('/market/:marketId/info', async (req, res) => {
  try {
    const { error, value } = getMarketBetsSchema.validate({ marketId: req.params.marketId });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const bettingInfo = await bettingService.getMarketBettingInfo(value.marketId);

    res.json({
      success: true,
      data: bettingInfo,
    });
  } catch (error) {
    logger.error('Failed to get market betting info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market betting info',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/betting/market/:marketId/odds
 * @desc Get current odds for a market outcome
 */
router.get('/market/:marketId/odds', async (req, res) => {
  try {
    const { marketId } = req.params;
    const { outcome } = req.query;

    if (!outcome || typeof outcome !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Outcome parameter is required',
      });
    }

    const odds = await bettingService.calculateOdds(marketId, outcome);

    res.json({
      success: true,
      data: {
        marketId,
        outcome,
        odds,
      },
    });
  } catch (error) {
    logger.error('Failed to get odds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get odds',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/betting/cancel
 * @desc Cancel a bet
 */
router.post('/cancel', async (req, res) => {
  try {
    const { error, value } = cancelBetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const result = await bettingService.cancelBet(value.betId, value.userSecret);

    res.json({
      success: true,
      data: result,
      message: 'Bet cancelled successfully',
    });
  } catch (error) {
    logger.error('Failed to cancel bet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel bet',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/betting/stats/global
 * @desc Get global betting statistics
 */
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await bettingService.getGlobalBettingStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get global betting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get global betting stats',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/betting/calculate-payouts
 * @desc Calculate payouts for a market (admin only)
 */
router.post('/calculate-payouts', async (req, res) => {
  try {
    const { marketId, winningOutcome } = req.body;

    if (!marketId || !winningOutcome) {
      return res.status(400).json({
        success: false,
        error: 'Market ID and winning outcome are required',
      });
    }

    const payouts = await bettingService.calculatePayouts(marketId, winningOutcome);

    res.json({
      success: true,
      data: payouts,
      count: payouts.length,
    });
  } catch (error) {
    logger.error('Failed to calculate payouts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate payouts',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/betting/settle-bets
 * @desc Settle bets for a market (admin only)
 */
router.post('/settle-bets', async (req, res) => {
  try {
    const { marketId, winningOutcome } = req.body;

    if (!marketId || !winningOutcome) {
      return res.status(400).json({
        success: false,
        error: 'Market ID and winning outcome are required',
      });
    }

    const transactions = await bettingService.settleBets(marketId, winningOutcome);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
      message: 'Bets settled successfully',
    });
  } catch (error) {
    logger.error('Failed to settle bets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to settle bets',
      message: error.message,
    });
  }
});

export default router;
