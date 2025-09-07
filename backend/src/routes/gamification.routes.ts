import express from 'express';
import { GamificationService } from '../services/gamification.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

const router = express.Router();

// Initialize gamification service
const gamificationService = new GamificationService();

// Validation schemas
const updateUserStatsSchema = Joi.object({
  userAddress: Joi.string().required(),
  betAmount: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  isWinner: Joi.boolean().required(),
  payoutAmount: Joi.string().pattern(/^\d+(\.\d+)?$/).optional(),
});

const updateMarketCreationSchema = Joi.object({
  userAddress: Joi.string().required(),
});

/**
 * @route GET /api/gamification/profile/:userAddress
 * @desc Get user profile
 */
router.get('/profile/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'User address is required',
      });
    }

    const profile = await gamificationService.getUserProfile(userAddress);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error('Failed to get user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/leaderboard
 * @desc Get leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { category = 'overall', period = 'all-time', limit = 100 } = req.query;

    const leaderboard = await gamificationService.getLeaderboard(
      category as string,
      period as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Failed to get leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/badges/:userAddress
 * @desc Get user badges
 */
router.get('/badges/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'User address is required',
      });
    }

    const badges = await gamificationService.getUserBadges(userAddress);

    res.json({
      success: true,
      data: badges,
      count: badges.length,
    });
  } catch (error) {
    logger.error('Failed to get user badges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user badges',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/achievements/:userAddress
 * @desc Get user achievements
 */
router.get('/achievements/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'User address is required',
      });
    }

    const achievements = await gamificationService.getUserAchievements(userAddress);

    res.json({
      success: true,
      data: achievements,
      count: achievements.length,
    });
  } catch (error) {
    logger.error('Failed to get user achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user achievements',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/ranking/:userAddress
 * @desc Get user ranking
 */
router.get('/ranking/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const { category = 'overall' } = req.query;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'User address is required',
      });
    }

    const ranking = await gamificationService.getUserRanking(userAddress, category as string);

    res.json({
      success: true,
      data: ranking,
    });
  } catch (error) {
    logger.error('Failed to get user ranking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user ranking',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/gamification/update-bet-stats
 * @desc Update user stats after bet
 */
router.post('/update-bet-stats', async (req, res) => {
  try {
    const { error, value } = updateUserStatsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    await gamificationService.updateUserStatsAfterBet(
      value.userAddress,
      value.betAmount,
      value.isWinner,
      value.payoutAmount
    );

    res.json({
      success: true,
      message: 'User stats updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update user bet stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user bet stats',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/gamification/update-market-stats
 * @desc Update user stats after market creation
 */
router.post('/update-market-stats', async (req, res) => {
  try {
    const { error, value } = updateMarketCreationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    await gamificationService.updateUserStatsAfterMarketCreation(value.userAddress);

    res.json({
      success: true,
      message: 'User market stats updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update user market stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user market stats',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/leaderboard/overall
 * @desc Get overall leaderboard
 */
router.get('/leaderboard/overall', async (req, res) => {
  try {
    const { period = 'all-time', limit = 100 } = req.query;

    const leaderboard = await gamificationService.getLeaderboard(
      'overall',
      period as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Failed to get overall leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get overall leaderboard',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/leaderboard/accuracy
 * @desc Get accuracy leaderboard
 */
router.get('/leaderboard/accuracy', async (req, res) => {
  try {
    const { period = 'all-time', limit = 100 } = req.query;

    const leaderboard = await gamificationService.getLeaderboard(
      'accuracy',
      period as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Failed to get accuracy leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get accuracy leaderboard',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/leaderboard/volume
 * @desc Get volume leaderboard
 */
router.get('/leaderboard/volume', async (req, res) => {
  try {
    const { period = 'all-time', limit = 100 } = req.query;

    const leaderboard = await gamificationService.getLeaderboard(
      'volume',
      period as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Failed to get volume leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get volume leaderboard',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/leaderboard/streak
 * @desc Get streak leaderboard
 */
router.get('/leaderboard/streak', async (req, res) => {
  try {
    const { period = 'all-time', limit = 100 } = req.query;

    const leaderboard = await gamificationService.getLeaderboard(
      'streak',
      period as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Failed to get streak leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get streak leaderboard',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/badges/available
 * @desc Get all available badges
 */
router.get('/badges/available', async (req, res) => {
  try {
    // This would typically return all available badges
    const availableBadges = [
      {
        id: 'first_bet',
        name: 'First Bet',
        description: 'Placed your first bet',
        icon: '🎯',
        rarity: 'common',
        category: 'betting',
      },
      {
        id: 'high_roller',
        name: 'High Roller',
        description: 'Bet over 100,000 KALE total',
        icon: '💰',
        rarity: 'rare',
        category: 'betting',
      },
      {
        id: 'win_streak_5',
        name: 'Hot Streak',
        description: 'Won 5 bets in a row',
        icon: '🔥',
        rarity: 'rare',
        category: 'prediction',
      },
      {
        id: 'win_streak_10',
        name: 'Unstoppable',
        description: 'Won 10 bets in a row',
        icon: '⚡',
        rarity: 'legendary',
        category: 'prediction',
      },
      {
        id: 'market_creator',
        name: 'Market Maker',
        description: 'Created your first market',
        icon: '🏗️',
        rarity: 'common',
        category: 'social',
      },
      {
        id: 'accurate_predictor',
        name: 'Oracle',
        description: '70%+ win rate with 10+ bets',
        icon: '🔮',
        rarity: 'epic',
        category: 'prediction',
      },
    ];

    res.json({
      success: true,
      data: availableBadges,
      count: availableBadges.length,
    });
  } catch (error) {
    logger.error('Failed to get available badges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available badges',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/gamification/achievements/available
 * @desc Get all available achievements
 */
router.get('/achievements/available', async (req, res) => {
  try {
    // This would typically return all available achievements
    const availableAchievements = [
      {
        id: 'bet_master',
        name: 'Bet Master',
        description: 'Place 100 bets',
        icon: '🎲',
        points: 100,
        category: 'volume',
        maxProgress: 100,
      },
      {
        id: 'volume_king',
        name: 'Volume King',
        description: 'Bet 1,000,000 KALE total',
        icon: '👑',
        points: 200,
        category: 'volume',
        maxProgress: 1000,
      },
      {
        id: 'streak_legend',
        name: 'Streak Legend',
        description: 'Achieve a 20-win streak',
        icon: '🏆',
        points: 500,
        category: 'streak',
        maxProgress: 20,
      },
      {
        id: 'market_maker',
        name: 'Market Maker',
        description: 'Create 10 markets',
        icon: '🏗️',
        points: 150,
        category: 'social',
        maxProgress: 10,
      },
    ];

    res.json({
      success: true,
      data: availableAchievements,
      count: availableAchievements.length,
    });
  } catch (error) {
    logger.error('Failed to get available achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available achievements',
      message: error.message,
    });
  }
});

export default router;

