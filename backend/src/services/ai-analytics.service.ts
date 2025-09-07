import { logger } from '../utils/logger';
import { KaleIntegrationService } from './kale-integration.service';
import { ReflectorIntegrationService } from './reflector-integration.service';
import { EnhancedMarketService, Market } from './enhanced-market.service';
import { EnhancedBettingService, Bet, UserAnalytics } from './enhanced-betting.service';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTREME = 'extreme',
}

export enum TimeHorizon {
  SHORT_TERM = 'short_term',   // < 1 week
  MEDIUM_TERM = 'medium_term', // 1 week - 1 month
  LONG_TERM = 'long_term',     // > 1 month
}

export enum BehavioralBias {
  OVERCONFIDENCE_BIAS = 'overconfidence_bias',
  ANCHORING_BIAS = 'anchoring_bias',
  CONFIRMATION_BIAS = 'confirmation_bias',
  HERD_MENTALITY = 'herd_mentality',
  LOSS_AVERSION = 'loss_aversion',
  RECENCY_BIAS = 'recency_bias',
}

export enum AnomalyType {
  VOLUME_SPIKE = 'volume_spike',
  POTENTIAL_MANIPULATION = 'potential_manipulation',
  ORACLE_DISCREPANCY = 'oracle_discrepancy',
  UNUSUAL_BETTING_PATTERN = 'unusual_betting_pattern',
  LIQUIDITY_DRAIN = 'liquidity_drain',
}

export enum Severity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface MarketAnalytics {
  marketId: string;
  totalVolume: string;
  participantCount: number;
  averageBetSize: string;
  volatilityIndex: string;
  sentimentScore: number; // -100 to 100
  predictionAccuracy: number; // Percentage
  liquidityScore: number;
  riskAssessment: RiskLevel;
  trendingScore: string;
  lastUpdated: number;
}

export interface RiskProfile {
  riskTolerance: number; // 1-100
  maxLossComfort: string;
  diversificationScore: number;
  timeHorizon: TimeHorizon;
  behavioralBiases: BehavioralBias[];
  lastUpdated: number;
}

export interface PredictionPatterns {
  preferredCategories: string[];
  timingPatterns: {
    mostActiveHours: number[];
    mostActiveDays: string[];
    averageBetFrequency: number;
  };
  betSizingPattern: {
    averageBetSize: string;
    betSizeVolatility: string;
    maxBetSize: string;
    minBetSize: string;
  };
  marketSelectionCriteria: {
    preferredMarketTypes: string[];
    preferredResolutionSources: string[];
    averageConfidenceLevel: number;
  };
}

export interface SocialInfluence {
  followerCount: number;
  followingCount: number;
  influenceScore: string;
  copyTradingPerformance: number; // Performance when others copy this user
  collaborativeAccuracy: number; // Accuracy when working with others
  socialEngagement: {
    likesReceived: number;
    commentsReceived: number;
    sharesReceived: number;
  };
}

export interface UserInsights {
  user: string;
  riskProfile: RiskProfile;
  predictionPatterns: PredictionPatterns;
  socialInfluence: SocialInfluence;
  recommendedMarkets: string[];
  optimalBetSizes: string[];
  confidenceCalibration: number; // How well calibrated user's confidence is
  lastUpdated: number;
}

export interface MarketAnomaly {
  id: string;
  marketId: string;
  anomalyType: AnomalyType;
  severity: Severity;
  description: string;
  confidence: number;
  detectedAt: number;
  data: any;
}

export interface PortfolioOptimization {
  user: string;
  totalCapital: string;
  targetRisk: number;
  marketAllocations: Array<{ marketId: string; allocationAmount: string }>;
  expectedReturn: string;
  riskScore: number;
  diversificationScore: number;
  lastUpdated: number;
}

export interface HistoricalMarketData {
  marketId: string;
  successRate: number;
  averageVolume: string;
  volatilityMeasures: string[];
  dataQualityScore: number;
  timeframe: number;
  dataPoints: number;
}

export interface MarketSentiment {
  marketId: string;
  overallSentiment: number;
  sentimentStrength: number;
  positiveMentions: number;
  negativeMentions: number;
  neutralMentions: number;
  sentimentTrend: 'improving' | 'declining' | 'stable';
  lastUpdated: number;
}

export interface AIPrediction {
  marketId: string;
  predictedOutcome: number;
  confidence: number;
  expectedValue: string;
  reasoning: string;
  modelVersion: string;
  timestamp: number;
  factors: {
    historicalData: number;
    sentimentAnalysis: number;
    oracleData: number;
    marketConditions: number;
  };
}

export enum AnalyticsError {
  MARKET_NOT_FOUND = 'MARKET_NOT_FOUND',
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  MODEL_ERROR = 'MODEL_ERROR',
}

export class AIAnalyticsService {
  private kaleService: KaleIntegrationService;
  private reflectorService: ReflectorIntegrationService;
  private marketService: EnhancedMarketService;
  private bettingService: EnhancedBettingService;
  private marketAnalytics: Map<string, MarketAnalytics> = new Map();
  private userInsights: Map<string, UserInsights> = new Map();
  private marketAnomalies: Map<string, MarketAnomaly[]> = new Map();
  private portfolioOptimizations: Map<string, PortfolioOptimization> = new Map();
  private historicalData: Map<string, HistoricalMarketData> = new Map();
  private marketSentiments: Map<string, MarketSentiment> = new Map();

  constructor(
    kaleService: KaleIntegrationService,
    reflectorService: ReflectorIntegrationService,
    marketService: EnhancedMarketService,
    bettingService: EnhancedBettingService
  ) {
    this.kaleService = kaleService;
    this.reflectorService = reflectorService;
    this.marketService = marketService;
    this.bettingService = bettingService;
  }

  /**
   * Generate comprehensive market analytics
   */
  async analyzeMarket(marketId: string): Promise<MarketAnalytics> {
    try {
      const market = await this.marketService.getMarket(marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      const liquidity = await this.marketService.getMarketLiquidity(marketId);
      if (!liquidity) {
        throw new Error('Market liquidity not found');
      }

      // Calculate various metrics
      const totalVolume = await this.calculateTotalMarketVolume(marketId);
      const participantCount = await this.countUniqueParticipants(marketId);
      const averageBetSize = participantCount > 0 ? 
        new Big(totalVolume).div(participantCount).toString() : '0';
      
      const volatilityIndex = await this.calculateVolatilityIndex(marketId);
      const sentimentScore = await this.analyzeMarketSentiment(marketId);
      const predictionAccuracy = await this.calculateHistoricalAccuracy(marketId);
      const liquidityScore = await this.assessLiquidityQuality(liquidity);
      const riskAssessment = await this.assessMarketRisk(marketId);
      const trendingScore = await this.calculateTrendingScore(marketId);

      const analytics: MarketAnalytics = {
        marketId,
        totalVolume,
        participantCount,
        averageBetSize,
        volatilityIndex,
        sentimentScore,
        predictionAccuracy,
        liquidityScore,
        riskAssessment,
        trendingScore,
        lastUpdated: Date.now(),
      };

      this.marketAnalytics.set(marketId, analytics);

      logger.info('Market analytics generated:', {
        marketId,
        totalVolume,
        participantCount,
        sentimentScore,
        riskAssessment,
      });

      return analytics;
    } catch (error) {
      logger.error('Failed to analyze market:', error);
      throw error;
    }
  }

  /**
   * Generate personalized user insights
   */
  async analyzeUserBehavior(userAddress: string): Promise<UserInsights> {
    try {
      const userBets = await this.bettingService.getUserBets(userAddress);
      
      if (userBets.length === 0) {
        throw new Error('Insufficient data for user analysis');
      }

      // Analyze risk profile
      const riskProfile = await this.analyzeRiskProfile(userAddress, userBets);
      
      // Detect prediction patterns
      const predictionPatterns = await this.detectPredictionPatterns(userAddress, userBets);
      
      // Calculate social influence
      const socialInfluence = await this.calculateSocialInfluence(userAddress);
      
      // Generate recommendations
      const recommendedMarkets = await this.recommendMarketsForUser(userAddress, predictionPatterns);
      const optimalBetSizes = await this.calculateOptimalBetSizes(userAddress, recommendedMarkets, riskProfile);
      
      // Assess confidence calibration
      const confidenceCalibration = await this.assessConfidenceCalibration(userAddress, userBets);

      const insights: UserInsights = {
        user: userAddress,
        riskProfile,
        predictionPatterns,
        socialInfluence,
        recommendedMarkets,
        optimalBetSizes,
        confidenceCalibration,
        lastUpdated: Date.now(),
      };

      this.userInsights.set(userAddress, insights);

      logger.info('User insights generated:', {
        user: userAddress,
        totalBets: userBets.length,
        riskTolerance: riskProfile.riskTolerance,
        confidenceCalibration,
      });

      return insights;
    } catch (error) {
      logger.error('Failed to analyze user behavior:', error);
      throw error;
    }
  }

  /**
   * AI-powered market prediction
   */
  async predictMarketOutcome(marketId: string): Promise<AIPrediction> {
    try {
      const market = await this.marketService.getMarket(marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      // Collect various data sources for prediction
      const historicalData = await this.getHistoricalMarketData(market);
      const currentOdds = await this.getCurrentMarketOdds(marketId);
      const sentimentData = await this.getMarketSentimentData(marketId);
      const oracleData = await this.getOracleDataForMarket(market);

      // Apply machine learning algorithms
      const prediction = await this.applyMLPredictionModel(
        historicalData,
        currentOdds,
        sentimentData,
        oracleData,
        market
      );

      logger.info('AI market prediction generated:', {
        marketId,
        predictedOutcome: prediction.predictedOutcome,
        confidence: prediction.confidence,
        modelVersion: prediction.modelVersion,
      });

      return prediction;
    } catch (error) {
      logger.error('Failed to predict market outcome:', error);
      throw error;
    }
  }

  /**
   * Detect and alert about unusual market activity
   */
  async detectMarketAnomalies(marketId: string): Promise<MarketAnomaly[]> {
    try {
      const anomalies: MarketAnomaly[] = [];
      
      // Check for unusual betting patterns
      if (await this.detectUnusualVolumeSpike(marketId)) {
        anomalies.push({
          id: uuidv4(),
          marketId,
          anomalyType: AnomalyType.VOLUME_SPIKE,
          severity: Severity.MEDIUM,
          description: 'Unusual volume spike detected',
          confidence: 85,
          detectedAt: Date.now(),
          data: { type: 'volume_spike' },
        });
      }
      
      // Check for potential manipulation
      if (await this.detectPotentialManipulation(marketId)) {
        anomalies.push({
          id: uuidv4(),
          marketId,
          anomalyType: AnomalyType.POTENTIAL_MANIPULATION,
          severity: Severity.HIGH,
          description: 'Coordinated betting pattern detected',
          confidence: 92,
          detectedAt: Date.now(),
          data: { type: 'manipulation' },
        });
      }
      
      // Check for oracle discrepancies
      const oracleAnomaly = await this.detectOracleDiscrepancy(marketId);
      if (oracleAnomaly) {
        anomalies.push(oracleAnomaly);
      }

      this.marketAnomalies.set(marketId, anomalies);

      logger.info('Market anomalies detected:', {
        marketId,
        anomalyCount: anomalies.length,
        severities: anomalies.map(a => a.severity),
      });

      return anomalies;
    } catch (error) {
      logger.error('Failed to detect market anomalies:', error);
      throw error;
    }
  }

  /**
   * Advanced portfolio optimization for users
   */
  async optimizeUserPortfolio(
    userAddress: string,
    targetRisk: number,
    availableCapital: string
  ): Promise<PortfolioOptimization> {
    try {
      const userInsights = await this.analyzeUserBehavior(userAddress);
      
      // Get available markets that match user's preferences
      const suitableMarkets = await this.findSuitableMarkets(userInsights, targetRisk);
      
      // Apply modern portfolio theory adapted for prediction markets
      const allocations = await this.calculateOptimalAllocations(
        suitableMarkets,
        availableCapital,
        targetRisk,
        userInsights.riskProfile
      );
      
      const optimization: PortfolioOptimization = {
        user: userAddress,
        totalCapital: availableCapital,
        targetRisk,
        marketAllocations: allocations,
        expectedReturn: await this.calculateExpectedReturn(allocations),
        riskScore: targetRisk,
        diversificationScore: await this.calculateDiversificationScore(allocations),
        lastUpdated: Date.now(),
      };

      this.portfolioOptimizations.set(userAddress, optimization);

      logger.info('Portfolio optimization completed:', {
        user: userAddress,
        totalCapital: availableCapital,
        targetRisk,
        allocations: allocations.length,
        expectedReturn: optimization.expectedReturn,
      });

      return optimization;
    } catch (error) {
      logger.error('Failed to optimize user portfolio:', error);
      throw error;
    }
  }

  /**
   * Sentiment analysis from social data
   */
  async analyzeMarketSentiment(marketId: string): Promise<number> {
    try {
      const marketMessages = await this.getMarketMessages(marketId);
      const marketBets = await this.getMarketBetsWithSocialData(marketId);
      
      let sentimentSum = 0;
      let totalWeight = 0;
      
      // Analyze message sentiment
      for (const message of marketMessages) {
        const sentiment = await this.analyzeTextSentiment(message);
        sentimentSum += sentiment;
        totalWeight += 1;
      }
      
      // Analyze bet reasoning sentiment
      for (const bet of marketBets) {
        if (bet.socialData?.reasoning) {
          const sentiment = await this.analyzeTextSentiment(bet.socialData.reasoning);
          const weight = bet.socialData.confidenceLevel;
          sentimentSum += sentiment * weight;
          totalWeight += weight;
        }
      }
      
      const overallSentiment = totalWeight > 0 ? sentimentSum / totalWeight : 0;

      const sentimentData: MarketSentiment = {
        marketId,
        overallSentiment,
        sentimentStrength: Math.abs(overallSentiment),
        positiveMentions: marketMessages.filter(m => m > 0).length,
        negativeMentions: marketMessages.filter(m => m < 0).length,
        neutralMentions: marketMessages.filter(m => m === 0).length,
        sentimentTrend: 'stable', // Would be calculated from historical data
        lastUpdated: Date.now(),
      };

      this.marketSentiments.set(marketId, sentimentData);

      return overallSentiment;
    } catch (error) {
      logger.error('Failed to analyze market sentiment:', error);
      return 0;
    }
  }

  /**
   * Behavioral bias detection
   */
  async detectBehavioralBiases(userAddress: string, bettingHistory: Bet[]): Promise<BehavioralBias[]> {
    try {
      const biases: BehavioralBias[] = [];
      
      // Detect overconfidence bias
      if (await this.hasOverconfidenceBias(bettingHistory)) {
        biases.push(BehavioralBias.OVERCONFIDENCE_BIAS);
      }
      
      // Detect anchoring bias
      if (await this.hasAnchoringBias(bettingHistory)) {
        biases.push(BehavioralBias.ANCHORING_BIAS);
      }
      
      // Detect herd mentality
      if (await this.hasHerdMentality(userAddress, bettingHistory)) {
        biases.push(BehavioralBias.HERD_MENTALITY);
      }
      
      // Detect loss aversion
      if (await this.hasLossAversion(bettingHistory)) {
        biases.push(BehavioralBias.LOSS_AVERSION);
      }

      logger.info('Behavioral biases detected:', {
        user: userAddress,
        biases: biases.length,
        types: biases,
      });

      return biases;
    } catch (error) {
      logger.error('Failed to detect behavioral biases:', error);
      return [];
    }
  }

  /**
   * Get market analytics
   */
  async getMarketAnalytics(marketId: string): Promise<MarketAnalytics | null> {
    try {
      return this.marketAnalytics.get(marketId) || null;
    } catch (error) {
      logger.error('Failed to get market analytics:', error);
      throw error;
    }
  }

  /**
   * Get user insights
   */
  async getUserInsights(userAddress: string): Promise<UserInsights | null> {
    try {
      return this.userInsights.get(userAddress) || null;
    } catch (error) {
      logger.error('Failed to get user insights:', error);
      throw error;
    }
  }

  /**
   * Get market anomalies
   */
  async getMarketAnomalies(marketId: string): Promise<MarketAnomaly[]> {
    try {
      return this.marketAnomalies.get(marketId) || [];
    } catch (error) {
      logger.error('Failed to get market anomalies:', error);
      throw error;
    }
  }

  /**
   * Internal helper functions
   */
  private async calculateTotalMarketVolume(marketId: string): Promise<string> {
    try {
      const bets = await this.bettingService.getMarketBets(marketId);
      return bets.reduce((sum, bet) => sum.plus(bet.amount), new Big(0)).toString();
    } catch (error) {
      logger.error('Failed to calculate total market volume:', error);
      return '0';
    }
  }

  private async countUniqueParticipants(marketId: string): Promise<number> {
    try {
      const bets = await this.bettingService.getMarketBets(marketId);
      const uniqueParticipants = new Set(bets.map(bet => bet.bettor));
      return uniqueParticipants.size;
    } catch (error) {
      logger.error('Failed to count unique participants:', error);
      return 0;
    }
  }

  private async calculateVolatilityIndex(marketId: string): Promise<string> {
    try {
      // This would typically calculate volatility from price/odds movements
      return '0.15'; // Placeholder
    } catch (error) {
      logger.error('Failed to calculate volatility index:', error);
      return '0';
    }
  }

  private async calculateHistoricalAccuracy(marketId: string): Promise<number> {
    try {
      // This would typically calculate from historical market data
      return 75; // Placeholder
    } catch (error) {
      logger.error('Failed to calculate historical accuracy:', error);
      return 0;
    }
  }

  private async assessLiquidityQuality(liquidity: any): Promise<number> {
    try {
      const totalLiquidity = new Big(liquidity.totalKaleStaked);
      const providerCount = liquidity.liquidityProviders.length;
      
      // Simple liquidity score based on total amount and provider diversity
      const amountScore = Math.min(100, totalLiquidity.div('1000000000').toNumber() * 10); // Max 100
      const diversityScore = Math.min(100, providerCount * 10); // Max 100
      
      return Math.floor((amountScore + diversityScore) / 2);
    } catch (error) {
      logger.error('Failed to assess liquidity quality:', error);
      return 0;
    }
  }

  private async assessMarketRisk(marketId: string): Promise<RiskLevel> {
    try {
      const analytics = await this.analyzeMarket(marketId);
      
      // Simple risk assessment based on volatility and liquidity
      const volatility = parseFloat(analytics.volatilityIndex);
      const liquidity = analytics.liquidityScore;
      
      if (volatility > 0.3 || liquidity < 30) {
        return RiskLevel.EXTREME;
      } else if (volatility > 0.2 || liquidity < 50) {
        return RiskLevel.HIGH;
      } else if (volatility > 0.1 || liquidity < 70) {
        return RiskLevel.MEDIUM;
      } else {
        return RiskLevel.LOW;
      }
    } catch (error) {
      logger.error('Failed to assess market risk:', error);
      return RiskLevel.MEDIUM;
    }
  }

  private async calculateTrendingScore(marketId: string): Promise<string> {
    try {
      // This would typically calculate trending based on recent activity
      return '75'; // Placeholder
    } catch (error) {
      logger.error('Failed to calculate trending score:', error);
      return '0';
    }
  }

  private async analyzeRiskProfile(userAddress: string, bettingHistory: Bet[]): Promise<RiskProfile> {
    try {
      const totalVolume = bettingHistory.reduce((sum, bet) => sum.plus(bet.amount), new Big(0));
      const averageBetSize = totalVolume.div(bettingHistory.length);
      const maxBetSize = bettingHistory.reduce((max, bet) => 
        new Big(bet.amount).gt(max) ? new Big(bet.amount) : max, new Big(0)
      );

      // Calculate risk tolerance based on betting patterns
      const riskTolerance = Math.min(100, averageBetSize.div(maxBetSize).mul(100).toNumber());
      
      // Detect behavioral biases
      const biases = await this.detectBehavioralBiases(userAddress, bettingHistory);

      return {
        riskTolerance,
        maxLossComfort: totalVolume.div(10).toString(), // 10% of total volume
        diversificationScore: await this.calculateDiversificationScore([]),
        timeHorizon: TimeHorizon.MEDIUM_TERM,
        behavioralBiases: biases,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      logger.error('Failed to analyze risk profile:', error);
      return {
        riskTolerance: 50,
        maxLossComfort: '1000000',
        diversificationScore: 50,
        timeHorizon: TimeHorizon.MEDIUM_TERM,
        behavioralBiases: [],
        lastUpdated: Date.now(),
      };
    }
  }

  private async detectPredictionPatterns(userAddress: string, bettingHistory: Bet[]): Promise<PredictionPatterns> {
    try {
      const categories = new Map<string, number>();
      const marketTypes = new Map<string, number>();
      const resolutionSources = new Map<string, number>();
      let totalConfidence = 0;

      for (const bet of bettingHistory) {
        const market = await this.marketService.getMarket(bet.marketId);
        if (market) {
          const categoryCount = categories.get(market.category) || 0;
          categories.set(market.category, categoryCount + 1);
          
          const typeCount = marketTypes.get(market.marketType) || 0;
          marketTypes.set(market.marketType, typeCount + 1);
          
          const sourceCount = resolutionSources.get(market.resolutionSource) || 0;
          resolutionSources.set(market.resolutionSource, sourceCount + 1);
        }

        if (bet.socialData) {
          totalConfidence += bet.socialData.confidenceLevel;
        }
      }

      const preferredCategories = Array.from(categories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category]) => category);

      const betSizes = bettingHistory.map(bet => new Big(bet.amount));
      const averageBetSize = betSizes.reduce((sum, size) => sum.plus(size), new Big(0))
        .div(bettingHistory.length).toString();

      return {
        preferredCategories,
        timingPatterns: {
          mostActiveHours: [9, 10, 11, 14, 15, 16], // Placeholder
          mostActiveDays: ['Monday', 'Tuesday', 'Wednesday'], // Placeholder
          averageBetFrequency: bettingHistory.length / 30, // Bets per day
        },
        betSizingPattern: {
          averageBetSize,
          betSizeVolatility: '0.2', // Placeholder
          maxBetSize: betSizes.reduce((max, size) => size.gt(max) ? size : max, new Big(0)).toString(),
          minBetSize: betSizes.reduce((min, size) => size.lt(min) ? size : min, betSizes[0]).toString(),
        },
        marketSelectionCriteria: {
          preferredMarketTypes: Array.from(marketTypes.keys()),
          preferredResolutionSources: Array.from(resolutionSources.keys()),
          averageConfidenceLevel: bettingHistory.length > 0 ? totalConfidence / bettingHistory.length : 0,
        },
      };
    } catch (error) {
      logger.error('Failed to detect prediction patterns:', error);
      return {
        preferredCategories: [],
        timingPatterns: {
          mostActiveHours: [],
          mostActiveDays: [],
          averageBetFrequency: 0,
        },
        betSizingPattern: {
          averageBetSize: '0',
          betSizeVolatility: '0',
          maxBetSize: '0',
          minBetSize: '0',
        },
        marketSelectionCriteria: {
          preferredMarketTypes: [],
          preferredResolutionSources: [],
          averageConfidenceLevel: 0,
        },
      };
    }
  }

  private async calculateSocialInfluence(userAddress: string): Promise<SocialInfluence> {
    try {
      // This would typically query social graph data
      return {
        followerCount: 0,
        followingCount: 0,
        influenceScore: '0',
        copyTradingPerformance: 0,
        collaborativeAccuracy: 0,
        socialEngagement: {
          likesReceived: 0,
          commentsReceived: 0,
          sharesReceived: 0,
        },
      };
    } catch (error) {
      logger.error('Failed to calculate social influence:', error);
      return {
        followerCount: 0,
        followingCount: 0,
        influenceScore: '0',
        copyTradingPerformance: 0,
        collaborativeAccuracy: 0,
        socialEngagement: {
          likesReceived: 0,
          commentsReceived: 0,
          sharesReceived: 0,
        },
      };
    }
  }

  private async recommendMarketsForUser(
    userAddress: string,
    patterns: PredictionPatterns
  ): Promise<string[]> {
    try {
      // This would typically use collaborative filtering or content-based filtering
      const activeMarkets = await this.marketService.getActiveMarkets();
      
      return activeMarkets
        .filter(market => patterns.preferredCategories.includes(market.category))
        .slice(0, 10)
        .map(market => market.id);
    } catch (error) {
      logger.error('Failed to recommend markets for user:', error);
      return [];
    }
  }

  private async calculateOptimalBetSizes(
    userAddress: string,
    recommendedMarkets: string[],
    riskProfile: RiskProfile
  ): Promise<string[]> {
    try {
      const maxBetSize = new Big(riskProfile.maxLossComfort);
      const betSizes: string[] = [];

      for (const marketId of recommendedMarkets) {
        const market = await this.marketService.getMarket(marketId);
        if (market) {
          const optimalSize = maxBetSize.mul(riskProfile.riskTolerance / 100).toString();
          betSizes.push(optimalSize);
        }
      }

      return betSizes;
    } catch (error) {
      logger.error('Failed to calculate optimal bet sizes:', error);
      return [];
    }
  }

  private async assessConfidenceCalibration(userAddress: string, bettingHistory: Bet[]): Promise<number> {
    try {
      let totalConfidence = 0;
      let correctPredictions = 0;
      let totalPredictions = 0;

      for (const bet of bettingHistory) {
        if (bet.socialData && bet.isSettled) {
          totalConfidence += bet.socialData.confidenceLevel;
          totalPredictions += 1;
          
          if (bet.payout && new Big(bet.payout).gt(bet.amount)) {
            correctPredictions += 1;
          }
        }
      }

      if (totalPredictions === 0) {
        return 0;
      }

      const averageConfidence = totalConfidence / totalPredictions;
      const actualAccuracy = (correctPredictions / totalPredictions) * 100;
      
      // Calibration score: how close is confidence to actual accuracy
      return Math.max(0, 100 - Math.abs(averageConfidence - actualAccuracy));
    } catch (error) {
      logger.error('Failed to assess confidence calibration:', error);
      return 0;
    }
  }

  // Additional helper methods would be implemented here...
  private async getHistoricalMarketData(market: Market): Promise<HistoricalMarketData> {
    return {
      marketId: market.id,
      successRate: 75,
      averageVolume: '1000000',
      volatilityMeasures: ['0.15', '0.20'],
      dataQualityScore: 85,
      timeframe: 30,
      dataPoints: 100,
    };
  }

  private async getCurrentMarketOdds(marketId: string): Promise<any> {
    return { '0': '15000', '1': '25000' };
  }

  private async getMarketSentimentData(marketId: string): Promise<MarketSentiment> {
    return this.marketSentiments.get(marketId) || {
      marketId,
      overallSentiment: 0,
      sentimentStrength: 0,
      positiveMentions: 0,
      negativeMentions: 0,
      neutralMentions: 0,
      sentimentTrend: 'stable',
      lastUpdated: Date.now(),
    };
  }

  private async getOracleDataForMarket(market: Market): Promise<any> {
    return null;
  }

  private async applyMLPredictionModel(
    historicalData: HistoricalMarketData,
    currentOdds: any,
    sentimentData: MarketSentiment,
    oracleData: any,
    market: Market
  ): Promise<AIPrediction> {
    // Simplified ML model
    const predictionScore = historicalData.successRate * 0.4 + 
                           sentimentData.overallSentiment * 0.3 + 
                           (oracleData ? 20 : 0);
    
    return {
      marketId: market.id,
      predictedOutcome: predictionScore > 50 ? 0 : 1,
      confidence: Math.min(95, Math.max(60, predictionScore)),
      expectedValue: '1.2',
      reasoning: 'AI analysis based on historical data, sentiment, and market conditions',
      modelVersion: '1.0',
      timestamp: Date.now(),
      factors: {
        historicalData: historicalData.successRate,
        sentimentAnalysis: sentimentData.overallSentiment,
        oracleData: oracleData ? 20 : 0,
        marketConditions: 15,
      },
    };
  }

  private async detectUnusualVolumeSpike(marketId: string): Promise<boolean> {
    return false; // Placeholder
  }

  private async detectPotentialManipulation(marketId: string): Promise<boolean> {
    return false; // Placeholder
  }

  private async detectOracleDiscrepancy(marketId: string): Promise<MarketAnomaly | null> {
    return null; // Placeholder
  }

  private async findSuitableMarkets(insights: UserInsights, targetRisk: number): Promise<string[]> {
    return []; // Placeholder
  }

  private async calculateOptimalAllocations(
    markets: string[],
    capital: string,
    targetRisk: number,
    riskProfile: RiskProfile
  ): Promise<Array<{ marketId: string; allocationAmount: string }>> {
    return []; // Placeholder
  }

  private async calculateExpectedReturn(allocations: Array<{ marketId: string; allocationAmount: string }>): Promise<string> {
    return '0'; // Placeholder
  }

  private async calculateDiversificationScore(allocations: Array<{ marketId: string; allocationAmount: string }>): Promise<number> {
    return 50; // Placeholder
  }

  private async getMarketMessages(marketId: string): Promise<number[]> {
    return []; // Placeholder
  }

  private async getMarketBetsWithSocialData(marketId: string): Promise<Bet[]> {
    const bets = await this.bettingService.getMarketBets(marketId);
    return bets.filter(bet => bet.socialData);
  }

  private async analyzeTextSentiment(text: string): Promise<number> {
    // Simplified sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'win', 'profit', 'bullish'];
    const negativeWords = ['bad', 'terrible', 'awful', 'loss', 'bearish', 'crash'];
    
    const words = text.toLowerCase().split(' ');
    let score = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    }
    
    return Math.max(-100, Math.min(100, score * 10));
  }

  private async hasOverconfidenceBias(bettingHistory: Bet[]): Promise<boolean> {
    return false; // Placeholder
  }

  private async hasAnchoringBias(bettingHistory: Bet[]): Promise<boolean> {
    return false; // Placeholder
  }

  private async hasHerdMentality(userAddress: string, bettingHistory: Bet[]): Promise<boolean> {
    return false; // Placeholder
  }

  private async hasLossAversion(bettingHistory: Bet[]): Promise<boolean> {
    return false; // Placeholder
  }
}
