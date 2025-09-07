import { Keypair, Asset, Operation, Memo } from '@stellar/stellar-sdk';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { KaleIntegrationService } from './kale-integration.service';
import { ReflectorIntegrationService } from './reflector-integration.service';
import { EnhancedMarketService, Market } from './enhanced-market.service';
import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export enum BetType {
  STANDARD = 'standard',
  TEAM_BET = 'team_bet',
  FOLLOW_BET = 'follow_bet',
  SYNDICATE_BET = 'syndicate_bet',
}

export enum StopLossCondition {
  PRICE_BELOW = 'price_below',
  PRICE_ABOVE = 'price_above',
  LOSS_PERCENTAGE = 'loss_percentage',
  TIME_EXPIRY = 'time_expiry',
}

export enum StopLossAction {
  SELL_ALL = 'sell_all',
  SELL_PERCENTAGE = 'sell_percentage',
  HEDGE_BET = 'hedge_bet',
}

export interface Bet {
  id: string;
  marketId: string;
  bettor: string;
  outcome: number;
  amount: string;
  odds: string; // Stored as basis points (10000 = 1.0)
  placedAt: number;
  isSettled: boolean;
  payout?: string;
  betType: BetType;
  socialData?: SocialBetData;
  teamId?: string;
  syndicateId?: string;
  followedUser?: string;
}

export interface SocialBetData {
  isPublic: boolean;
  reasoning?: string;
  confidenceLevel: number; // 1-100
  followersCount: number;
  likes: number;
  comments: string[];
  shares: number;
  createdAt: number;
}

export interface BettingSyndicate {
  id: string;
  name: string;
  leader: string;
  members: string[];
  totalPool: string;
  profitSharing: number[]; // Percentage shares
  performanceStats: {
    wins: number;
    totalBets: number;
    totalProfit: string;
  };
  isPublic: boolean;
  minStake: string;
  createdAt: number;
  isActive: boolean;
}

export interface PredictionStreak {
  user: string;
  currentStreak: number;
  longestStreak: number;
  accuracyRate: number; // Percentage
  totalPredictions: number;
  lastPredictionTime: number;
  streakBonusEarned: string;
}

export interface StopLossOrder {
  id: string;
  user: string;
  marketId: string;
  triggerCondition: StopLossCondition;
  triggerValue: string;
  action: StopLossAction;
  actionParams?: any;
  isActive: boolean;
  createdAt: number;
  executedAt?: number;
}

export interface CopyTradingConfig {
  follower: string;
  target: string;
  maxAmountPerBet: string;
  copyPercentage: number; // 1-100
  categories?: string[];
  riskLimits?: {
    dailyLossLimit: string;
    maxOpenPositions: number;
  };
  isActive: boolean;
  createdAt: number;
}

export interface UserAnalytics {
  user: string;
  totalBets: number;
  totalVolume: string;
  winRate: number;
  profitLoss: string;
  longestStreak: number;
  currentStreak: number;
  averageConfidence: number;
  favoriteCategories: string[];
  roi: number; // Return on investment as percentage
  sharpeRatio: number; // Risk-adjusted return metric
  lastUpdated: number;
}

export interface AIPrediction {
  predictedOutcome: number;
  confidence: number;
  expectedValue: string;
  reasoning: string;
  modelVersion: string;
  timestamp: number;
}

export enum BettingError {
  MARKET_NOT_FOUND = 'MARKET_NOT_FOUND',
  MARKET_CLOSED = 'MARKET_CLOSED',
  INVALID_OUTCOME = 'INVALID_OUTCOME',
  INVALID_BET_AMOUNT = 'INVALID_BET_AMOUNT',
  BET_NOT_FOUND = 'BET_NOT_FOUND',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_PROFIT_SHARING = 'INVALID_PROFIT_SHARING',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  INVALID_COPY_PERCENTAGE = 'INVALID_COPY_PERCENTAGE',
  ALREADY_LIKED = 'ALREADY_LIKED',
  BET_NOT_PUBLIC = 'BET_NOT_PUBLIC',
}

export class EnhancedBettingService {
  private stellarRpc: StellarRpcService;
  private kaleService: KaleIntegrationService;
  private reflectorService: ReflectorIntegrationService;
  private marketService: EnhancedMarketService;
  private bets: Map<string, Bet> = new Map();
  private syndicates: Map<string, BettingSyndicate> = new Map();
  private stopLossOrders: Map<string, StopLossOrder> = new Map();
  private copyTradingConfigs: Map<string, CopyTradingConfig> = new Map();
  private userAnalytics: Map<string, UserAnalytics> = new Map();
  private predictionStreaks: Map<string, PredictionStreak> = new Map();

  constructor(
    stellarRpc: StellarRpcService,
    kaleService: KaleIntegrationService,
    reflectorService: ReflectorIntegrationService,
    marketService: EnhancedMarketService
  ) {
    this.stellarRpc = stellarRpc;
    this.kaleService = kaleService;
    this.reflectorService = reflectorService;
    this.marketService = marketService;
  }

  /**
   * Place advanced bet with social features
   */
  async placeSocialBet(
    bettorKeypair: Keypair,
    marketId: string,
    outcome: number,
    amount: string,
    betType: BetType,
    isPublic: boolean = false,
    reasoning?: string,
    confidenceLevel: number = 50,
    teamId?: string,
    syndicateId?: string,
    followedUser?: string
  ): Promise<Bet> {
    try {
      // Validate bet parameters
      await this.validateBetParams(marketId, outcome, amount, betType);

      // Calculate current odds
      const odds = await this.calculateDynamicOdds(marketId, outcome, amount);

      // Create bet with social data
      const betId = uuidv4();
      const socialData: SocialBetData | undefined = isPublic ? {
        isPublic: true,
        reasoning,
        confidenceLevel,
        followersCount: await this.getFollowersCount(bettorKeypair.publicKey()),
        likes: 0,
        comments: [],
        shares: 0,
        createdAt: Date.now(),
      } : undefined;

      const bet: Bet = {
        id: betId,
        marketId,
        bettor: bettorKeypair.publicKey(),
        outcome,
        amount,
        odds,
        placedAt: Date.now(),
        isSettled: false,
        betType,
        socialData,
        teamId,
        syndicateId,
        followedUser,
      };

      // Process bet based on type
      await this.processBetByType(bettorKeypair, bet);

      // Store bet
      this.bets.set(betId, bet);

      // Update user's prediction streak
      await this.updatePredictionStreak(bettorKeypair.publicKey(), marketId);

      // Update user analytics
      await this.updateUserAnalytics(bettorKeypair.publicKey(), bet);

      logger.info('Social bet placed:', {
        betId,
        bettor: bettorKeypair.publicKey(),
        marketId,
        amount,
        betType,
        isPublic,
      });

      return bet;
    } catch (error) {
      logger.error('Failed to place social bet:', error);
      throw error;
    }
  }

  /**
   * Create betting syndicate
   */
  async createBettingSyndicate(
    leaderKeypair: Keypair,
    name: string,
    members: string[],
    profitSharing: number[],
    isPublic: boolean = false,
    minStake: string = '1000000'
  ): Promise<BettingSyndicate> {
    try {
      // Validate profit sharing percentages sum to 100
      const totalPercentage = profitSharing.reduce((sum, share) => sum + share, 0);
      if (totalPercentage !== 100) {
        throw new Error('Profit sharing percentages must sum to 100');
      }

      if (profitSharing.length !== members.length + 1) { // +1 for leader
        throw new Error('Profit sharing array must include leader and all members');
      }

      const syndicateId = uuidv4();
      const syndicate: BettingSyndicate = {
        id: syndicateId,
        name,
        leader: leaderKeypair.publicKey(),
        members,
        totalPool: '0',
        profitSharing,
        performanceStats: {
          wins: 0,
          totalBets: 0,
          totalProfit: '0',
        },
        isPublic,
        minStake,
        createdAt: Date.now(),
        isActive: true,
      };

      this.syndicates.set(syndicateId, syndicate);

      logger.info('Betting syndicate created:', {
        syndicateId,
        leader: leaderKeypair.publicKey(),
        name,
        members: members.length,
        isPublic,
      });

      return syndicate;
    } catch (error) {
      logger.error('Failed to create betting syndicate:', error);
      throw error;
    }
  }

  /**
   * Create stop-loss order
   */
  async createStopLossOrder(
    userKeypair: Keypair,
    marketId: string,
    triggerCondition: StopLossCondition,
    triggerValue: string,
    action: StopLossAction,
    actionParams?: any
  ): Promise<StopLossOrder> {
    try {
      const orderId = uuidv4();
      const stopLoss: StopLossOrder = {
        id: orderId,
        user: userKeypair.publicKey(),
        marketId,
        triggerCondition,
        triggerValue,
        action,
        actionParams,
        isActive: true,
        createdAt: Date.now(),
      };

      this.stopLossOrders.set(orderId, stopLoss);

      logger.info('Stop-loss order created:', {
        orderId,
        user: userKeypair.publicKey(),
        marketId,
        triggerCondition,
        triggerValue,
        action,
      });

      return stopLoss;
    } catch (error) {
      logger.error('Failed to create stop-loss order:', error);
      throw error;
    }
  }

  /**
   * Process stop-loss orders (called by automated system)
   */
  async processStopLossOrders(marketId: string): Promise<number> {
    try {
      const currentPrice = await this.getCurrentMarketPrice(marketId);
      let executedOrders = 0;

      // Get all active stop-loss orders for this market
      const activeOrders = Array.from(this.stopLossOrders.values())
        .filter(order => order.marketId === marketId && order.isActive);

      for (const order of activeOrders) {
        const shouldExecute = await this.checkStopLossTrigger(order, currentPrice);
        
        if (shouldExecute) {
          await this.executeStopLossAction(order);
          order.isActive = false;
          order.executedAt = Date.now();
          this.stopLossOrders.set(order.id, order);
          executedOrders++;
        }
      }

      logger.info('Stop-loss orders processed:', {
        marketId,
        executedOrders,
        currentPrice,
      });

      return executedOrders;
    } catch (error) {
      logger.error('Failed to process stop-loss orders:', error);
      throw error;
    }
  }

  /**
   * Copy trading - automatically follow successful predictors
   */
  async enableCopyTrading(
    followerKeypair: Keypair,
    target: string,
    maxAmountPerBet: string,
    copyPercentage: number,
    categories?: string[],
    riskLimits?: any
  ): Promise<CopyTradingConfig> {
    try {
      // Validate copy percentage (1-100)
      if (copyPercentage <= 0 || copyPercentage > 100) {
        throw new Error('Copy percentage must be between 1 and 100');
      }

      const configId = uuidv4();
      const config: CopyTradingConfig = {
        follower: followerKeypair.publicKey(),
        target,
        maxAmountPerBet,
        copyPercentage,
        categories,
        riskLimits,
        isActive: true,
        createdAt: Date.now(),
      };

      this.copyTradingConfigs.set(configId, config);

      logger.info('Copy trading enabled:', {
        configId,
        follower: followerKeypair.publicKey(),
        target,
        copyPercentage,
        maxAmountPerBet,
      });

      return config;
    } catch (error) {
      logger.error('Failed to enable copy trading:', error);
      throw error;
    }
  }

  /**
   * Automated betting based on AI insights
   */
  async placeAIAssistedBet(
    userKeypair: Keypair,
    marketId: string,
    maxAmount: string,
    minConfidence: number = 70
  ): Promise<Bet | null> {
    try {
      // Get AI prediction and confidence
      const aiPrediction = await this.getAIMarketPrediction(marketId);
      
      if (aiPrediction.confidence < minConfidence) {
        return null; // Don't bet if confidence too low
      }

      // Calculate bet amount based on confidence and Kelly criterion
      const betAmount = await this.calculateKellyBetSize(
        userKeypair.publicKey(),
        maxAmount,
        aiPrediction.confidence,
        aiPrediction.expectedValue
      );

      if (new Big(betAmount).lt('1000000')) { // Minimum 1 KALE
        return null;
      }

      const bet = await this.placeSocialBet(
        userKeypair,
        marketId,
        aiPrediction.predictedOutcome,
        betAmount,
        BetType.STANDARD,
        false, // AI bets are private by default
        aiPrediction.reasoning,
        aiPrediction.confidence
      );

      return bet;
    } catch (error) {
      logger.error('Failed to place AI-assisted bet:', error);
      throw error;
    }
  }

  /**
   * Social features - like and comment on bets
   */
  async likeBet(userKeypair: Keypair, betId: string): Promise<void> {
    try {
      const bet = this.bets.get(betId);
      if (!bet) {
        throw new Error('Bet not found');
      }

      if (!bet.socialData) {
        throw new Error('Bet is not public');
      }

      // Check if user already liked this bet
      const likeKey = `like_${betId}_${userKeypair.publicKey()}`;
      if (this.hasUserLikedBet(betId, userKeypair.publicKey())) {
        throw new Error('User already liked this bet');
      }

      bet.socialData.likes += 1;
      this.bets.set(betId, bet);

      logger.info('Bet liked:', {
        betId,
        user: userKeypair.publicKey(),
        likes: bet.socialData.likes,
      });
    } catch (error) {
      logger.error('Failed to like bet:', error);
      throw error;
    }
  }

  async commentOnBet(
    userKeypair: Keypair,
    betId: string,
    comment: string
  ): Promise<void> {
    try {
      const bet = this.bets.get(betId);
      if (!bet) {
        throw new Error('Bet not found');
      }

      if (!bet.socialData) {
        throw new Error('Bet is not public');
      }

      const commentWithAuthor = `${userKeypair.publicKey()}: ${comment}`;
      bet.socialData.comments.push(commentWithAuthor);
      this.bets.set(betId, bet);

      logger.info('Comment added to bet:', {
        betId,
        user: userKeypair.publicKey(),
        commentLength: comment.length,
      });
    } catch (error) {
      logger.error('Failed to comment on bet:', error);
      throw error;
    }
  }

  /**
   * Advanced analytics and insights
   */
  async getUserAnalytics(userAddress: string): Promise<UserAnalytics> {
    try {
      let analytics = this.userAnalytics.get(userAddress);
      
      if (!analytics) {
        analytics = {
          user: userAddress,
          totalBets: 0,
          totalVolume: '0',
          winRate: 0,
          profitLoss: '0',
          longestStreak: 0,
          currentStreak: 0,
          averageConfidence: 0,
          favoriteCategories: [],
          roi: 0,
          sharpeRatio: 0,
          lastUpdated: Date.now(),
        };
      }

      // Get all user bets and recalculate metrics
      const userBets = Array.from(this.bets.values())
        .filter(bet => bet.bettor === userAddress);

      if (userBets.length === 0) {
        return analytics;
      }

      let wins = 0;
      let totalConfidence = 0;
      let totalInvested = new Big(0);
      let totalReturned = new Big(0);
      const categoryCounts = new Map<string, number>();

      for (const bet of userBets) {
        analytics.totalBets += 1;
        analytics.totalVolume = new Big(analytics.totalVolume).plus(bet.amount).toString();
        totalInvested = totalInvested.plus(bet.amount);

        if (bet.isSettled && bet.payout) {
          const payout = new Big(bet.payout);
          if (payout.gt(bet.amount)) {
            wins += 1;
          }
          totalReturned = totalReturned.plus(payout);
        }

        if (bet.socialData) {
          totalConfidence += bet.socialData.confidenceLevel;
        }

        // Count categories
        const market = await this.marketService.getMarket(bet.marketId);
        if (market) {
          const count = categoryCounts.get(market.category) || 0;
          categoryCounts.set(market.category, count + 1);
        }
      }

      analytics.winRate = analytics.totalBets > 0 ? (wins / analytics.totalBets) * 100 : 0;
      analytics.profitLoss = totalReturned.minus(totalInvested).toString();
      analytics.averageConfidence = analytics.totalBets > 0 ? totalConfidence / analytics.totalBets : 0;
      analytics.roi = totalInvested.gt(0) ? 
        totalReturned.minus(totalInvested).div(totalInvested).mul(100).toNumber() : 0;
      
      // Get favorite categories
      analytics.favoriteCategories = Array.from(categoryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category]) => category);

      analytics.lastUpdated = Date.now();
      this.userAnalytics.set(userAddress, analytics);

      return analytics;
    } catch (error) {
      logger.error('Failed to get user analytics:', error);
      throw error;
    }
  }

  /**
   * Get bet information
   */
  async getBet(betId: string): Promise<Bet | null> {
    try {
      return this.bets.get(betId) || null;
    } catch (error) {
      logger.error('Failed to get bet:', error);
      throw error;
    }
  }

  /**
   * Get user's bets
   */
  async getUserBets(userAddress: string): Promise<Bet[]> {
    try {
      return Array.from(this.bets.values())
        .filter(bet => bet.bettor === userAddress);
    } catch (error) {
      logger.error('Failed to get user bets:', error);
      throw error;
    }
  }

  /**
   * Get market bets
   */
  async getMarketBets(marketId: string): Promise<Bet[]> {
    try {
      return Array.from(this.bets.values())
        .filter(bet => bet.marketId === marketId);
    } catch (error) {
      logger.error('Failed to get market bets:', error);
      throw error;
    }
  }

  /**
   * Internal helper functions
   */
  private async validateBetParams(
    marketId: string,
    outcome: number,
    amount: string,
    betType: BetType
  ): Promise<void> {
    const market = await this.marketService.getMarket(marketId);
    if (!market) {
      throw new Error('Market not found');
    }

    const currentTime = Date.now();
    if (currentTime < market.bettingStart || currentTime > market.bettingEnd) {
      throw new Error('Market is not accepting bets');
    }

    if (outcome >= market.outcomes.length) {
      throw new Error('Invalid outcome');
    }

    const betAmount = new Big(amount);
    const minBet = new Big(market.minBet);
    const maxBet = new Big(market.maxBet);

    if (betAmount.lt(minBet) || betAmount.gt(maxBet)) {
      throw new Error(`Bet amount must be between ${minBet.toString()} and ${maxBet.toString()}`);
    }
  }

  private async calculateDynamicOdds(marketId: string, outcome: number, betAmount: string): Promise<string> {
    try {
      const liquidity = await this.marketService.getMarketLiquidity(marketId);
      if (!liquidity) {
        return '20000'; // 2.0 odds if no liquidity
      }

      const outcomePool = new Big(liquidity.outcomePools[outcome] || '0');
      const totalLiquidity = new Big(liquidity.totalKaleStaked);

      if (totalLiquidity.eq(0)) {
        return '20000'; // 2.0 odds if no liquidity
      }

      // Calculate odds using automated market maker formula
      const probability = outcomePool.plus(betAmount).div(totalLiquidity.plus(betAmount));
      const odds = new Big(1).div(probability).mul(10000);

      // Clamp between 1.01 and 10.0
      return odds.max(10100).min(100000).toString();
    } catch (error) {
      logger.error('Failed to calculate dynamic odds:', error);
      return '20000'; // Default odds
    }
  }

  private async processBetByType(bettorKeypair: Keypair, bet: Bet): Promise<void> {
    try {
      switch (bet.betType) {
        case BetType.STANDARD:
          await this.processStandardBet(bettorKeypair, bet);
          break;
        case BetType.TEAM_BET:
          await this.processTeamBet(bettorKeypair, bet);
          break;
        case BetType.FOLLOW_BET:
          await this.processFollowBet(bettorKeypair, bet);
          break;
        case BetType.SYNDICATE_BET:
          await this.processSyndicateBet(bettorKeypair, bet);
          break;
      }
    } catch (error) {
      logger.error('Failed to process bet by type:', error);
      throw error;
    }
  }

  private async processStandardBet(bettorKeypair: Keypair, bet: Bet): Promise<void> {
    // Standard bet processing - would transfer KALE and update liquidity
    logger.info('Standard bet processed:', { betId: bet.id });
  }

  private async processTeamBet(bettorKeypair: Keypair, bet: Bet): Promise<void> {
    // Team bet processing - would involve team farming pool
    logger.info('Team bet processed:', { betId: bet.id, teamId: bet.teamId });
  }

  private async processFollowBet(bettorKeypair: Keypair, bet: Bet): Promise<void> {
    // Follow bet processing - would copy another user's bet
    logger.info('Follow bet processed:', { betId: bet.id, followedUser: bet.followedUser });
  }

  private async processSyndicateBet(bettorKeypair: Keypair, bet: Bet): Promise<void> {
    // Syndicate bet processing - would involve betting syndicate
    logger.info('Syndicate bet processed:', { betId: bet.id, syndicateId: bet.syndicateId });
  }

  private async getFollowersCount(userAddress: string): Promise<number> {
    try {
      // This would typically query a social graph
      return 0; // Placeholder
    } catch (error) {
      logger.error('Failed to get followers count:', error);
      return 0;
    }
  }

  private async updatePredictionStreak(userAddress: string, marketId: string): Promise<void> {
    try {
      let streak = this.predictionStreaks.get(userAddress);
      if (!streak) {
        streak = {
          user: userAddress,
          currentStreak: 0,
          longestStreak: 0,
          accuracyRate: 0,
          totalPredictions: 0,
          lastPredictionTime: 0,
          streakBonusEarned: '0',
        };
      }

      streak.totalPredictions += 1;
      streak.lastPredictionTime = Date.now();

      this.predictionStreaks.set(userAddress, streak);
    } catch (error) {
      logger.error('Failed to update prediction streak:', error);
    }
  }

  private async updateUserAnalytics(userAddress: string, bet: Bet): Promise<void> {
    try {
      let analytics = this.userAnalytics.get(userAddress);
      if (!analytics) {
        analytics = {
          user: userAddress,
          totalBets: 0,
          totalVolume: '0',
          winRate: 0,
          profitLoss: '0',
          longestStreak: 0,
          currentStreak: 0,
          averageConfidence: 0,
          favoriteCategories: [],
          roi: 0,
          sharpeRatio: 0,
          lastUpdated: Date.now(),
        };
      }

      analytics.totalBets += 1;
      analytics.totalVolume = new Big(analytics.totalVolume).plus(bet.amount).toString();
      analytics.lastUpdated = Date.now();

      this.userAnalytics.set(userAddress, analytics);
    } catch (error) {
      logger.error('Failed to update user analytics:', error);
    }
  }

  private async getCurrentMarketPrice(marketId: string): Promise<string> {
    try {
      const market = await this.marketService.getMarket(marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      // This would typically get current price from oracle
      return '50000'; // Placeholder
    } catch (error) {
      logger.error('Failed to get current market price:', error);
      throw error;
    }
  }

  private async checkStopLossTrigger(order: StopLossOrder, currentPrice: string): Promise<boolean> {
    try {
      const price = new Big(currentPrice);
      const triggerValue = new Big(order.triggerValue);

      switch (order.triggerCondition) {
        case StopLossCondition.PRICE_BELOW:
          return price.lt(triggerValue);
        case StopLossCondition.PRICE_ABOVE:
          return price.gt(triggerValue);
        case StopLossCondition.LOSS_PERCENTAGE:
          // This would calculate loss percentage from user's bets
          return false; // Placeholder
        case StopLossCondition.TIME_EXPIRY:
          return Date.now() > parseInt(order.triggerValue);
        default:
          return false;
      }
    } catch (error) {
      logger.error('Failed to check stop-loss trigger:', error);
      return false;
    }
  }

  private async executeStopLossAction(order: StopLossOrder): Promise<void> {
    try {
      // This would execute the stop-loss action
      logger.info('Stop-loss action executed:', {
        orderId: order.id,
        action: order.action,
        actionParams: order.actionParams,
      });
    } catch (error) {
      logger.error('Failed to execute stop-loss action:', error);
    }
  }

  private async getAIMarketPrediction(marketId: string): Promise<AIPrediction> {
    try {
      // This would typically call an AI service
      return {
        predictedOutcome: 0,
        confidence: 75,
        expectedValue: '1.2',
        reasoning: 'AI analysis based on historical data and market conditions',
        modelVersion: '1.0',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Failed to get AI market prediction:', error);
      throw error;
    }
  }

  private async calculateKellyBetSize(
    userAddress: string,
    maxAmount: string,
    confidence: number,
    expectedValue: string
  ): Promise<string> {
    try {
      // Kelly criterion: f = (bp - q) / b
      // where b = odds, p = probability of winning, q = probability of losing
      const p = confidence / 100;
      const q = 1 - p;
      const b = parseFloat(expectedValue);
      
      const kellyFraction = (b * p - q) / b;
      const betSize = new Big(maxAmount).mul(Math.max(0, kellyFraction));
      
      return betSize.toString();
    } catch (error) {
      logger.error('Failed to calculate Kelly bet size:', error);
      return '1000000'; // Default minimum bet
    }
  }

  private hasUserLikedBet(betId: string, userAddress: string): boolean {
    // This would typically check a database
    return false; // Placeholder
  }
}
