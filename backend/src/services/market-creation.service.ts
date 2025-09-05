import { Keypair, Asset, Operation } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { KaleTokenService } from './kale-token.service';
import { logger } from '../utils/logger';
import Big from 'big.js';

export interface MarketCreationRequest {
  creator: string;
  description: string;
  assetSymbol: string;
  targetPrice: string;
  condition: 'above' | 'below';
  resolveTime: number; // Unix timestamp
  marketFee: string;
}

export interface MarketInfo {
  id: string;
  creator: string;
  description: string;
  assetSymbol: string;
  targetPrice: string;
  condition: 'above' | 'below';
  resolveTime: number;
  createdAt: number;
  resolved: boolean;
  outcome?: boolean;
  totalFor: string;
  totalAgainst: string;
  marketFee: string;
  contractAddress?: string;
}

export interface MarketOffer {
  id: string;
  seller: string;
  sellingAsset: Asset;
  buyingAsset: Asset;
  amount: string;
  price: string;
  timestamp: number;
}

export class MarketCreationService {
  private stellarRpc: StellarRpcService;
  private kaleToken: KaleTokenService;
  private kaleIntegrationContractId: string;

  constructor(
    stellarRpc: StellarRpcService,
    kaleToken: KaleTokenService,
    kaleIntegrationContractId: string
  ) {
    this.stellarRpc = stellarRpc;
    this.kaleToken = kaleToken;
    this.kaleIntegrationContractId = kaleIntegrationContractId;
  }

  /**
   * Create a new prediction market
   */
  async createMarket(
    creatorKeypair: Keypair,
    request: MarketCreationRequest
  ): Promise<MarketInfo> {
    try {
      // Validate request
      this.validateMarketRequest(request);

      // Check creator has enough KALE for market fee
      const creatorBalance = await this.kaleToken.getBalance(creatorKeypair.publicKey());
      if (new Big(creatorBalance.balance).lt(new Big(request.marketFee))) {
        throw new Error('Insufficient KALE balance for market creation fee');
      }

      // Create market on Soroban contract
      const marketId = await this.createMarketOnContract(creatorKeypair, request);

      // Create market info
      const marketInfo: MarketInfo = {
        id: marketId,
        creator: creatorKeypair.publicKey(),
        description: request.description,
        assetSymbol: request.assetSymbol,
        targetPrice: request.targetPrice,
        condition: request.condition,
        resolveTime: request.resolveTime,
        createdAt: Date.now(),
        resolved: false,
        totalFor: '0',
        totalAgainst: '0',
        marketFee: request.marketFee,
      };

      logger.info('Market created successfully:', {
        marketId,
        creator: creatorKeypair.publicKey(),
        description: request.description,
      });

      return marketInfo;
    } catch (error) {
      logger.error('Failed to create market:', error);
      throw error;
    }
  }

  /**
   * Create market on Soroban contract
   */
  private async createMarketOnContract(
    creatorKeypair: Keypair,
    request: MarketCreationRequest
  ): Promise<string> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      const conditionValue = request.condition === 'above' ? 0 : 1;
      
      const result = await contract.call(
        'create_market',
        creatorKeypair.publicKey(),
        request.description,
        request.assetSymbol,
        request.targetPrice,
        conditionValue,
        request.resolveTime,
        request.marketFee
      );

      return result.toString();
    } catch (error) {
      logger.error('Failed to create market on contract:', error);
      throw error;
    }
  }

  /**
   * Get market information from contract
   */
  async getMarketInfo(marketId: string): Promise<MarketInfo> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      const result = await contract.call('get_market_info', marketId);

      return {
        id: result.id,
        creator: result.creator,
        description: result.description,
        assetSymbol: result.asset_symbol,
        targetPrice: result.target_price.toString(),
        condition: result.condition === 0 ? 'above' : 'below',
        resolveTime: result.resolve_time,
        createdAt: result.created_at,
        resolved: result.resolved,
        outcome: result.outcome,
        totalFor: result.total_for.toString(),
        totalAgainst: result.total_against.toString(),
        marketFee: result.market_fee.toString(),
      };
    } catch (error) {
      logger.error('Failed to get market info:', error);
      throw error;
    }
  }

  /**
   * Get user's markets
   */
  async getUserMarkets(userAddress: string): Promise<string[]> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      const result = await contract.call('get_user_markets', userAddress);
      
      return result.map((marketId: any) => marketId.toString());
    } catch (error) {
      logger.error('Failed to get user markets:', error);
      throw error;
    }
  }

  /**
   * Create a market offer for trading KALE
   */
  async createMarketOffer(
    sellerKeypair: Keypair,
    sellingAsset: Asset,
    buyingAsset: Asset,
    amount: string,
    price: string,
    offerId: string = '0'
  ): Promise<TransactionResult> {
    try {
      return await this.stellarRpc.createMarketOffer(
        sellerKeypair,
        sellingAsset,
        buyingAsset,
        amount,
        price,
        offerId
      );
    } catch (error) {
      logger.error('Failed to create market offer:', error);
      throw error;
    }
  }

  /**
   * Create KALE/XLM trading pair offers
   */
  async createKaleXlmOffers(
    traderKeypair: Keypair,
    kaleAmount: string,
    xlmAmount: string,
    price: string
  ): Promise<{ sellOffer: TransactionResult; buyOffer: TransactionResult }> {
    try {
      const kaleAsset = this.kaleToken.getKaleAsset();
      const xlmAsset = Asset.native();

      // Create sell offer (KALE for XLM)
      const sellOffer = await this.createMarketOffer(
        traderKeypair,
        kaleAsset,
        xlmAsset,
        kaleAmount,
        price,
        '0'
      );

      // Create buy offer (XLM for KALE)
      const buyOffer = await this.createMarketOffer(
        traderKeypair,
        xlmAsset,
        kaleAsset,
        xlmAmount,
        price,
        '1'
      );

      return { sellOffer, buyOffer };
    } catch (error) {
      logger.error('Failed to create KALE/XLM offers:', error);
      throw error;
    }
  }

  /**
   * Get market offers for a trading pair
   */
  async getMarketOffers(sellingAsset: Asset, buyingAsset: Asset): Promise<MarketOffer[]> {
    try {
      const orderBook = await this.stellarRpc.getOrderBook(sellingAsset, buyingAsset);
      
      const offers: MarketOffer[] = [];
      
      // Process bids (buying offers)
      if (orderBook.bids) {
        orderBook.bids.forEach((bid: any, index: number) => {
          offers.push({
            id: `bid_${index}`,
            seller: bid.account,
            sellingAsset: buyingAsset,
            buyingAsset: sellingAsset,
            amount: bid.amount,
            price: bid.price,
            timestamp: Date.now(),
          });
        });
      }

      // Process asks (selling offers)
      if (orderBook.asks) {
        orderBook.asks.forEach((ask: any, index: number) => {
          offers.push({
            id: `ask_${index}`,
            seller: ask.account,
            sellingAsset: sellingAsset,
            buyingAsset: buyingAsset,
            amount: ask.amount,
            price: ask.price,
            timestamp: Date.now(),
          });
        });
      }

      return offers;
    } catch (error) {
      logger.error('Failed to get market offers:', error);
      throw error;
    }
  }

  /**
   * Cancel a market offer
   */
  async cancelMarketOffer(
    sellerKeypair: Keypair,
    sellingAsset: Asset,
    buyingAsset: Asset,
    offerId: string
  ): Promise<TransactionResult> {
    try {
      return await this.stellarRpc.cancelMarketOffer(
        sellerKeypair,
        sellingAsset,
        buyingAsset,
        offerId
      );
    } catch (error) {
      logger.error('Failed to cancel market offer:', error);
      throw error;
    }
  }

  /**
   * Get KALE trading statistics
   */
  async getKaleTradingStats(): Promise<{
    totalVolume: string;
    totalTrades: number;
    averagePrice: string;
    priceChange24h: string;
  }> {
    try {
      const orderBook = await this.kaleToken.getOrderBook();
      const currentPrice = await this.kaleToken.getPrice();

      // This would typically come from historical data
      // For now, we'll return mock data
      return {
        totalVolume: '1000000', // Mock data
        totalTrades: 150, // Mock data
        averagePrice: currentPrice,
        priceChange24h: '0.05', // Mock data
      };
    } catch (error) {
      logger.error('Failed to get KALE trading stats:', error);
      throw error;
    }
  }

  /**
   * Validate market creation request
   */
  private validateMarketRequest(request: MarketCreationRequest): void {
    if (!request.description || request.description.length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }

    if (!request.assetSymbol || request.assetSymbol.length === 0) {
      throw new Error('Asset symbol is required');
    }

    if (!request.targetPrice || new Big(request.targetPrice).lte(0)) {
      throw new Error('Target price must be greater than 0');
    }

    if (!['above', 'below'].includes(request.condition)) {
      throw new Error('Condition must be either "above" or "below"');
    }

    if (request.resolveTime <= Date.now()) {
      throw new Error('Resolve time must be in the future');
    }

    if (!request.marketFee || new Big(request.marketFee).lt(0)) {
      throw new Error('Market fee must be non-negative');
    }
  }

  /**
   * Calculate market creation fee
   */
  calculateMarketFee(baseAmount: string, feeRate: number = 0.01): string {
    try {
      const base = new Big(baseAmount);
      const fee = base.mul(feeRate);
      return fee.toFixed(0);
    } catch (error) {
      logger.error('Failed to calculate market fee:', error);
      return '0';
    }
  }

  /**
   * Get market creation fee rate
   */
  async getMarketCreationFeeRate(): Promise<number> {
    try {
      // This would typically come from the contract configuration
      return 0.01; // 1% default fee rate
    } catch (error) {
      logger.error('Failed to get market creation fee rate:', error);
      return 0.01;
    }
  }

  /**
   * Check if market can be created
   */
  async canCreateMarket(creatorAddress: string, marketFee: string): Promise<boolean> {
    try {
      const balance = await this.kaleToken.getBalance(creatorAddress);
      return new Big(balance.balance).gte(new Big(marketFee));
    } catch (error) {
      logger.error('Failed to check market creation eligibility:', error);
      return false;
    }
  }

  /**
   * Get market creation requirements
   */
  async getMarketCreationRequirements(): Promise<{
    minFee: string;
    maxFee: string;
    requiredBalance: string;
    feeRate: number;
  }> {
    try {
      const feeRate = await this.getMarketCreationFeeRate();
      const minFee = this.calculateMarketFee('1000', feeRate); // Minimum fee for 1000 KALE
      const maxFee = this.calculateMarketFee('100000', feeRate); // Maximum fee for 100000 KALE
      const requiredBalance = new Big(minFee).mul(2).toString(); // Require 2x minimum fee as balance

      return {
        minFee,
        maxFee,
        requiredBalance,
        feeRate,
      };
    } catch (error) {
      logger.error('Failed to get market creation requirements:', error);
      throw error;
    }
  }
}
