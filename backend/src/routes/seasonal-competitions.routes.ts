import express from 'express';
import { SeasonalCompetitionsService } from '../services/seasonal-competitions.service';
import { SocialSharingService } from '../services/social-sharing.service';
import { StellarRpcService } from '../services/stellar-rpc.service';
import { KaleTokenService } from '../services/kale-token.service';
import { GamificationService } from '../services/gamification.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

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
  decimals: 7,
  symbol: 'KALE',
  name: 'KALE Token',
};

const stellarRpc = new StellarRpcService(stellarConfig);
const kaleToken = new KaleTokenService(stellarRpc, kaleConfig);
const gamification = new GamificationService(stellarRpc, kaleToken);
const seasonalCompetitions = new SeasonalCompetitionsService(stellarRpc, kaleToken, gamification);
const socialSharing = new SocialSharingService();

// Validation schemas
const createCompetitionSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(500),
  season: Joi.string().required(),
  startDate: Joi.number().required(),
  endDate: Joi.number().required(),
  competitionType: Joi.string().valid('individual', 'team', 'mixed').required(),
  categories: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    prizePool: Joi.string().required(),
    criteria: Joi.string().valid('volume', 'accuracy', 'streak', 'innovation', 'social').required(),
    weight: Joi.number().min(0).max(1).required(),
    requirements: Joi.array().items(Joi.object({
      type: Joi.string().valid('min_bets', 'min_volume', 'min_accuracy', 'min_streak', 'social_shares').required(),
      value: Joi.string().required(),
      description: Joi.string().required(),
    })).required(),
  })).min(1).required(),
  totalPrizePool: Joi.string().required(),
  rules: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('scoring', 'eligibility', 'penalty', 'bonus').required(),
    value: Joi.string().optional(),
  })).required(),
  socialSharingEnabled: Joi.boolean().required(),
  creatorSecret: Joi.string().required(),
});

const joinCompetitionSchema = Joi.object({
  competitionId: Joi.string().required(),
  category: Joi.string().required(),
  teamId: Joi.string().optional(),
  userSecret: Joi.string().required(),
});

const socialShareSchema = Joi.object({
  competitionId: Joi.string().required(),
  platform: Joi.string().valid('twitter', 'discord', 'telegram', 'reddit', 'linkedin').required(),
  content: Joi.string().required().min(10).max(1000),
  userSecret: Joi.string().required(),
});

const claimRewardSchema = Joi.object({
  rewardId: Joi.string().required(),
  userSecret: Joi.string().required(),
});

// Routes

/**
 * Create a new seasonal competition
 */
router.post('/create', async (req, res) => {
  try {
    const { error, value } = createCompetitionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { creatorSecret, ...competitionData } = value;
    const creatorKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(creatorSecret);

    const competition = await seasonalCompetitions.createCompetition(creatorKeypair, competitionData);

    res.json({
      success: true,
      data: competition,
      message: 'Seasonal competition created successfully',
    });
  } catch (error) {
    logger.error('Failed to create seasonal competition:', error);
    res.status(500).json({ error: 'Failed to create seasonal competition' });
  }
});

/**
 * Get all active competitions
 */
router.get('/active', async (req, res) => {
  try {
    const competitions = Array.from((seasonalCompetitions as any).competitions.values())
      .filter((comp: any) => comp.status === 'active');

    res.json({
      success: true,
      data: competitions,
      count: competitions.length,
    });
  } catch (error) {
    logger.error('Failed to get active competitions:', error);
    res.status(500).json({ error: 'Failed to get active competitions' });
  }
});

/**
 * Get competition details
 */
router.get('/:competitionId', async (req, res) => {
  try {
    const { competitionId } = req.params;
    const competition = (seasonalCompetitions as any).competitions.get(competitionId);

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    res.json({
      success: true,
      data: competition,
    });
  } catch (error) {
    logger.error('Failed to get competition details:', error);
    res.status(500).json({ error: 'Failed to get competition details' });
  }
});

/**
 * Join a seasonal competition
 */
router.post('/join', async (req, res) => {
  try {
    const { error, value } = joinCompetitionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userSecret, ...joinData } = value;
    const userKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(userSecret);

    const participant = await seasonalCompetitions.joinCompetition(
      userKeypair,
      joinData.competitionId,
      joinData.category,
      joinData.teamId
    );

    res.json({
      success: true,
      data: participant,
      message: 'Successfully joined competition',
    });
  } catch (error) {
    logger.error('Failed to join competition:', error);
    res.status(500).json({ error: error.message || 'Failed to join competition' });
  }
});

/**
 * Record social share for bonus points
 */
router.post('/social-share', async (req, res) => {
  try {
    const { error, value } = socialShareSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userSecret, ...shareData } = value;
    const userKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(userSecret);

    const socialShare = await seasonalCompetitions.recordSocialShare(
      userKeypair,
      shareData.competitionId,
      shareData.platform,
      shareData.content
    );

    res.json({
      success: true,
      data: socialShare,
      message: 'Social share recorded successfully',
    });
  } catch (error) {
    logger.error('Failed to record social share:', error);
    res.status(500).json({ error: error.message || 'Failed to record social share' });
  }
});

/**
 * Get competition leaderboard
 */
router.get('/:competitionId/leaderboard', async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { category } = req.query;

    const leaderboards = await seasonalCompetitions.getCompetitionLeaderboard(
      competitionId,
      category as string
    );

    res.json({
      success: true,
      data: leaderboards,
      count: leaderboards.length,
    });
  } catch (error) {
    logger.error('Failed to get competition leaderboard:', error);
    res.status(500).json({ error: 'Failed to get competition leaderboard' });
  }
});

/**
 * Get user's competition history
 */
router.get('/user/:userAddress/history', async (req, res) => {
  try {
    const { userAddress } = req.params;

    const history = await seasonalCompetitions.getUserCompetitionHistory(userAddress);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('Failed to get user competition history:', error);
    res.status(500).json({ error: 'Failed to get user competition history' });
  }
});

/**
 * Distribute competition rewards (admin only)
 */
router.post('/:competitionId/distribute-rewards', async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { adminSecret } = req.body;

    if (!adminSecret) {
      return res.status(400).json({ error: 'Admin secret required' });
    }

    const rewards = await seasonalCompetitions.distributeCompetitionRewards(competitionId);

    res.json({
      success: true,
      data: rewards,
      count: rewards.length,
      message: 'Competition rewards distributed successfully',
    });
  } catch (error) {
    logger.error('Failed to distribute competition rewards:', error);
    res.status(500).json({ error: error.message || 'Failed to distribute competition rewards' });
  }
});

/**
 * Claim competition reward
 */
router.post('/claim-reward', async (req, res) => {
  try {
    const { error, value } = claimRewardSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userSecret, rewardId } = value;
    const userKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(userSecret);

    const transactionResult = await seasonalCompetitions.claimCompetitionReward(
      userKeypair,
      rewardId
    );

    res.json({
      success: true,
      data: transactionResult,
      message: 'Competition reward claimed successfully',
    });
  } catch (error) {
    logger.error('Failed to claim competition reward:', error);
    res.status(500).json({ error: error.message || 'Failed to claim competition reward' });
  }
});

/**
 * Get social share templates
 */
router.get('/social-templates/:platform?', async (req, res) => {
  try {
    const { platform } = req.params;
    const templates = await socialSharing.getShareTemplates(platform as any);

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    logger.error('Failed to get social share templates:', error);
    res.status(500).json({ error: 'Failed to get social share templates' });
  }
});

/**
 * Generate social share content
 */
router.post('/generate-share', async (req, res) => {
  try {
    const { userId, competitionId, platform, templateId, customContent, variables } = req.body;

    if (!userId || !platform) {
      return res.status(400).json({ error: 'User ID and platform are required' });
    }

    const shareRequest = {
      userId,
      competitionId,
      platform,
      templateId,
      customContent,
      variables,
    };

    const shareResult = await socialSharing.generateShareContent(shareRequest);

    res.json({
      success: true,
      data: shareResult,
      message: 'Social share content generated successfully',
    });
  } catch (error) {
    logger.error('Failed to generate social share content:', error);
    res.status(500).json({ error: error.message || 'Failed to generate social share content' });
  }
});

/**
 * Get user's social sharing stats
 */
router.get('/user/:userAddress/social-stats', async (req, res) => {
  try {
    const { userAddress } = req.params;

    const stats = await socialSharing.getUserSocialStats(userAddress);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get user social stats:', error);
    res.status(500).json({ error: 'Failed to get user social stats' });
  }
});

/**
 * Update social engagement metrics
 */
router.post('/update-engagement', async (req, res) => {
  try {
    const { shareId, engagement } = req.body;

    if (!shareId || !engagement) {
      return res.status(400).json({ error: 'Share ID and engagement data are required' });
    }

    const updatedEngagement = await socialSharing.updateEngagement(shareId, engagement);

    res.json({
      success: true,
      data: updatedEngagement,
      message: 'Social engagement updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update social engagement:', error);
    res.status(500).json({ error: 'Failed to update social engagement' });
  }
});

export default router;
