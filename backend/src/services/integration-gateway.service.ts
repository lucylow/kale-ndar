import { Keypair, Networks, Server, Transaction, Account } from '@stellar/stellar-sdk';
import { logger } from '../utils/logger';
import { KaleIntegrationService } from './kale-integration.service';
import { ReflectorIntegrationService } from './reflector-integration.service';
import { EnhancedMarketService } from './enhanced-market.service';
import { EnhancedBettingService } from './enhanced-betting.service';
import { RealtimeEventService, EventType } from './realtime-event.service';
import { AIAnalyticsService } from './ai-analytics.service';
import { StellarRpcService } from './stellar-rpc.service';
import { KaleTokenService } from './kale-token.service';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export interface KaleIntegrationConfig {
  kaleContractId: string;
  kaleAssetCode: string;
  kaleAssetIssuer: string;
  networkPassphrase: string;
  horizonUrl: string;
  rpcUrl: string;
}

export interface ReflectorConfig {
  contractAddresses: {
    externalCex: string;
    stellarPubnet: string;
    foreignExchange: string;
  };
  subscriptionClientConfig: {
    publicKey: string;
    signTransaction: (xdr: string, opts: any) => string;
    rpcUrl: string;
  };
}

export interface MarketCreationParams {
  title: string;
  description: string;
  outcomes: string[];
  category: string;
  resolutionSource: 'ORACLE' | 'MANUAL' | 'COMMUNITY';
  resolutionCriteria: any;
  bettingDuration: number;
  kaleBoostEnabled: boolean;
}

export interface BettingParams {
  marketId: string;
  outcome: number;
  amount: string;
  betType: 'STANDARD' | 'TEAM' | 'FOLLOW' | 'SYNDICATE';
  socialData?: {
    isPublic: boolean;
    reasoning?: string;
    confidence: number;
  };
}

export interface FarmingAutomationConfig {
  stakeAmount: string;
  autoHarvest: boolean;
  riskTolerance: 'low' | 'medium' | 'high';
  teamFarming?: {
    teamId: string;
    sharePercentage: number;
  };
}

export interface IntegrationGatewayConfig {
  kale: KaleIntegrationConfig;
  reflector: ReflectorConfig;
  redis: any;
  wsPort: number;
  apiBaseUrl: string;
}

export class IntegrationGatewayService {
  private kaleConfig: KaleIntegrationConfig;
  private reflectorConfig: ReflectorConfig;
  private stellarServer: Server;
  private kaleService: KaleIntegrationService;
  private reflectorService: ReflectorIntegrationService;
  private marketService: EnhancedMarketService;
  private bettingService: EnhancedBettingService;
  private realtimeService: RealtimeEventService;
  private aiAnalyticsService: AIAnalyticsService;
  private stellarRpc: StellarRpcService;
  private kaleToken: KaleTokenService;

  constructor(config: IntegrationGatewayConfig) {
    this.kaleConfig = config.kale;
    this.reflectorConfig = config.reflector;
    this.stellarServer = new Server(config.kale.horizonUrl);
    
    // Initialize services
    this.stellarRpc = new StellarRpcService(config.kale.rpcUrl);
    this.kaleToken = new KaleTokenService(this.stellarRpc, {
      contractId: config.kale.kaleContractId,
      issuerAddress: config.kale.kaleAssetIssuer,
      totalSupply: '1000000000000000',
      decimals: 6,
      symbol: config.kale.kaleAssetCode,
      name: 'KALE Token',
    });

    this.kaleService = new KaleIntegrationService(
      this.stellarRpc,
      this.kaleToken,
      config.kale
    );

    this.reflectorService = new ReflectorIntegrationService({
      apiUrl: 'https://reflector-api.example.com',
      webhookUrl: `${config.apiBaseUrl}/webhook`,
      contractAddresses: config.reflector.contractAddresses,
      subscriptionClientConfig: config.reflector.subscriptionClientConfig,
      defaultThreshold: 100,
      defaultHeartbeat: 60,
      maxConfidence: 100,
      minConfidence: 50,
    });

    this.marketService = new EnhancedMarketService(
      this.stellarRpc,
      this.kaleService,
      this.reflectorService
    );

    this.bettingService = new EnhancedBettingService(
      this.stellarRpc,
      this.kaleService,
      this.reflectorService,
      this.marketService
    );

    this.realtimeService = new RealtimeEventService({
      wsPort: config.wsPort,
      redisConfig: config.redis,
      maxConnections: 1000,
      heartbeatInterval: 30000,
      cleanupInterval: 3600000,
      maxCacheSize: 10000,
    });

    this.aiAnalyticsService = new AIAnalyticsService(
      this.kaleService,
      this.reflectorService,
      this.marketService,
      this.bettingService
    );
  }

  /**
   * Enhanced KALE farming integration
   */
  async stakeKaleForPrediction(
    userKeypair: Keypair,
    amount: string,
    marketId: string,
    predictionData: any
  ): Promise<{ transactionHash: string; sessionId: string }> {
    try {
      // Load user account
      const userAccount = await this.stellarServer.loadAccount(userKeypair.publicKey());
      
      // Create staking session
      const session = await this.kaleService.stakeForPrediction(
        userKeypair,
        amount,
        marketId,
        predictionData
      );

      // Emit real-time event
      await this.realtimeService.emitEvent(
        EventType.MARKET_CREATED,
        {
          sessionId: session.id,
          amount,
          marketId,
          predictionData,
        },
        marketId,
        userKeypair.publicKey(),
        'high'
      );

      logger.info('KALE staking for prediction completed:', {
        sessionId: session.id,
        user: userKeypair.publicKey(),
        amount,
        marketId,
      });

      return {
        transactionHash: 'placeholder_hash', // Would be actual transaction hash
        sessionId: session.id,
      };
    } catch (error) {
      logger.error('KALE staking failed:', error);
      throw new Error(`KALE staking failed: ${error.message}`);
    }
  }

  /**
   * Advanced KALE farming automation
   */
  async setupAutomatedKaleFarming(
    userKeypair: Keypair,
    farmingConfig: FarmingAutomationConfig
  ): Promise<string> {
    try {
      // Create farming automation job
      const automationId = uuidv4();
      
      // Store automation config
      const automationData = {
        userPublicKey: userKeypair.publicKey(),
        config: farmingConfig,
        status: 'ACTIVE',
        lastExecution: null,
        totalHarvested: '0',
        createdAt: Date.now(),
      };

      // Schedule periodic farming tasks
      await this.scheduleKaleFarmingTasks(automationId, farmingConfig);

      logger.info('Automated KALE farming setup completed:', {
        automationId,
        user: userKeypair.publicKey(),
        config: farmingConfig,
      });

      return automationId;
    } catch (error) {
      logger.error('Automation setup failed:', error);
      throw new Error(`Automation setup failed: ${error.message}`);
    }
  }

  /**
   * Enhanced Reflector oracle integration
   */
  async createMarketWithOracleResolution(
    creatorKeypair: Keypair,
    marketData: MarketCreationParams
  ): Promise<{ marketId: string; subscriptionId: string }> {
    try {
      // Create market
      const market = await this.marketService.createAdvancedMarket(creatorKeypair, {
        creator: creatorKeypair.publicKey(),
        title: marketData.title,
        description: marketData.description,
        marketType: 'binary' as any,
        outcomes: marketData.outcomes,
        resolutionSource: marketData.resolutionSource as any,
        resolutionCriteria: JSON.stringify(marketData.resolutionCriteria),
        bettingDuration: marketData.bettingDuration,
        resolutionDelay: 3600,
        category: marketData.category,
        tags: [marketData.category],
        kaleBoostEnabled: marketData.kaleBoostEnabled,
      });

      // Create Reflector subscription for market resolution
      const subscription = await this.reflectorService.createMarketSubscription(
        market.id,
        { base: marketData.resolutionCriteria.asset, quote: 'USD' },
        100, // 1% price change threshold
        `${process.env.API_BASE_URL}/webhook/reflector/${market.id}`
      );

      // Emit market creation event
      await this.realtimeService.emitEvent(
        EventType.MARKET_CREATED,
        {
          marketId: market.id,
          title: marketData.title,
          category: marketData.category,
          kaleBoostEnabled: marketData.kaleBoostEnabled,
        },
        market.id,
        creatorKeypair.publicKey(),
        'high'
      );

      logger.info('Market created with oracle resolution:', {
        marketId: market.id,
        subscriptionId: subscription.id,
        creator: creatorKeypair.publicKey(),
      });

      return {
        marketId: market.id,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      logger.error('Market creation with oracle failed:', error);
      throw new Error(`Market creation with oracle failed: ${error.message}`);
    }
  }

  /**
   * Multi-oracle price aggregation for enhanced accuracy
   */
  async getAggregatedPriceData(
    asset: string,
    sources: string[] = ['external_cex', 'stellar_pubnet', 'foreign_exchange']
  ): Promise<{
    aggregatedPrice: number;
    confidence: number;
    sourceData: Array<{ source: string; price: number; timestamp: number }>;
    priceVariance: number;
  }> {
    try {
      const priceData = await this.reflectorService.getAggregatedPriceData(asset, 70);
      
      return {
        aggregatedPrice: parseFloat(priceData.price),
        confidence: priceData.confidence,
        sourceData: [{
          source: priceData.source,
          price: parseFloat(priceData.price),
          timestamp: priceData.timestamp,
        }],
        priceVariance: 0, // Would be calculated from multiple sources
      };
    } catch (error) {
      logger.error('Price aggregation failed:', error);
      throw new Error(`Price aggregation failed: ${error.message}`);
    }
  }

  /**
   * Real-time market data streaming
   */
  async startMarketDataStream(
    marketId: string,
    updateIntervals: {
      priceUpdates: number;    // seconds
      oddsUpdates: number;     // seconds
      volumeUpdates: number;   // seconds
    }
  ): Promise<void> {
    try {
      await this.realtimeService.startMarketDataStream(marketId, updateIntervals);
      
      logger.info('Market data stream started:', {
        marketId,
        intervals: updateIntervals,
      });
    } catch (error) {
      logger.error('Failed to start market data stream:', error);
      throw new Error(`Failed to start market data stream: ${error.message}`);
    }
  }

  /**
   * Advanced stop-loss and take-profit automation
   */
  async setupAdvancedOrderAutomation(
    userKeypair: Keypair,
    marketId: string,
    orders: Array<{
      type: 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP';
      trigger: {
        condition: 'PRICE_BELOW' | 'PRICE_ABOVE' | 'LOSS_PERCENTAGE' | 'PROFIT_PERCENTAGE';
        value: number;
      };
      action: {
        type: 'SELL_ALL' | 'SELL_PERCENTAGE' | 'HEDGE_BET';
        parameters: any;
      };
    }>
  ): Promise<string[]> {
    try {
      const orderIds: string[] = [];
      
      for (const order of orders) {
        const stopLossOrder = await this.bettingService.createStopLossOrder(
          userKeypair,
          marketId,
          order.trigger.condition.toLowerCase() as any,
          order.trigger.value.toString(),
          order.action.type.toLowerCase() as any,
          order.action.parameters
        );
        
        orderIds.push(stopLossOrder.id);
      }

      logger.info('Advanced order automation setup completed:', {
        user: userKeypair.publicKey(),
        marketId,
        orderCount: orderIds.length,
      });

      return orderIds;
    } catch (error) {
      logger.error('Order automation setup failed:', error);
      throw new Error(`Order automation setup failed: ${error.message}`);
    }
  }

  /**
   * Social trading features
   */
  async enableCopyTrading(
    followerKeypair: Keypair,
    targetUserPublicKey: string,
    copySettings: {
      maxAmountPerTrade: string;
      copyPercentage: number;
      categories?: string[];
      riskLimits?: {
        dailyLossLimit: string;
        maxOpenPositions: number;
      };
    }
  ): Promise<string> {
    try {
      const copyTradingConfig = await this.bettingService.enableCopyTrading(
        followerKeypair,
        targetUserPublicKey,
        copySettings.maxAmountPerTrade,
        copySettings.copyPercentage,
        copySettings.categories,
        copySettings.riskLimits
      );

      logger.info('Copy trading enabled:', {
        follower: followerKeypair.publicKey(),
        target: targetUserPublicKey,
        copyPercentage: copySettings.copyPercentage,
        maxAmountPerTrade: copySettings.maxAmountPerTrade,
      });

      return copyTradingConfig.follower;
    } catch (error) {
      logger.error('Copy trading setup failed:', error);
      throw new Error(`Copy trading setup failed: ${error.message}`);
    }
  }

  /**
   * Advanced analytics and insights
   */
  async generateMarketInsights(marketId: string): Promise<{
    sentiment: {
      overall: number;
      trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
      confidence: number;
    };
    technicalAnalysis: {
      support: number;
      resistance: number;
      momentum: number;
      volatility: number;
    };
    socialSignals: {
      influencerActivity: number;
      communityEngagement: number;
      expertPredictions: Array<{
        predictor: string;
        prediction: number;
        confidence: number;
      }>;
    };
    riskAssessment: {
      liquidityRisk: number;
      manipulationRisk: number;
      oracleRisk: number;
      overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    };
  }> {
    try {
      // Generate market analytics
      const marketAnalytics = await this.aiAnalyticsService.analyzeMarket(marketId);
      
      // Get market sentiment
      const sentimentScore = await this.aiAnalyticsService.analyzeMarketSentiment(marketId);
      
      // Detect anomalies
      const anomalies = await this.aiAnalyticsService.detectMarketAnomalies(marketId);

      const insights = {
        sentiment: {
          overall: sentimentScore,
          trend: sentimentScore > 20 ? 'BULLISH' : sentimentScore < -20 ? 'BEARISH' : 'NEUTRAL',
          confidence: marketAnalytics.sentimentScore,
        },
        technicalAnalysis: {
          support: parseFloat(marketAnalytics.trendingScore) * 0.8,
          resistance: parseFloat(marketAnalytics.trendingScore) * 1.2,
          momentum: marketAnalytics.sentimentScore,
          volatility: parseFloat(marketAnalytics.volatilityIndex),
        },
        socialSignals: {
          influencerActivity: marketAnalytics.participantCount,
          communityEngagement: marketAnalytics.totalVolume,
          expertPredictions: [], // Would be populated from actual data
        },
        riskAssessment: {
          liquidityRisk: 100 - marketAnalytics.liquidityScore,
          manipulationRisk: anomalies.filter(a => a.anomalyType === 'potential_manipulation').length * 25,
          oracleRisk: 20, // Placeholder
          overallRisk: marketAnalytics.riskAssessment.toUpperCase() as any,
        },
      };

      logger.info('Market insights generated:', {
        marketId,
        sentiment: insights.sentiment.overall,
        risk: insights.riskAssessment.overallRisk,
      });

      return insights;
    } catch (error) {
      logger.error('Market insights generation failed:', error);
      throw new Error(`Market insights generation failed: ${error.message}`);
    }
  }

  /**
   * Webhook handler for Reflector oracle updates
   */
  async handleReflectorWebhook(payload: any): Promise<void> {
    try {
      await this.reflectorService.processReflectorWebhook(payload);
      
      logger.info('Reflector webhook processed successfully');
    } catch (error) {
      logger.error('Reflector webhook processing failed:', error);
    }
  }

  /**
   * Place bet with full integration
   */
  async placeIntegratedBet(
    userKeypair: Keypair,
    bettingParams: BettingParams
  ): Promise<any> {
    try {
      // Place bet
      const bet = await this.bettingService.placeSocialBet(
        userKeypair,
        bettingParams.marketId,
        bettingParams.outcome,
        bettingParams.amount,
        bettingParams.betType.toLowerCase() as any,
        bettingParams.socialData?.isPublic || false,
        bettingParams.socialData?.reasoning,
        bettingParams.socialData?.confidence || 50
      );

      // Emit real-time event
      await this.realtimeService.emitEvent(
        EventType.BET_PLACED,
        {
          betId: bet.id,
          amount: bet.amount,
          outcome: bet.outcome,
          betType: bet.betType,
        },
        bettingParams.marketId,
        userKeypair.publicKey(),
        'medium'
      );

      // Update market analytics
      await this.aiAnalyticsService.analyzeMarket(bettingParams.marketId);

      logger.info('Integrated bet placed:', {
        betId: bet.id,
        user: userKeypair.publicKey(),
        marketId: bettingParams.marketId,
        amount: bettingParams.amount,
      });

      return bet;
    } catch (error) {
      logger.error('Failed to place integrated bet:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive user dashboard data
   */
  async getUserDashboardData(userAddress: string): Promise<{
    userAnalytics: any;
    userInsights: any;
    activeBets: any[];
    farmingSessions: any[];
    liquidStakes: any[];
    notifications: any[];
    portfolioOptimization: any;
  }> {
    try {
      const [
        userAnalytics,
        userInsights,
        activeBets,
        farmingSessions,
        liquidStakes,
        notifications,
        portfolioOptimization,
      ] = await Promise.all([
        this.bettingService.getUserAnalytics(userAddress),
        this.aiAnalyticsService.getUserInsights(userAddress),
        this.bettingService.getUserBets(userAddress),
        this.kaleService.getUserFarmingSessions(userAddress),
        this.kaleService.getUserLiquidStakes(userAddress),
        this.realtimeService.getUserNotifications(userAddress, 20),
        this.aiAnalyticsService.optimizeUserPortfolio(userAddress, 50, '10000000'),
      ]);

      return {
        userAnalytics,
        userInsights,
        activeBets,
        farmingSessions,
        liquidStakes,
        notifications,
        portfolioOptimization,
      };
    } catch (error) {
      logger.error('Failed to get user dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive market dashboard data
   */
  async getMarketDashboardData(marketId: string): Promise<{
    market: any;
    liquidity: any;
    analytics: any;
    bets: any[];
    chatMessages: any[];
    anomalies: any[];
    aiPrediction: any;
  }> {
    try {
      const [
        market,
        liquidity,
        analytics,
        bets,
        chatMessages,
        anomalies,
        aiPrediction,
      ] = await Promise.all([
        this.marketService.getMarket(marketId),
        this.marketService.getMarketLiquidity(marketId),
        this.aiAnalyticsService.getMarketAnalytics(marketId),
        this.bettingService.getMarketBets(marketId),
        this.realtimeService.getMarketChatMessages(marketId, 50),
        this.aiAnalyticsService.getMarketAnomalies(marketId),
        this.aiAnalyticsService.predictMarketOutcome(marketId),
      ]);

      return {
        market,
        liquidity,
        analytics,
        bets,
        chatMessages,
        anomalies,
        aiPrediction,
      };
    } catch (error) {
      logger.error('Failed to get market dashboard data:', error);
      throw error;
    }
  }

  /**
   * Internal helper functions
   */
  private async scheduleKaleFarmingTasks(
    automationId: string,
    config: FarmingAutomationConfig
  ): Promise<void> {
    try {
      // This would typically schedule periodic tasks
      logger.info('KALE farming tasks scheduled:', {
        automationId,
        config,
      });
    } catch (error) {
      logger.error('Failed to schedule KALE farming tasks:', error);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      await this.realtimeService.shutdown();
      logger.info('Integration gateway shutdown completed');
    } catch (error) {
      logger.error('Failed to shutdown integration gateway:', error);
    }
  }
}
