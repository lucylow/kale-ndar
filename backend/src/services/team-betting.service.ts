import { Keypair } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { KaleTokenService } from './kale-token.service';
import { BettingService } from './betting.service';
import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export interface TeamVault {
  id: string;
  name: string;
  description: string;
  creator: string;
  members: TeamMember[];
  totalDeposits: string;
  totalBets: string;
  totalPayouts: string;
  createdAt: number;
  isActive: boolean;
  contractAddress?: string;
  teamType: 'friends' | 'public' | 'competitive';
  minDeposit: string;
  maxMembers: number;
  bettingStrategy: 'consensus' | 'majority' | 'individual';
}

export interface TeamMember {
  address: string;
  nickname: string;
  depositAmount: string;
  joinedAt: number;
  isActive: boolean;
  votingPower: string;
  betCount: number;
  totalWinnings: string;
}

export interface TeamBet {
  id: string;
  teamId: string;
  marketId: string;
  outcome: string;
  amount: string;
  placedBy: string;
  approvedBy: string[];
  rejectedBy: string[];
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  createdAt: number;
  executedAt?: number;
  transactionHash?: string;
  payoutAmount?: string;
  isWinner?: boolean;
}

export interface TeamBetRequest {
  teamId: string;
  marketId: string;
  outcome: string;
  amount: string;
  requesterSecret: string;
  description?: string;
}

export interface TeamStats {
  teamId: string;
  totalMembers: number;
  totalDeposits: string;
  totalBets: number;
  winRate: number;
  totalPayouts: string;
  averageBetSize: string;
  topPerformer: string;
  teamRank: number;
}

export class TeamBettingService {
  private stellarRpc: StellarRpcService;
  private kaleToken: KaleTokenService;
  private bettingService: BettingService;
  private kaleIntegrationContractId: string;

  constructor(
    stellarRpc: StellarRpcService,
    kaleToken: KaleTokenService,
    bettingService: BettingService,
    kaleIntegrationContractId: string
  ) {
    this.stellarRpc = stellarRpc;
    this.kaleToken = kaleToken;
    this.bettingService = bettingService;
    this.kaleIntegrationContractId = kaleIntegrationContractId;
  }

  /**
   * Create a new team betting vault
   */
  async createTeamVault(
    creatorKeypair: Keypair,
    name: string,
    description: string,
    teamType: 'friends' | 'public' | 'competitive' = 'friends',
    minDeposit: string = '100',
    maxMembers: number = 10,
    bettingStrategy: 'consensus' | 'majority' | 'individual' = 'majority'
  ): Promise<TeamVault> {
    try {
      const teamId = uuidv4();
      
      // Create team vault on contract
      const contractAddress = await this.createTeamVaultOnContract(creatorKeypair, teamId, {
        name,
        description,
        teamType,
        minDeposit,
        maxMembers,
        bettingStrategy,
      });

      // Add creator as first member
      const creatorMember: TeamMember = {
        address: creatorKeypair.publicKey(),
        nickname: 'Creator',
        depositAmount: '0',
        joinedAt: Date.now(),
        isActive: true,
        votingPower: '100', // Creator gets 100% initial voting power
        betCount: 0,
        totalWinnings: '0',
      };

      const teamVault: TeamVault = {
        id: teamId,
        name,
        description,
        creator: creatorKeypair.publicKey(),
        members: [creatorMember],
        totalDeposits: '0',
        totalBets: '0',
        totalPayouts: '0',
        createdAt: Date.now(),
        isActive: true,
        contractAddress,
        teamType,
        minDeposit,
        maxMembers,
        bettingStrategy,
      };

      logger.info('Team vault created successfully:', {
        teamId,
        name,
        creator: creatorKeypair.publicKey(),
        teamType,
        maxMembers,
      });

      return teamVault;
    } catch (error) {
      logger.error('Failed to create team vault:', error);
      throw error;
    }
  }

  /**
   * Join an existing team vault
   */
  async joinTeamVault(
    userKeypair: Keypair,
    teamId: string,
    nickname: string,
    depositAmount: string
  ): Promise<TeamMember> {
    try {
      // Validate deposit amount
      if (new Big(depositAmount).lt(new Big('100'))) {
        throw new Error('Minimum deposit is 100 KALE');
      }

      // Check user balance
      const userBalance = await this.kaleToken.getBalance(userKeypair.publicKey());
      if (new Big(userBalance.balance).lt(new Big(depositAmount))) {
        throw new Error('Insufficient KALE balance');
      }

      // Transfer deposit to team vault
      await this.kaleToken.transfer(
        userKeypair,
        this.getTeamVaultAddress(teamId),
        depositAmount,
        `Team vault deposit for ${teamId}`
      );

      // Create team member
      const member: TeamMember = {
        address: userKeypair.publicKey(),
        nickname,
        depositAmount,
        joinedAt: Date.now(),
        isActive: true,
        votingPower: this.calculateVotingPower(depositAmount),
        betCount: 0,
        totalWinnings: '0',
      };

      // Add member to team vault on contract
      await this.addMemberToTeamVault(teamId, member);

      logger.info('User joined team vault:', {
        teamId,
        user: userKeypair.publicKey(),
        nickname,
        depositAmount,
      });

      return member;
    } catch (error) {
      logger.error('Failed to join team vault:', error);
      throw error;
    }
  }

  /**
   * Propose a team bet
   */
  async proposeTeamBet(request: TeamBetRequest): Promise<TeamBet> {
    try {
      const requesterKeypair = Keypair.fromSecret(request.requesterSecret);
      
      // Validate team membership
      const teamVault = await this.getTeamVault(request.teamId);
      const member = teamVault.members.find(m => m.address === requesterKeypair.publicKey());
      if (!member || !member.isActive) {
        throw new Error('User is not an active member of this team');
      }

      // Validate bet amount
      if (new Big(request.amount).gt(new Big(teamVault.totalDeposits))) {
        throw new Error('Bet amount exceeds team vault balance');
      }

      // Create team bet proposal
      const teamBet: TeamBet = {
        id: uuidv4(),
        teamId: request.teamId,
        marketId: request.marketId,
        outcome: request.outcome,
        amount: request.amount,
        placedBy: requesterKeypair.publicKey(),
        approvedBy: [],
        rejectedBy: [],
        status: 'pending',
        createdAt: Date.now(),
      };

      // Store team bet proposal
      await this.storeTeamBetProposal(teamBet);

      logger.info('Team bet proposed:', {
        betId: teamBet.id,
        teamId: request.teamId,
        marketId: request.marketId,
        outcome: request.outcome,
        amount: request.amount,
        proposer: requesterKeypair.publicKey(),
      });

      return teamBet;
    } catch (error) {
      logger.error('Failed to propose team bet:', error);
      throw error;
    }
  }

  /**
   * Vote on a team bet proposal
   */
  async voteOnTeamBet(
    voterKeypair: Keypair,
    betId: string,
    vote: 'approve' | 'reject'
  ): Promise<void> {
    try {
      const teamBet = await this.getTeamBet(betId);
      if (!teamBet) {
        throw new Error('Team bet not found');
      }

      if (teamBet.status !== 'pending') {
        throw new Error('Bet proposal is no longer pending');
      }

      // Check if user is team member
      const teamVault = await this.getTeamVault(teamBet.teamId);
      const member = teamVault.members.find(m => m.address === voterKeypair.publicKey());
      if (!member || !member.isActive) {
        throw new Error('User is not an active member of this team');
      }

      // Check if user already voted
      if (teamBet.approvedBy.includes(voterKeypair.publicKey()) || 
          teamBet.rejectedBy.includes(voterKeypair.publicKey())) {
        throw new Error('User has already voted on this proposal');
      }

      // Record vote
      if (vote === 'approve') {
        teamBet.approvedBy.push(voterKeypair.publicKey());
      } else {
        teamBet.rejectedBy.push(voterKeypair.publicKey());
      }

      // Check if bet should be executed based on voting strategy
      const shouldExecute = await this.shouldExecuteBet(teamBet, teamVault);
      
      if (shouldExecute) {
        await this.executeTeamBet(teamBet);
      }

      // Update team bet
      await this.updateTeamBet(teamBet);

      logger.info('Vote recorded on team bet:', {
        betId,
        voter: voterKeypair.publicKey(),
        vote,
        approvedCount: teamBet.approvedBy.length,
        rejectedCount: teamBet.rejectedBy.length,
      });
    } catch (error) {
      logger.error('Failed to vote on team bet:', error);
      throw error;
    }
  }

  /**
   * Execute a team bet
   */
  private async executeTeamBet(teamBet: TeamBet): Promise<void> {
    try {
      // Place bet using team vault funds
      const teamVaultKeypair = this.getTeamVaultKeypair(teamBet.teamId);
      
      const betRequest = {
        marketId: teamBet.marketId,
        userId: teamBet.teamId, // Use team ID as user ID
        outcome: teamBet.outcome,
        amount: teamBet.amount,
        userSecret: teamVaultKeypair.secret(),
      };

      const bet = await this.bettingService.placeBet(betRequest);

      // Update team bet
      teamBet.status = 'executed';
      teamBet.executedAt = Date.now();
      teamBet.transactionHash = bet.transactionHash;

      // Update team vault stats
      await this.updateTeamVaultStats(teamBet.teamId, {
        totalBets: new Big(teamBet.amount).toString(),
      });

      logger.info('Team bet executed:', {
        betId: teamBet.id,
        teamId: teamBet.teamId,
        marketId: teamBet.marketId,
        amount: teamBet.amount,
        transactionHash: bet.transactionHash,
      });
    } catch (error) {
      logger.error('Failed to execute team bet:', error);
      throw error;
    }
  }

  /**
   * Get team vault information
   */
  async getTeamVault(teamId: string): Promise<TeamVault> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      const result = await contract.call('get_team_vault', teamId);

      return {
        id: result.id.toString(),
        name: result.name.toString(),
        description: result.description.toString(),
        creator: result.creator.toString(),
        members: result.members.map((m: any) => ({
          address: m.address.toString(),
          nickname: m.nickname.toString(),
          depositAmount: m.deposit_amount.toString(),
          joinedAt: m.joined_at,
          isActive: m.is_active,
          votingPower: m.voting_power.toString(),
          betCount: m.bet_count,
          totalWinnings: m.total_winnings.toString(),
        })),
        totalDeposits: result.total_deposits.toString(),
        totalBets: result.total_bets.toString(),
        totalPayouts: result.total_payouts.toString(),
        createdAt: result.created_at,
        isActive: result.is_active,
        contractAddress: result.contract_address?.toString(),
        teamType: result.team_type.toString(),
        minDeposit: result.min_deposit.toString(),
        maxMembers: result.max_members,
        bettingStrategy: result.betting_strategy.toString(),
      };
    } catch (error) {
      logger.error('Failed to get team vault:', error);
      throw error;
    }
  }

  /**
   * Get team betting statistics
   */
  async getTeamStats(teamId: string): Promise<TeamStats> {
    try {
      const teamVault = await this.getTeamVault(teamId);
      const teamBets = await this.getTeamBets(teamId);
      
      const executedBets = teamBets.filter(bet => bet.status === 'executed');
      const winningBets = executedBets.filter(bet => bet.isWinner);
      
      const winRate = executedBets.length > 0 
        ? (winningBets.length / executedBets.length) * 100 
        : 0;

      const averageBetSize = executedBets.length > 0
        ? executedBets.reduce((sum, bet) => sum.plus(new Big(bet.amount)), new Big(0))
            .div(executedBets.length).toString()
        : '0';

      // Find top performer
      const topPerformer = teamVault.members.reduce((top, member) => 
        new Big(member.totalWinnings).gt(new Big(top.totalWinnings)) ? member : top
      );

      return {
        teamId,
        totalMembers: teamVault.members.length,
        totalDeposits: teamVault.totalDeposits,
        totalBets: executedBets.length,
        winRate,
        totalPayouts: teamVault.totalPayouts,
        averageBetSize,
        topPerformer: topPerformer.nickname,
        teamRank: 0, // Would be calculated against other teams
      };
    } catch (error) {
      logger.error('Failed to get team stats:', error);
      throw error;
    }
  }

  /**
   * Get team leaderboard
   */
  async getTeamLeaderboard(): Promise<TeamStats[]> {
    try {
      // This would typically query all teams and rank them
      // For now, returning mock data
      return [];
    } catch (error) {
      logger.error('Failed to get team leaderboard:', error);
      throw error;
    }
  }

  /**
   * Create team vault on Soroban contract
   */
  private async createTeamVaultOnContract(
    creatorKeypair: Keypair,
    teamId: string,
    config: any
  ): Promise<string> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      const result = await contract.call(
        'create_team_vault',
        creatorKeypair.publicKey(),
        teamId,
        config.name,
        config.description,
        config.teamType,
        config.minDeposit,
        config.maxMembers,
        config.bettingStrategy
      );

      return result.toString();
    } catch (error) {
      logger.error('Failed to create team vault on contract:', error);
      throw error;
    }
  }

  /**
   * Add member to team vault
   */
  private async addMemberToTeamVault(teamId: string, member: TeamMember): Promise<void> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      await contract.call(
        'add_team_member',
        teamId,
        member.address,
        member.nickname,
        member.depositAmount,
        member.votingPower
      );
    } catch (error) {
      logger.error('Failed to add member to team vault:', error);
      throw error;
    }
  }

  /**
   * Calculate voting power based on deposit amount
   */
  private calculateVotingPower(depositAmount: string): string {
    // Simple linear voting power calculation
    // Could be more sophisticated (quadratic, etc.)
    return new Big(depositAmount).div(100).toString();
  }

  /**
   * Check if bet should be executed based on voting strategy
   */
  private async shouldExecuteBet(teamBet: TeamBet, teamVault: TeamVault): Promise<boolean> {
    const totalVotingPower = teamVault.members.reduce((sum, member) => 
      sum.plus(new Big(member.votingPower)), new Big(0)
    );

    const approvedVotingPower = teamBet.approvedBy.reduce((sum, voter) => {
      const member = teamVault.members.find(m => m.address === voter);
      return sum.plus(new Big(member?.votingPower || '0'));
    }, new Big(0));

    const rejectedVotingPower = teamBet.rejectedBy.reduce((sum, voter) => {
      const member = teamVault.members.find(m => m.address === voter);
      return sum.plus(new Big(member?.votingPower || '0'));
    }, new Big(0));

    switch (teamVault.bettingStrategy) {
      case 'consensus':
        return approvedVotingPower.gte(totalVotingPower.mul(0.8)); // 80% consensus
      case 'majority':
        return approvedVotingPower.gt(rejectedVotingPower);
      case 'individual':
        return approvedVotingPower.gte(totalVotingPower.mul(0.5)); // 50% approval
      default:
        return false;
    }
  }

  /**
   * Get team vault address
   */
  private getTeamVaultAddress(teamId: string): string {
    // This would typically derive from the team contract
    return `G${teamId.substring(0, 55)}`;
  }

  /**
   * Get team vault keypair
   */
  private getTeamVaultKeypair(teamId: string): Keypair {
    // This would typically be derived from team ID
    // For demo purposes, using a deterministic approach
    return Keypair.fromSecret(process.env.TEAM_VAULT_SECRET || '');
  }

  /**
   * Store team bet proposal
   */
  private async storeTeamBetProposal(teamBet: TeamBet): Promise<void> {
    // This would typically store in database
    // For now, just logging
    logger.info('Team bet proposal stored:', teamBet);
  }

  /**
   * Get team bet
   */
  private async getTeamBet(betId: string): Promise<TeamBet | null> {
    // This would typically query database
    // For now, returning null
    return null;
  }

  /**
   * Update team bet
   */
  private async updateTeamBet(teamBet: TeamBet): Promise<void> {
    // This would typically update database
    logger.info('Team bet updated:', teamBet);
  }

  /**
   * Update team vault stats
   */
  private async updateTeamVaultStats(teamId: string, stats: any): Promise<void> {
    // This would typically update database
    logger.info('Team vault stats updated:', { teamId, stats });
  }

  /**
   * Get team bets
   */
  private async getTeamBets(teamId: string): Promise<TeamBet[]> {
    // This would typically query database
    return [];
  }
}
