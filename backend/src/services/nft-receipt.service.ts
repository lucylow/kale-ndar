import { Keypair } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export interface PredictionReceipt {
  id: string;
  tokenId: string;
  betId: string;
  marketId: string;
  owner: string;
  outcome: string;
  amount: string;
  odds: string;
  mintedAt: number;
  metadata: ReceiptMetadata;
  isTradable: boolean;
  currentPrice?: string;
  lastTradePrice?: string;
  tradeCount: number;
}

export interface ReceiptMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url: string;
  animation_url?: string;
}

export interface ReceiptTrade {
  id: string;
  receiptId: string;
  seller: string;
  buyer: string;
  price: string;
  tradedAt: number;
  transactionHash: string;
}

export interface ReceiptMarket {
  receiptId: string;
  seller: string;
  askPrice: string;
  createdAt: number;
  isActive: boolean;
  expiresAt?: number;
}

export interface ReceiptOffer {
  receiptId: string;
  buyer: string;
  bidPrice: string;
  createdAt: number;
  isActive: boolean;
  expiresAt?: number;
}

export class NFTReceiptService {
  private stellarRpc: StellarRpcService;
  private nftContractId: string;
  private kaleIntegrationContractId: string;

  constructor(
    stellarRpc: StellarRpcService,
    nftContractId: string,
    kaleIntegrationContractId: string
  ) {
    this.stellarRpc = stellarRpc;
    this.nftContractId = nftContractId;
    this.kaleIntegrationContractId = kaleIntegrationContractId;
  }

  /**
   * Mint NFT receipt for a bet
   */
  async mintBetReceipt(
    betId: string,
    marketId: string,
    ownerKeypair: Keypair,
    outcome: string,
    amount: string,
    odds: string,
    marketInfo: any
  ): Promise<PredictionReceipt> {
    try {
      const tokenId = uuidv4();
      
      // Create metadata
      const metadata = this.createReceiptMetadata(
        marketInfo,
        outcome,
        amount,
        odds,
        tokenId
      );

      // Mint NFT on Soroban contract
      const mintResult = await this.mintNFTOnContract(
        ownerKeypair,
        tokenId,
        metadata,
        betId
      );

      // Create receipt record
      const receipt: PredictionReceipt = {
        id: uuidv4(),
        tokenId,
        betId,
        marketId,
        owner: ownerKeypair.publicKey(),
        outcome,
        amount,
        odds,
        mintedAt: Date.now(),
        metadata,
        isTradable: true,
        tradeCount: 0,
      };

      // Store receipt in database
      await this.storeReceipt(receipt);

      logger.info('NFT receipt minted successfully:', {
        receiptId: receipt.id,
        tokenId,
        betId,
        marketId,
        owner: ownerKeypair.publicKey(),
        outcome,
        amount,
        odds,
      });

      return receipt;
    } catch (error) {
      logger.error('Failed to mint bet receipt:', error);
      throw error;
    }
  }

  /**
   * List receipt for sale
   */
  async listReceiptForSale(
    sellerKeypair: Keypair,
    receiptId: string,
    askPrice: string,
    expiresAt?: number
  ): Promise<ReceiptMarket> {
    try {
      // Verify ownership
      const receipt = await this.getReceipt(receiptId);
      if (!receipt || receipt.owner !== sellerKeypair.publicKey()) {
        throw new Error('User does not own this receipt');
      }

      if (!receipt.isTradable) {
        throw new Error('Receipt is not tradable');
      }

      // Create market listing
      const market: ReceiptMarket = {
        receiptId,
        seller: sellerKeypair.publicKey(),
        askPrice,
        createdAt: Date.now(),
        isActive: true,
        expiresAt,
      };

      // List on Stellar DEX
      await this.createReceiptMarketOffer(sellerKeypair, receiptId, askPrice);

      // Store market listing
      await this.storeReceiptMarket(market);

      logger.info('Receipt listed for sale:', {
        receiptId,
        seller: sellerKeypair.publicKey(),
        askPrice,
        expiresAt,
      });

      return market;
    } catch (error) {
      logger.error('Failed to list receipt for sale:', error);
      throw error;
    }
  }

  /**
   * Place bid on receipt
   */
  async placeReceiptBid(
    buyerKeypair: Keypair,
    receiptId: string,
    bidPrice: string,
    expiresAt?: number
  ): Promise<ReceiptOffer> {
    try {
      // Verify receipt exists and is tradable
      const receipt = await this.getReceipt(receiptId);
      if (!receipt || !receipt.isTradable) {
        throw new Error('Receipt is not available for trading');
      }

      // Check buyer balance
      const buyerBalance = await this.stellarRpc.getKaleBalance(buyerKeypair.publicKey());
      if (new Big(buyerBalance).lt(new Big(bidPrice))) {
        throw new Error('Insufficient KALE balance for bid');
      }

      // Create bid offer
      const offer: ReceiptOffer = {
        receiptId,
        buyer: buyerKeypair.publicKey(),
        bidPrice,
        createdAt: Date.now(),
        isActive: true,
        expiresAt,
      };

      // Create bid on Stellar DEX
      await this.createReceiptBidOffer(buyerKeypair, receiptId, bidPrice);

      // Store bid offer
      await this.storeReceiptOffer(offer);

      logger.info('Receipt bid placed:', {
        receiptId,
        buyer: buyerKeypair.publicKey(),
        bidPrice,
        expiresAt,
      });

      return offer;
    } catch (error) {
      logger.error('Failed to place receipt bid:', error);
      throw error;
    }
  }

  /**
   * Execute receipt trade
   */
  async executeReceiptTrade(
    sellerKeypair: Keypair,
    buyerKeypair: Keypair,
    receiptId: string,
    price: string
  ): Promise<ReceiptTrade> {
    try {
      // Verify ownership
      const receipt = await this.getReceipt(receiptId);
      if (!receipt || receipt.owner !== sellerKeypair.publicKey()) {
        throw new Error('Seller does not own this receipt');
      }

      // Transfer NFT ownership
      await this.transferReceiptOwnership(
        sellerKeypair,
        buyerKeypair.publicKey(),
        receiptId
      );

      // Transfer payment
      await this.stellarRpc.transferKale(
        buyerKeypair,
        sellerKeypair.publicKey(),
        price
      );

      // Create trade record
      const trade: ReceiptTrade = {
        id: uuidv4(),
        receiptId,
        seller: sellerKeypair.publicKey(),
        buyer: buyerKeypair.publicKey(),
        price,
        tradedAt: Date.now(),
        transactionHash: '', // Would be filled from transaction result
      };

      // Update receipt
      receipt.owner = buyerKeypair.publicKey();
      receipt.lastTradePrice = price;
      receipt.tradeCount += 1;
      await this.updateReceipt(receipt);

      // Store trade
      await this.storeReceiptTrade(trade);

      logger.info('Receipt trade executed:', {
        tradeId: trade.id,
        receiptId,
        seller: sellerKeypair.publicKey(),
        buyer: buyerKeypair.publicKey(),
        price,
      });

      return trade;
    } catch (error) {
      logger.error('Failed to execute receipt trade:', error);
      throw error;
    }
  }

  /**
   * Get receipt by ID
   */
  async getReceipt(receiptId: string): Promise<PredictionReceipt | null> {
    try {
      const contract = new SorobanClient.Contract(this.nftContractId);
      const result = await contract.call('get_receipt', receiptId);

      if (!result) {
        return null;
      }

      return {
        id: result.id.toString(),
        tokenId: result.token_id.toString(),
        betId: result.bet_id.toString(),
        marketId: result.market_id.toString(),
        owner: result.owner.toString(),
        outcome: result.outcome.toString(),
        amount: result.amount.toString(),
        odds: result.odds.toString(),
        mintedAt: result.minted_at,
        metadata: result.metadata,
        isTradable: result.is_tradable,
        currentPrice: result.current_price?.toString(),
        lastTradePrice: result.last_trade_price?.toString(),
        tradeCount: result.trade_count,
      };
    } catch (error) {
      logger.error('Failed to get receipt:', error);
      return null;
    }
  }

  /**
   * Get user's receipts
   */
  async getUserReceipts(userAddress: string): Promise<PredictionReceipt[]> {
    try {
      const contract = new SorobanClient.Contract(this.nftContractId);
      const result = await contract.call('get_user_receipts', userAddress);

      return result.map((receipt: any) => ({
        id: receipt.id.toString(),
        tokenId: receipt.token_id.toString(),
        betId: receipt.bet_id.toString(),
        marketId: receipt.market_id.toString(),
        owner: receipt.owner.toString(),
        outcome: receipt.outcome.toString(),
        amount: receipt.amount.toString(),
        odds: receipt.odds.toString(),
        mintedAt: receipt.minted_at,
        metadata: receipt.metadata,
        isTradable: receipt.is_tradable,
        currentPrice: receipt.current_price?.toString(),
        lastTradePrice: receipt.last_trade_price?.toString(),
        tradeCount: receipt.trade_count,
      }));
    } catch (error) {
      logger.error('Failed to get user receipts:', error);
      throw error;
    }
  }

  /**
   * Get receipt market data
   */
  async getReceiptMarketData(receiptId: string): Promise<{
    currentPrice: string;
    volume24h: string;
    trades24h: number;
    priceChange24h: string;
    marketCap: string;
  }> {
    try {
      // This would typically aggregate data from trades
      // For now, returning mock data
      return {
        currentPrice: '0',
        volume24h: '0',
        trades24h: 0,
        priceChange24h: '0',
        marketCap: '0',
      };
    } catch (error) {
      logger.error('Failed to get receipt market data:', error);
      throw error;
    }
  }

  /**
   * Get receipt trading history
   */
  async getReceiptTradingHistory(receiptId: string): Promise<ReceiptTrade[]> {
    try {
      // This would typically query database for trades
      return [];
    } catch (error) {
      logger.error('Failed to get receipt trading history:', error);
      throw error;
    }
  }

  /**
   * Create receipt metadata
   */
  private createReceiptMetadata(
    marketInfo: any,
    outcome: string,
    amount: string,
    odds: string,
    tokenId: string
  ): ReceiptMetadata {
    const marketName = marketInfo.description || 'Prediction Market';
    const outcomeText = outcome === 'above' ? 'Above' : 'Below';
    
    return {
      name: `KALE-ndar Receipt #${tokenId.substring(0, 8)}`,
      description: `Prediction receipt for ${marketName} - ${outcomeText} ${marketInfo.targetPrice}`,
      image: this.generateReceiptImage(marketInfo, outcome, amount, odds),
      attributes: [
        {
          trait_type: 'Market',
          value: marketName,
        },
        {
          trait_type: 'Outcome',
          value: outcomeText,
        },
        {
          trait_type: 'Amount',
          value: `${amount} KALE`,
        },
        {
          trait_type: 'Odds',
          value: odds,
        },
        {
          trait_type: 'Target Price',
          value: marketInfo.targetPrice,
        },
        {
          trait_type: 'Rarity',
          value: this.calculateReceiptRarity(amount, odds),
        },
      ],
      external_url: `https://kale-ndar.com/receipt/${tokenId}`,
      animation_url: this.generateReceiptAnimation(marketInfo, outcome),
    };
  }

  /**
   * Generate receipt image
   */
  private generateReceiptImage(
    marketInfo: any,
    outcome: string,
    amount: string,
    odds: string
  ): string {
    // This would typically generate a dynamic image
    // For now, returning a placeholder
    return `https://kale-ndar.com/api/receipt-image?market=${marketInfo.id}&outcome=${outcome}&amount=${amount}&odds=${odds}`;
  }

  /**
   * Generate receipt animation
   */
  private generateReceiptAnimation(marketInfo: any, outcome: string): string {
    // This would typically generate a dynamic animation
    return `https://kale-ndar.com/api/receipt-animation?market=${marketInfo.id}&outcome=${outcome}`;
  }

  /**
   * Calculate receipt rarity
   */
  private calculateReceiptRarity(amount: string, odds: string): string {
    const amountNum = parseFloat(amount);
    const oddsNum = parseFloat(odds);
    
    if (amountNum > 10000 && oddsNum > 5) {
      return 'Legendary';
    } else if (amountNum > 5000 && oddsNum > 3) {
      return 'Epic';
    } else if (amountNum > 1000 && oddsNum > 2) {
      return 'Rare';
    } else {
      return 'Common';
    }
  }

  /**
   * Mint NFT on Soroban contract
   */
  private async mintNFTOnContract(
    ownerKeypair: Keypair,
    tokenId: string,
    metadata: ReceiptMetadata,
    betId: string
  ): Promise<TransactionResult> {
    try {
      const contract = new SorobanClient.Contract(this.nftContractId);
      
      const result = await contract.call(
        'mint',
        ownerKeypair.publicKey(),
        tokenId,
        metadata,
        betId
      );

      return {
        hash: result.hash || '',
        ledger: result.ledger || 0,
        success: true,
        result: result,
      };
    } catch (error) {
      logger.error('Failed to mint NFT on contract:', error);
      throw error;
    }
  }

  /**
   * Transfer receipt ownership
   */
  private async transferReceiptOwnership(
    fromKeypair: Keypair,
    toAddress: string,
    receiptId: string
  ): Promise<void> {
    try {
      const contract = new SorobanClient.Contract(this.nftContractId);
      
      await contract.call(
        'transfer',
        fromKeypair.publicKey(),
        toAddress,
        receiptId
      );
    } catch (error) {
      logger.error('Failed to transfer receipt ownership:', error);
      throw error;
    }
  }

  /**
   * Create receipt market offer
   */
  private async createReceiptMarketOffer(
    sellerKeypair: Keypair,
    receiptId: string,
    askPrice: string
  ): Promise<void> {
    try {
      // This would create a market offer on Stellar DEX
      // For now, just logging
      logger.info('Receipt market offer created:', {
        receiptId,
        seller: sellerKeypair.publicKey(),
        askPrice,
      });
    } catch (error) {
      logger.error('Failed to create receipt market offer:', error);
      throw error;
    }
  }

  /**
   * Create receipt bid offer
   */
  private async createReceiptBidOffer(
    buyerKeypair: Keypair,
    receiptId: string,
    bidPrice: string
  ): Promise<void> {
    try {
      // This would create a bid offer on Stellar DEX
      logger.info('Receipt bid offer created:', {
        receiptId,
        buyer: buyerKeypair.publicKey(),
        bidPrice,
      });
    } catch (error) {
      logger.error('Failed to create receipt bid offer:', error);
      throw error;
    }
  }

  /**
   * Store receipt in database
   */
  private async storeReceipt(receipt: PredictionReceipt): Promise<void> {
    // This would typically store in database
    logger.info('Receipt stored:', receipt);
  }

  /**
   * Store receipt market
   */
  private async storeReceiptMarket(market: ReceiptMarket): Promise<void> {
    logger.info('Receipt market stored:', market);
  }

  /**
   * Store receipt offer
   */
  private async storeReceiptOffer(offer: ReceiptOffer): Promise<void> {
    logger.info('Receipt offer stored:', offer);
  }

  /**
   * Store receipt trade
   */
  private async storeReceiptTrade(trade: ReceiptTrade): Promise<void> {
    logger.info('Receipt trade stored:', trade);
  }

  /**
   * Update receipt
   */
  private async updateReceipt(receipt: PredictionReceipt): Promise<void> {
    logger.info('Receipt updated:', receipt);
  }
}
