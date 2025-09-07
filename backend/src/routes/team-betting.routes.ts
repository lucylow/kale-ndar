import express from 'express';
import { TeamBettingService } from '../services/team-betting.service';
import { StellarRpcService } from '../services/stellar-rpc.service';
import { KaleTokenService } from '../services/kale-token.service';
import { MarketCreationService } from '../services/market-creation.service';
import { BettingService } from '../services/betting.service';
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
const marketService = new MarketCreationService(stellarRpc, kaleToken, stellarConfig.kaleIntegrationContractId);
const bettingService = new BettingService(stellarRpc, kaleToken, marketService, stellarConfig.kaleIntegrationContractId);
const teamBettingService = new TeamBettingService(stellarRpc, kaleToken, bettingService, stellarConfig.kaleIntegrationContractId);

// Validation schemas
const createTeamVaultSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(10).max(500).required(),
  teamType: Joi.string().valid('friends', 'public', 'competitive').optional(),
  minDeposit: Joi.string().pattern(/^\d+(\.\d+)?$/).optional(),
  maxMembers: Joi.number().min(2).max(50).optional(),
  bettingStrategy: Joi.string().valid('consensus', 'majority', 'individual').optional(),
  creatorSecret: Joi.string().required(),
});

const joinTeamSchema = Joi.object({
  teamId: Joi.string().uuid().required(),
  nickname: Joi.string().min(2).max(20).required(),
  depositAmount: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  userSecret: Joi.string().required(),
});

const proposeTeamBetSchema = Joi.object({
  teamId: Joi.string().uuid().required(),
  marketId: Joi.string().uuid().required(),
  outcome: Joi.string().valid('for', 'against', 'above', 'below').required(),
  amount: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  requesterSecret: Joi.string().required(),
  description: Joi.string().max(200).optional(),
});

const voteOnBetSchema = Joi.object({
  betId: Joi.string().uuid().required(),
  vote: Joi.string().valid('approve', 'reject').required(),
  voterSecret: Joi.string().required(),
});

/**
 * @route POST /api/teams/create
 * @desc Create a new team betting vault
 */
router.post('/create', async (req, res) => {
  try {
    const { error, value } = createTeamVaultSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const creatorKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(value.creatorSecret);
    
    const teamVault = await teamBettingService.createTeamVault(
      creatorKeypair,
      value.name,
      value.description,
      value.teamType || 'friends',
      value.minDeposit || '100',
      value.maxMembers || 10,
      value.bettingStrategy || 'majority'
    );

    res.json({
      success: true,
      data: teamVault,
      message: 'Team vault created successfully',
    });
  } catch (error) {
    logger.error('Failed to create team vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create team vault',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/teams/join
 * @desc Join an existing team vault
 */
router.post('/join', async (req, res) => {
  try {
    const { error, value } = joinTeamSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const userKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(value.userSecret);
    
    const member = await teamBettingService.joinTeamVault(
      userKeypair,
      value.teamId,
      value.nickname,
      value.depositAmount
    );

    res.json({
      success: true,
      data: member,
      message: 'Successfully joined team vault',
    });
  } catch (error) {
    logger.error('Failed to join team vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join team vault',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/teams/:teamId
 * @desc Get team vault information
 */
router.get('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required',
      });
    }

    const teamVault = await teamBettingService.getTeamVault(teamId);

    res.json({
      success: true,
      data: teamVault,
    });
  } catch (error) {
    logger.error('Failed to get team vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team vault',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/teams/:teamId/stats
 * @desc Get team betting statistics
 */
router.get('/:teamId/stats', async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required',
      });
    }

    const stats = await teamBettingService.getTeamStats(teamId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get team stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team stats',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/teams/propose-bet
 * @desc Propose a team bet
 */
router.post('/propose-bet', async (req, res) => {
  try {
    const { error, value } = proposeTeamBetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const teamBet = await teamBettingService.proposeTeamBet(value);

    res.json({
      success: true,
      data: teamBet,
      message: 'Team bet proposed successfully',
    });
  } catch (error) {
    logger.error('Failed to propose team bet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to propose team bet',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/teams/vote-bet
 * @desc Vote on a team bet proposal
 */
router.post('/vote-bet', async (req, res) => {
  try {
    const { error, value } = voteOnBetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const voterKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(value.voterSecret);
    
    await teamBettingService.voteOnTeamBet(
      voterKeypair,
      value.betId,
      value.vote
    );

    res.json({
      success: true,
      message: 'Vote recorded successfully',
    });
  } catch (error) {
    logger.error('Failed to vote on team bet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to vote on team bet',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/teams/leaderboard
 * @desc Get team leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await teamBettingService.getTeamLeaderboard();

    res.json({
      success: true,
      data: leaderboard,
      count: leaderboard.length,
    });
  } catch (error) {
    logger.error('Failed to get team leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team leaderboard',
      message: error.message,
    });
  }
});

export default router;
