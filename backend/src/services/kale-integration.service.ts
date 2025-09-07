import { Keypair, Asset, Operation, Memo } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { KaleTokenService } from './kale-token.service';
import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export interface KaleFarmingSession {
  id: string;
  farmer: string;
  stakedAmount: string;
  blockIndex: number;
  workSubmitted: boolean;
  harvested: boolean;
  nonce: number;
  hashZeros: number;
  marketId?: string;
  teamId?: string;
  createdAt: number;
  lastUpdate: number;
}

export interface TeamFarmingPool {
  id: string;
  teamLeader: string;
  teamMembers: string[];
  totalStake: string;
  leagueId?: string;
  performanceStats: {
    totalHarvested: string;
    successfulSessions: number;
    totalSessions: number;
  };
  createdAt: number;
  isActive: boolean;
}

export interface LiquidStakePosition {
  id: string;
  staker: string;
  originalAmount: string;
  skaleTokenId: string;
  skaleBalance: string;
  stakingRewards: string;
  createdAt: number;
  isActive: boolean;
}

export interface PredictionStats {
  userId: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracyRate: number;
  totalVolume: string;
  totalProfit: string;
  longestStreak: number;
  currentStreak: number;
  lastPredictionTime: number;
}

export interface KaleRewardDistribution {
  marketId: string;
  winningParticipants: string[];
  baseRewards: string[];
  accuracyBonuses: string[];
  totalDistributed: string;
  distributedAt: number;
}

export interface KaleIntegrationConfig {
  kaleContractId: string;
  kaleAssetCode: string;
  kaleAssetIssuer: string;
  farmingContractId: string;
  liquidStakingContractId: string;
  teamFarmingContractId: string;
  networkPassphrase: string;
  horizonUrl: string;
  rpcUrl: string;
}

export enum KaleError {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  STAKING_FAILED = 'STAKING_FAILED',
  HARVEST_FAILED = 'HARVEST_FAILED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  WORK_ALREADY_SUBMITTED = 'WORK_ALREADY_SUBMITTED',
  INVALID_PROOF_OF_WORK = 'INVALID_PROOF_OF_WORK',
}

export class KaleIntegrationService {
  private stellarRpc: StellarRpcService;
  private kaleToken: KaleTokenService;
  private config: KaleIntegrationConfig;
  private farmingSessions: Map<string, KaleFarmingSession> = new Map();
  private teamPools: Map<string, TeamFarmingPool> = new Map();
  private liquidStakes: Map<string, LiquidStakePosition> = new Map();
  private predictionStats: Map<string, PredictionStats> = new Map();

  constructor(
    stellarRpc: StellarRpcService,
    kaleToken: KaleTokenService,
    config: KaleIntegrationConfig
  ) {
    this.stellarRpc = stellarRpc;
    this.kaleToken = kaleToken;
    this.config = config;
  }

  /**
   * Enhanced KALE staking with prediction market integration
   */
  async stakeForPrediction(
    farmerKeypair: Keypair,
    amount: string,
    marketId: string,
    predictionData?: any
  ): Promise<KaleFarmingSession> {
    try {
      // Validate farmer has sufficient KALE balance
      const farmerBalance = await this.kaleToken.getBalance(farmerKeypair.publicKey());
      if (new Big(farmerBalance.balance).lt(new Big(amount))) {
        throw new Error('Insufficient KALE balance for staking');
      }

      // Create farming session linked to prediction market
      const sessionId = uuidv4();
      const session: KaleFarmingSession = {
        id: sessionId,
        farmer: farmerKeypair.publicKey(),
        stakedAmount: amount,
        blockIndex: await this.getCurrentBlockIndex(),
        workSubmitted: false,
        harvested: false,
        nonce: 0,
        hashZeros: 0,
        marketId,
        createdAt: Date.now(),
        lastUpdate: Date.now(),
      };

      // Perform KALE staking transaction
      const stakingResult = await this.plantKale(farmerKeypair, amount, {
        sessionId,
        marketId,
        predictionData,
      });

      // Store session
      this.farmingSessions.set(sessionId, session);

      logger.info('KALE staking for prediction completed:', {
        sessionId,
        farmer: farmerKeypair.publicKey(),
        amount,
        marketId,
        txHash: stakingResult.hash,
      });

      return session;
    } catch (error) {
      logger.error('Failed to stake KALE for prediction:', error);
      throw error;
    }
  }

  /**
   * Team-based KALE farming for prediction leagues
   */
  async createTeamFarmingPool(
    teamLeaderKeypair: Keypair,
    teamMembers: string[],
    totalStake: string,
    leagueId?: string
  ): Promise<TeamFarmingPool> {
    try {
      // Validate team leader has sufficient balance
      const leaderBalance = await this.kaleToken.getBalance(teamLeaderKeypair.publicKey());
      if (new Big(leaderBalance.balance).lt(new Big(totalStake))) {
        throw new Error('Insufficient KALE balance for team farming');
      }

      const poolId = uuidv4();
      const stakePerMember = new Big(totalStake).div(teamMembers.length).toString();

      // Create team farming pool
      const teamPool: TeamFarmingPool = {
        id: poolId,
        teamLeader: teamLeaderKeypair.publicKey(),
        teamMembers,
        totalStake,
        leagueId,
        performanceStats: {
          totalHarvested: '0',
          successfulSessions: 0,
          totalSessions: 0,
        },
        createdAt: Date.now(),
        isActive: true,
      };

      // Distribute stake among team members
      for (const member of teamMembers) {
        const memberKeypair = Keypair.fromPublicKey(member);
        await this.stakeForPrediction(memberKeypair, stakePerMember, '', {
          teamPoolId: poolId,
          isTeamFarming: true,
        });
      }

      // Store team pool
      this.teamPools.set(poolId, teamPool);

      logger.info('Team farming pool created:', {
        poolId,
        teamLeader: teamLeaderKeypair.publicKey(),
        teamMembers: teamMembers.length,
        totalStake,
        leagueId,
      });

      return teamPool;
    } catch (error) {
      logger.error('Failed to create team farming pool:', error);
      throw error;
    }
  }

  /**
   * Advanced KALE reward distribution with prediction bonuses
   */
  async distributeRewardsWithBonus(
    marketId: string,
    winningParticipants: string[],
    baseRewards: string[],
    accuracyBonuses: string[]
  ): Promise<KaleRewardDistribution> {
    try {
      if (winningParticipants.length !== baseRewards.length || 
          winningParticipants.length !== accuracyBonuses.length) {
        throw new Error('Mismatch in participants and rewards arrays');
      }

      const distribution: KaleRewardDistribution = {
        marketId,
        winningParticipants,
        baseRewards,
        accuracyBonuses,
        totalDistributed: '0',
        distributedAt: Date.now(),
      };

      let totalDistributed = new Big(0);

      // Distribute rewards to each winner
      for (let i = 0; i < winningParticipants.length; i++) {
        const participant = winningParticipants[i];
        const baseReward = baseRewards[i];
        const accuracyBonus = accuracyBonuses[i];
        const totalReward = new Big(baseReward).plus(new Big(accuracyBonus));

        // Harvest original KALE stake
        await this.harvestKale(participant);

        // Transfer additional rewards
        const issuerKeypair = Keypair.fromSecret(process.env.KALE_ISSUER_SECRET || '');
        await this.kaleToken.transfer(
          issuerKeypair,
          participant,
          totalReward.toString()
        );

        totalDistributed = totalDistributed.plus(totalReward);

        // Update participant's prediction statistics
        await this.updatePredictionStats(participant, marketId, true);
      }

      distribution.totalDistributed = totalDistributed.toString();

      logger.info('KALE rewards distributed with bonuses:', {
        marketId,
        participants: winningParticipants.length,
        totalDistributed: distribution.totalDistributed,
      });

      return distribution;
    } catch (error) {
      logger.error('Failed to distribute rewards with bonus:', error);
      throw error;
    }
  }

  /**
   * KALE liquid staking for continuous prediction participation
   */
  async createLiquidStake(
    stakerKeypair: Keypair,
    amount: string
  ): Promise<LiquidStakePosition> {
    try {
      // Validate staker has sufficient balance
      const stakerBalance = await this.kaleToken.getBalance(stakerKeypair.publicKey());
      if (new Big(stakerBalance.balance).lt(new Big(amount))) {
        throw new Error('Insufficient KALE balance for liquid staking');
      }

      const positionId = uuidv4();
      const skaleTokenId = uuidv4();

      // Transfer KALE to staking contract
      await this.kaleToken.transfer(
        stakerKeypair,
        this.config.liquidStakingContractId,
        amount
      );

      // Create liquid staking position
      const position: LiquidStakePosition = {
        id: positionId,
        staker: stakerKeypair.publicKey(),
        originalAmount: amount,
        skaleTokenId,
        skaleBalance: amount, // Initially 1:1
        stakingRewards: '0',
        createdAt: Date.now(),
        isActive: true,
      };

      // Store position
      this.liquidStakes.set(positionId, position);

      logger.info('Liquid stake created:', {
        positionId,
        staker: stakerKeypair.publicKey(),
        amount,
        skaleTokenId,
      });

      return position;
    } catch (error) {
      logger.error('Failed to create liquid stake:', error);
      throw error;
    }
  }

  /**
   * Harvest KALE from farming session
   */
  async harvestKale(farmerAddress: string): Promise<string> {
    try {
      // Find active farming sessions for this farmer
      const sessions = Array.from(this.farmingSessions.values())
        .filter(session => 
          session.farmer === farmerAddress && 
          !session.harvested && 
          session.workSubmitted
        );

      if (sessions.length === 0) {
        throw new Error('No harvestable KALE found for farmer');
      }

      let totalHarvested = new Big(0);

      // Harvest from each session
      for (const session of sessions) {
        const harvestAmount = await this.calculateHarvestAmount(session);
        
        // Transfer harvested KALE to farmer
        const issuerKeypair = Keypair.fromSecret(process.env.KALE_ISSUER_SECRET || '');
        await this.kaleToken.transfer(
          issuerKeypair,
          farmerAddress,
          harvestAmount.toString()
        );

        // Mark session as harvested
        session.harvested = true;
        session.lastUpdate = Date.now();
        this.farmingSessions.set(session.id, session);

        totalHarvested = totalHarvested.plus(new Big(harvestAmount));
      }

      logger.info('KALE harvested:', {
        farmer: farmerAddress,
        sessions: sessions.length,
        totalHarvested: totalHarvested.toString(),
      });

      return totalHarvested.toString();
    } catch (error) {
      logger.error('Failed to harvest KALE:', error);
      throw error;
    }
  }

  /**
   * Submit work for farming session
   */
  async submitWork(
    farmerKeypair: Keypair,
    sessionId: string,
    workData: {
      nonce: number;
      hashZeros: number;
      proofOfWork: string;
    }
  ): Promise<boolean> {
    try {
      const session = this.farmingSessions.get(sessionId);
      if (!session) {
        throw new Error('Farming session not found');
      }

      if (session.farmer !== farmerKeypair.publicKey()) {
        throw new Error('Unauthorized: Not the session owner');
      }

      if (session.workSubmitted) {
        throw new Error('Work already submitted for this session');
      }

      // Validate proof of work
      const isValidWork = await this.validateProofOfWork(workData);
      if (!isValidWork) {
        throw new Error('Invalid proof of work');
      }

      // Update session with work data
      session.workSubmitted = true;
      session.nonce = workData.nonce;
      session.hashZeros = workData.hashZeros;
      session.lastUpdate = Date.now();

      this.farmingSessions.set(sessionId, session);

      logger.info('Work submitted for farming session:', {
        sessionId,
        farmer: farmerKeypair.publicKey(),
        nonce: workData.nonce,
        hashZeros: workData.hashZeros,
      });

      return true;
    } catch (error) {
      logger.error('Failed to submit work:', error);
      throw error;
    }
  }

  /**
   * Get farming session information
   */
  async getFarmingSession(sessionId: string): Promise<KaleFarmingSession | null> {
    try {
      return this.farmingSessions.get(sessionId) || null;
    } catch (error) {
      logger.error('Failed to get farming session:', error);
      throw error;
    }
  }

  /**
   * Get user's farming sessions
   */
  async getUserFarmingSessions(userAddress: string): Promise<KaleFarmingSession[]> {
    try {
      return Array.from(this.farmingSessions.values())
        .filter(session => session.farmer === userAddress);
    } catch (error) {
      logger.error('Failed to get user farming sessions:', error);
      throw error;
    }
  }

  /**
   * Get team farming pool information
   */
  async getTeamFarmingPool(poolId: string): Promise<TeamFarmingPool | null> {
    try {
      return this.teamPools.get(poolId) || null;
    } catch (error) {
      logger.error('Failed to get team farming pool:', error);
      throw error;
    }
  }

  /**
   * Get user's liquid stake positions
   */
  async getUserLiquidStakes(userAddress: string): Promise<LiquidStakePosition[]> {
    try {
      return Array.from(this.liquidStakes.values())
        .filter(position => position.staker === userAddress && position.isActive);
    } catch (error) {
      logger.error('Failed to get user liquid stakes:', error);
      throw error;
    }
  }

  /**
   * Get prediction statistics for user
   */
  async getPredictionStats(userAddress: string): Promise<PredictionStats> {
    try {
      const stats = this.predictionStats.get(userAddress);
      if (!stats) {
        return {
          userId: userAddress,
          totalPredictions: 0,
          correctPredictions: 0,
          accuracyRate: 0,
          totalVolume: '0',
          totalProfit: '0',
          longestStreak: 0,
          currentStreak: 0,
          lastPredictionTime: 0,
        };
      }
      return stats;
    } catch (error) {
      logger.error('Failed to get prediction stats:', error);
      throw error;
    }
  }

  /**
   * Internal KALE farming functions
   */
  private async plantKale(
    farmerKeypair: Keypair,
    amount: string,
    metadata: any
  ): Promise<TransactionResult> {
    try {
      // Create staking transaction with metadata
      const memo = Memo.text(JSON.stringify({
        type: 'KALE_PLANT',
        amount,
        metadata,
        timestamp: Date.now(),
      }));

      const operation = Operation.payment({
        destination: this.config.farmingContractId,
        asset: this.kaleToken.getKaleAsset(),
        amount,
      });

      return await this.stellarRpc.submitTransaction(farmerKeypair, [operation], memo);
    } catch (error) {
      logger.error('Failed to plant KALE:', error);
      throw error;
    }
  }

  private async calculateHarvestAmount(session: KaleFarmingSession): Promise<string> {
    try {
      // Calculate harvest based on staked amount, work quality, and time
      const baseAmount = new Big(session.stakedAmount);
      const workMultiplier = session.hashZeros > 0 ? 1 + (session.hashZeros / 100) : 1;
      const timeMultiplier = 1 + ((Date.now() - session.createdAt) / (24 * 60 * 60 * 1000)) * 0.01; // 1% per day

      const harvestAmount = baseAmount.mul(workMultiplier).mul(timeMultiplier);
      return harvestAmount.toString();
    } catch (error) {
      logger.error('Failed to calculate harvest amount:', error);
      return session.stakedAmount; // Fallback to original amount
    }
  }

  private async validateProofOfWork(workData: any): Promise<boolean> {
    try {
      // Simplified proof of work validation
      // In a real implementation, this would validate the hash and nonce
      return workData.nonce > 0 && workData.hashZeros >= 0;
    } catch (error) {
      logger.error('Failed to validate proof of work:', error);
      return false;
    }
  }

  private async getCurrentBlockIndex(): Promise<number> {
    try {
      // Get current ledger sequence from Stellar
      const accountInfo = await this.stellarRpc.getAccountInfo(process.env.KALE_ISSUER_ADDRESS || '');
      return accountInfo.sequenceNumber || 0;
    } catch (error) {
      logger.error('Failed to get current block index:', error);
      return Math.floor(Date.now() / 1000); // Fallback to timestamp
    }
  }

  private async updatePredictionStats(
    userAddress: string,
    marketId: string,
    correct: boolean
  ): Promise<void> {
    try {
      let stats = this.predictionStats.get(userAddress);
      if (!stats) {
        stats = {
          userId: userAddress,
          totalPredictions: 0,
          correctPredictions: 0,
          accuracyRate: 0,
          totalVolume: '0',
          totalProfit: '0',
          longestStreak: 0,
          currentStreak: 0,
          lastPredictionTime: 0,
        };
      }

      stats.totalPredictions += 1;
      if (correct) {
        stats.correctPredictions += 1;
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
      } else {
        stats.currentStreak = 0;
      }

      stats.accuracyRate = (stats.correctPredictions / stats.totalPredictions) * 100;
      stats.lastPredictionTime = Date.now();

      this.predictionStats.set(userAddress, stats);
    } catch (error) {
      logger.error('Failed to update prediction stats:', error);
    }
  }

  /**
   * Get KALE farming statistics
   */
  async getFarmingStats(): Promise<{
    totalActiveSessions: number;
    totalStaked: string;
    totalHarvested: string;
    averageSessionDuration: number;
    topFarmers: Array<{ address: string; totalHarvested: string }>;
  }> {
    try {
      const sessions = Array.from(this.farmingSessions.values());
      const activeSessions = sessions.filter(s => !s.harvested);
      
      const totalStaked = sessions.reduce((sum, session) => 
        sum.plus(new Big(session.stakedAmount)), new Big(0)
      ).toString();

      const farmerStats = new Map<string, Big>();
      sessions.forEach(session => {
        if (session.harvested) {
          const current = farmerStats.get(session.farmer) || new Big(0);
          farmerStats.set(session.farmer, current.plus(new Big(session.stakedAmount)));
        }
      });

      const topFarmers = Array.from(farmerStats.entries())
        .map(([address, totalHarvested]) => ({ address, totalHarvested: totalHarvested.toString() }))
        .sort((a, b) => new Big(b.totalHarvested).cmp(new Big(a.totalHarvested)))
        .slice(0, 10);

      return {
        totalActiveSessions: activeSessions.length,
        totalStaked,
        totalHarvested: '0', // Would be calculated from actual harvests
        averageSessionDuration: 0, // Would be calculated from session data
        topFarmers,
      };
    } catch (error) {
      logger.error('Failed to get farming stats:', error);
      throw error;
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      for (const [sessionId, session] of this.farmingSessions.entries()) {
        if (now - session.lastUpdate > maxAge && !session.workSubmitted) {
          this.farmingSessions.delete(sessionId);
        }
      }

      logger.info('Expired farming sessions cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup expired sessions:', error);
    }
  }
}
