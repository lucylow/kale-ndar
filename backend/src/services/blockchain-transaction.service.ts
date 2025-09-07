import { Keypair, Server, TransactionBuilder, Networks, Operation, Asset, Memo } from '@stellar/stellar-sdk';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  data?: any;
}

export interface MarketCreationTransaction {
  marketId: string;
  creatorAddress: string;
  initialLiquidity: number;
  fee: number;
  title: string;
  description: string;
  endDate: string;
  options: string[];
}

export interface BetTransaction {
  betId: string;
  marketId: string;
  userAddress: string;
  amount: number;
  optionId: string;
  betType: 'yes' | 'no';
}

export class BlockchainTransactionService {
  private server: Server;
  private networkPassphrase: string;
  private kaleTokenContractId: string;
  private marketFactoryContractId: string;

  constructor() {
    // Use testnet for demo
    this.server = new Server('https://horizon-testnet.stellar.org');
    this.networkPassphrase = Networks.TESTNET;
    this.kaleTokenContractId = process.env.KALE_TOKEN_CONTRACT_ID || 'test-kale-contract';
    this.marketFactoryContractId = process.env.MARKET_FACTORY_CONTRACT_ID || 'test-market-factory';
  }

  /**
   * Create a market transaction on the blockchain
   */
  async createMarketTransaction(transactionData: MarketCreationTransaction): Promise<TransactionResult> {
    try {
      const creatorKeypair = Keypair.fromSecret(process.env.DEMO_CREATOR_SECRET || '');
      
      // Get account info
      const account = await this.server.loadAccount(creatorKeypair.publicKey());

      // Create transaction
      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.invokeHostFunction({
            contract: this.marketFactoryContractId,
            func: 'create_market',
            args: [
              transactionData.marketId,
              transactionData.title,
              transactionData.description,
              transactionData.endDate,
              JSON.stringify(transactionData.options),
              transactionData.initialLiquidity.toString(),
              transactionData.fee.toString(),
            ],
          })
        )
        .addMemo(Memo.text(`Market: ${transactionData.title}`))
        .setTimeout(30)
        .build();

      // Sign transaction
      transaction.sign(creatorKeypair);

      // Submit transaction
      const result = await this.server.submitTransaction(transaction);

      logger.info(`Market creation transaction submitted: ${result.hash}`);

      return {
        success: true,
        transactionHash: result.hash,
        data: {
          marketId: transactionData.marketId,
          creatorAddress: transactionData.creatorAddress,
          transactionHash: result.hash,
        },
      };

    } catch (error) {
      logger.error('Failed to create market transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a bet transaction on the blockchain
   */
  async createBetTransaction(transactionData: BetTransaction): Promise<TransactionResult> {
    try {
      const userKeypair = Keypair.fromSecret(process.env.DEMO_USER_SECRET || '');
      
      // Get account info
      const account = await this.server.loadAccount(userKeypair.publicKey());

      // First, approve KALE token spending
      const approveTransaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.invokeHostFunction({
            contract: this.kaleTokenContractId,
            func: 'approve',
            args: [
              this.marketFactoryContractId,
              transactionData.amount.toString(),
            ],
          })
        )
        .setTimeout(30)
        .build();

      approveTransaction.sign(userKeypair);
      await this.server.submitTransaction(approveTransaction);

      // Then, place the bet
      const betTransaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.invokeHostFunction({
            contract: this.marketFactoryContractId,
            func: 'place_bet',
            args: [
              transactionData.marketId,
              transactionData.optionId,
              transactionData.amount.toString(),
              transactionData.betType,
            ],
          })
        )
        .addMemo(Memo.text(`Bet: ${transactionData.betId}`))
        .setTimeout(30)
        .build();

      betTransaction.sign(userKeypair);
      const result = await this.server.submitTransaction(betTransaction);

      logger.info(`Bet transaction submitted: ${result.hash}`);

      return {
        success: true,
        transactionHash: result.hash,
        data: {
          betId: transactionData.betId,
          marketId: transactionData.marketId,
          userAddress: transactionData.userAddress,
          transactionHash: result.hash,
        },
      };

    } catch (error) {
      logger.error('Failed to create bet transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionHash: string): Promise<TransactionResult> {
    try {
      const transaction = await this.server.transactions().transaction(transactionHash).call();
      
      return {
        success: true,
        data: {
          hash: transaction.hash,
          status: transaction.successful ? 'success' : 'failed',
          ledger: transaction.ledger,
          createdAt: transaction.created_at,
        },
      };
    } catch (error) {
      logger.error('Failed to get transaction status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user's KALE balance
   */
  async getUserKaleBalance(userAddress: string): Promise<number> {
    try {
      // This would typically call the KALE token contract
      // For demo purposes, return a mock balance
      return 10000; // 10,000 KALE
    } catch (error) {
      logger.error('Failed to get user balance:', error);
      return 0;
    }
  }

  /**
   * Transfer KALE tokens (for demo purposes)
   */
  async transferKale(fromAddress: string, toAddress: string, amount: number): Promise<TransactionResult> {
    try {
      const fromKeypair = Keypair.fromSecret(process.env.DEMO_CREATOR_SECRET || '');
      
      const account = await this.server.loadAccount(fromKeypair.publicKey());

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.invokeHostFunction({
            contract: this.kaleTokenContractId,
            func: 'transfer',
            args: [
              fromAddress,
              toAddress,
              amount.toString(),
            ],
          })
        )
        .addMemo(Memo.text(`Transfer: ${amount} KALE`))
        .setTimeout(30)
        .build();

      transaction.sign(fromKeypair);
      const result = await this.server.submitTransaction(transaction);

      return {
        success: true,
        transactionHash: result.hash,
        data: {
          fromAddress,
          toAddress,
          amount,
          transactionHash: result.hash,
        },
      };

    } catch (error) {
      logger.error('Failed to transfer KALE:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Resolve market transaction
   */
  async resolveMarketTransaction(marketId: string, winningOption: string): Promise<TransactionResult> {
    try {
      const resolverKeypair = Keypair.fromSecret(process.env.DEMO_CREATOR_SECRET || '');
      
      const account = await this.server.loadAccount(resolverKeypair.publicKey());

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.invokeHostFunction({
            contract: this.marketFactoryContractId,
            func: 'resolve_market',
            args: [
              marketId,
              winningOption,
            ],
          })
        )
        .addMemo(Memo.text(`Resolve: ${marketId}`))
        .setTimeout(30)
        .build();

      transaction.sign(resolverKeypair);
      const result = await this.server.submitTransaction(transaction);

      return {
        success: true,
        transactionHash: result.hash,
        data: {
          marketId,
          winningOption,
          transactionHash: result.hash,
        },
      };

    } catch (error) {
      logger.error('Failed to resolve market:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
