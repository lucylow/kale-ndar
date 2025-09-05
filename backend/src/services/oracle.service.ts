import axios from 'axios';
import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export interface OracleConfig {
  reflectorApiUrl: string;
  reflectorWebhookUrl: string;
  xrfTokenAddress: string;
  subscriptionBalance: string;
  heartbeatInterval: number;
  priceThreshold: number;
}

export interface PriceData {
  symbol: string;
  price: string;
  timestamp: number;
  source: string;
  change24h?: string;
  volume24h?: string;
}

export interface EventData {
  eventId: string;
  eventType: string;
  description: string;
  timestamp: number;
  data: any;
  source: string;
}

export interface OracleSubscription {
  id: string;
  marketId: string;
  baseAsset: string;
  quoteAsset: string;
  threshold: number;
  heartbeat: number;
  balance: string;
  isActive: boolean;
  createdAt: number;
  webhookUrl: string;
}

export interface OracleWebhookPayload {
  subscriptionId: string;
  eventType: 'price_update' | 'threshold_breach' | 'heartbeat';
  timestamp: number;
  data: any;
  signature?: string;
}

export interface MarketOracleMapping {
  marketId: string;
  oracleType: 'price_feed' | 'event_data';
  assetSymbol?: string;
  eventType?: string;
  threshold?: number;
  isActive: boolean;
}

export class OracleService {
  private config: OracleConfig;
  private subscriptions: Map<string, OracleSubscription> = new Map();
  private marketMappings: Map<string, MarketOracleMapping> = new Map();
  private priceCache: Map<string, PriceData> = new Map();
  private eventCache: Map<string, EventData> = new Map();

  constructor(config: OracleConfig) {
    this.config = config;
  }

  /**
   * Create a new oracle subscription for price feeds
   */
  async createPriceFeedSubscription(
    marketId: string,
    baseAsset: string,
    quoteAsset: string,
    threshold: number = 100, // 1% threshold (per ten-thousand)
    heartbeat: number = 60 // 60 minutes
  ): Promise<OracleSubscription> {
    try {
      const subscriptionId = uuidv4();
      
      const subscription: OracleSubscription = {
        id: subscriptionId,
        marketId,
        baseAsset,
        quoteAsset,
        threshold,
        heartbeat,
        balance: this.config.subscriptionBalance,
        isActive: true,
        createdAt: Date.now(),
        webhookUrl: `${this.config.reflectorWebhookUrl}/oracle-webhook`,
      };

      // Create subscription via Reflector API
      await this.createReflectorSubscription(subscription);

      // Store subscription locally
      this.subscriptions.set(subscriptionId, subscription);

      // Create market mapping
      const mapping: MarketOracleMapping = {
        marketId,
        oracleType: 'price_feed',
        assetSymbol: `${baseAsset}/${quoteAsset}`,
        threshold,
        isActive: true,
      };
      this.marketMappings.set(marketId, mapping);

      logger.info('Price feed subscription created:', {
        subscriptionId,
        marketId,
        baseAsset,
        quoteAsset,
        threshold,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to create price feed subscription:', error);
      throw error;
    }
  }

  /**
   * Create a new oracle subscription for event data
   */
  async createEventDataSubscription(
    marketId: string,
    eventType: string,
    threshold?: number
  ): Promise<OracleSubscription> {
    try {
      const subscriptionId = uuidv4();
      
      const subscription: OracleSubscription = {
        id: subscriptionId,
        marketId,
        baseAsset: 'EVENT',
        quoteAsset: 'USD',
        threshold: threshold || 0,
        heartbeat: 30, // 30 minutes for events
        balance: this.config.subscriptionBalance,
        isActive: true,
        createdAt: Date.now(),
        webhookUrl: `${this.config.reflectorWebhookUrl}/oracle-webhook`,
      };

      // Create subscription via Reflector API
      await this.createReflectorSubscription(subscription);

      // Store subscription locally
      this.subscriptions.set(subscriptionId, subscription);

      // Create market mapping
      const mapping: MarketOracleMapping = {
        marketId,
        oracleType: 'event_data',
        eventType,
        threshold,
        isActive: true,
      };
      this.marketMappings.set(marketId, mapping);

      logger.info('Event data subscription created:', {
        subscriptionId,
        marketId,
        eventType,
        threshold,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to create event data subscription:', error);
      throw error;
    }
  }

  /**
   * Create subscription via Reflector API
   */
  private async createReflectorSubscription(subscription: OracleSubscription): Promise<void> {
    try {
      const payload = {
        webhook: subscription.webhookUrl,
        base: { asset: subscription.baseAsset, source: 'exchanges' },
        quote: { asset: subscription.quoteAsset, source: 'exchanges' },
        threshold: subscription.threshold,
        heartbeat: subscription.heartbeat,
        initialBalance: subscription.balance,
      };

      const response = await axios.post(
        `${this.config.reflectorApiUrl}/subscriptions`,
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

  /**
   * Handle webhook notifications from Reflector
   */
  async handleWebhook(payload: OracleWebhookPayload): Promise<void> {
    try {
      logger.info('Received oracle webhook:', {
        subscriptionId: payload.subscriptionId,
        eventType: payload.eventType,
        timestamp: payload.timestamp,
      });

      const subscription = this.subscriptions.get(payload.subscriptionId);
      if (!subscription) {
        logger.warn('Unknown subscription ID in webhook:', payload.subscriptionId);
        return;
      }

      switch (payload.eventType) {
        case 'price_update':
          await this.handlePriceUpdate(subscription, payload.data);
          break;
          
        case 'threshold_breach':
          await this.handleThresholdBreach(subscription, payload.data);
          break;
          
        case 'heartbeat':
          await this.handleHeartbeat(subscription, payload.data);
          break;
          
        default:
          logger.warn('Unknown webhook event type:', payload.eventType);
      }
    } catch (error) {
      logger.error('Failed to handle oracle webhook:', error);
      throw error;
    }
  }

  /**
   * Handle price update from oracle
   */
  private async handlePriceUpdate(subscription: OracleSubscription, data: any): Promise<void> {
    try {
      const priceData: PriceData = {
        symbol: `${subscription.baseAsset}/${subscription.quoteAsset}`,
        price: data.price.toString(),
        timestamp: data.timestamp || Date.now(),
        source: 'reflector',
        change24h: data.change24h?.toString(),
        volume24h: data.volume24h?.toString(),
      };

      // Cache the price data
      this.priceCache.set(subscription.marketId, priceData);

      logger.info('Price update received:', {
        marketId: subscription.marketId,
        symbol: priceData.symbol,
        price: priceData.price,
        timestamp: priceData.timestamp,
      });

      // Check if this triggers any market resolution conditions
      await this.checkMarketResolutionTriggers(subscription.marketId, priceData);
    } catch (error) {
      logger.error('Failed to handle price update:', error);
      throw error;
    }
  }

  /**
   * Handle threshold breach from oracle
   */
  private async handleThresholdBreach(subscription: OracleSubscription, data: any): Promise<void> {
    try {
      logger.info('Threshold breach detected:', {
        marketId: subscription.marketId,
        threshold: subscription.threshold,
        currentPrice: data.price,
        previousPrice: data.prevPrice,
      });

      // This could trigger immediate market resolution
      await this.checkMarketResolutionTriggers(subscription.marketId, data);
    } catch (error) {
      logger.error('Failed to handle threshold breach:', error);
      throw error;
    }
  }

  /**
   * Handle heartbeat from oracle
   */
  private async handleHeartbeat(subscription: OracleSubscription, data: any): Promise<void> {
    try {
      logger.info('Oracle heartbeat received:', {
        marketId: subscription.marketId,
        subscriptionId: subscription.id,
        timestamp: data.timestamp,
      });

      // Update subscription status
      subscription.isActive = true;
      this.subscriptions.set(subscription.id, subscription);
    } catch (error) {
      logger.error('Failed to handle heartbeat:', error);
      throw error;
    }
  }

  /**
   * Check if oracle data triggers market resolution
   */
  private async checkMarketResolutionTriggers(marketId: string, data: any): Promise<void> {
    try {
      const mapping = this.marketMappings.get(marketId);
      if (!mapping || !mapping.isActive) {
        return;
      }

      // This would typically trigger market resolution service
      // For now, we'll just log the potential trigger
      logger.info('Market resolution trigger detected:', {
        marketId,
        oracleType: mapping.oracleType,
        data,
      });
    } catch (error) {
      logger.error('Failed to check market resolution triggers:', error);
      throw error;
    }
  }

  /**
   * Get oracle data for a specific market
   */
  async getOracleDataForMarket(marketId: string): Promise<any> {
    try {
      const mapping = this.marketMappings.get(marketId);
      if (!mapping) {
        return null;
      }

      if (mapping.oracleType === 'price_feed') {
        return this.priceCache.get(marketId);
      } else if (mapping.oracleType === 'event_data') {
        return this.eventCache.get(marketId);
      }

      return null;
    } catch (error) {
      logger.error('Failed to get oracle data for market:', error);
      throw error;
    }
  }

  /**
   * Get last oracle data for a market
   */
  async getLastOracleDataForMarket(marketId: string): Promise<any> {
    try {
      return await this.getOracleDataForMarket(marketId);
    } catch (error) {
      logger.error('Failed to get last oracle data for market:', error);
      throw error;
    }
  }

  /**
   * Check if oracle has valid data for a market
   */
  async hasValidOracleData(marketId: string): Promise<boolean> {
    try {
      const data = await this.getOracleDataForMarket(marketId);
      return data !== null && data !== undefined;
    } catch (error) {
      logger.error('Failed to check oracle data validity:', error);
      return false;
    }
  }

  /**
   * Get current price for an asset pair
   */
  async getCurrentPrice(baseAsset: string, quoteAsset: string): Promise<PriceData | null> {
    try {
      const symbol = `${baseAsset}/${quoteAsset}`;
      
      // Check cache first
      for (const [marketId, priceData] of this.priceCache.entries()) {
        if (priceData.symbol === symbol) {
          return priceData;
        }
      }

      // Fetch from Reflector API if not in cache
      const response = await axios.get(
        `${this.config.reflectorApiUrl}/prices/${baseAsset}/${quoteAsset}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REFLECTOR_API_KEY}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        const priceData: PriceData = {
          symbol,
          price: response.data.price.toString(),
          timestamp: response.data.timestamp || Date.now(),
          source: 'reflector',
          change24h: response.data.change24h?.toString(),
          volume24h: response.data.volume24h?.toString(),
        };

        return priceData;
      }

      return null;
    } catch (error) {
      logger.error('Failed to get current price:', error);
      return null;
    }
  }

  /**
   * Get all active subscriptions
   */
  async getActiveSubscriptions(): Promise<OracleSubscription[]> {
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
        `${this.config.reflectorApiUrl}/subscriptions/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REFLECTOR_API_KEY}`,
          },
        }
      );

      // Mark as inactive locally
      subscription.isActive = false;
      this.subscriptions.set(subscriptionId, subscription);

      // Update market mapping
      const mapping = this.marketMappings.get(subscription.marketId);
      if (mapping) {
        mapping.isActive = false;
        this.marketMappings.set(subscription.marketId, mapping);
      }

      logger.info('Subscription cancelled:', { subscriptionId });
    } catch (error) {
      logger.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Renew subscription balance
   */
  async renewSubscription(subscriptionId: string, additionalBalance: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Add balance via Reflector API
      await axios.post(
        `${this.config.reflectorApiUrl}/subscriptions/${subscriptionId}/renew`,
        { amount: additionalBalance },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REFLECTOR_API_KEY}`,
          },
        }
      );

      // Update local balance
      const newBalance = new Big(subscription.balance).plus(new Big(additionalBalance)).toString();
      subscription.balance = newBalance;
      this.subscriptions.set(subscriptionId, subscription);

      logger.info('Subscription renewed:', {
        subscriptionId,
        additionalBalance,
        newBalance,
      });
    } catch (error) {
      logger.error('Failed to renew subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<any> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Get status from Reflector API
      const response = await axios.get(
        `${this.config.reflectorApiUrl}/subscriptions/${subscriptionId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REFLECTOR_API_KEY}`,
          },
        }
      );

      return {
        ...subscription,
        reflectorStatus: response.data,
      };
    } catch (error) {
      logger.error('Failed to get subscription status:', error);
      throw error;
    }
  }

  /**
   * Get oracle statistics
   */
  async getOracleStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalPriceFeeds: number;
    totalEventFeeds: number;
    averageResponseTime: number;
  }> {
    try {
      const subscriptions = Array.from(this.subscriptions.values());
      const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
      
      const priceFeeds = subscriptions.filter(sub => sub.baseAsset !== 'EVENT').length;
      const eventFeeds = subscriptions.filter(sub => sub.baseAsset === 'EVENT').length;

      return {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        totalPriceFeeds: priceFeeds,
        totalEventFeeds: eventFeeds,
        averageResponseTime: 0, // Would be calculated from actual response times
      };
    } catch (error) {
      logger.error('Failed to get oracle stats:', error);
      throw error;
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

      // Clean up event cache
      for (const [key, data] of this.eventCache.entries()) {
        if (now - data.timestamp > maxAge) {
          this.eventCache.delete(key);
        }
      }

      logger.info('Oracle cache cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup oracle cache:', error);
      throw error;
    }
  }
}
