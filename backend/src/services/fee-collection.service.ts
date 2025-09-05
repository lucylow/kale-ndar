import { Keypair } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { KaleTokenService } from './kale-token.service';
import { logger } from '../utils/logger';
import Big from 'big.js';

export interface FeeInfo {
  platformFees: string;
  collectedFees: string;
  feeRate: number;
  feeCollector: string;
}

export interface FeeCollectionResult {
  amountCollected: string;
  transactionHash: string;
  collectorAddress: string;
  timestamp: number;
}

export interface FeeDistribution {
  platformFee: string;
  creatorFee: string;
  totalFee: string;
}

export interface FeeStats {
  totalFeesCollected: string;
  totalFeesDistributed: string;
  pendingFees: string;
  feeCollectionCount: number;
  averageFeePerCollection: string;
}

export class FeeCollectionService {
  private stellarRpc: StellarRpcService;
  private kaleToken: KaleTokenService;
  private kaleIntegrationContractId: string;
  private feeCollectorAddress: string;

  constructor(
    stellarRpc: StellarRpcService,
    kaleToken: KaleTokenService,
    kaleIntegrationContractId: string,
    feeCollectorAddress: string
  ) {
    this.stellarRpc = stellarRpc;
    this.kaleToken = kaleToken;
    this.kaleIntegrationContractId = kaleIntegrationContractId;
    this.feeCollectorAddress = feeCollectorAddress;
  }

  /**
   * Collect platform fees (admin only)
   */
  async collectFees(adminKeypair: Keypair): Promise<FeeCollectionResult> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      const result = await contract.call('collect_fees', adminKeypair.publicKey());
      const amountCollected = result.toString();

      // Get transaction details
      const transactionHash = 'mock_hash'; // In real implementation, get from contract call result
      
      const feeCollectionResult: FeeCollectionResult = {
        amountCollected,
        transactionHash,
        collectorAddress: this.feeCollectorAddress,
        timestamp: Date.now(),
      };

      logger.info('Fees collected successfully:', feeCollectionResult);

      return feeCollectionResult;
    } catch (error) {
      logger.error('Failed to collect fees:', error);
      throw error;
    }
  }

  /**
   * Get current fee information
   */
  async getFeeInfo(): Promise<FeeInfo> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      const result = await contract.call('get_fee_info');

      return {
        platformFees: result.platform_fees.toString(),
        collectedFees: result.collected_fees.toString(),
        feeRate: result.fee_rate,
        feeCollector: result.fee_collector.toString(),
      };
    } catch (error) {
      logger.error('Failed to get fee info:', error);
      throw error;
    }
  }

  /**
   * Update fee rate (admin only)
   */
  async updateFeeRate(adminKeypair: Keypair, newFeeRate: number): Promise<TransactionResult> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      const result = await contract.call('update_fee_rate', adminKeypair.publicKey(), newFeeRate);

      logger.info('Fee rate updated:', {
        newFeeRate,
        admin: adminKeypair.publicKey(),
      });

      return {
        hash: 'mock_hash',
        ledger: 0,
        success: true,
        result,
      };
    } catch (error) {
      logger.error('Failed to update fee rate:', error);
      throw error;
    }
  }

  /**
   * Update fee collector address (admin only)
   */
  async updateFeeCollector(
    adminKeypair: Keypair,
    newFeeCollector: string
  ): Promise<TransactionResult> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      const result = await contract.call('update_fee_collector', adminKeypair.publicKey(), newFeeCollector);

      logger.info('Fee collector updated:', {
        newFeeCollector,
        admin: adminKeypair.publicKey(),
      });

      return {
        hash: 'mock_hash',
        ledger: 0,
        success: true,
        result,
      };
    } catch (error) {
      logger.error('Failed to update fee collector:', error);
      throw error;
    }
  }

  /**
   * Calculate fees for a transaction
   */
  calculateFees(amount: string, feeRate: number): FeeDistribution {
    try {
      const bigAmount = new Big(amount);
      const platformFee = bigAmount.mul(feeRate).toFixed(0);
      const creatorFee = bigAmount.mul(feeRate * 0.5).toFixed(0); // Creator gets 50% of platform fee
      const totalFee = new Big(platformFee).add(creatorFee).toFixed(0);

      return {
        platformFee,
        creatorFee,
        totalFee,
      };
    } catch (error) {
      logger.error('Failed to calculate fees:', error);
      throw error;
    }
  }

  /**
   * Distribute fees to stakeholders
   */
  async distributeFees(
    distributorKeypair: Keypair,
    platformFee: string,
    creatorFee: string,
    creatorAddress: string
  ): Promise<TransactionResult[]> {
    try {
      const results: TransactionResult[] = [];

      // Transfer platform fee to fee collector
      if (new Big(platformFee).gt(0)) {
        const platformResult = await this.kaleToken.transfer(
          distributorKeypair,
          this.feeCollectorAddress,
          platformFee
        );
        results.push(platformResult);
      }

      // Transfer creator fee to creator
      if (new Big(creatorFee).gt(0)) {
        const creatorResult = await this.kaleToken.transfer(
          distributorKeypair,
          creatorAddress,
          creatorFee
        );
        results.push(creatorResult);
      }

      logger.info('Fees distributed:', {
        platformFee,
        creatorFee,
        creatorAddress,
        resultsCount: results.length,
      });

      return results;
    } catch (error) {
      logger.error('Failed to distribute fees:', error);
      throw error;
    }
  }

  /**
   * Get fee collector balance
   */
  async getFeeCollectorBalance(): Promise<string> {
    try {
      const balance = await this.kaleToken.getBalance(this.feeCollectorAddress);
      return balance.balance;
    } catch (error) {
      logger.error('Failed to get fee collector balance:', error);
      return '0';
    }
  }

  /**
   * Get fee statistics
   */
  async getFeeStats(): Promise<FeeStats> {
    try {
      const feeInfo = await this.getFeeInfo();
      const feeCollectorBalance = await this.getFeeCollectorBalance();

      // This would typically come from historical data
      // For now, we'll calculate based on current state
      const totalFeesCollected = new Big(feeInfo.collectedFees).toString();
      const totalFeesDistributed = new Big(feeInfo.collectedFees).sub(feeInfo.platformFees).toString();
      const pendingFees = feeInfo.platformFees;
      const feeCollectionCount = 1; // Mock data
      const averageFeePerCollection = new Big(totalFeesCollected).div(feeCollectionCount).toString();

      return {
        totalFeesCollected,
        totalFeesDistributed,
        pendingFees,
        feeCollectionCount,
        averageFeePerCollection,
      };
    } catch (error) {
      logger.error('Failed to get fee stats:', error);
      throw error;
    }
  }

  /**
   * Check if fees can be collected
   */
  async canCollectFees(): Promise<boolean> {
    try {
      const feeInfo = await this.getFeeInfo();
      return new Big(feeInfo.platformFees).gt(0);
    } catch (error) {
      logger.error('Failed to check fee collection eligibility:', error);
      return false;
    }
  }

  /**
   * Get fee collection requirements
   */
  async getFeeCollectionRequirements(): Promise<{
    minFeesToCollect: string;
    maxFeesToCollect: string;
    feeCollectorBalance: string;
    pendingFees: string;
  }> {
    try {
      const feeInfo = await this.getFeeInfo();
      const feeCollectorBalance = await this.getFeeCollectorBalance();

      return {
        minFeesToCollect: '100', // Minimum 100 KALE to collect
        maxFeesToCollect: feeInfo.platformFees,
        feeCollectorBalance,
        pendingFees: feeInfo.platformFees,
      };
    } catch (error) {
      logger.error('Failed to get fee collection requirements:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic fee collection
   */
  async scheduleFeeCollection(intervalMinutes: number = 60): Promise<void> {
    try {
      // This would typically be implemented with a cron job or scheduler
      logger.info('Fee collection scheduled:', {
        intervalMinutes,
        nextCollection: new Date(Date.now() + intervalMinutes * 60 * 1000),
      });
    } catch (error) {
      logger.error('Failed to schedule fee collection:', error);
      throw error;
    }
  }

  /**
   * Process fee collection for multiple markets
   */
  async processBulkFeeCollection(
    adminKeypair: Keypair,
    marketIds: string[]
  ): Promise<FeeCollectionResult[]> {
    try {
      const results: FeeCollectionResult[] = [];

      for (const marketId of marketIds) {
        try {
          // This would typically process fees for each market
          // For now, we'll simulate the process
          const result = await this.collectFees(adminKeypair);
          results.push(result);
        } catch (error) {
          logger.error(`Failed to collect fees for market ${marketId}:`, error);
          // Continue with other markets
        }
      }

      logger.info('Bulk fee collection completed:', {
        totalMarkets: marketIds.length,
        successfulCollections: results.length,
        failedCollections: marketIds.length - results.length,
      });

      return results;
    } catch (error) {
      logger.error('Failed to process bulk fee collection:', error);
      throw error;
    }
  }

  /**
   * Get fee collection history
   */
  async getFeeCollectionHistory(limit: number = 10): Promise<FeeCollectionResult[]> {
    try {
      // This would typically come from a database or blockchain events
      // For now, we'll return mock data
      const mockHistory: FeeCollectionResult[] = [
        {
          amountCollected: '1000',
          transactionHash: 'mock_hash_1',
          collectorAddress: this.feeCollectorAddress,
          timestamp: Date.now() - 3600000, // 1 hour ago
        },
        {
          amountCollected: '500',
          transactionHash: 'mock_hash_2',
          collectorAddress: this.feeCollectorAddress,
          timestamp: Date.now() - 7200000, // 2 hours ago
        },
      ];

      return mockHistory.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get fee collection history:', error);
      throw error;
    }
  }

  /**
   * Validate fee collection request
   */
  private validateFeeCollectionRequest(adminKeypair: Keypair): void {
    if (!adminKeypair || !adminKeypair.publicKey()) {
      throw new Error('Valid admin keypair is required');
    }

    // Additional validation could be added here
    // e.g., check if the keypair has admin privileges
  }

  /**
   * Get optimal fee collection timing
   */
  async getOptimalCollectionTiming(): Promise<{
    recommendedInterval: number; // minutes
    nextCollectionTime: number; // timestamp
    estimatedFees: string;
  }> {
    try {
      const feeInfo = await this.getFeeInfo();
      const currentFees = new Big(feeInfo.platformFees);
      
      // Recommend collection when fees reach 1000 KALE or every 4 hours
      const recommendedInterval = currentFees.gte(1000) ? 60 : 240; // 1 hour or 4 hours
      const nextCollectionTime = Date.now() + recommendedInterval * 60 * 1000;
      const estimatedFees = currentFees.toString();

      return {
        recommendedInterval,
        nextCollectionTime,
        estimatedFees,
      };
    } catch (error) {
      logger.error('Failed to get optimal collection timing:', error);
      throw error;
    }
  }
}
