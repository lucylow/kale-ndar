import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface LivePriceUpdate {
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

export interface OracleMetrics {
  totalUpdates: number;
  averageConfidence: number;
  activeNodes: number;
  uptime: number;
  lastUpdateTime: number;
  updateFrequency: number; // updates per minute
}

export class LiveOracleUpdatesService extends EventEmitter {
  private priceUpdates: Map<string, LivePriceUpdate[]> = new Map();
  private oracleNodes: Map<string, OracleNode> = new Map();
  private metrics: OracleMetrics = {
    totalUpdates: 0,
    averageConfidence: 0,
    activeNodes: 0,
    uptime: 100,
    lastUpdateTime: 0,
    updateFrequency: 0,
  };
  private isRunning = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<string> = new Set();

  // Supported assets with realistic base prices
  private readonly supportedAssets = [
    {
      id: 'KALE:GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE',
      symbol: 'KALE',
      name: 'KALE Token',
      basePrice: 0.15,
      volatility: 0.05, // 5% volatility
    },
    {
      id: 'XLM',
      symbol: 'XLM',
      name: 'Stellar Lumens',
      basePrice: 0.12,
      volatility: 0.08,
    },
    {
      id: 'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      symbol: 'USDC',
      name: 'USD Coin',
      basePrice: 1.00,
      volatility: 0.001, // Very low volatility for stablecoin
    },
    {
      id: 'BTC',
      symbol: 'BTC',
      name: 'Bitcoin',
      basePrice: 45000,
      volatility: 0.12,
    },
    {
      id: 'ETH',
      symbol: 'ETH',
      name: 'Ethereum',
      basePrice: 3200,
      volatility: 0.10,
    },
  ];

  // Mock oracle nodes
  private readonly mockOracleNodes = [
    {
      id: 'oracle-node-1',
      address: 'GORACLE1ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      name: 'Stellar Oracle Node Alpha',
      reliability: 0.98,
    },
    {
      id: 'oracle-node-2',
      address: 'GORACLE2ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      name: 'Stellar Oracle Node Beta',
      reliability: 0.95,
    },
    {
      id: 'oracle-node-3',
      address: 'GORACLE3ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      name: 'Stellar Oracle Node Gamma',
      reliability: 0.92,
    },
  ];

  constructor() {
    super();
    this.initializeOracleNodes();
  }

  /**
   * Start live price updates
   */
  startLiveUpdates(intervalMs: number = 5000): void {
    if (this.isRunning) {
      logger.warn('Live oracle updates already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting live oracle price updates', { intervalMs });

    this.updateInterval = setInterval(() => {
      this.generatePriceUpdates();
    }, intervalMs);

    // Generate initial updates
    this.generatePriceUpdates();
  }

  /**
   * Stop live price updates
   */
  stopLiveUpdates(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    logger.info('Stopped live oracle price updates');
  }

  /**
   * Subscribe to live updates
   */
  subscribe(subscriberId: string): void {
    this.subscribers.add(subscriberId);
    logger.info('New subscriber added', { subscriberId, totalSubscribers: this.subscribers.size });
  }

  /**
   * Unsubscribe from live updates
   */
  unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
    logger.info('Subscriber removed', { subscriberId, totalSubscribers: this.subscribers.size });
  }

  /**
   * Get latest price updates for an asset
   */
  getLatestPriceUpdates(assetId: string, limit: number = 10): LivePriceUpdate[] {
    const updates = this.priceUpdates.get(assetId) || [];
    return updates.slice(-limit);
  }

  /**
   * Get all latest price updates
   */
  getAllLatestPrices(): Record<string, LivePriceUpdate> {
    const latestPrices: Record<string, LivePriceUpdate> = {};
    
    for (const [assetId, updates] of this.priceUpdates.entries()) {
      if (updates.length > 0) {
        latestPrices[assetId] = updates[updates.length - 1];
      }
    }

    return latestPrices;
  }

  /**
   * Get oracle metrics
   */
  getOracleMetrics(): OracleMetrics {
    return { ...this.metrics };
  }

  /**
   * Get oracle nodes status
   */
  getOracleNodes(): OracleNode[] {
    return Array.from(this.oracleNodes.values());
  }

  /**
   * Get price history for an asset
   */
  getPriceHistory(assetId: string, hours: number = 24): LivePriceUpdate[] {
    const updates = this.priceUpdates.get(assetId) || [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    return updates.filter(update => update.timestamp >= cutoffTime);
  }

  /**
   * Simulate oracle node failure
   */
  simulateNodeFailure(nodeId: string): void {
    const node = this.oracleNodes.get(nodeId);
    if (node) {
      node.isActive = false;
      logger.warn('Oracle node failure simulated', { nodeId, nodeName: node.name });
      this.emit('nodeFailure', node);
    }
  }

  /**
   * Simulate oracle node recovery
   */
  simulateNodeRecovery(nodeId: string): void {
    const node = this.oracleNodes.get(nodeId);
    if (node) {
      node.isActive = true;
      logger.info('Oracle node recovery simulated', { nodeId, nodeName: node.name });
      this.emit('nodeRecovery', node);
    }
  }

  /**
   * Generate realistic price updates
   */
  private generatePriceUpdates(): void {
    const activeNodes = Array.from(this.oracleNodes.values()).filter(node => node.isActive);
    
    if (activeNodes.length === 0) {
      logger.warn('No active oracle nodes available');
      return;
    }

    const updates: LivePriceUpdate[] = [];

    for (const asset of this.supportedAssets) {
      // Select a random active oracle node
      const oracleNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      
      // Generate realistic price movement
      const priceUpdate = this.generatePriceUpdate(asset, oracleNode);
      updates.push(priceUpdate);

      // Store the update
      if (!this.priceUpdates.has(asset.id)) {
        this.priceUpdates.set(asset.id, []);
      }
      
      const assetUpdates = this.priceUpdates.get(asset.id)!;
      assetUpdates.push(priceUpdate);

      // Keep only last 1000 updates per asset
      if (assetUpdates.length > 1000) {
        assetUpdates.splice(0, assetUpdates.length - 1000);
      }

      // Update oracle node stats
      oracleNode.lastUpdate = Date.now();
      oracleNode.updateCount++;
      oracleNode.averageConfidence = this.calculateAverageConfidence(oracleNode.id);
    }

    // Update metrics
    this.updateMetrics(updates);

    // Emit updates to subscribers
    this.emit('priceUpdates', updates);
    this.emit('metricsUpdate', this.metrics);

    logger.debug('Generated price updates', {
      assetCount: updates.length,
      activeNodes: activeNodes.length,
      totalUpdates: this.metrics.totalUpdates,
    });
  }

  /**
   * Generate a single price update
   */
  private generatePriceUpdate(asset: any, oracleNode: OracleNode): LivePriceUpdate {
    const previousUpdates = this.priceUpdates.get(asset.id) || [];
    const lastUpdate = previousUpdates[previousUpdates.length - 1];
    
    let newPrice: number;
    
    if (lastUpdate) {
      // Generate price movement based on volatility and market conditions
      const priceChange = this.generatePriceChange(asset.volatility);
      newPrice = parseFloat(lastUpdate.formattedPrice) * (1 + priceChange);
    } else {
      // First update - use base price with small variation
      const variation = (Math.random() - 0.5) * asset.volatility;
      newPrice = asset.basePrice * (1 + variation);
    }

    // Ensure price doesn't go negative
    newPrice = Math.max(newPrice, asset.basePrice * 0.1);

    // Generate confidence based on node reliability and market conditions
    const baseConfidence = oracleNode.reliability * 100;
    const confidenceVariation = (Math.random() - 0.5) * 5; // ±2.5%
    const confidence = Math.max(80, Math.min(100, baseConfidence + confidenceVariation));

    // Generate 24h change and volume
    const change24h = (Math.random() - 0.5) * 20; // ±10%
    const volume24h = Math.random() * 1000000; // Random volume

    const update: LivePriceUpdate = {
      id: uuidv4(),
      asset: asset.id,
      symbol: asset.symbol,
      price: (newPrice * Math.pow(10, 14)).toString(), // Convert to integer with decimals
      formattedPrice: newPrice.toFixed(6),
      timestamp: Date.now(),
      confidence: Math.round(confidence),
      source: 'reflector',
      change24h: parseFloat(change24h.toFixed(2)),
      volume24h: parseFloat(volume24h.toFixed(2)),
      oracleNode: oracleNode.id,
      transactionHash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    return update;
  }

  /**
   * Generate realistic price change
   */
  private generatePriceChange(volatility: number): number {
    // Use Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Scale by volatility
    return z0 * volatility * 0.1; // 10% of volatility per update
  }

  /**
   * Calculate average confidence for an oracle node
   */
  private calculateAverageConfidence(nodeId: string): number {
    let totalConfidence = 0;
    let updateCount = 0;

    for (const updates of this.priceUpdates.values()) {
      for (const update of updates) {
        if (update.oracleNode === nodeId) {
          totalConfidence += update.confidence;
          updateCount++;
        }
      }
    }

    return updateCount > 0 ? totalConfidence / updateCount : 0;
  }

  /**
   * Update oracle metrics
   */
  private updateMetrics(updates: LivePriceUpdate[]): void {
    this.metrics.totalUpdates += updates.length;
    this.metrics.lastUpdateTime = Date.now();
    this.metrics.activeNodes = Array.from(this.oracleNodes.values()).filter(node => node.isActive).length;

    // Calculate average confidence
    const totalConfidence = updates.reduce((sum, update) => sum + update.confidence, 0);
    this.metrics.averageConfidence = updates.length > 0 ? totalConfidence / updates.length : 0;

    // Calculate update frequency (updates per minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    let recentUpdates = 0;

    for (const assetUpdates of this.priceUpdates.values()) {
      recentUpdates += assetUpdates.filter(update => update.timestamp >= oneMinuteAgo).length;
    }

    this.metrics.updateFrequency = recentUpdates;

    // Calculate uptime
    const totalNodes = this.oracleNodes.size;
    const activeNodes = this.metrics.activeNodes;
    this.metrics.uptime = totalNodes > 0 ? (activeNodes / totalNodes) * 100 : 0;
  }

  /**
   * Initialize oracle nodes
   */
  private initializeOracleNodes(): void {
    for (const nodeData of this.mockOracleNodes) {
      const node: OracleNode = {
        id: nodeData.id,
        address: nodeData.address,
        name: nodeData.name,
        isActive: true,
        lastUpdate: 0,
        updateCount: 0,
        averageConfidence: 0,
        reliability: nodeData.reliability,
      };

      this.oracleNodes.set(node.id, node);
    }

    logger.info('Oracle nodes initialized', { nodeCount: this.oracleNodes.size });
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    subscribers: number;
    supportedAssets: number;
    totalUpdates: number;
    activeNodes: number;
  } {
    return {
      isRunning: this.isRunning,
      subscribers: this.subscribers.size,
      supportedAssets: this.supportedAssets.length,
      totalUpdates: this.metrics.totalUpdates,
      activeNodes: this.metrics.activeNodes,
    };
  }
}
