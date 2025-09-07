import { Keypair } from '@stellar/stellar-sdk';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { KaleTokenService } from './kale-token.service';
import { GamificationService } from './gamification.service';
import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export interface SeasonalCompetition {
  id: string;
  name: string;
  description: string;
  season: string; // e.g., "Spring 2024", "Summer 2024"
  startDate: number;
  endDate: number;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  competitionType: 'individual' | 'team' | 'mixed';
  categories: CompetitionCategory[];
  totalPrizePool: string;
  participantCount: number;
  rules: CompetitionRule[];
  socialSharingEnabled: boolean;
  createdAt: number;
  createdBy: string;
}

export interface CompetitionCategory {
  id: string;
  name: string;
  description: string;
  prizePool: string;
  criteria: 'volume' | 'accuracy' | 'streak' | 'innovation' | 'social';
  weight: number; // For mixed competitions
  requirements: CategoryRequirement[];
}

export interface CategoryRequirement {
  type: 'min_bets' | 'min_volume' | 'min_accuracy' | 'min_streak' | 'social_shares';
  value: string;
  description: string;
}

export interface CompetitionRule {
  id: string;
  title: string;
  description: string;
  type: 'scoring' | 'eligibility' | 'penalty' | 'bonus';
  value?: string;
}

export interface CompetitionParticipant {
  id: string;
  competitionId: string;
  userId: string;
  teamId?: string;
  category: string;
  joinedAt: number;
  status: 'active' | 'disqualified' | 'withdrawn';
  currentScore: string;
  currentRank: number;
  achievements: CompetitionAchievement[];
  socialShares: SocialShare[];
}

export interface CompetitionAchievement {
  id: string;
  name: string;
  description: string;
  points: number;
  earnedAt: number;
  category: string;
}

export interface SocialShare {
  id: string;
  platform: 'twitter' | 'discord' | 'telegram' | 'reddit' | 'linkedin';
  content: string;
  sharedAt: number;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  bonusPoints: number;
}

export interface CompetitionLeaderboard {
  competitionId: string;
  category: string;
  rankings: CompetitionRanking[];
  lastUpdated: number;
  totalParticipants: number;
}

export interface CompetitionRanking {
  rank: number;
  participantId: string;
  userId: string;
  teamId?: string;
  username: string;
  teamName?: string;
  score: string;
  achievements: number;
  socialShares: number;
  bonusPoints: string;
  trend: 'up' | 'down' | 'stable';
  previousRank?: number;
}

export interface CompetitionReward {
  id: string;
  competitionId: string;
  participantId: string;
  category: string;
  rank: number;
  rewardType: 'kale_tokens' | 'badge' | 'nft' | 'special_access';
  amount: string;
  description: string;
  claimed: boolean;
  claimedAt?: number;
  transactionHash?: string;
}

export class SeasonalCompetitionsService {
  private stellarRpc: StellarRpcService;
  private kaleToken: KaleTokenService;
  private gamification: GamificationService;
  private competitions: Map<string, SeasonalCompetition> = new Map();
  private participants: Map<string, CompetitionParticipant> = new Map();
  private leaderboards: Map<string, CompetitionLeaderboard> = new Map();
  private rewards: Map<string, CompetitionReward> = new Map();

  constructor(
    stellarRpc: StellarRpcService,
    kaleToken: KaleTokenService,
    gamification: GamificationService
  ) {
    this.stellarRpc = stellarRpc;
    this.kaleToken = kaleToken;
    this.gamification = gamification;
    this.initializeDefaultCompetitions();
  }

  /**
   * Create a new seasonal competition
   */
  async createCompetition(
    creatorKeypair: Keypair,
    competitionData: Omit<SeasonalCompetition, 'id' | 'createdAt' | 'createdBy' | 'participantCount'>
  ): Promise<SeasonalCompetition> {
    try {
      const competition: SeasonalCompetition = {
        id: uuidv4(),
        ...competitionData,
        participantCount: 0,
        createdAt: Date.now(),
        createdBy: creatorKeypair.publicKey(),
      };

      // Validate competition data
      await this.validateCompetitionData(competition);

      // Store competition
      this.competitions.set(competition.id, competition);

      logger.info('Seasonal competition created:', {
        competitionId: competition.id,
        name: competition.name,
        season: competition.season,
        creator: creatorKeypair.publicKey(),
        prizePool: competition.totalPrizePool,
      });

      return competition;
    } catch (error) {
      logger.error('Failed to create seasonal competition:', error);
      throw error;
    }
  }

  /**
   * Join a seasonal competition
   */
  async joinCompetition(
    userKeypair: Keypair,
    competitionId: string,
    category: string,
    teamId?: string
  ): Promise<CompetitionParticipant> {
    try {
      const competition = this.competitions.get(competitionId);
      if (!competition) {
        throw new Error('Competition not found');
      }

      if (competition.status !== 'active') {
        throw new Error('Competition is not currently active');
      }

      // Check if user is already participating
      const existingParticipant = Array.from(this.participants.values())
        .find(p => p.competitionId === competitionId && p.userId === userKeypair.publicKey());

      if (existingParticipant) {
        throw new Error('User is already participating in this competition');
      }

      // Validate category
      const categoryData = competition.categories.find(c => c.id === category);
      if (!categoryData) {
        throw new Error('Invalid competition category');
      }

      // Check eligibility requirements
      await this.checkEligibilityRequirements(userKeypair.publicKey(), categoryData.requirements);

      // Create participant
      const participant: CompetitionParticipant = {
        id: uuidv4(),
        competitionId,
        userId: userKeypair.publicKey(),
        teamId,
        category,
        joinedAt: Date.now(),
        status: 'active',
        currentScore: '0',
        currentRank: 0,
        achievements: [],
        socialShares: [],
      };

      this.participants.set(participant.id, participant);

      // Update competition participant count
      competition.participantCount += 1;
      this.competitions.set(competitionId, competition);

      logger.info('User joined seasonal competition:', {
        participantId: participant.id,
        competitionId,
        userId: userKeypair.publicKey(),
        category,
        teamId,
      });

      return participant;
    } catch (error) {
      logger.error('Failed to join seasonal competition:', error);
      throw error;
    }
  }

  /**
   * Record social share for bonus points
   */
  async recordSocialShare(
    userKeypair: Keypair,
    competitionId: string,
    platform: SocialShare['platform'],
    content: string
  ): Promise<SocialShare> {
    try {
      const participant = Array.from(this.participants.values())
        .find(p => p.competitionId === competitionId && p.userId === userKeypair.publicKey());

      if (!participant) {
        throw new Error('User is not participating in this competition');
      }

      const competition = this.competitions.get(competitionId);
      if (!competition || !competition.socialSharingEnabled) {
        throw new Error('Social sharing is not enabled for this competition');
      }

      // Calculate bonus points based on platform and content
      const bonusPoints = this.calculateSocialShareBonus(platform, content);

      const socialShare: SocialShare = {
        id: uuidv4(),
        platform,
        content,
        sharedAt: Date.now(),
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0,
        },
        bonusPoints,
      };

      participant.socialShares.push(socialShare);
      this.participants.set(participant.id, participant);

      // Update participant score
      await this.updateParticipantScore(participant.id);

      logger.info('Social share recorded:', {
        shareId: socialShare.id,
        competitionId,
        userId: userKeypair.publicKey(),
        platform,
        bonusPoints,
      });

      return socialShare;
    } catch (error) {
      logger.error('Failed to record social share:', error);
      throw error;
    }
  }

  /**
   * Update participant score based on achievements and social shares
   */
  async updateParticipantScore(participantId: string): Promise<void> {
    try {
      const participant = this.participants.get(participantId);
      if (!participant) {
        throw new Error('Participant not found');
      }

      const competition = this.competitions.get(participant.competitionId);
      if (!competition) {
        throw new Error('Competition not found');
      }

      // Calculate base score from achievements
      const achievementScore = participant.achievements.reduce((sum, achievement) => 
        sum + achievement.points, 0
      );

      // Calculate social sharing bonus
      const socialBonus = participant.socialShares.reduce((sum, share) => 
        sum + share.bonusPoints, 0
      );

      // Calculate total score
      const totalScore = achievementScore + socialBonus;

      participant.currentScore = totalScore.toString();
      this.participants.set(participantId, participant);

      // Update leaderboard
      await this.updateLeaderboard(participant.competitionId, participant.category);

      logger.info('Participant score updated:', {
        participantId,
        competitionId: participant.competitionId,
        category: participant.category,
        newScore: totalScore,
        achievementScore,
        socialBonus,
      });
    } catch (error) {
      logger.error('Failed to update participant score:', error);
      throw error;
    }
  }

  /**
   * Get competition leaderboard
   */
  async getCompetitionLeaderboard(
    competitionId: string,
    category?: string
  ): Promise<CompetitionLeaderboard[]> {
    try {
      const competition = this.competitions.get(competitionId);
      if (!competition) {
        throw new Error('Competition not found');
      }

      const leaderboards: CompetitionLeaderboard[] = [];
      const categories = category ? [category] : competition.categories.map(c => c.id);

      for (const cat of categories) {
        const leaderboardId = `${competitionId}_${cat}`;
        let leaderboard = this.leaderboards.get(leaderboardId);

        if (!leaderboard || Date.now() - leaderboard.lastUpdated > 300000) { // 5 minutes
          leaderboard = await this.generateLeaderboard(competitionId, cat);
          this.leaderboards.set(leaderboardId, leaderboard);
        }

        leaderboards.push(leaderboard);
      }

      return leaderboards;
    } catch (error) {
      logger.error('Failed to get competition leaderboard:', error);
      throw error;
    }
  }

  /**
   * Distribute rewards at the end of competition
   */
  async distributeCompetitionRewards(competitionId: string): Promise<CompetitionReward[]> {
    try {
      const competition = this.competitions.get(competitionId);
      if (!competition) {
        throw new Error('Competition not found');
      }

      if (competition.status !== 'ended') {
        throw new Error('Competition must be ended to distribute rewards');
      }

      const rewards: CompetitionReward[] = [];

      // Distribute rewards for each category
      for (const category of competition.categories) {
        const leaderboard = await this.getCompetitionLeaderboard(competitionId, category.id);
        const categoryLeaderboard = leaderboard[0];

        if (!categoryLeaderboard) continue;

        // Calculate reward distribution
        const rewardDistribution = this.calculateRewardDistribution(
          category.prizePool,
          categoryLeaderboard.rankings.length
        );

        // Create rewards for top participants
        for (let i = 0; i < Math.min(rewardDistribution.length, categoryLeaderboard.rankings.length); i++) {
          const ranking = categoryLeaderboard.rankings[i];
          const rewardAmount = rewardDistribution[i];

          const reward: CompetitionReward = {
            id: uuidv4(),
            competitionId,
            participantId: ranking.participantId,
            category: category.id,
            rank: ranking.rank,
            rewardType: 'kale_tokens',
            amount: rewardAmount,
            description: `${category.name} - Rank ${ranking.rank}`,
            claimed: false,
          };

          rewards.push(reward);
          this.rewards.set(reward.id, reward);
        }
      }

      logger.info('Competition rewards distributed:', {
        competitionId,
        totalRewards: rewards.length,
        totalPrizePool: competition.totalPrizePool,
      });

      return rewards;
    } catch (error) {
      logger.error('Failed to distribute competition rewards:', error);
      throw error;
    }
  }

  /**
   * Claim competition reward
   */
  async claimCompetitionReward(
    userKeypair: Keypair,
    rewardId: string
  ): Promise<TransactionResult> {
    try {
      const reward = this.rewards.get(rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }

      if (reward.claimed) {
        throw new Error('Reward already claimed');
      }

      // Verify user owns this reward
      const participant = this.participants.get(reward.participantId);
      if (!participant || participant.userId !== userKeypair.publicKey()) {
        throw new Error('Unauthorized: User does not own this reward');
      }

      // Transfer KALE tokens
      const transactionResult = await this.kaleToken.transfer(
        userKeypair,
        userKeypair.publicKey(),
        reward.amount
      );

      // Mark reward as claimed
      reward.claimed = true;
      reward.claimedAt = Date.now();
      reward.transactionHash = transactionResult.transactionHash;
      this.rewards.set(rewardId, reward);

      logger.info('Competition reward claimed:', {
        rewardId,
        competitionId: reward.competitionId,
        userId: userKeypair.publicKey(),
        amount: reward.amount,
        transactionHash: transactionResult.transactionHash,
      });

      return transactionResult;
    } catch (error) {
      logger.error('Failed to claim competition reward:', error);
      throw error;
    }
  }

  /**
   * Get user's competition history
   */
  async getUserCompetitionHistory(userAddress: string): Promise<{
    competitions: SeasonalCompetition[];
    participations: CompetitionParticipant[];
    rewards: CompetitionReward[];
  }> {
    try {
      const participations = Array.from(this.participants.values())
        .filter(p => p.userId === userAddress);

      const competitionIds = [...new Set(participations.map(p => p.competitionId))];
      const competitions = competitionIds.map(id => this.competitions.get(id)).filter(Boolean) as SeasonalCompetition[];

      const rewards = Array.from(this.rewards.values())
        .filter(r => participations.some(p => p.id === r.participantId));

      return {
        competitions,
        participations,
        rewards,
      };
    } catch (error) {
      logger.error('Failed to get user competition history:', error);
      throw error;
    }
  }

  // Private helper methods

  private async validateCompetitionData(competition: SeasonalCompetition): Promise<void> {
    if (competition.startDate >= competition.endDate) {
      throw new Error('Start date must be before end date');
    }

    if (competition.categories.length === 0) {
      throw new Error('Competition must have at least one category');
    }

    const totalCategoryPrizePool = competition.categories.reduce((sum, cat) => 
      sum.plus(new Big(cat.prizePool)), new Big(0)
    );

    if (!totalCategoryPrizePool.eq(new Big(competition.totalPrizePool))) {
      throw new Error('Total prize pool must match sum of category prize pools');
    }
  }

  private async checkEligibilityRequirements(
    userAddress: string,
    requirements: CategoryRequirement[]
  ): Promise<void> {
    const userProfile = await this.gamification.getUserProfile(userAddress);

    for (const requirement of requirements) {
      switch (requirement.type) {
        case 'min_bets':
          if (userProfile.stats.totalBets < parseInt(requirement.value)) {
            throw new Error(`Minimum ${requirement.value} bets required`);
          }
          break;
        case 'min_volume':
          if (new Big(userProfile.stats.totalVolume).lt(new Big(requirement.value))) {
            throw new Error(`Minimum ${requirement.value} KALE volume required`);
          }
          break;
        case 'min_accuracy':
          if (userProfile.stats.winRate < parseFloat(requirement.value)) {
            throw new Error(`Minimum ${requirement.value}% accuracy required`);
          }
          break;
        case 'min_streak':
          if (userProfile.stats.longestWinStreak < parseInt(requirement.value)) {
            throw new Error(`Minimum ${requirement.value} win streak required`);
          }
          break;
      }
    }
  }

  private calculateSocialShareBonus(platform: SocialShare['platform'], content: string): number {
    const basePoints = {
      twitter: 10,
      discord: 8,
      telegram: 6,
      reddit: 12,
      linkedin: 15,
    };

    const platformBonus = basePoints[platform] || 5;
    const contentBonus = content.length > 100 ? 5 : 0; // Bonus for detailed content
    const hashtagBonus = (content.match(/#/g) || []).length * 2; // Bonus for hashtags

    return platformBonus + contentBonus + hashtagBonus;
  }

  private async generateLeaderboard(
    competitionId: string,
    category: string
  ): Promise<CompetitionLeaderboard> {
    const participants = Array.from(this.participants.values())
      .filter(p => p.competitionId === competitionId && p.category === category && p.status === 'active')
      .sort((a, b) => parseFloat(b.currentScore) - parseFloat(a.currentScore));

    const rankings: CompetitionRanking[] = participants.map((participant, index) => ({
      rank: index + 1,
      participantId: participant.id,
      userId: participant.userId,
      teamId: participant.teamId,
      username: `User_${participant.userId.substring(0, 8)}`, // Mock username
      teamName: participant.teamId ? `Team_${participant.teamId.substring(0, 8)}` : undefined,
      score: participant.currentScore,
      achievements: participant.achievements.length,
      socialShares: participant.socialShares.length,
      bonusPoints: participant.socialShares.reduce((sum, share) => sum + share.bonusPoints, 0).toString(),
      trend: 'stable', // Would need historical data to calculate
    }));

    return {
      competitionId,
      category,
      rankings,
      lastUpdated: Date.now(),
      totalParticipants: participants.length,
    };
  }

  private async updateLeaderboard(competitionId: string, category: string): Promise<void> {
    const leaderboardId = `${competitionId}_${category}`;
    const leaderboard = await this.generateLeaderboard(competitionId, category);
    this.leaderboards.set(leaderboardId, leaderboard);
  }

  private calculateRewardDistribution(prizePool: string, participantCount: number): string[] {
    const totalPrize = new Big(prizePool);
    const distribution: string[] = [];

    // Top 10% get 50% of prize pool
    const topCount = Math.max(1, Math.floor(participantCount * 0.1));
    const topPrize = totalPrize.mul(0.5).div(topCount);

    for (let i = 0; i < topCount; i++) {
      distribution.push(topPrize.toString());
    }

    // Next 20% get 30% of prize pool
    const midCount = Math.max(1, Math.floor(participantCount * 0.2));
    const midPrize = totalPrize.mul(0.3).div(midCount);

    for (let i = 0; i < midCount; i++) {
      distribution.push(midPrize.toString());
    }

    // Remaining participants get 20% of prize pool
    const remainingCount = Math.max(1, participantCount - topCount - midCount);
    const remainingPrize = totalPrize.mul(0.2).div(remainingCount);

    for (let i = 0; i < remainingCount; i++) {
      distribution.push(remainingPrize.toString());
    }

    return distribution;
  }

  private initializeDefaultCompetitions(): void {
    // Spring 2024 Competition
    const springCompetition: SeasonalCompetition = {
      id: 'spring-2024',
      name: 'Spring Prediction Masters',
      description: 'Compete in the ultimate spring prediction tournament with KALE rewards!',
      season: 'Spring 2024',
      startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      status: 'active',
      competitionType: 'mixed',
      categories: [
        {
          id: 'volume-master',
          name: 'Volume Master',
          description: 'Highest betting volume',
          prizePool: '50000',
          criteria: 'volume',
          weight: 0.3,
          requirements: [
            { type: 'min_bets', value: '10', description: 'Minimum 10 bets required' },
            { type: 'min_volume', value: '1000', description: 'Minimum 1000 KALE volume' }
          ]
        },
        {
          id: 'accuracy-champion',
          name: 'Accuracy Champion',
          description: 'Highest prediction accuracy',
          prizePool: '30000',
          criteria: 'accuracy',
          weight: 0.4,
          requirements: [
            { type: 'min_bets', value: '20', description: 'Minimum 20 bets required' },
            { type: 'min_accuracy', value: '60', description: 'Minimum 60% accuracy' }
          ]
        },
        {
          id: 'social-influencer',
          name: 'Social Influencer',
          description: 'Most social shares and engagement',
          prizePool: '20000',
          criteria: 'social',
          weight: 0.3,
          requirements: [
            { type: 'social_shares', value: '5', description: 'Minimum 5 social shares' }
          ]
        }
      ],
      totalPrizePool: '100000',
      participantCount: 0,
      rules: [
        {
          id: 'rule-1',
          title: 'Fair Play',
          description: 'All participants must follow fair play guidelines',
          type: 'eligibility'
        },
        {
          id: 'rule-2',
          title: 'Social Sharing Bonus',
          description: 'Share your predictions on social media for bonus points',
          type: 'bonus',
          value: '10'
        }
      ],
      socialSharingEnabled: true,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      createdBy: 'GADMIN123...'
    };

    this.competitions.set(springCompetition.id, springCompetition);
  }
}
