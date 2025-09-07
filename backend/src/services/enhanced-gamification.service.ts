import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

// Enhanced interfaces for advanced gamification
export interface AdvancedBadge extends Badge {
  category: BadgeCategory;
  subcategory?: string;
  rarity: BadgeRarity;
  unlockConditions: BadgeCondition[];
  rewards: BadgeReward[];
  isSecret: boolean;
  isTimeLimited: boolean;
  expiresAt?: number;
  metadata: BadgeMetadata;
}

export interface BadgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentCategory?: string;
}

export interface BadgeCondition {
  type: 'betting' | 'prediction' | 'social' | 'market' | 'time' | 'volume' | 'streak' | 'accuracy';
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
  value: any;
  description: string;
}

export interface BadgeReward {
  type: 'xp' | 'kale' | 'badge' | 'title' | 'access' | 'discount';
  amount: number;
  description: string;
}

export interface BadgeMetadata {
  difficulty: number; // 1-10 scale
  estimatedTimeToEarn: number; // in hours
  popularity: number; // percentage of users who have this badge
  tags: string[];
}

export interface BadgeRarity {
  level: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  color: string;
  glowEffect: boolean;
  animationType: 'none' | 'pulse' | 'rotate' | 'float' | 'sparkle';
  dropRate: number; // percentage chance to earn
}

export interface SeasonalBadge extends AdvancedBadge {
  season: string;
  year: number;
  isRetired: boolean;
  retirementDate?: number;
}

export interface SocialBadge extends AdvancedBadge {
  socialRequirement: {
    type: 'followers' | 'mentions' | 'shares' | 'collaborations';
    count: number;
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
  };
}

export interface PredictionMasteryBadge extends AdvancedBadge {
  masteryArea: 'crypto' | 'stocks' | 'sports' | 'politics' | 'weather' | 'economics';
  accuracyThreshold: number;
  minimumBets: number;
  timeframe: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export class EnhancedGamificationService {
  private badges: Map<string, AdvancedBadge> = new Map();
  private badgeCategories: Map<string, BadgeCategory> = new Map();
  private seasonalBadges: Map<string, SeasonalBadge> = new Map();
  private socialBadges: Map<string, SocialBadge> = new Map();
  private masteryBadges: Map<string, PredictionMasteryBadge> = new Map();

  constructor() {
    this.initializeBadgeCategories();
    this.initializeAdvancedBadges();
    this.initializeSeasonalBadges();
    this.initializeSocialBadges();
    this.initializeMasteryBadges();
  }

  /**
   * Initialize badge categories
   */
  private initializeBadgeCategories(): void {
    const categories: BadgeCategory[] = [
      {
        id: 'prediction_mastery',
        name: 'Prediction Mastery',
        description: 'Badges for excelling in specific prediction areas',
        icon: '🎯',
        color: '#3B82F6',
      },
      {
        id: 'market_creation',
        name: 'Market Creation',
        description: 'Badges for creating and managing markets',
        icon: '🏗️',
        color: '#10B981',
      },
      {
        id: 'social_trading',
        name: 'Social Trading',
        description: 'Badges for social features and community engagement',
        icon: '👥',
        color: '#8B5CF6',
      },
      {
        id: 'risk_management',
        name: 'Risk Management',
        description: 'Badges for smart betting and risk assessment',
        icon: '🛡️',
        color: '#F59E0B',
      },
      {
        id: 'kale_ecosystem',
        name: 'KALE Ecosystem',
        description: 'Badges for KALE token and ecosystem participation',
        icon: '🌿',
        color: '#06B6D4',
      },
      {
        id: 'seasonal',
        name: 'Seasonal Events',
        description: 'Limited-time badges for special events',
        icon: '🎊',
        color: '#EF4444',
      },
      {
        id: 'achievement_milestones',
        name: 'Achievement Milestones',
        description: 'Badges for reaching significant milestones',
        icon: '🏆',
        color: '#F97316',
      },
      {
        id: 'special_recognition',
        name: 'Special Recognition',
        description: 'Unique badges for exceptional achievements',
        icon: '⭐',
        color: '#EC4899',
      },
    ];

    categories.forEach(category => {
      this.badgeCategories.set(category.id, category);
    });
  }

  /**
   * Initialize advanced badges
   */
  private initializeAdvancedBadges(): void {
    const advancedBadges: AdvancedBadge[] = [
      // Prediction Mastery Badges
      {
        id: 'crypto_oracle',
        name: 'Crypto Oracle',
        description: 'Achieve 80%+ accuracy in cryptocurrency predictions',
        icon: '₿',
        rarity: {
          level: 'epic',
          color: '#F59E0B',
          glowEffect: true,
          animationType: 'pulse',
          dropRate: 5,
        },
        category: this.badgeCategories.get('prediction_mastery')!,
        unlockConditions: [
          {
            type: 'accuracy',
            operator: 'greater_than',
            value: 80,
            description: 'Maintain 80%+ win rate',
          },
          {
            type: 'prediction',
            operator: 'greater_than',
            value: 20,
            description: 'Make 20+ crypto predictions',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 500,
            description: '500 XP bonus',
          },
          {
            type: 'title',
            amount: 1,
            description: 'Crypto Oracle title',
          },
        ],
        isSecret: false,
        isTimeLimited: false,
        metadata: {
          difficulty: 8,
          estimatedTimeToEarn: 40,
          popularity: 12,
          tags: ['crypto', 'accuracy', 'prediction'],
        },
      },
      {
        id: 'streak_destroyer',
        name: 'Streak Destroyer',
        description: 'Break someone else\'s winning streak',
        icon: '💥',
        rarity: {
          level: 'rare',
          color: '#EF4444',
          glowEffect: true,
          animationType: 'sparkle',
          dropRate: 15,
        },
        category: this.badgeCategories.get('social_trading')!,
        unlockConditions: [
          {
            type: 'social',
            operator: 'equals',
            value: 'streak_break',
            description: 'Break another user\'s streak',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 200,
            description: '200 XP bonus',
          },
          {
            type: 'kale',
            amount: 50,
            description: '50 KALE reward',
          },
        ],
        isSecret: true,
        isTimeLimited: false,
        metadata: {
          difficulty: 6,
          estimatedTimeToEarn: 20,
          popularity: 8,
          tags: ['social', 'streak', 'competitive'],
        },
      },
      // Market Creation Badges
      {
        id: 'market_architect',
        name: 'Market Architect',
        description: 'Create 50+ successful markets',
        icon: '🏛️',
        rarity: {
          level: 'legendary',
          color: '#8B5CF6',
          glowEffect: true,
          animationType: 'float',
          dropRate: 2,
        },
        category: this.badgeCategories.get('market_creation')!,
        unlockConditions: [
          {
            type: 'market',
            operator: 'greater_than',
            value: 50,
            description: 'Create 50+ markets',
          },
          {
            type: 'volume',
            operator: 'greater_than',
            value: 100000,
            description: 'Generate 100K+ volume',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 1000,
            description: '1000 XP bonus',
          },
          {
            type: 'access',
            amount: 1,
            description: 'Premium market creation tools',
          },
        ],
        isSecret: false,
        isTimeLimited: false,
        metadata: {
          difficulty: 9,
          estimatedTimeToEarn: 100,
          popularity: 3,
          tags: ['market', 'creation', 'volume'],
        },
      },
      // Risk Management Badges
      {
        id: 'risk_master',
        name: 'Risk Master',
        description: 'Maintain positive ROI for 30 consecutive days',
        icon: '🎲',
        rarity: {
          level: 'epic',
          color: '#10B981',
          glowEffect: true,
          animationType: 'rotate',
          dropRate: 8,
        },
        category: this.badgeCategories.get('risk_management')!,
        unlockConditions: [
          {
            type: 'time',
            operator: 'greater_than',
            value: 30,
            description: '30 consecutive days',
          },
          {
            type: 'volume',
            operator: 'greater_than',
            value: 0,
            description: 'Positive ROI',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 750,
            description: '750 XP bonus',
          },
          {
            type: 'discount',
            amount: 10,
            description: '10% fee discount',
          },
        ],
        isSecret: false,
        isTimeLimited: false,
        metadata: {
          difficulty: 9,
          estimatedTimeToEarn: 30,
          popularity: 5,
          tags: ['risk', 'roi', 'consistency'],
        },
      },
    ];

    advancedBadges.forEach(badge => {
      this.badges.set(badge.id, badge);
    });
  }

  /**
   * Initialize seasonal badges
   */
  private initializeSeasonalBadges(): void {
    const currentYear = new Date().getFullYear();
    
    const seasonalBadges: SeasonalBadge[] = [
      {
        id: 'new_year_prediction',
        name: 'New Year Prophet',
        description: 'Make accurate predictions during New Year event',
        icon: '🎆',
        rarity: {
          level: 'rare',
          color: '#F59E0B',
          glowEffect: true,
          animationType: 'sparkle',
          dropRate: 20,
        },
        category: this.badgeCategories.get('seasonal')!,
        unlockConditions: [
          {
            type: 'time',
            operator: 'between',
            value: ['2024-12-31', '2025-01-02'],
            description: 'Active during New Year period',
          },
          {
            type: 'prediction',
            operator: 'greater_than',
            value: 5,
            description: 'Make 5+ predictions',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 300,
            description: '300 XP bonus',
          },
          {
            type: 'kale',
            amount: 100,
            description: '100 KALE reward',
          },
        ],
        isSecret: false,
        isTimeLimited: true,
        expiresAt: new Date('2025-01-15').getTime(),
        season: 'New Year',
        year: currentYear,
        isRetired: false,
        metadata: {
          difficulty: 4,
          estimatedTimeToEarn: 2,
          popularity: 25,
          tags: ['seasonal', 'new-year', 'limited'],
        },
      },
      {
        id: 'crypto_crash_survivor',
        name: 'Crash Survivor',
        description: 'Successfully predict and profit from a major crypto crash',
        icon: '💥',
        rarity: {
          level: 'legendary',
          color: '#EF4444',
          glowEffect: true,
          animationType: 'pulse',
          dropRate: 1,
        },
        category: this.badgeCategories.get('seasonal')!,
        unlockConditions: [
          {
            type: 'prediction',
            operator: 'equals',
            value: 'crash_prediction',
            description: 'Predict a major crash',
          },
          {
            type: 'volume',
            operator: 'greater_than',
            value: 10000,
            description: 'Profit 10K+ from crash',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 2000,
            description: '2000 XP bonus',
          },
          {
            type: 'title',
            amount: 1,
            description: 'Crash Survivor title',
          },
        ],
        isSecret: true,
        isTimeLimited: false,
        season: 'Special Event',
        year: currentYear,
        isRetired: false,
        metadata: {
          difficulty: 10,
          estimatedTimeToEarn: 200,
          popularity: 1,
          tags: ['crash', 'prediction', 'legendary'],
        },
      },
    ];

    seasonalBadges.forEach(badge => {
      this.seasonalBadges.set(badge.id, badge);
    });
  }

  /**
   * Initialize social badges
   */
  private initializeSocialBadges(): void {
    const socialBadges: SocialBadge[] = [
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Gain 100+ followers in a month',
        icon: '🦋',
        rarity: {
          level: 'rare',
          color: '#EC4899',
          glowEffect: true,
          animationType: 'float',
          dropRate: 12,
        },
        category: this.badgeCategories.get('social_trading')!,
        unlockConditions: [
          {
            type: 'social',
            operator: 'greater_than',
            value: 100,
            description: 'Gain 100+ followers',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 400,
            description: '400 XP bonus',
          },
          {
            type: 'title',
            amount: 1,
            description: 'Social Butterfly title',
          },
        ],
        isSecret: false,
        isTimeLimited: false,
        socialRequirement: {
          type: 'followers',
          count: 100,
          timeframe: 'monthly',
        },
        metadata: {
          difficulty: 7,
          estimatedTimeToEarn: 30,
          popularity: 15,
          tags: ['social', 'followers', 'community'],
        },
      },
      {
        id: 'mentor_master',
        name: 'Mentor Master',
        description: 'Help 10+ users improve their win rate',
        icon: '👨‍🏫',
        rarity: {
          level: 'epic',
          color: '#3B82F6',
          glowEffect: true,
          animationType: 'pulse',
          dropRate: 8,
        },
        category: this.badgeCategories.get('social_trading')!,
        unlockConditions: [
          {
            type: 'social',
            operator: 'greater_than',
            value: 10,
            description: 'Help 10+ users improve',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 600,
            description: '600 XP bonus',
          },
          {
            type: 'access',
            amount: 1,
            description: 'Mentor tools access',
          },
        ],
        isSecret: false,
        isTimeLimited: false,
        socialRequirement: {
          type: 'mentions',
          count: 10,
          timeframe: 'all-time',
        },
        metadata: {
          difficulty: 8,
          estimatedTimeToEarn: 60,
          popularity: 8,
          tags: ['mentor', 'teaching', 'community'],
        },
      },
    ];

    socialBadges.forEach(badge => {
      this.socialBadges.set(badge.id, badge);
    });
  }

  /**
   * Initialize mastery badges
   */
  private initializeMasteryBadges(): void {
    const masteryBadges: PredictionMasteryBadge[] = [
      {
        id: 'btc_master',
        name: 'Bitcoin Master',
        description: 'Master Bitcoin price predictions',
        icon: '₿',
        rarity: {
          level: 'epic',
          color: '#F59E0B',
          glowEffect: true,
          animationType: 'rotate',
          dropRate: 10,
        },
        category: this.badgeCategories.get('prediction_mastery')!,
        unlockConditions: [
          {
            type: 'accuracy',
            operator: 'greater_than',
            value: 75,
            description: '75%+ accuracy',
          },
          {
            type: 'prediction',
            operator: 'greater_than',
            value: 15,
            description: '15+ BTC predictions',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 500,
            description: '500 XP bonus',
          },
          {
            type: 'title',
            amount: 1,
            description: 'Bitcoin Master title',
          },
        ],
        isSecret: false,
        isTimeLimited: false,
        masteryArea: 'crypto',
        accuracyThreshold: 75,
        minimumBets: 15,
        timeframe: 'monthly',
        metadata: {
          difficulty: 7,
          estimatedTimeToEarn: 45,
          popularity: 18,
          tags: ['bitcoin', 'crypto', 'mastery'],
        },
      },
      {
        id: 'defi_expert',
        name: 'DeFi Expert',
        description: 'Excel in DeFi protocol predictions',
        icon: '🏦',
        rarity: {
          level: 'rare',
          color: '#10B981',
          glowEffect: true,
          animationType: 'pulse',
          dropRate: 15,
        },
        category: this.badgeCategories.get('prediction_mastery')!,
        unlockConditions: [
          {
            type: 'accuracy',
            operator: 'greater_than',
            value: 70,
            description: '70%+ accuracy',
          },
          {
            type: 'prediction',
            operator: 'greater_than',
            value: 10,
            description: '10+ DeFi predictions',
          },
        ],
        rewards: [
          {
            type: 'xp',
            amount: 350,
            description: '350 XP bonus',
          },
          {
            type: 'kale',
            amount: 75,
            description: '75 KALE reward',
          },
        ],
        isSecret: false,
        isTimeLimited: false,
        masteryArea: 'crypto',
        accuracyThreshold: 70,
        minimumBets: 10,
        timeframe: 'monthly',
        metadata: {
          difficulty: 6,
          estimatedTimeToEarn: 30,
          popularity: 22,
          tags: ['defi', 'protocols', 'expert'],
        },
      },
    ];

    masteryBadges.forEach(badge => {
      this.masteryBadges.set(badge.id, badge);
    });
  }

  /**
   * Get all available badges
   */
  getAllBadges(): AdvancedBadge[] {
    return Array.from(this.badges.values());
  }

  /**
   * Get badges by category
   */
  getBadgesByCategory(categoryId: string): AdvancedBadge[] {
    return Array.from(this.badges.values())
      .filter(badge => badge.category.id === categoryId);
  }

  /**
   * Get seasonal badges
   */
  getSeasonalBadges(): SeasonalBadge[] {
    return Array.from(this.seasonalBadges.values());
  }

  /**
   * Get social badges
   */
  getSocialBadges(): SocialBadge[] {
    return Array.from(this.socialBadges.values());
  }

  /**
   * Get mastery badges
   */
  getMasteryBadges(): PredictionMasteryBadge[] {
    return Array.from(this.masteryBadges.values());
  }

  /**
   * Check if user qualifies for a badge
   */
  checkBadgeEligibility(userAddress: string, badgeId: string): Promise<{
    eligible: boolean;
    progress: number;
    maxProgress: number;
    missingConditions: BadgeCondition[];
  }> {
    // Implementation would check user stats against badge conditions
    // This is a placeholder for the actual logic
    return Promise.resolve({
      eligible: false,
      progress: 0,
      maxProgress: 100,
      missingConditions: [],
    });
  }

  /**
   * Award badge to user
   */
  async awardBadge(userAddress: string, badgeId: string): Promise<void> {
    // Implementation would award the badge and trigger rewards
    logger.info(`Awarding badge ${badgeId} to user ${userAddress}`);
  }
}

// Re-export base interfaces for compatibility
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
}
