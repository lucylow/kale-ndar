import { Server, Keypair, TransactionBuilder, Networks, Operation, Asset, Account, SorobanRpc } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { logger } from '../utils/logger';
import Big from 'big.js';

export interface StellarConfig {
  horizonUrl: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  kaleTokenContractId: string;
  kaleIntegrationContractId: string;
  feeCollectorAddress: string;
}

export interface TransactionResult {
  hash: string;
  ledger: number;
  success: boolean;
  result?: any;
  error?: string;
}

export interface AccountInfo {
  accountId: string;
  sequence: string;
  balances: Array<{
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
    balance: string;
  }>;
}

export class StellarRpcService {
  private server: Server;
  private sorobanClient: SorobanClient;
  private config: StellarConfig;

  constructor(config: StellarConfig) {
    this.config = config;
    this.server = new Server(config.horizonUrl);
    this.sorobanClient = new SorobanClient(config.sorobanRpcUrl);
  }

  /**
   * Get account information from Stellar network
   */
  async getAccountInfo(accountId: string): Promise<AccountInfo> {
    try {
      const account = await this.server.loadAccount(accountId);
      
      return {
        accountId: account.accountId(),
        sequence: account.sequenceNumber(),
        balances: account.balances.map(balance => ({
          asset_type: balance.asset_type,
          asset_code: balance.asset_code,
          asset_issuer: balance.asset_issuer,
          balance: balance.balance,
        })),
      };
    } catch (error) {
      logger.error('Failed to get account info:', error);
      throw new Error(`Failed to load account ${accountId}: ${error.message}`);
    }
  }

  /**
   * Get KALE token balance for an account
   */
  async getKaleBalance(accountId: string): Promise<string> {
    try {
      const contract = new SorobanClient.Contract(this.config.kaleTokenContractId);
      const result = await contract.call('balance', accountId);
      return result.toString();
    } catch (error) {
      logger.error('Failed to get KALE balance:', error);
      return '0';
    }
  }

  /**
   * Create and submit a transaction to the Stellar network
   */
  async submitTransaction(
    sourceKeypair: Keypair,
    operations: Operation[],
    memo?: string,
    timebounds?: { minTime: number; maxTime: number }
  ): Promise<TransactionResult> {
    try {
      const account = await this.getAccountInfo(sourceKeypair.publicKey());
      
      const transaction = new TransactionBuilder(account, {
        fee: await this.server.fetchBaseFee(),
        networkPassphrase: this.config.networkPassphrase,
        timebounds: timebounds || { minTime: 0, maxTime: 0 },
      });

      // Add operations
      operations.forEach(op => transaction.addOperation(op));

      // Add memo if provided
      if (memo) {
        transaction.addMemo(memo);
      }

      // Set timeout
      transaction.setTimeout(120);

      // Build and sign transaction
      const tx = transaction.build();
      tx.sign(sourceKeypair);

      // Submit transaction
      const result = await this.server.submitTransaction(tx);

      return {
        hash: result.hash,
        ledger: result.ledger,
        success: !result.error,
        result: result.result,
        error: result.error,
      };
    } catch (error) {
      logger.error('Failed to submit transaction:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Transfer KALE tokens between accounts
   */
  async transferKale(
    senderKeypair: Keypair,
    recipientAddress: string,
    amount: string
  ): Promise<TransactionResult> {
    try {
      const kaleAsset = new Asset('KALE', this.config.kaleTokenContractId);
      
      const operation = Operation.payment({
        destination: recipientAddress,
        asset: kaleAsset,
        amount: amount,
      });

      return await this.submitTransaction(senderKeypair, [operation]);
    } catch (error) {
      logger.error('Failed to transfer KALE:', error);
      throw error;
    }
  }

  /**
   * Create a market offer on Stellar DEX
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
      const operation = Operation.manageSellOffer({
        selling: sellingAsset,
        buying: buyingAsset,
        amount: amount,
        price: price,
        offerId: offerId,
      });

      return await this.submitTransaction(sellerKeypair, [operation]);
    } catch (error) {
      logger.error('Failed to create market offer:', error);
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
      const operation = Operation.manageSellOffer({
        selling: sellingAsset,
        buying: buyingAsset,
        amount: '0',
        price: '0',
        offerId: offerId,
      });

      return await this.submitTransaction(sellerKeypair, [operation]);
    } catch (error) {
      logger.error('Failed to cancel market offer:', error);
      throw error;
    }
  }

  /**
   * Get order book for a trading pair
   */
  async getOrderBook(sellingAsset: Asset, buyingAsset: Asset): Promise<any> {
    try {
      return await this.server.orderbook(sellingAsset, buyingAsset).call();
    } catch (error) {
      logger.error('Failed to get order book:', error);
      throw error;
    }
  }

  /**
   * Get recent transactions for an account
   */
  async getAccountTransactions(
    accountId: string,
    limit: number = 10,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<any[]> {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(accountId)
        .order(order)
        .limit(limit)
        .call();

      return transactions.records;
    } catch (error) {
      logger.error('Failed to get account transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: string): Promise<any> {
    try {
      return await this.server.transactions().transaction(hash).call();
    } catch (error) {
      logger.error('Failed to get transaction:', error);
      throw error;
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<any> {
    try {
      const ledger = await this.server.ledgers().order('desc').limit(1).call();
      const latestLedger = ledger.records[0];

      return {
        latestLedger: latestLedger.sequence,
        latestLedgerCloseTime: latestLedger.closed_at,
        network: this.config.networkPassphrase === Networks.PUBLIC ? 'mainnet' : 'testnet',
        horizonUrl: this.config.horizonUrl,
        sorobanRpcUrl: this.config.sorobanRpcUrl,
      };
    } catch (error) {
      logger.error('Failed to get network stats:', error);
      throw error;
    }
  }

  /**
   * Check if account exists
   */
  async accountExists(accountId: string): Promise<boolean> {
    try {
      await this.getAccountInfo(accountId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get account sequence number
   */
  async getAccountSequence(accountId: string): Promise<string> {
    try {
      const account = await this.getAccountInfo(accountId);
      return account.sequence;
    } catch (error) {
      logger.error('Failed to get account sequence:', error);
      throw error;
    }
  }

  /**
   * Create a new account (fund with XLM)
   */
  async createAccount(
    destinationKeypair: Keypair,
    startingBalance: string = '10'
  ): Promise<TransactionResult> {
    try {
      const operation = Operation.createAccount({
        destination: destinationKeypair.publicKey(),
        startingBalance: startingBalance,
      });

      // This would typically be called by a funded account
      throw new Error('Create account operation requires a funded source account');
    } catch (error) {
      logger.error('Failed to create account:', error);
      throw error;
    }
  }

  /**
   * Fund account with XLM
   */
  async fundAccount(
    sourceKeypair: Keypair,
    destinationAddress: string,
    amount: string
  ): Promise<TransactionResult> {
    try {
      const operation = Operation.payment({
        destination: destinationAddress,
        asset: Asset.native(),
        amount: amount,
      });

      return await this.submitTransaction(sourceKeypair, [operation]);
    } catch (error) {
      logger.error('Failed to fund account:', error);
      throw error;
    }
  }

  /**
   * Get current network fee
   */
  async getCurrentFee(): Promise<string> {
    try {
      const fee = await this.server.fetchBaseFee();
      return fee.toString();
    } catch (error) {
      logger.error('Failed to get current fee:', error);
      return '100'; // Default fee
    }
  }

  /**
   * Validate Stellar address
   */
  static isValidAddress(address: string): boolean {
    try {
      Keypair.fromPublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a new keypair
   */
  static generateKeypair(): Keypair {
    return Keypair.random();
  }

  /**
   * Create keypair from secret
   */
  static createKeypairFromSecret(secret: string): Keypair {
    return Keypair.fromSecret(secret);
  }

  /**
   * Create keypair from public key
   */
  static createKeypairFromPublicKey(publicKey: string): Keypair {
    return Keypair.fromPublicKey(publicKey);
  }
}
