import { EventEmitter } from 'events';

export interface PriceUpdate {
  id: string;
  asset: string;
  symbol: string;
  price: string;
  formattedPrice: string;
  timestamp: number;
  confidence: number;
  source: string;
  change24h: number;
  volume24h: number;
  oracleNode: string;
  transactionHash?: string;
}

export interface OracleMetrics {
  totalUpdates: number;
  averageConfidence: number;
  activeNodes: number;
  uptime: number;
  lastUpdateTime: number;
  updateFrequency: number;
}

export interface OracleNode {
  id: string;
  address: string;
  name: string;
  isActive: boolean;
  lastUpdate: number;
  updateCount: number;
  averageConfidence: number;
  reliability: number;
}

export class HttpOracleClient extends EventEmitter {
  private baseUrl: string;
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private subscribedAssets: Set<string> = new Set();
  private lastPrices: Record<string, PriceUpdate> = {};
  private metrics: OracleMetrics | null = null;
  private nodes: OracleNode[] = [];

  constructor(baseUrl: string = 'http://localhost:3000/api/oracle-demo') {
    super();
    this.baseUrl = baseUrl;
  }

  /**
   * Start HTTP-based live updates
   */
  start(intervalMs: number = 5000): void {
    if (this.isRunning) {
      console.log('HTTP oracle client already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting HTTP oracle client', { intervalMs });

    // Initial data fetch
    this.fetchAllData();

    // Set up polling interval
    this.updateInterval = setInterval(() => {
      this.fetchAllData();
    }, intervalMs);

    this.emit('started');
  }

  /**
   * Stop HTTP-based live updates
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    console.log('HTTP oracle client stopped');
    this.emit('stopped');
  }

  /**
   * Subscribe to specific assets
   */
  subscribeToAssets(assets: string[]): void {
    this.subscribedAssets = new Set(assets);
    console.log('Subscribed to assets:', assets);
  }

  /**
   * Unsubscribe from assets
   */
  unsubscribeFromAssets(assets: string[]): void {
    assets.forEach(asset => this.subscribedAssets.delete(asset));
    console.log('Unsubscribed from assets:', assets);
  }

  /**
   * Get latest prices
   */
  getLatestPrices(): Record<string, PriceUpdate> {
    return { ...this.lastPrices };
  }

  /**
   * Get oracle metrics
   */
  getMetrics(): OracleMetrics | null {
    return this.metrics;
  }

  /**
   * Get oracle nodes
   */
  getNodes(): OracleNode[] {
    return [...this.nodes];
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean;
    subscribedAssets: string[];
    baseUrl: string;
    isRunning: boolean;
  } {
    return {
      isConnected: this.isRunning,
      subscribedAssets: Array.from(this.subscribedAssets),
      baseUrl: this.baseUrl,
      isRunning: this.isRunning,
    };
  }

  /**
   * Fetch all data from the API
   */
  private async fetchAllData(): Promise<void> {
    try {
      await Promise.all([
        this.fetchLatestPrices(),
        this.fetchMetrics(),
        this.fetchNodes(),
      ]);
    } catch (error) {
      console.error('Failed to fetch oracle data:', error);
      this.emit('error', error);
    }
  }

  /**
   * Fetch latest prices
   */
  private async fetchLatestPrices(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/latest-prices`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const previousPrices = { ...this.lastPrices };
        this.lastPrices = result.data;

        // Emit price updates for changed prices
        Object.entries(result.data).forEach(([assetId, priceData]) => {
          const previousPrice = previousPrices[assetId];
          
          if (!previousPrice || 
              previousPrice.formattedPrice !== (priceData as PriceUpdate).formattedPrice ||
              previousPrice.timestamp !== (priceData as PriceUpdate).timestamp) {
            
            this.emit('priceUpdate', {
              updates: [priceData],
            });
          }
        });

        this.emit('latestPrices', result.data);
      }
    } catch (error) {
      console.error('Failed to fetch latest prices:', error);
      this.emit('error', error);
    }
  }

  /**
   * Fetch oracle metrics
   */
  private async fetchMetrics(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        this.metrics = result.data;
        this.emit('metricsUpdate', { metrics: result.data });
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      this.emit('error', error);
    }
  }

  /**
   * Fetch oracle nodes
   */
  private async fetchNodes(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/nodes`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        this.nodes = result.data;
        this.emit('nodeStatus', { nodes: result.data });
      }
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
      this.emit('error', error);
    }
  }

  /**
   * Simulate node failure
   */
  async simulateNodeFailure(nodeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/simulate-failure/${nodeId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`Node ${nodeId} failure simulated`);
        this.emit('nodeFailure', { nodeId });
      }
    } catch (error) {
      console.error('Failed to simulate node failure:', error);
      this.emit('error', error);
    }
  }

  /**
   * Simulate node recovery
   */
  async simulateNodeRecovery(nodeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/simulate-recovery/${nodeId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`Node ${nodeId} recovery simulated`);
        this.emit('nodeRecovery', { nodeId });
      }
    } catch (error) {
      console.error('Failed to simulate node recovery:', error);
      this.emit('error', error);
    }
  }

  /**
   * Force price update
   */
  async forceUpdate(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/force-update`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Price update forced');
        // Fetch updated data immediately
        await this.fetchAllData();
      }
    } catch (error) {
      console.error('Failed to force update:', error);
      this.emit('error', error);
    }
  }

  /**
   * Get price history for an asset
   */
  async getPriceHistory(assetId: string, hours: number = 24): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/price-history/${assetId}?hours=${hours}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data.history;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get price history:', error);
      return [];
    }
  }
}

// Singleton instance
let httpClientInstance: HttpOracleClient | null = null;

export const getHttpOracleClient = (baseUrl?: string): HttpOracleClient => {
  if (!httpClientInstance) {
    httpClientInstance = new HttpOracleClient(baseUrl);
  }
  return httpClientInstance;
};

export default HttpOracleClient;
