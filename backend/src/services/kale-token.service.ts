import { Asset, Keypair, Operation } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { logger } from '../utils/logger';
import Big from 'big.js';

export interface KaleTokenConfig {
  contractId: string;
  issuerAddress: string;
  totalSupply: string;
  decimals: number;
  symbol: string;
  name: string;
}

export interface TokenBalance {
  address: string;
  balance: string;
  formattedBalance: string;
  contractId: string;
}

export interface TokenTransfer {
  from: string;
  to: string;
  amount: string;
  memo?: string;
}

export interface TokenInfo {
  contractId: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  issuer: string;
}

export class KaleTokenService {
  private stellarRpc: StellarRpcService;
  private config: KaleTokenConfig;
  private kaleAsset: Asset;

  constructor(stellarRpc: StellarRpcService, config: KaleTokenConfig) {
    this.stellarRpc = stellarRpc;
    this.config = config;
    this.kaleAsset = new Asset(config.symbol, config.issuerAddress);
  }

  /**
   * Get KALE token information
   */
  async getTokenInfo(): Promise<TokenInfo> {
    try {
      return {
        contractId: this.config.contractId,
        symbol: this.config.symbol,
        name: this.config.name,
        decimals: this.config.decimals,
        totalSupply: this.config.totalSupply,
        issuer: this.config.issuerAddress,
      };
    } catch (error) {
      logger.error('Failed to get token info:', error);
      throw error;
    }
  }

  /**
   * Get KALE balance for an address
   */
  async getBalance(address: string): Promise<TokenBalance> {
    try {
      const balance = await this.stellarRpc.getKaleBalance(address);
      const formattedBalance = this.formatBalance(balance);

      return {
        address,
        balance,
        formattedBalance,
        contractId: this.config.contractId,
      };
    } catch (error) {
      logger.error('Failed to get KALE balance:', error);
      throw error;
    }
  }

  /**
   * Transfer KALE tokens
   */
  async transfer(
    senderKeypair: Keypair,
    recipientAddress: string,
    amount: string,
    memo?: string
  ): Promise<TransactionResult> {
    try {
      // Validate amount
      if (!this.isValidAmount(amount)) {
        throw new Error('Invalid amount format');
      }

      // Check sender balance
      const senderBalance = await this.getBalance(senderKeypair.publicKey());
      if (new Big(senderBalance.balance).lt(new Big(amount))) {
        throw new Error('Insufficient KALE balance');
      }

      // Perform transfer
      const result = await this.stellarRpc.transferKale(
        senderKeypair,
        recipientAddress,
        amount
      );

      logger.info('KALE transfer completed:', {
        from: senderKeypair.publicKey(),
        to: recipientAddress,
        amount,
        hash: result.hash,
      });

      return result;
    } catch (error) {
      logger.error('Failed to transfer KALE:', error);
      throw error;
    }
  }

  /**
   * Mint KALE tokens (admin only)
   */
  async mint(
    adminKeypair: Keypair,
    recipientAddress: string,
    amount: string
  ): Promise<TransactionResult> {
    try {
      // This would typically be implemented in the Soroban contract
      // For now, we'll simulate it with a transfer from the issuer
      const issuerKeypair = Keypair.fromSecret(process.env.KALE_ISSUER_SECRET || '');
      
      return await this.transfer(issuerKeypair, recipientAddress, amount);
    } catch (error) {
      logger.error('Failed to mint KALE:', error);
      throw error;
    }
  }

  /**
   * Burn KALE tokens
   */
  async burn(
    ownerKeypair: Keypair,
    amount: string
  ): Promise<TransactionResult> {
    try {
      // This would typically be implemented in the Soroban contract
      // For now, we'll simulate it by transferring to a burn address
      const burnAddress = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'; // Burn address
      
      return await this.transfer(ownerKeypair, burnAddress, amount);
    } catch (error) {
      logger.error('Failed to burn KALE:', error);
      throw error;
    }
  }

  /**
   * Approve KALE tokens for spending by another address
   */
  async approve(
    ownerKeypair: Keypair,
    spenderAddress: string,
    amount: string
  ): Promise<TransactionResult> {
    try {
      // This would typically be implemented in the Soroban contract
      // For now, we'll simulate it
      throw new Error('Approve functionality not implemented in current contract');
    } catch (error) {
      logger.error('Failed to approve KALE:', error);
      throw error;
    }
  }

  /**
   * Get allowance for a spender
   */
  async getAllowance(
    ownerAddress: string,
    spenderAddress: string
  ): Promise<string> {
    try {
      // This would typically be implemented in the Soroban contract
      // For now, we'll return 0
      return '0';
    } catch (error) {
      logger.error('Failed to get allowance:', error);
      throw error;
    }
  }

  /**
   * Create a market offer to sell KALE for XLM
   */
  async createSellOffer(
    sellerKeypair: Keypair,
    amount: string,
    price: string,
    offerId: string = '0'
  ): Promise<TransactionResult> {
    try {
      const xlmAsset = Asset.native();
      
      return await this.stellarRpc.createMarketOffer(
        sellerKeypair,
        this.kaleAsset,
        xlmAsset,
        amount,
        price,
        offerId
      );
    } catch (error) {
      logger.error('Failed to create sell offer:', error);
      throw error;
    }
  }

  /**
   * Create a market offer to buy KALE with XLM
   */
  async createBuyOffer(
    buyerKeypair: Keypair,
    amount: string,
    price: string,
    offerId: string = '0'
  ): Promise<TransactionResult> {
    try {
      const xlmAsset = Asset.native();
      
      return await this.stellarRpc.createMarketOffer(
        buyerKeypair,
        xlmAsset,
        this.kaleAsset,
        amount,
        price,
        offerId
      );
    } catch (error) {
      logger.error('Failed to create buy offer:', error);
      throw error;
    }
  }

  /**
   * Get KALE/XLM order book
   */
  async getOrderBook(): Promise<any> {
    try {
      const xlmAsset = Asset.native();
      return await this.stellarRpc.getOrderBook(this.kaleAsset, xlmAsset);
    } catch (error) {
      logger.error('Failed to get order book:', error);
      throw error;
    }
  }

  /**
   * Get KALE price in XLM
   */
  async getPrice(): Promise<string> {
    try {
      const orderBook = await this.getOrderBook();
      
      if (orderBook.bids && orderBook.bids.length > 0) {
        // Get the highest bid price
        return orderBook.bids[0].price;
      }
      
      if (orderBook.asks && orderBook.asks.length > 0) {
        // Get the lowest ask price
        return orderBook.asks[0].price;
      }
      
      return '0';
    } catch (error) {
      logger.error('Failed to get KALE price:', error);
      return '0';
    }
  }

  /**
   * Get total supply of KALE tokens
   */
  async getTotalSupply(): Promise<string> {
    try {
      return this.config.totalSupply;
    } catch (error) {
      logger.error('Failed to get total supply:', error);
      throw error;
    }
  }

  /**
   * Format balance with proper decimals
   */
  private formatBalance(balance: string): string {
    try {
      const bigBalance = new Big(balance);
      const divisor = new Big(10).pow(this.config.decimals);
      return bigBalance.div(divisor).toFixed(this.config.decimals);
    } catch (error) {
      logger.error('Failed to format balance:', error);
      return '0';
    }
  }

  /**
   * Validate amount format
   */
  private isValidAmount(amount: string): boolean {
    try {
      const bigAmount = new Big(amount);
      return bigAmount.gt(0) && bigAmount.lte(new Big(this.config.totalSupply));
    } catch {
      return false;
    }
  }

  /**
   * Convert amount to smallest unit (considering decimals)
   */
  public toSmallestUnit(amount: string): string {
    try {
      const bigAmount = new Big(amount);
      const multiplier = new Big(10).pow(this.config.decimals);
      return bigAmount.mul(multiplier).toFixed(0);
    } catch (error) {
      logger.error('Failed to convert to smallest unit:', error);
      throw error;
    }
  }

  /**
   * Convert from smallest unit to human readable format
   */
  public fromSmallestUnit(amount: string): string {
    try {
      const bigAmount = new Big(amount);
      const divisor = new Big(10).pow(this.config.decimals);
      return bigAmount.div(divisor).toFixed(this.config.decimals);
    } catch (error) {
      logger.error('Failed to convert from smallest unit:', error);
      throw error;
    }
  }

  /**
   * Get KALE asset object
   */
  public getKaleAsset(): Asset {
    return this.kaleAsset;
  }

  /**
   * Check if address has KALE trustline
   */
  async hasTrustline(address: string): Promise<boolean> {
    try {
      const accountInfo = await this.stellarRpc.getAccountInfo(address);
      return accountInfo.balances.some(
        balance => 
          balance.asset_type === 'credit_alphanum4' &&
          balance.asset_code === this.config.symbol &&
          balance.asset_issuer === this.config.issuerAddress
      );
    } catch (error) {
      logger.error('Failed to check trustline:', error);
      return false;
    }
  }

  /**
   * Create trustline for KALE token
   */
  async createTrustline(accountKeypair: Keypair): Promise<TransactionResult> {
    try {
      const operation = Operation.changeTrust({
        asset: this.kaleAsset,
        limit: '922337203685.4775807', // Max limit
      });

      return await this.stellarRpc.submitTransaction(accountKeypair, [operation]);
    } catch (error) {
      logger.error('Failed to create trustline:', error);
      throw error;
    }
  }
}
