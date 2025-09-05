// Mock implementation of Reflector Oracle service
// This prevents TypeScript errors while maintaining the expected API

export interface PriceData {
  price: number;
  decimals: number;
  timestamp: number;
  confidence: number;
}

export interface OracleStats {
  total_feeds: number;
  active_feeds: number;
  total_updates: number;
  last_update_time: number;
}

// Mock Reflector Oracle Service
export class ReflectorOracleService {
  private static instance: ReflectorOracleService | null = null;

  static getInstance(): ReflectorOracleService {
    if (!ReflectorOracleService.instance) {
      ReflectorOracleService.instance = new ReflectorOracleService();
    }
    return ReflectorOracleService.instance;
  }

  private constructor() {}

  async getLatestPrice(baseAsset: string, quoteAsset: string): Promise<PriceData> {
    // Mock implementation with realistic price data
    const mockPrices: { [key: string]: number } = {
      'BTC-USD': 65000,
      'ETH-USD': 3200,
      'XLM-USD': 0.12,
      'KALE-USD': 0.85,
      'XRP-USD': 0.55
    };

    const pairKey = `${baseAsset}-${quoteAsset}`;
    const basePrice = mockPrices[pairKey] || Math.random() * 100;

    return {
      price: basePrice,
      decimals: 7,
      timestamp: Date.now(),
      confidence: 0.95
    };
  }

  // Alias for backward compatibility
  async getAssetPrice(baseAsset: string, quoteAsset: string): Promise<PriceData> {
    return this.getLatestPrice(baseAsset, quoteAsset);
  }

  async getKalePrice(): Promise<number> {
    // Mock implementation
    const priceData = await this.getLatestPrice('KALE', 'USD');
    return priceData.price;
  }

  async resolveMarket(marketId: string, outcome: boolean | string, ...additionalArgs: any[]): Promise<string> {
    // Mock implementation - handle both boolean and string outcomes
    const resolvedOutcome = typeof outcome === 'string' ? outcome === 'true' : outcome;
    console.log(`Mock resolving market ${marketId} with outcome: ${resolvedOutcome}`);
    return 'mock_resolve_market_tx_hash';
  }

  async getHistoricalPrices(
    baseAsset: string, 
    quoteAsset: string, 
    startTime: number, 
    endTime: number
  ): Promise<PriceData[]> {
    // Mock implementation
    const prices: PriceData[] = [];
    const timeStep = (endTime - startTime) / 10;
    
    for (let i = 0; i < 10; i++) {
      prices.push({
        price: Math.random() * 100 + 50,
        decimals: 7,
        timestamp: startTime + (i * timeStep),
        confidence: 0.9 + Math.random() * 0.1
      });
    }

    return prices;
  }

  async updatePriceFeed(
    userAddress: string,
    baseAsset: string,
    quoteAsset: string,
    price: number
  ): Promise<string> {
    // Mock implementation
    console.log(`Mock updating price feed ${baseAsset}/${quoteAsset} to ${price} for ${userAddress}`);
    return 'mock_update_price_tx_hash';
  }

  async getOracleStats(): Promise<OracleStats> {
    // Mock implementation
    return {
      total_feeds: 125,
      active_feeds: 98,
      total_updates: 15420,
      last_update_time: Date.now() - 300000 // 5 minutes ago
    };
  }

  async getSupportedAssets(): Promise<string[]> {
    // Mock implementation
    return [
      'BTC', 'ETH', 'XLM', 'XRP', 'ADA', 'DOT', 'SOL', 'AVAX',
      'KALE', 'USDC', 'USDT', 'DAI', 'WBTC', 'WETH'
    ];
  }

  async getPriceFeedInfo(baseAsset: string, quoteAsset: string): Promise<{
    last_update: number;
    update_count: number;
    subscribers: number;
    price: number;
  }> {
    // Mock implementation
    return {
      last_update: Date.now() - 600000, // 10 minutes ago
      update_count: Math.floor(Math.random() * 1000) + 100,
      subscribers: Math.floor(Math.random() * 50) + 5,
      price: Math.random() * 100 + 10
    };
  }
}

// Export the singleton instance
export const reflectorOracleService = ReflectorOracleService.getInstance();