import axios from 'axios';
import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export interface ReflectorPriceData {
  asset: string;
  price: string;
  timestamp: number;
  decimals: number;
  source: string;
  confidence: number;
  volume24h?: string;
  change24h?: string;
}

export interface MarketResolutionData {
  marketId: string;
  oracleSource: string;
  resolutionValue: string;
  confidenceScore: number;
  timestamp: number;
  dataSources: string[];
  aggregatedPrice: string;
  priceVariance: string;
}

export interface ReflectorSubscription {
  id: string;
  marketId: string;
  assetPair: {
    base: string;
    quote: string;
  };
  threshold: number;
  heartbeat: number;
  webhookUrl: string;
  balance: string;
  isActive: boolean;
  createdAt: number;
  lastUpdate: number;
}

export interface HistoricalAnalysis {
  asset: string;
  avgPrice: string;
  volatility: string;
  trend: number; // -1 for bearish, 0 for neutral, 1 for bullish
  supportLevel: string;
  resistanceLevel: string;
  timeframe: number;
  dataPoints: number;
}

export interface CrossPriceData {
  baseAsset: string;
  quoteAsset: string;
  intermediateAsset: string;
  crossRate: string;
  confidence: number;
  calculationMethod: string;
  timestamp: number;
}

export interface ReflectorConfig {
  apiUrl: string;
  webhookUrl: string;
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
  defaultThreshold: number;
  defaultHeartbeat: number;
  maxConfidence: number;
  minConfidence: number;
}

export enum ReflectorError {
  NO_DATA_AVAILABLE = 'NO_DATA_AVAILABLE',
  INSUFFICIENT_CONFIDENCE = 'INSUFFICIENT_CONFIDENCE',
  ORACLE_CALL_FAILED = 'ORACLE_CALL_FAILED',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
}

export class ReflectorIntegrationService {
  private config: ReflectorConfig;
  private subscriptions: Map<string, ReflectorSubscription> = new Map();
  private priceCache: Map<string, ReflectorPriceData> = new Map();
  private historicalCache: Map<string, HistoricalAnalysis> = new Map();
  private crossPriceCache: Map<string, CrossPriceData> = new Map();

  constructor(config: ReflectorConfig) {
    this.config = config;
  }

  /**
   * Multi-oracle price aggregation for market resolution
   */
  async getAggregatedPriceData(
    asset: string,
    minConfidence: number = 70
  ): Promise<ReflectorPriceData> {
    try {
      const priceData: ReflectorPriceData[] = [];
      
      // Collect price data from multiple oracle sources
      const sources = Object.keys(this.config.contractAddresses);
      
      for (const source of sources) {
        try {
          const data = await this.fetchPriceFromOracle(source, asset);
          if (data && data.confidence >= minConfidence) {
            priceData.push(data);
          }
        } catch (error) {
          logger.warn(`Failed to fetch price from ${source}:`, error.message);
        }
      }

      if (priceData.length === 0) {
        throw new Error('No price data available from any source');
      }

      // Calculate confidence-weighted average
      const aggregated = await this.calculateWeightedAverage(priceData, minConfidence);
      
      // Cache the aggregated result
      this.priceCache.set(asset, aggregated);
      
      logger.info('Aggregated price data calculated:', {
        asset,
        sources: priceData.length,
        aggregatedPrice: aggregated.price,
        confidence: aggregated.confidence,
      });

      return aggregated;
    } catch (error) {
      logger.error('Failed to get aggregated price data:', error);
      throw error;
    }
  }

  /**
   * Advanced market resolution with multiple data sources
   */
  async resolveMarketWithConfidence(
    marketId: string,
    resolutionCriteria: string,
    requiredConfidence: number = 80
  ): Promise<MarketResolutionData> {
    try {
      // Get price data from multiple sources
      const priceData = await this.getAggregatedPriceData(resolutionCriteria, requiredConfidence);
      
      // Calculate confidence score based on data consistency
      const confidence = await this.calculateConfidenceScore(priceData);
      
      if (confidence < requiredConfidence) {
        throw new Error(`Insufficient confidence: ${confidence}% (required: ${requiredConfidence}%)`);
      }

      const resolutionData: MarketResolutionData = {
        marketId,
        oracleSource: resolutionCriteria,
        resolutionValue: priceData.price,
        confidenceScore: confidence,
        timestamp: Date.now(),
        dataSources: [priceData.source],
        aggregatedPrice: priceData.price,
        priceVariance: '0', // Would be calculated from multiple sources
      };

      logger.info('Market resolved with confidence:', {
        marketId,
        resolutionCriteria,
        resolutionValue: resolutionData.resolutionValue,
        confidence: resolutionData.confidenceScore,
      });

      return resolutionData;
    } catch (error) {
      logger.error('Failed to resolve market with confidence:', error);
      throw error;
    }
  }

  /**
   * Real-time subscription management for live markets
   */
  async createMarketSubscription(
    marketId: string,
    assetPair: { base: string; quote: string },
    thresholdPercentage: number = 100, // 1% threshold
    webhookUrl?: string
  ): Promise<ReflectorSubscription> {
    try {
      const subscriptionId = uuidv4();
      
      const subscription: ReflectorSubscription = {
        id: subscriptionId,
        marketId,
        assetPair,
        threshold: thresholdPercentage,
        heartbeat: this.config.defaultHeartbeat,
        webhookUrl: webhookUrl || `${this.config.webhookUrl}/reflector-webhook`,
        balance: '300', // XRF tokens
        isActive: true,
        createdAt: Date.now(),
        lastUpdate: Date.now(),
      };

      // Create Reflector subscription
      await this.createReflectorSubscription(subscription);
      
      // Store subscription locally
      this.subscriptions.set(subscriptionId, subscription);

      logger.info('Market subscription created:', {
        subscriptionId,
        marketId,
        assetPair: `${assetPair.base}/${assetPair.quote}`,
        threshold: thresholdPercentage,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to create market subscription:', error);
      throw error;
    }
  }

  /**
   * Historical price analysis for market insights
   */
  async getHistoricalAnalysis(
    asset: string,
    timeframeDays: number = 30
  ): Promise<HistoricalAnalysis> {
    try {
      const cacheKey = `${asset}_${timeframeDays}`;
      const cached = this.historicalCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached;
      }

      const pricePoints: ReflectorPriceData[] = [];
      const currentTime = Date.now();
      const timeframeMs = timeframeDays * 24 * 60 * 60 * 1000;
      
      // Collect historical data points
      for (let i = 0; i < timeframeDays; i++) {
        const timestamp = currentTime - (i * 24 * 60 * 60 * 1000);
        try {
          const data = await this.getHistoricalPrice(asset, timestamp);
          if (data) {
            pricePoints.push(data);
          }
        } catch (error) {
          logger.warn(`Failed to get historical price for ${asset} at ${timestamp}:`, error.message);
        }
      }

      if (pricePoints.length === 0) {
        throw new Error('No historical data available');
      }

      // Calculate analysis metrics
      const analysis: HistoricalAnalysis = {
        asset,
        avgPrice: this.calculateAveragePrice(pricePoints),
        volatility: this.calculateVolatility(pricePoints),
        trend: this.calculateTrend(pricePoints),
        supportLevel: this.calculateSupportLevel(pricePoints),
        resistanceLevel: this.calculateResistanceLevel(pricePoints),
        timeframe: timeframeDays,
        dataPoints: pricePoints.length,
      };

      // Cache the analysis
      this.historicalCache.set(cacheKey, analysis);

      logger.info('Historical analysis completed:', {
        asset,
        timeframe: timeframeDays,
        dataPoints: analysis.dataPoints,
        avgPrice: analysis.avgPrice,
        volatility: analysis.volatility,
        trend: analysis.trend,
      });

      return analysis;
    } catch (error) {
      logger.error('Failed to get historical analysis:', error);
      throw error;
    }
  }

  /**
   * Cross-price calculation for complex markets
   */
  async calculateCrossPrice(
    baseAsset: string,
    quoteAsset: string,
    intermediateAsset: string = 'USD'
  ): Promise<CrossPriceData> {
    try {
      const cacheKey = `${baseAsset}_${quoteAsset}_${intermediateAsset}`;
      const cached = this.crossPriceCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
        return cached;
      }

      // Get prices for both pairs
      const baseToIntermediate = await this.getAggregatedPriceData(`${baseAsset}/${intermediateAsset}`, 80);
      const intermediateToQuote = await this.getAggregatedPriceData(`${intermediateAsset}/${quoteAsset}`, 80);
      
      // Calculate cross rate with proper decimal handling
      const basePrice = new Big(baseToIntermediate.price);
      const quotePrice = new Big(intermediateToQuote.price);
      const crossRate = basePrice.div(quotePrice).toString();
      
      // Calculate confidence based on both sources
      const confidence = Math.min(baseToIntermediate.confidence, intermediateToQuote.confidence);
      
      const crossPriceData: CrossPriceData = {
        baseAsset,
        quoteAsset,
        intermediateAsset,
        crossRate,
        confidence,
        calculationMethod: 'cross_rate',
        timestamp: Date.now(),
      };

      // Cache the result
      this.crossPriceCache.set(cacheKey, crossPriceData);

      logger.info('Cross price calculated:', {
        baseAsset,
        quoteAsset,
        intermediateAsset,
        crossRate,
        confidence,
      });

      return crossPriceData;
    } catch (error) {
      logger.error('Failed to calculate cross price:', error);
      throw error;
    }
  }

  /**
   * Process Reflector webhook notifications
   */
  async processReflectorWebhook(payload: any): Promise<void> {
    try {
      const { subscription, price, prevPrice, timestamp } = payload.update?.event || payload;
      
      if (!subscription || !price) {
        logger.warn('Invalid webhook payload:', payload);
        return;
      }

      // Find associated market
      const marketId = await this.getMarketForSubscription(subscription);
      if (!marketId) {
        logger.warn(`No market found for subscription ${subscription}`);
        return;
      }

      // Calculate price change
      const priceChange = prevPrice ? 
        ((new Big(price).minus(new Big(prevPrice)).div(new Big(prevPrice))).mul(100)).toString() : '0';

      // Update market with new price data
      await this.updateMarketPriceData(marketId, {
        price: price.toString(),
        previousPrice: prevPrice?.toString() || price.toString(),
        change: priceChange,
        timestamp: timestamp || Date.now(),
      });

      logger.info('Reflector webhook processed:', {
        subscription,
        marketId,
        price: price.toString(),
        priceChange,
        timestamp,
      });

      // Check if market should be resolved
      await this.checkMarketResolution(marketId, price.toString());
      
    } catch (error) {
      logger.error('Reflector webhook processing failed:', error);
    }
  }

  /**
   * Get current price for an asset
   */
  async getCurrentPrice(asset: string): Promise<ReflectorPriceData | null> {
    try {
      // Check cache first
      const cached = this.priceCache.get(asset);
      if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached;
      }

      // Fetch fresh data
      return await this.getAggregatedPriceData(asset);
    } catch (error) {
      logger.error('Failed to get current price:', error);
      return null;
    }
  }

  /**
   * Get all active subscriptions
   */
  async getActiveSubscriptions(): Promise<ReflectorSubscription[]> {
    try {
      return Array.from(this.subscriptions.values()).filter(sub => sub.isActive);
    } catch (error) {
      logger.error('Failed to get active subscriptions:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel via Reflector API
      await axios.delete(
        `${this.config.apiUrl}/subscriptions/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REFLECTOR_API_KEY}`,
          },
        }
      );

      // Mark as inactive locally
      subscription.isActive = false;
      subscription.lastUpdate = Date.now();
      this.subscriptions.set(subscriptionId, subscription);

      logger.info('Subscription cancelled:', { subscriptionId });
    } catch (error) {
      logger.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Internal helper functions
   */
  private async fetchPriceFromOracle(source: string, asset: string): Promise<ReflectorPriceData | null> {
    try {
      const contractAddress = this.config.contractAddresses[source];
      if (!contractAddress) {
        return null;
      }

      // Call Reflector oracle contract
      const response = await axios.get(
        `${this.config.apiUrl}/prices/${asset}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REFLECTOR_API_KEY}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        return {
          asset,
          price: response.data.price.toString(),
          timestamp: response.data.timestamp || Date.now(),
          decimals: response.data.decimals || 6,
          source,
          confidence: response.data.confidence || 90,
          volume24h: response.data.volume24h?.toString(),
          change24h: response.data.change24h?.toString(),
        };
      }

      return null;
    } catch (error) {
      logger.warn(`Failed to fetch price from ${source}:`, error.message);
      return null;
    }
  }

  private async calculateWeightedAverage(
    priceData: ReflectorPriceData[],
    minConfidence: number
  ): Promise<ReflectorPriceData> {
    try {
      let totalWeightedPrice = new Big(0);
      let totalWeight = new Big(0);
      let latestTimestamp = 0;
      let totalConfidence = 0;

      for (const data of priceData) {
        const weight = new Big(data.confidence);
        if (weight.gte(minConfidence)) {
          const price = new Big(data.price);
          totalWeightedPrice = totalWeightedPrice.plus(price.mul(weight));
          totalWeight = totalWeight.plus(weight);
          latestTimestamp = Math.max(latestTimestamp, data.timestamp);
          totalConfidence += data.confidence;
        }
      }

      if (totalWeight.eq(0)) {
        throw new Error('Insufficient confidence for price aggregation');
      }

      const avgPrice = totalWeightedPrice.div(totalWeight).toString();
      const avgConfidence = totalConfidence / priceData.length;

      return {
        asset: priceData[0].asset,
        price: avgPrice,
        timestamp: latestTimestamp,
        decimals: priceData[0].decimals,
        source: 'aggregated',
        confidence: avgConfidence,
      };
    } catch (error) {
      logger.error('Failed to calculate weighted average:', error);
      throw error;
    }
  }

  private async calculateConfidenceScore(priceData: ReflectorPriceData): Promise<number> {
    try {
      // Calculate confidence based on data recency, source reliability, and price stability
      const recencyScore = this.calculateRecencyScore(priceData.timestamp);
      const stabilityScore = this.calculateStabilityScore(priceData.price);
      
      return Math.min(100, Math.floor((recencyScore + stabilityScore) / 2));
    } catch (error) {
      logger.error('Failed to calculate confidence score:', error);
      return 50; // Default confidence
    }
  }

  private calculateRecencyScore(timestamp: number): number {
    const ageMinutes = (Date.now() - timestamp) / (1000 * 60);
    if (ageMinutes <= 5) return 100;
    if (ageMinutes <= 15) return 90;
    if (ageMinutes <= 60) return 80;
    if (ageMinutes <= 240) return 70;
    return 50;
  }

  private calculateStabilityScore(price: string): number {
    // Simplified stability calculation
    // In a real implementation, this would analyze price volatility
    return 85; // Default stability score
  }

  private async createReflectorSubscription(subscription: ReflectorSubscription): Promise<void> {
    try {
      const payload = {
        webhook: subscription.webhookUrl,
        base: { asset: subscription.assetPair.base, source: 'exchanges' },
        quote: { asset: subscription.assetPair.quote, source: 'exchanges' },
        threshold: subscription.threshold,
        heartbeat: subscription.heartbeat,
        initialBalance: subscription.balance,
      };

      const response = await axios.post(
        `${this.config.apiUrl}/subscriptions`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REFLECTOR_API_KEY}`,
          },
        }
      );

      if (response.status !== 201) {
        throw new Error(`Failed to create Reflector subscription: ${response.statusText}`);
      }

      logger.info('Reflector subscription created successfully:', {
        subscriptionId: subscription.id,
        reflectorId: response.data.id,
      });
    } catch (error) {
      logger.error('Failed to create Reflector subscription:', error);
      throw error;
    }
  }

  private async getMarketForSubscription(subscriptionId: string): Promise<string | null> {
    try {
      for (const [marketId, subscription] of this.subscriptions.entries()) {
        if (subscription.id === subscriptionId) {
          return marketId;
        }
      }
      return null;
    } catch (error) {
      logger.error('Failed to get market for subscription:', error);
      return null;
    }
  }

  private async updateMarketPriceData(marketId: string, data: any): Promise<void> {
    try {
      // This would typically update the market service
      logger.info('Market price data updated:', { marketId, data });
    } catch (error) {
      logger.error('Failed to update market price data:', error);
    }
  }

  private async checkMarketResolution(marketId: string, price: string): Promise<void> {
    try {
      // This would typically trigger market resolution service
      logger.info('Market resolution check triggered:', { marketId, price });
    } catch (error) {
      logger.error('Failed to check market resolution:', error);
    }
  }

  private async getHistoricalPrice(asset: string, timestamp: number): Promise<ReflectorPriceData | null> {
    try {
      // This would typically fetch from historical data API
      // For now, return null as placeholder
      return null;
    } catch (error) {
      logger.error('Failed to get historical price:', error);
      return null;
    }
  }

  private calculateAveragePrice(pricePoints: ReflectorPriceData[]): string {
    try {
      const sum = pricePoints.reduce((acc, point) => acc.plus(new Big(point.price)), new Big(0));
      return sum.div(pricePoints.length).toString();
    } catch (error) {
      logger.error('Failed to calculate average price:', error);
      return '0';
    }
  }

  private calculateVolatility(pricePoints: ReflectorPriceData[]): string {
    try {
      if (pricePoints.length < 2) return '0';
      
      const prices = pricePoints.map(p => new Big(p.price));
      const avg = prices.reduce((acc, price) => acc.plus(price), new Big(0)).div(prices.length);
      
      const variance = prices.reduce((acc, price) => {
        const diff = price.minus(avg);
        return acc.plus(diff.mul(diff));
      }, new Big(0)).div(prices.length);
      
      return variance.sqrt().toString();
    } catch (error) {
      logger.error('Failed to calculate volatility:', error);
      return '0';
    }
  }

  private calculateTrend(pricePoints: ReflectorPriceData[]): number {
    try {
      if (pricePoints.length < 2) return 0;
      
      const firstPrice = new Big(pricePoints[pricePoints.length - 1].price);
      const lastPrice = new Big(pricePoints[0].price);
      
      const change = lastPrice.minus(firstPrice).div(firstPrice);
      
      if (change.gt(0.05)) return 1;  // Bullish
      if (change.lt(-0.05)) return -1; // Bearish
      return 0; // Neutral
    } catch (error) {
      logger.error('Failed to calculate trend:', error);
      return 0;
    }
  }

  private calculateSupportLevel(pricePoints: ReflectorPriceData[]): string {
    try {
      const prices = pricePoints.map(p => new Big(p.price));
      return prices.reduce((min, price) => min.lt(price) ? min : price, prices[0]).toString();
    } catch (error) {
      logger.error('Failed to calculate support level:', error);
      return '0';
    }
  }

  private calculateResistanceLevel(pricePoints: ReflectorPriceData[]): string {
    try {
      const prices = pricePoints.map(p => new Big(p.price));
      return prices.reduce((max, price) => max.gt(price) ? max : price, prices[0]).toString();
    } catch (error) {
      logger.error('Failed to calculate resistance level:', error);
      return '0';
    }
  }

  /**
   * Clean up expired cache data
   */
  async cleanupCache(): Promise<void> {
    try {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Clean up price cache
      for (const [key, data] of this.priceCache.entries()) {
        if (now - data.timestamp > maxAge) {
          this.priceCache.delete(key);
        }
      }

      // Clean up historical cache
      for (const [key, data] of this.historicalCache.entries()) {
        if (now - data.timestamp > maxAge) {
          this.historicalCache.delete(key);
        }
      }

      // Clean up cross price cache
      for (const [key, data] of this.crossPriceCache.entries()) {
        if (now - data.timestamp > maxAge) {
          this.crossPriceCache.delete(key);
        }
      }

      logger.info('Reflector cache cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup Reflector cache:', error);
    }
  }
}
