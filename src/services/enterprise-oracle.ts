/**
 * Enterprise Oracle Service for KALE-ndar
 * Provides institutional-grade oracle services with high-frequency data feeds,
 * enterprise APIs, compliance features, and dedicated support.
 */

export interface EnterprisePriceFeed {
  asset: string;
  price: number;
  timestamp: number;
  confidence: number;
  sources: PriceSource[];
  metadata: PriceMetadata;
  latency?: number;
}

export interface PriceSource {
  name: string;
  price: number;
  weight: number;
  latency: number;
  volume?: number;
  spread?: number;
}

export interface PriceMetadata {
  volume24h: number;
  spread: number;
  volatility: number;
  marketCap?: number;
  lastUpdate: number;
  updateCount: number;
}

export interface EnterpriseConfig {
  apiKey: string;
  institutionId: string;
  environment: 'sandbox' | 'production';
  tier: 'professional' | 'enterprise' | 'institutional';
  rateLimit?: number;
  timeout?: number;
}

export interface BatchPriceRequest {
  assets: string[];
  timestamp?: number;
  includeMetadata?: boolean;
  minConfidence?: number;
  maxAge?: number;
}

export interface HistoricalDataRequest {
  asset: string;
  startDate: string;
  endDate: string;
  interval: '1s' | '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1M';
  includeVolume?: boolean;
  includeOrderbook?: boolean;
}

export interface OracleHealth {
  totalNodes: number;
  activeNodes: number;
  averageLatency: number;
  uptime: number;
  lastUpdate: number;
  dataQuality: number;
}

export interface EnterpriseMetrics {
  apiCalls: number;
  dataFeeds: number;
  averageLatency: number;
  uptime: number;
  errorRate: number;
  cost: number;
}

export class EnterpriseOracleService {
  private static instance: EnterpriseOracleService | null = null;
  private config: EnterpriseConfig;
  private wsConnection: WebSocket | null = null;
  private subscribers: Map<string, (data: EnterprisePriceFeed) => void> = new Map();
  private metrics: EnterpriseMetrics = {
    apiCalls: 0,
    dataFeeds: 0,
    averageLatency: 0,
    uptime: 100,
    errorRate: 0,
    cost: 0
  };

  constructor(config: EnterpriseConfig) {
    this.config = config;
    this.initializeMetrics();
  }

  static getInstance(config?: EnterpriseConfig): EnterpriseOracleService {
    if (!EnterpriseOracleService.instance && config) {
      EnterpriseOracleService.instance = new EnterpriseOracleService(config);
    }
    return EnterpriseOracleService.instance!;
  }

  /**
   * Get real-time price for a single asset with enterprise-grade data
   */
  async getPrice(asset: string, options?: {
    minConfidence?: number;
    maxAge?: number;
    includeMetadata?: boolean;
  }): Promise<EnterprisePriceFeed> {
    this.metrics.apiCalls++;
    
    try {
      const response = await this.makeRequest('GET', `/api/v2/prices/${asset}`, {
        min_confidence: options?.minConfidence || 90,
        max_age: options?.maxAge || 300,
        include_metadata: options?.includeMetadata || true
      });

      const startTime = Date.now();
      const priceFeed = await this.processPriceResponse(response, asset);
      const latency = Date.now() - startTime;
      
      this.updateLatencyMetrics(latency);
      
      return {
        ...priceFeed,
        latency
      };
    } catch (error) {
      this.metrics.errorRate++;
      throw new Error(`Failed to get price for ${asset}: ${error}`);
    }
  }

  /**
   * Get batch prices for multiple assets
   */
  async getBatchPrices(request: BatchPriceRequest): Promise<EnterprisePriceFeed[]> {
    this.metrics.apiCalls++;
    
    try {
      const response = await this.makeRequest('POST', '/api/v2/prices/batch', request);
      
      const startTime = Date.now();
      const priceFeeds = await Promise.all(
        response.data.map((feed: any) => this.processPriceResponse(feed, feed.asset))
      );
      const latency = Date.now() - startTime;
      
      this.updateLatencyMetrics(latency);
      
      return priceFeeds.map(feed => ({ ...feed, latency }));
    } catch (error) {
      this.metrics.errorRate++;
      throw new Error(`Failed to get batch prices: ${error}`);
    }
  }

  /**
   * Get historical data with enterprise features
   */
  async getHistoricalData(request: HistoricalDataRequest): Promise<EnterprisePriceFeed[]> {
    this.metrics.apiCalls++;
    
    try {
      const params = new URLSearchParams({
        start: request.startDate,
        end: request.endDate,
        interval: request.interval,
        include_volume: request.includeVolume?.toString() || 'false',
        include_orderbook: request.includeOrderbook?.toString() || 'false'
      });

      const response = await this.makeRequest('GET', `/api/v2/historical/${request.asset}?${params}`);
      
      return response.data.map((feed: any) => this.processPriceResponse(feed, request.asset));
    } catch (error) {
      this.metrics.errorRate++;
      throw new Error(`Failed to get historical data: ${error}`);
    }
  }

  /**
   * Subscribe to real-time price updates via WebSocket
   */
  subscribeToPrices(assets: string[], callback: (data: EnterprisePriceFeed) => void): void {
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      this.initializeWebSocket();
    }

    assets.forEach(asset => {
      this.subscribers.set(asset, callback);
    });

    // Send subscription message
    this.wsConnection?.send(JSON.stringify({
      type: 'subscribe',
      assets,
      frequency: 'realtime',
      include_orderbook: true,
      include_trades: true
    }));
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribeFromPrices(assets: string[]): void {
    assets.forEach(asset => {
      this.subscribers.delete(asset);
    });

    this.wsConnection?.send(JSON.stringify({
      type: 'unsubscribe',
      assets
    }));
  }

  /**
   * Get oracle network health status
   */
  async getOracleHealth(): Promise<OracleHealth> {
    try {
      const response = await this.makeRequest('GET', '/api/v2/oracle/health');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get oracle health: ${error}`);
    }
  }

  /**
   * Get enterprise metrics and usage statistics
   */
  getEnterpriseMetrics(): EnterpriseMetrics {
    return { ...this.metrics };
  }

  /**
   * Get supported assets for enterprise tier
   */
  async getSupportedAssets(): Promise<string[]> {
    try {
      const response = await this.makeRequest('GET', '/api/v2/assets/supported');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get supported assets: ${error}`);
    }
  }

  /**
   * Validate data quality and confidence
   */
  validateDataQuality(priceFeed: EnterprisePriceFeed): {
    isValid: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 100;

    // Check confidence threshold
    if (priceFeed.confidence < 90) {
      issues.push(`Low confidence: ${priceFeed.confidence}%`);
      score -= 20;
    }

    // Check data freshness
    const age = Date.now() - priceFeed.timestamp;
    if (age > 300000) { // 5 minutes
      issues.push(`Stale data: ${Math.round(age / 1000)}s old`);
      score -= 30;
    }

    // Check source diversity
    if (priceFeed.sources.length < 3) {
      issues.push(`Insufficient sources: ${priceFeed.sources.length}`);
      score -= 15;
    }

    // Check latency
    if (priceFeed.latency && priceFeed.latency > 1000) {
      issues.push(`High latency: ${priceFeed.latency}ms`);
      score -= 10;
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private initializeWebSocket(): void {
    const wsUrl = this.config.environment === 'production' 
      ? 'wss://oracle.kale-ndar.com/v2/stream'
      : 'wss://sandbox-oracle.kale-ndar.com/v2/stream';

    this.wsConnection = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Client-ID': this.config.institutionId,
        'X-Subscription-Tier': this.config.tier
      }
    });

    this.wsConnection.onopen = () => {
      console.log('Enterprise Oracle WebSocket connected');
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'price_update') {
          const priceFeed = this.processPriceResponse(data.data, data.asset);
          const callback = this.subscribers.get(data.asset);
          if (callback) {
            callback(priceFeed);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('Enterprise Oracle WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (this.subscribers.size > 0) {
          this.initializeWebSocket();
        }
      }, 5000);
    };

    this.wsConnection.onerror = (error) => {
      console.error('Enterprise Oracle WebSocket error:', error);
    };
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = this.config.environment === 'production'
      ? `https://api.kale-ndar.com${endpoint}`
      : `https://sandbox-api.kale-ndar.com${endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Client-ID': this.config.institutionId,
      'X-API-Version': '2.0',
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers,
      timeout: this.config.timeout || 10000
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Process price response and add enterprise metadata
   */
  private async processPriceResponse(data: any, asset: string): Promise<EnterprisePriceFeed> {
    return {
      asset,
      price: data.price,
      timestamp: data.timestamp,
      confidence: data.confidence,
      sources: data.sources || [],
      metadata: {
        volume24h: data.metadata?.volume_24h || 0,
        spread: data.metadata?.spread || 0,
        volatility: data.metadata?.volatility || 0,
        marketCap: data.metadata?.market_cap,
        lastUpdate: data.metadata?.last_update || data.timestamp,
        updateCount: data.metadata?.update_count || 1
      }
    };
  }

  /**
   * Update latency metrics
   */
  private updateLatencyMetrics(latency: number): void {
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.apiCalls - 1) + latency) / this.metrics.apiCalls;
  }

  /**
   * Initialize metrics tracking
   */
  private initializeMetrics(): void {
    // Set up periodic metrics updates
    setInterval(() => {
      this.updateUptimeMetrics();
    }, 60000); // Every minute
  }

  /**
   * Update uptime metrics
   */
  private updateUptimeMetrics(): void {
    // Calculate uptime based on error rate
    this.metrics.uptime = Math.max(0, 100 - this.metrics.errorRate);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscribers.clear();
  }
}

// Enterprise Oracle Client Factory
export class EnterpriseOracleClientFactory {
  static createClient(config: EnterpriseConfig): EnterpriseOracleService {
    return new EnterpriseOracleService(config);
  }

  static createMockClient(): EnterpriseOracleService {
    // Mock implementation for testing
    const mockConfig: EnterpriseConfig = {
      apiKey: 'mock_key',
      institutionId: 'mock_institution',
      environment: 'sandbox',
      tier: 'enterprise'
    };

    return new EnterpriseOracleService(mockConfig);
  }
}

// Export singleton instance getter
export const getEnterpriseOracleService = (config?: EnterpriseConfig): EnterpriseOracleService => {
  return EnterpriseOracleService.getInstance(config);
};

// Export types for external use
export type {
  EnterprisePriceFeed,
  PriceSource,
  PriceMetadata,
  EnterpriseConfig,
  BatchPriceRequest,
  HistoricalDataRequest,
  OracleHealth,
  EnterpriseMetrics
};
