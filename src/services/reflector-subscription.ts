import { SorobanRpc, TransactionBuilder, Contract, Networks } from '@stellar/stellar-sdk';
import { config } from '@/lib/config';

// Reflector Subscription Service
// Manages price feed subscriptions with webhook notifications
export class ReflectorSubscriptionService {
  private readonly rpcUrl: string;
  private readonly networkPassphrase: string;
  private readonly subscriptionContractId: string;
  private readonly server: SorobanRpc.Server;

  constructor() {
    this.rpcUrl = config.soroban.rpcUrl;
    this.networkPassphrase = config.soroban.networkPassphrase;
    this.subscriptionContractId = config.soroban.reflectorSubscriptionId;
    this.server = new SorobanRpc.Server(this.rpcUrl);
  }

  // Create a price feed subscription
  async createSubscription(params: {
    webhook: string;
    baseAsset: string;
    quoteAsset: string;
    threshold: number; // Price change threshold (e.g., 3 for 0.3%)
    heartbeat: number; // Heartbeat interval in minutes
    initialBalance: string; // Initial XRF token deposit
    userAddress: string;
    signTransaction: (tx: string) => Promise<string>;
  }) {
    try {
      if (!this.subscriptionContractId) {
        throw new Error('Reflector subscription contract not configured');
      }

      const contract = new Contract(this.subscriptionContractId);
      
      const account = await this.server.getAccount(params.userAddress);
      const transaction = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('create_subscription', {
          webhook: params.webhook,
          base_asset: params.baseAsset,
          quote_asset: params.quoteAsset,
          threshold: params.threshold,
          heartbeat: params.heartbeat,
          initial_balance: params.initialBalance,
        }))
        .setTimeout(30)
        .build();

      const signedTx = await params.signTransaction(transaction.toXDR());
      const result = await this.server.sendTransaction(signedTx);
      
      return {
        success: true,
        subscriptionId: result.hash,
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId: string) {
    try {
      if (!this.subscriptionContractId) {
        throw new Error('Reflector subscription contract not configured');
      }

      const contract = new Contract(this.subscriptionContractId);
      const subscription = await contract.call('get_subscription', subscriptionId);
      
      return {
        id: subscriptionId,
        webhook: subscription.webhook,
        baseAsset: subscription.base_asset,
        quoteAsset: subscription.quote_asset,
        threshold: subscription.threshold,
        heartbeat: subscription.heartbeat,
        balance: subscription.balance,
        status: subscription.status,
        createdAt: subscription.created_at,
        lastTriggered: subscription.last_triggered,
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  // Add more XRF tokens to subscription
  async depositToSubscription(
    subscriptionId: string,
    amount: string,
    userAddress: string,
    signTransaction: (tx: string) => Promise<string>
  ) {
    try {
      if (!this.subscriptionContractId) {
        throw new Error('Reflector subscription contract not configured');
      }

      const contract = new Contract(this.subscriptionContractId);
      
      const account = await this.server.getAccount(userAddress);
      const transaction = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('deposit', subscriptionId, amount))
        .setTimeout(30)
        .build();

      const signedTx = await signTransaction(transaction.toXDR());
      const result = await this.server.sendTransaction(signedTx);
      
      return {
        success: true,
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error depositing to subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Cancel subscription and refund remaining tokens
  async cancelSubscription(
    subscriptionId: string,
    userAddress: string,
    signTransaction: (tx: string) => Promise<string>
  ) {
    try {
      if (!this.subscriptionContractId) {
        throw new Error('Reflector subscription contract not configured');
      }

      const contract = new Contract(this.subscriptionContractId);
      
      const account = await this.server.getAccount(userAddress);
      const transaction = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('cancel_subscription', subscriptionId))
        .setTimeout(30)
        .build();

      const signedTx = await signTransaction(transaction.toXDR());
      const result = await this.server.sendTransaction(signedTx);
      
      return {
        success: true,
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get user's subscriptions
  async getUserSubscriptions(userAddress: string) {
    try {
      if (!this.subscriptionContractId) {
        throw new Error('Reflector subscription contract not configured');
      }

      const contract = new Contract(this.subscriptionContractId);
      const subscriptions = await contract.call('get_user_subscriptions', userAddress);
      
      return subscriptions.map((sub: any) => ({
        id: sub.id,
        webhook: sub.webhook,
        baseAsset: sub.base_asset,
        quoteAsset: sub.quote_asset,
        threshold: sub.threshold,
        heartbeat: sub.heartbeat,
        balance: sub.balance,
        status: sub.status,
        createdAt: sub.created_at,
        lastTriggered: sub.last_triggered,
      }));
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      return [];
    }
  }

  // Update subscription parameters
  async updateSubscription(
    subscriptionId: string,
    updates: {
      threshold?: number;
      heartbeat?: number;
      webhook?: string;
    },
    userAddress: string,
    signTransaction: (tx: string) => Promise<string>
  ) {
    try {
      if (!this.subscriptionContractId) {
        throw new Error('Reflector subscription contract not configured');
      }

      const contract = new Contract(this.subscriptionContractId);
      
      const account = await this.server.getAccount(userAddress);
      const transaction = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('update_subscription', subscriptionId, updates))
        .setTimeout(30)
        .build();

      const signedTx = await signTransaction(transaction.toXDR());
      const result = await this.server.sendTransaction(signedTx);
      
      return {
        success: true,
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get subscription usage statistics
  async getSubscriptionStats(subscriptionId: string) {
    try {
      if (!this.subscriptionContractId) {
        throw new Error('Reflector subscription contract not configured');
      }

      const contract = new Contract(this.subscriptionContractId);
      const stats = await contract.call('get_subscription_stats', subscriptionId);
      
      return {
        totalTriggers: stats.total_triggers || 0,
        totalCost: stats.total_cost || 0,
        averageTriggerInterval: stats.avg_trigger_interval || 0,
        lastTriggerTime: stats.last_trigger_time || 0,
        remainingBalance: stats.remaining_balance || 0,
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      return {
        totalTriggers: 0,
        totalCost: 0,
        averageTriggerInterval: 0,
        lastTriggerTime: 0,
        remainingBalance: 0,
      };
    }
  }

  // Encrypt webhook URL for privacy (client-side encryption)
  encryptWebhookUrl(webhookUrl: string, userSecret: string): string {
    // Simple base64 encoding for demo - in production, use proper encryption
    const combined = `${webhookUrl}:${userSecret}`;
    return btoa(combined);
  }

  // Decrypt webhook URL
  decryptWebhookUrl(encryptedUrl: string, userSecret: string): string {
    try {
      const decrypted = atob(encryptedUrl);
      const [webhookUrl, secret] = decrypted.split(':');
      if (secret === userSecret) {
        return webhookUrl;
      }
      throw new Error('Invalid secret');
    } catch (error) {
      throw new Error('Failed to decrypt webhook URL');
    }
  }

  // Estimate subscription cost
  async estimateSubscriptionCost(params: {
    threshold: number;
    heartbeat: number;
    duration: number; // Duration in days
  }) {
    try {
      if (!this.subscriptionContractId) {
        throw new Error('Reflector subscription contract not configured');
      }

      const contract = new Contract(this.subscriptionContractId);
      const cost = await contract.call('estimate_cost', {
        threshold: params.threshold,
        heartbeat: params.heartbeat,
        duration: params.duration,
      });
      
      return {
        estimatedCost: cost.toString(),
        currency: 'XRF',
        breakdown: {
          thresholdCost: cost.threshold_cost || 0,
          heartbeatCost: cost.heartbeat_cost || 0,
          durationMultiplier: cost.duration_multiplier || 1,
        },
      };
    } catch (error) {
      console.error('Error estimating subscription cost:', error);
      return {
        estimatedCost: '0',
        currency: 'XRF',
        breakdown: {
          thresholdCost: 0,
          heartbeatCost: 0,
          durationMultiplier: 1,
        },
      };
    }
  }
}

export const reflectorSubscriptionService = new ReflectorSubscriptionService();
