import { Keypair } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { MarketCreationService, MarketInfo } from './market-creation.service';
import { BettingService } from './betting.service';
import { OracleService } from './oracle.service';
import { logger } from '../utils/logger';
import Big from 'big.js';

export interface ResolutionRequest {
  marketId: string;
  winningOutcome: string;
  resolutionData?: any;
  resolverSecret: string;
  resolutionType: 'manual' | 'oracle' | 'timeout';
}

export interface ResolutionResult {
  marketId: string;
  winningOutcome: string;
  resolutionTime: number;
  resolutionType: string;
  totalBets: number;
  totalPayouts: string;
  transactions: TransactionResult[];
  success: boolean;
  error?: string;
}

export interface MarketResolutionInfo {
  marketId: string;
  isResolved: boolean;
  winningOutcome?: string;
  resolutionTime?: number;
  resolutionType?: string;
  resolutionData?: any;
  canResolve: boolean;
  resolutionDeadline: number;
  autoResolveEnabled: boolean;
}

export interface ResolutionTrigger {
  marketId: string;
  triggerType: 'price_threshold' | 'time_based' | 'event_based';
  triggerCondition: any;
  isActive: boolean;
  createdAt: number;
}

export class MarketResolutionService {
  private stellarRpc: StellarRpcService;
  private marketService: MarketCreationService;
  private bettingService: BettingService;
  private oracleService: OracleService;
  private kaleIntegrationContractId: string;

  constructor(
    stellarRpc: StellarRpcService,
    marketService: MarketCreationService,
    bettingService: BettingService,
    oracleService: OracleService,
    kaleIntegrationContractId: string
  ) {
    this.stellarRpc = stellarRpc;
    this.marketService = marketService;
    this.bettingService = bettingService;
    this.oracleService = oracleService;
    this.kaleIntegrationContractId = kaleIntegrationContractId;
  }

  /**
   * Resolve a market with the winning outcome
   */
  async resolveMarket(request: ResolutionRequest): Promise<ResolutionResult> {
    try {
      // Validate resolution request
      await this.validateResolutionRequest(request);

      // Get market information
      const market = await this.marketService.getMarketInfo(request.marketId);

      // Check if market can be resolved
      if (!await this.canResolveMarket(market, request.resolutionType)) {
        throw new Error('Market cannot be resolved at this time');
      }

      // Validate winning outcome
      this.validateWinningOutcome(request.winningOutcome, market);

      // Resolve market on contract
      await this.resolveMarketOnContract(request);

      // Calculate and distribute payouts
      const payoutTransactions = await this.bettingService.settleBets(
        request.marketId,
        request.winningOutcome
      );

      // Get final betting stats
      const bettingInfo = await this.bettingService.getMarketBettingInfo(request.marketId);

      const result: ResolutionResult = {
        marketId: request.marketId,
        winningOutcome: request.winningOutcome,
        resolutionTime: Date.now(),
        resolutionType: request.resolutionType,
        totalBets: bettingInfo.activeBets + bettingInfo.resolvedBets,
        totalPayouts: bettingInfo.totalVolume,
        transactions: payoutTransactions,
        success: true,
      };

      logger.info('Market resolved successfully:', {
        marketId: request.marketId,
        winningOutcome: request.winningOutcome,
        resolutionType: request.resolutionType,
        totalBets: result.totalBets,
        totalPayouts: result.totalPayouts,
      });

      return result;
    } catch (error) {
      logger.error('Failed to resolve market:', error);
      
      return {
        marketId: request.marketId,
        winningOutcome: request.winningOutcome,
        resolutionTime: Date.now(),
        resolutionType: request.resolutionType,
        totalBets: 0,
        totalPayouts: '0',
        transactions: [],
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Resolve market on Soroban contract
   */
  private async resolveMarketOnContract(request: ResolutionRequest): Promise<void> {
    try {
      const resolverKeypair = Keypair.fromSecret(request.resolverSecret);
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      await contract.call(
        'resolve_market',
        resolverKeypair.publicKey(),
        request.marketId,
        request.winningOutcome,
        request.resolutionData || {}
      );

      logger.info('Market resolved on contract:', {
        marketId: request.marketId,
        winningOutcome: request.winningOutcome,
      });
    } catch (error) {
      logger.error('Failed to resolve market on contract:', error);
      throw error;
    }
  }

  /**
   * Check if a market can be resolved
   */
  async canResolveMarket(market: MarketInfo, resolutionType: string): Promise<boolean> {
    try {
      const now = Date.now();

      // Market must not already be resolved
      if (market.resolved) {
        return false;
      }

      // Different resolution types have different requirements
      switch (resolutionType) {
        case 'manual':
          // Manual resolution can happen after market end time
          return now >= market.resolveTime;
          
        case 'oracle':
          // Oracle resolution can happen when oracle data is available
          return await this.oracleService.hasValidOracleData(market.id);
          
        case 'timeout':
          // Timeout resolution happens automatically after a grace period
          const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours
          return now >= (market.resolveTime + gracePeriod);
          
        default:
          return false;
      }
    } catch (error) {
      logger.error('Failed to check if market can be resolved:', error);
      return false;
    }
  }

  /**
   * Get market resolution information
   */
  async getMarketResolutionInfo(marketId: string): Promise<MarketResolutionInfo> {
    try {
      const market = await this.marketService.getMarketInfo(marketId);
      
      const canResolve = await this.canResolveMarket(market, 'manual');
      const autoResolveEnabled = await this.isAutoResolveEnabled(marketId);
      
      return {
        marketId,
        isResolved: market.resolved,
        winningOutcome: market.outcome ? (market.outcome ? 'for' : 'against') : undefined,
        resolutionTime: market.resolved ? market.resolveTime : undefined,
        resolutionType: market.resolved ? 'manual' : undefined,
        canResolve,
        resolutionDeadline: market.resolveTime,
        autoResolveEnabled,
      };
    } catch (error) {
      logger.error('Failed to get market resolution info:', error);
      throw error;
    }
  }

  /**
   * Set up automatic resolution triggers
   */
  async setupResolutionTrigger(trigger: ResolutionTrigger): Promise<void> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      await contract.call(
        'setup_resolution_trigger',
        trigger.marketId,
        trigger.triggerType,
        trigger.triggerCondition
      );

      logger.info('Resolution trigger setup:', {
        marketId: trigger.marketId,
        triggerType: trigger.triggerType,
        triggerCondition: trigger.triggerCondition,
      });
    } catch (error) {
      logger.error('Failed to setup resolution trigger:', error);
      throw error;
    }
  }

  /**
   * Process automatic resolution based on oracle data
   */
  async processOracleResolution(marketId: string): Promise<ResolutionResult | null> {
    try {
      const market = await this.marketService.getMarketInfo(marketId);
      
      // Check if oracle has valid data for resolution
      const oracleData = await this.oracleService.getOracleDataForMarket(marketId);
      if (!oracleData) {
        return null;
      }

      // Determine winning outcome based on oracle data
      const winningOutcome = this.determineWinningOutcomeFromOracleData(market, oracleData);
      
      if (!winningOutcome) {
        logger.info('Oracle data insufficient for resolution:', { marketId });
        return null;
      }

      // Resolve market
      const resolutionRequest: ResolutionRequest = {
        marketId,
        winningOutcome,
        resolutionData: oracleData,
        resolverSecret: process.env.SYSTEM_SECRET || '',
        resolutionType: 'oracle',
      };

      return await this.resolveMarket(resolutionRequest);
    } catch (error) {
      logger.error('Failed to process oracle resolution:', error);
      return null;
    }
  }

  /**
   * Process timeout resolution for expired markets
   */
  async processTimeoutResolution(marketId: string): Promise<ResolutionResult | null> {
    try {
      const market = await this.marketService.getMarketInfo(marketId);
      
      // Check if market has expired and can be resolved by timeout
      if (!await this.canResolveMarket(market, 'timeout')) {
        return null;
      }

      // For timeout resolution, we need to determine the outcome
      // This could be based on the last known oracle data or a default outcome
      const winningOutcome = await this.determineTimeoutOutcome(market);
      
      if (!winningOutcome) {
        logger.info('Cannot determine timeout outcome:', { marketId });
        return null;
      }

      const resolutionRequest: ResolutionRequest = {
        marketId,
        winningOutcome,
        resolverSecret: process.env.SYSTEM_SECRET || '',
        resolutionType: 'timeout',
      };

      return await this.resolveMarket(resolutionRequest);
    } catch (error) {
      logger.error('Failed to process timeout resolution:', error);
      return null;
    }
  }

  /**
   * Get all markets pending resolution
   */
  async getMarketsPendingResolution(): Promise<MarketInfo[]> {
    try {
      // This would typically query the database for markets that need resolution
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      logger.error('Failed to get markets pending resolution:', error);
      throw error;
    }
  }

  /**
   * Process all pending resolutions
   */
  async processPendingResolutions(): Promise<ResolutionResult[]> {
    try {
      const pendingMarkets = await this.getMarketsPendingResolution();
      const results: ResolutionResult[] = [];

      for (const market of pendingMarkets) {
        // Try oracle resolution first
        let result = await this.processOracleResolution(market.id);
        
        // If oracle resolution failed, try timeout resolution
        if (!result) {
          result = await this.processTimeoutResolution(market.id);
        }

        if (result) {
          results.push(result);
        }
      }

      logger.info('Processed pending resolutions:', {
        totalMarkets: pendingMarkets.length,
        resolvedMarkets: results.length,
      });

      return results;
    } catch (error) {
      logger.error('Failed to process pending resolutions:', error);
      throw error;
    }
  }

  /**
   * Validate resolution request
   */
  private async validateResolutionRequest(request: ResolutionRequest): Promise<void> {
    if (!request.marketId) {
      throw new Error('Market ID is required');
    }
    
    if (!request.winningOutcome) {
      throw new Error('Winning outcome is required');
    }
    
    if (!request.resolverSecret) {
      throw new Error('Resolver secret is required');
    }
    
    if (!['manual', 'oracle', 'timeout'].includes(request.resolutionType)) {
      throw new Error('Invalid resolution type');
    }
  }

  /**
   * Validate winning outcome
   */
  private validateWinningOutcome(outcome: string, market: MarketInfo): void {
    const validOutcomes = ['for', 'against', 'above', 'below'];
    
    if (!validOutcomes.includes(outcome)) {
      throw new Error(`Invalid winning outcome: ${outcome}`);
    }
    
    // Additional validation based on market type
    if (market.condition === 'above' && !['above', 'below'].includes(outcome)) {
      throw new Error('Winning outcome must be "above" or "below" for this market type');
    }
  }

  /**
   * Determine winning outcome from oracle data
   */
  private determineWinningOutcomeFromOracleData(market: MarketInfo, oracleData: any): string | null {
    try {
      if (market.condition === 'above') {
        const currentPrice = new Big(oracleData.price || '0');
        const targetPrice = new Big(market.targetPrice);
        
        return currentPrice.gte(targetPrice) ? 'above' : 'below';
      }
      
      // Add more logic for other market types
      return null;
    } catch (error) {
      logger.error('Failed to determine winning outcome from oracle data:', error);
      return null;
    }
  }

  /**
   * Determine timeout outcome
   */
  private async determineTimeoutOutcome(market: MarketInfo): Promise<string | null> {
    try {
      // For timeout resolution, we could use the last known oracle data
      // or implement a fallback mechanism
      const lastOracleData = await this.oracleService.getLastOracleDataForMarket(market.id);
      
      if (lastOracleData) {
        return this.determineWinningOutcomeFromOracleData(market, lastOracleData);
      }
      
      // Default fallback - could be based on market rules
      return null;
    } catch (error) {
      logger.error('Failed to determine timeout outcome:', error);
      return null;
    }
  }

  /**
   * Check if auto-resolve is enabled for a market
   */
  private async isAutoResolveEnabled(marketId: string): Promise<boolean> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      const result = await contract.call('is_auto_resolve_enabled', marketId);
      return result === true;
    } catch (error) {
      logger.error('Failed to check auto-resolve status:', error);
      return false;
    }
  }

  /**
   * Enable/disable auto-resolve for a market
   */
  async setAutoResolve(marketId: string, enabled: boolean, adminSecret: string): Promise<void> {
    try {
      const adminKeypair = Keypair.fromSecret(adminSecret);
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      await contract.call('set_auto_resolve', adminKeypair.publicKey(), marketId, enabled);
      
      logger.info('Auto-resolve setting updated:', { marketId, enabled });
    } catch (error) {
      logger.error('Failed to set auto-resolve:', error);
      throw error;
    }
  }

  /**
   * Get resolution history for a market
   */
  async getResolutionHistory(marketId: string): Promise<any[]> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      const result = await contract.call('get_resolution_history', marketId);
      
      return result.map((entry: any) => ({
        timestamp: entry.timestamp,
        resolutionType: entry.resolution_type,
        winningOutcome: entry.winning_outcome,
        resolutionData: entry.resolution_data,
        resolver: entry.resolver,
      }));
    } catch (error) {
      logger.error('Failed to get resolution history:', error);
      throw error;
    }
  }
}
