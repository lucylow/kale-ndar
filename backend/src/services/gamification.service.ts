import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  address: string;
  nickname: string;
  avatar?: string;
  level: number;
  experience: number;
  reputation: number;
  badges: Badge[];
  achievements: Achievement[];
  stats: UserStats;
  createdAt: number;
  lastActive: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'betting' | 'prediction' | 'social' | 'special';
  earnedAt: number;
  metadata?: any;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'streak' | 'accuracy' | 'volume' | 'social' | 'special';
  earnedAt: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
}

export interface UserStats {
  totalBets: number;
  winningBets: number;
  totalVolume: string;
  totalPayouts: string;
  averageBetSize: string;
  winRate: number;
  accuracy: number;
  longestWinStreak: number;
  currentWinStreak: number;
  longestLossStreak: number;
  currentLossStreak: number;
  marketsCreated: number;
  marketsResolved: number;
  teamMemberships: number;
  nftReceipts: number;
  socialScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  nickname: string;
  score: number;
  level: number;
  badgeCount: number;
  stats: UserStats;
  change: number; // Change from previous period
}

export interface Leaderboard {
  id: string;
  name: string;
  category: 'overall' | 'accuracy' | 'volume' | 'streak' | 'social' | 'weekly' | 'monthly';
  entries: LeaderboardEntry[];
  lastUpdated: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

export interface GamificationEvent {
  id: string;
  userId: string;
  eventType: 'bet_placed' | 'bet_won' | 'bet_lost' | 'market_created' | 'market_resolved' | 'badge_earned' | 'achievement_unlocked' | 'level_up';
  points: number;
  metadata: any;
  timestamp: number;
}

export class GamificationService {
  private userProfiles: Map<string, UserProfile> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();
  private badges: Map<string, Badge> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private events: GamificationEvent[] = [];

  constructor() {
    this.initializeBadges();
    this.initializeAchievements();
    this.startLeaderboardUpdates();
  }

  /**
   * Get or create user profile
   */
  async getUserProfile(userAddress: string): Promise<UserProfile> {
    try {
      let profile = this.userProfiles.get(userAddress);
      
      if (!profile) {
        profile = await this.createUserProfile(userAddress);
      }

      // Update last active
      profile.lastActive = Date.now();
      this.userProfiles.set(userAddress, profile);

      return profile;
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user stats after bet
   */
  async updateUserStatsAfterBet(
    userAddress: string,
    betAmount: string,
    isWinner: boolean,
    payoutAmount?: string
  ): Promise<void> {
    try {
      const profile = await this.getUserProfile(userAddress);
      
      // Update basic stats
      profile.stats.totalBets += 1;
      profile.stats.totalVolume = new Big(profile.stats.totalVolume).plus(new Big(betAmount)).toString();
      
      if (isWinner) {
        profile.stats.winningBets += 1;
        profile.stats.currentWinStreak += 1;
        profile.stats.currentLossStreak = 0;
        
        if (profile.stats.currentWinStreak > profile.stats.longestWinStreak) {
          profile.stats.longestWinStreak = profile.stats.currentWinStreak;
        }
        
        if (payoutAmount) {
          profile.stats.totalPayouts = new Big(profile.stats.totalPayouts).plus(new Big(payoutAmount)).toString();
        }
      } else {
        profile.stats.currentLossStreak += 1;
        profile.stats.currentWinStreak = 0;
        
        if (profile.stats.currentLossStreak > profile.stats.longestLossStreak) {
          profile.stats.longestLossStreak = profile.stats.currentLossStreak;
        }
      }

      // Update calculated stats
      profile.stats.winRate = (profile.stats.winningBets / profile.stats.totalBets) * 100;
      profile.stats.averageBetSize = new Big(profile.stats.totalVolume).div(profile.stats.totalBets).toString();

      // Award experience points
      const experienceGained = this.calculateExperienceGain(betAmount, isWinner, payoutAmount);
      await this.awardExperience(userAddress, experienceGained);

      // Check for badge/achievement unlocks
      await this.checkBadgeUnlocks(userAddress);
      await this.checkAchievementUnlocks(userAddress);

      // Record event
      this.recordEvent({
        id: uuidv4(),
        userId: userAddress,
        eventType: isWinner ? 'bet_won' : 'bet_lost',
        points: experienceGained,
        metadata: { betAmount, payoutAmount, isWinner },
        timestamp: Date.now(),
      });

      this.userProfiles.set(userAddress, profile);
    } catch (error) {
      logger.error('Failed to update user stats after bet:', error);
      throw error;
    }
  }

  /**
   * Update user stats after market creation
   */
  async updateUserStatsAfterMarketCreation(userAddress: string): Promise<void> {
    try {
      const profile = await this.getUserProfile(userAddress);
      profile.stats.marketsCreated += 1;

      // Award experience for market creation
      const experienceGained = 50;
      await this.awardExperience(userAddress, experienceGained);

      // Record event
      this.recordEvent({
        id: uuidv4(),
        userId: userAddress,
        eventType: 'market_created',
        points: experienceGained,
        metadata: { marketsCreated: profile.stats.marketsCreated },
        timestamp: Date.now(),
      });

      this.userProfiles.set(userAddress, profile);
    } catch (error) {
      logger.error('Failed to update user stats after market creation:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    category: string = 'overall',
    period: string = 'all-time',
    limit: number = 100
  ): Promise<Leaderboard> {
    try {
      const leaderboardId = `${category}_${period}`;
      let leaderboard = this.leaderboards.get(leaderboardId);

      if (!leaderboard || Date.now() - leaderboard.lastUpdated > 300000) { // 5 minutes
        leaderboard = await this.generateLeaderboard(category, period, limit);
        this.leaderboards.set(leaderboardId, leaderboard);
      }

      return leaderboard;
    } catch (error) {
      logger.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user badges
   */
  async getUserBadges(userAddress: string): Promise<Badge[]> {
    try {
      const profile = await this.getUserProfile(userAddress);
      return profile.badges;
    } catch (error) {
      logger.error('Failed to get user badges:', error);
      throw error;
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userAddress: string): Promise<Achievement[]> {
    try {
      const profile = await this.getUserProfile(userAddress);
      return profile.achievements;
    } catch (error) {
      logger.error('Failed to get user achievements:', error);
      throw error;
    }
  }

  /**
   * Get user ranking
   */
  async getUserRanking(userAddress: string, category: string = 'overall'): Promise<{
    rank: number;
    totalUsers: number;
    percentile: number;
  }> {
    try {
      const leaderboard = await this.getLeaderboard(category);
      const entry = leaderboard.entries.find(e => e.address === userAddress);
      
      if (!entry) {
        return { rank: 0, totalUsers: leaderboard.entries.length, percentile: 0 };
      }

      const percentile = ((leaderboard.entries.length - entry.rank + 1) / leaderboard.entries.length) * 100;

      return {
        rank: entry.rank,
        totalUsers: leaderboard.entries.length,
        percentile: Math.round(percentile),
      };
    } catch (error) {
      logger.error('Failed to get user ranking:', error);
      throw error;
    }
  }

  /**
   * Create user profile
   */
  private async createUserProfile(userAddress: string): Promise<UserProfile> {
    const profile: UserProfile = {
      address: userAddress,
      nickname: `User_${userAddress.substring(0, 8)}`,
      level: 1,
      experience: 0,
      reputation: 0,
      badges: [],
      achievements: [],
      stats: {
        totalBets: 0,
        winningBets: 0,
        totalVolume: '0',
        totalPayouts: '0',
        averageBetSize: '0',
        winRate: 0,
        accuracy: 0,
        longestWinStreak: 0,
        currentWinStreak: 0,
        longestLossStreak: 0,
        currentLossStreak: 0,
        marketsCreated: 0,
        marketsResolved: 0,
        teamMemberships: 0,
        nftReceipts: 0,
        socialScore: 0,
      },
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    this.userProfiles.set(userAddress, profile);
    return profile;
  }

  /**
   * Calculate experience gain
   */
  private calculateExperienceGain(
    betAmount: string,
    isWinner: boolean,
    payoutAmount?: string
  ): number {
    let baseExp = 10; // Base experience for placing bet
    
    // Bonus for bet size
    const amountBonus = Math.min(new Big(betAmount).div(1000).toNumber(), 50);
    
    // Bonus for winning
    const winBonus = isWinner ? 20 : 0;
    
    // Bonus for payout
    const payoutBonus = payoutAmount ? Math.min(new Big(payoutAmount).div(1000).toNumber(), 30) : 0;
    
    return baseExp + amountBonus + winBonus + payoutBonus;
  }

  /**
   * Award experience points
   */
  private async awardExperience(userAddress: string, points: number): Promise<void> {
    const profile = this.userProfiles.get(userAddress);
    if (!profile) return;

    profile.experience += points;
    
    // Check for level up
    const newLevel = this.calculateLevel(profile.experience);
    if (newLevel > profile.level) {
      profile.level = newLevel;
      
      // Record level up event
      this.recordEvent({
        id: uuidv4(),
        userId: userAddress,
        eventType: 'level_up',
        points: 0,
        metadata: { newLevel, totalExperience: profile.experience },
        timestamp: Date.now(),
      });
    }

    this.userProfiles.set(userAddress, profile);
  }

  /**
   * Calculate level from experience
   */
  private calculateLevel(experience: number): number {
    // Level formula: level = floor(sqrt(experience / 100)) + 1
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  /**
   * Check for badge unlocks
   */
  private async checkBadgeUnlocks(userAddress: string): Promise<void> {
    const profile = this.userProfiles.get(userAddress);
    if (!profile) return;

    const availableBadges = Array.from(this.badges.values());
    
    for (const badge of availableBadges) {
      // Skip if already earned
      if (profile.badges.some(b => b.id === badge.id)) continue;
      
      // Check unlock conditions
      if (await this.checkBadgeUnlockCondition(badge, profile)) {
        await this.awardBadge(userAddress, badge);
      }
    }
  }

  /**
   * Check badge unlock condition
   */
  private async checkBadgeUnlockCondition(badge: Badge, profile: UserProfile): Promise<boolean> {
    switch (badge.id) {
      case 'first_bet':
        return profile.stats.totalBets >= 1;
      case 'high_roller':
        return new Big(profile.stats.totalVolume).gte(new Big('100000'));
      case 'win_streak_5':
        return profile.stats.longestWinStreak >= 5;
      case 'win_streak_10':
        return profile.stats.longestWinStreak >= 10;
      case 'market_creator':
        return profile.stats.marketsCreated >= 1;
      case 'accurate_predictor':
        return profile.stats.winRate >= 70 && profile.stats.totalBets >= 10;
      default:
        return false;
    }
  }

  /**
   * Award badge to user
   */
  private async awardBadge(userAddress: string, badge: Badge): Promise<void> {
    const profile = this.userProfiles.get(userAddress);
    if (!profile) return;

    const earnedBadge: Badge = {
      ...badge,
      earnedAt: Date.now(),
    };

    profile.badges.push(earnedBadge);
    profile.reputation += this.getBadgeReputationValue(badge.rarity);

    // Record badge earned event
    this.recordEvent({
      id: uuidv4(),
      userId: userAddress,
      eventType: 'badge_earned',
      points: this.getBadgeReputationValue(badge.rarity),
      metadata: { badgeId: badge.id, badgeName: badge.name },
      timestamp: Date.now(),
    });

    this.userProfiles.set(userAddress, profile);
  }

  /**
   * Check for achievement unlocks
   */
  private async checkAchievementUnlocks(userAddress: string): Promise<void> {
    const profile = this.userProfiles.get(userAddress);
    if (!profile) return;

    const availableAchievements = Array.from(this.achievements.values());
    
    for (const achievement of availableAchievements) {
      // Skip if already completed
      if (profile.achievements.some(a => a.id === achievement.id && a.isCompleted)) continue;
      
      // Update progress
      const progress = await this.calculateAchievementProgress(achievement, profile);
      const existingAchievement = profile.achievements.find(a => a.id === achievement.id);
      
      if (existingAchievement) {
        existingAchievement.progress = progress;
        if (progress >= achievement.maxProgress && !existingAchievement.isCompleted) {
          existingAchievement.isCompleted = true;
          existingAchievement.earnedAt = Date.now();
          
          // Award points
          profile.experience += achievement.points;
          
          // Record achievement unlocked event
          this.recordEvent({
            id: uuidv4(),
            userId: userAddress,
            eventType: 'achievement_unlocked',
            points: achievement.points,
            metadata: { achievementId: achievement.id, achievementName: achievement.name },
            timestamp: Date.now(),
          });
        }
      } else {
        const newAchievement: Achievement = {
          ...achievement,
          progress,
          isCompleted: progress >= achievement.maxProgress,
          earnedAt: progress >= achievement.maxProgress ? Date.now() : 0,
        };
        
        profile.achievements.push(newAchievement);
      }
    }

    this.userProfiles.set(userAddress, profile);
  }

  /**
   * Calculate achievement progress
   */
  private async calculateAchievementProgress(achievement: Achievement, profile: UserProfile): Promise<number> {
    switch (achievement.id) {
      case 'bet_master':
        return profile.stats.totalBets;
      case 'volume_king':
        return new Big(profile.stats.totalVolume).div(1000).toNumber();
      case 'streak_legend':
        return profile.stats.longestWinStreak;
      case 'market_maker':
        return profile.stats.marketsCreated;
      default:
        return 0;
    }
  }

  /**
   * Generate leaderboard
   */
  private async generateLeaderboard(
    category: string,
    period: string,
    limit: number
  ): Promise<Leaderboard> {
    const profiles = Array.from(this.userProfiles.values());
    let entries: LeaderboardEntry[] = [];

    // Calculate scores based on category
    switch (category) {
      case 'accuracy':
        entries = profiles
          .filter(p => p.stats.totalBets >= 5)
          .map(p => ({
            rank: 0,
            address: p.address,
            nickname: p.nickname,
            score: p.stats.winRate,
            level: p.level,
            badgeCount: p.badges.length,
            stats: p.stats,
            change: 0,
          }))
          .sort((a, b) => b.score - a.score);
        break;
      case 'volume':
        entries = profiles
          .map(p => ({
            rank: 0,
            address: p.address,
            nickname: p.nickname,
            score: new Big(p.stats.totalVolume).toNumber(),
            level: p.level,
            badgeCount: p.badges.length,
            stats: p.stats,
            change: 0,
          }))
          .sort((a, b) => b.score - a.score);
        break;
      case 'streak':
        entries = profiles
          .map(p => ({
            rank: 0,
            address: p.address,
            nickname: p.nickname,
            score: p.stats.longestWinStreak,
            level: p.level,
            badgeCount: p.badges.length,
            stats: p.stats,
            change: 0,
          }))
          .sort((a, b) => b.score - a.score);
        break;
      default: // overall
        entries = profiles
          .map(p => ({
            rank: 0,
            address: p.address,
            nickname: p.nickname,
            score: this.calculateOverallScore(p),
            level: p.level,
            badgeCount: p.badges.length,
            stats: p.stats,
            change: 0,
          }))
          .sort((a, b) => b.score - a.score);
    }

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Limit results
    entries = entries.slice(0, limit);

    return {
      id: `${category}_${period}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Leaderboard`,
      category: category as any,
      entries,
      lastUpdated: Date.now(),
      period: period as any,
    };
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(profile: UserProfile): number {
    const volumeScore = new Big(profile.stats.totalVolume).div(1000).toNumber();
    const accuracyScore = profile.stats.winRate;
    const streakScore = profile.stats.longestWinStreak * 10;
    const badgeScore = profile.badges.length * 5;
    const levelScore = profile.level * 2;
    
    return volumeScore + accuracyScore + streakScore + badgeScore + levelScore;
  }

  /**
   * Get badge reputation value
   */
  private getBadgeReputationValue(rarity: string): number {
    switch (rarity) {
      case 'common': return 10;
      case 'rare': return 25;
      case 'epic': return 50;
      case 'legendary': return 100;
      default: return 10;
    }
  }

  /**
   * Record gamification event
   */
  private recordEvent(event: GamificationEvent): void {
    this.events.push(event);
    
    // Keep only last 10000 events
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }
  }

  /**
   * Start leaderboard updates
   */
  private startLeaderboardUpdates(): void {
    // Update leaderboards every 5 minutes
    setInterval(() => {
      this.updateAllLeaderboards();
    }, 5 * 60 * 1000);
  }

  /**
   * Update all leaderboards
   */
  private async updateAllLeaderboards(): Promise<void> {
    const categories = ['overall', 'accuracy', 'volume', 'streak'];
    const periods = ['all-time', 'weekly', 'monthly'];
    
    for (const category of categories) {
      for (const period of periods) {
        try {
          await this.getLeaderboard(category, period);
        } catch (error) {
          logger.error('Failed to update leaderboard:', error);
        }
      }
    }
  }

  /**
   * Initialize badges
   */
  private initializeBadges(): void {
    const badgeDefinitions = [
      {
        id: 'first_bet',
        name: 'First Bet',
        description: 'Placed your first bet',
        icon: '🎯',
        rarity: 'common' as const,
        category: 'betting' as const,
      },
      {
        id: 'high_roller',
        name: 'High Roller',
        description: 'Bet over 100,000 KALE total',
        icon: '💰',
        rarity: 'rare' as const,
        category: 'betting' as const,
      },
      {
        id: 'win_streak_5',
        name: 'Hot Streak',
        description: 'Won 5 bets in a row',
        icon: '🔥',
        rarity: 'rare' as const,
        category: 'prediction' as const,
      },
      {
        id: 'win_streak_10',
        name: 'Unstoppable',
        description: 'Won 10 bets in a row',
        icon: '⚡',
        rarity: 'legendary' as const,
        category: 'prediction' as const,
      },
      {
        id: 'market_creator',
        name: 'Market Maker',
        description: 'Created your first market',
        icon: '🏗️',
        rarity: 'common' as const,
        category: 'social' as const,
      },
      {
        id: 'accurate_predictor',
        name: 'Oracle',
        description: '70%+ win rate with 10+ bets',
        icon: '🔮',
        rarity: 'epic' as const,
        category: 'prediction' as const,
      },
    ];

    badgeDefinitions.forEach(badge => {
      this.badges.set(badge.id, badge as Badge);
    });
  }

  /**
   * Initialize achievements
   */
  private initializeAchievements(): void {
    const achievementDefinitions = [
      {
        id: 'bet_master',
        name: 'Bet Master',
        description: 'Place 100 bets',
        icon: '🎲',
        points: 100,
        category: 'volume' as const,
        maxProgress: 100,
      },
      {
        id: 'volume_king',
        name: 'Volume King',
        description: 'Bet 1,000,000 KALE total',
        icon: '👑',
        points: 200,
        category: 'volume' as const,
        maxProgress: 1000,
      },
      {
        id: 'streak_legend',
        name: 'Streak Legend',
        description: 'Achieve a 20-win streak',
        icon: '🏆',
        points: 500,
        category: 'streak' as const,
        maxProgress: 20,
      },
      {
        id: 'market_maker',
        name: 'Market Maker',
        description: 'Create 10 markets',
        icon: '🏗️',
        points: 150,
        category: 'social' as const,
        maxProgress: 10,
      },
    ];

    achievementDefinitions.forEach(achievement => {
      this.achievements.set(achievement.id, achievement as Achievement);
    });
  }
}

