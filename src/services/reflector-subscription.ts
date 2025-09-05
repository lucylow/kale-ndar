// Mock implementation of Reflector Subscription service
// This prevents TypeScript errors while maintaining the expected API

export interface PriceSubscription {
  id: string;
  webhook: string;
  base_asset: string;
  quote_asset: string;
  threshold: number;
  heartbeat: number;
  balance: number;
  status: 'active' | 'paused' | 'expired';
  created_at: number;
  last_triggered: number;
}

export interface SubscriptionStats {
  total_triggers: number;
  total_cost: number;
  avg_trigger_interval: number;
  last_trigger_time: number;
  remaining_balance: number;
}

export interface SubscriptionCosts {
  threshold_cost: number;
  heartbeat_cost: number;
  duration_multiplier: number;
}

// Mock Reflector Subscription Service
export class ReflectorSubscriptionService {
  private static instance: ReflectorSubscriptionService | null = null;

  static getInstance(): ReflectorSubscriptionService {
    if (!ReflectorSubscriptionService.instance) {
      ReflectorSubscriptionService.instance = new ReflectorSubscriptionService();
    }
    return ReflectorSubscriptionService.instance;
  }

  private constructor() {}

  async createSubscription(
    userAddress: string,
    webhookUrl: string,
    baseAsset: string,
    quoteAsset: string,
    threshold: number,
    heartbeat: number,
    initialBalance: number
  ): Promise<string> {
    // Mock implementation
    console.log(`Mock creating subscription for ${userAddress}: ${baseAsset}/${quoteAsset}`);
    return 'mock_subscription_id_' + Date.now();
  }

  async getUserSubscriptions(userAddress: string): Promise<PriceSubscription[]> {
    // Mock implementation
    return [
      {
        id: 'sub_1',
        webhook: 'https://webhook.example.com/price-alert',
        base_asset: 'BTC',
        quote_asset: 'USD',
        threshold: 0.05,
        heartbeat: 3600,
        balance: 150.5,
        status: 'active',
        created_at: Date.now() - 2592000000, // 30 days ago
        last_triggered: Date.now() - 3600000 // 1 hour ago
      },
      {
        id: 'sub_2',
        webhook: 'https://webhook.example.com/eth-alert',
        base_asset: 'ETH',
        quote_asset: 'USD',
        threshold: 0.03,
        heartbeat: 1800,
        balance: 75.2,
        status: 'active',
        created_at: Date.now() - 1296000000, // 15 days ago
        last_triggered: Date.now() - 1800000 // 30 minutes ago
      }
    ];
  }

  async updateSubscription(
    userAddress: string,
    subscriptionId: string,
    updates: Partial<{
      webhook: string;
      threshold: number;
      heartbeat: number;
      status: 'active' | 'paused';
    }>
  ): Promise<string> {
    // Mock implementation
    console.log(`Mock updating subscription ${subscriptionId} for ${userAddress}`);
    return 'mock_update_tx_hash';
  }

  async deleteSubscription(userAddress: string, subscriptionId: string): Promise<string> {
    // Mock implementation
    console.log(`Mock deleting subscription ${subscriptionId} for ${userAddress}`);
    return 'mock_delete_tx_hash';
  }

  async getAllSubscriptions(): Promise<PriceSubscription[]> {
    // Mock implementation
    const userSubs = await this.getUserSubscriptions('mock_user');
    return [
      ...userSubs,
      {
        id: 'sub_3',
        webhook: 'https://webhook.example.com/xlm-alert',
        base_asset: 'XLM',
        quote_asset: 'USD',
        threshold: 0.1,
        heartbeat: 7200,
        balance: 200.0,
        status: 'active',
        created_at: Date.now() - 864000000, // 10 days ago
        last_triggered: Date.now() - 7200000 // 2 hours ago
      }
    ];
  }

  async addFunds(
    userAddress: string,
    subscriptionId: string,
    amount: number
  ): Promise<string> {
    // Mock implementation
    console.log(`Mock adding ${amount} XRF to subscription ${subscriptionId} for ${userAddress}`);
    return 'mock_add_funds_tx_hash';
  }

  async getSubscriptionStats(
    userAddress: string,
    subscriptionId: string
  ): Promise<SubscriptionStats> {
    // Mock implementation
    return {
      total_triggers: Math.floor(Math.random() * 500) + 50,
      total_cost: Math.random() * 100 + 20,
      avg_trigger_interval: Math.random() * 7200 + 1800, // 30 minutes to 2 hours
      last_trigger_time: Date.now() - Math.random() * 86400000, // last 24 hours
      remaining_balance: Math.random() * 200 + 50
    };
  }

  async estimateSubscriptionCost(
    threshold: number,
    heartbeat: number,
    duration: number
  ): Promise<number> {
    // Mock implementation - simple cost calculation
    const baseCost = 0.1;
    const thresholdMultiplier = 1 / threshold;
    const heartbeatMultiplier = 3600 / heartbeat;
    const durationMultiplier = duration / 2592000; // normalize to 30 days
    
    return baseCost * thresholdMultiplier * heartbeatMultiplier * durationMultiplier;
  }

  async getSubscriptionCosts(): Promise<SubscriptionCosts> {
    // Mock implementation
    return {
      threshold_cost: 0.1,
      heartbeat_cost: 0.05,
      duration_multiplier: 1.0
    };
  }
}

// Export the singleton instance
export const reflectorSubscriptionService = ReflectorSubscriptionService.getInstance();