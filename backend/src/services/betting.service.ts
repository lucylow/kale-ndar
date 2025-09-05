import { Keypair } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { KaleTokenService } from './kale-token.service';
import { MarketCreationService, MarketInfo } from './market-creation.service';
import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export interface BetRequest {
  marketId: string;
  userId: string;
  outcome: string;
  amount: string;
  userSecret: string; // For signing transactions
}

export interface Bet {
  id: string;
  marketId: string;
  userId: string;
  outcome: string;
  amount: string;
  placedAt: number;
  settled: boolean;
  payoutAmount?: string;
  transactionHash?: string;
  odds?: string;
}

export interface BettingStats {
  totalBets: number;
  totalVolume: string;
  winRate: number;
  averageBetSize: string;
  totalPayouts: string;
}

export interface MarketBettingInfo {
  marketId: string;
  totalFor: string;
  totalAgainst: string;
  totalVolume: string;
  forOdds: string;
  againstOdds: string;
  activeBets: number;
  resolvedBets: number;
}

export interface PayoutCalculation {
  betId: string;
  userId: string;
  outcome: string;
  betAmount: string;
  payoutAmount: string;
  isWinner: boolean;
  profitLoss: string;
}

export class BettingService {
  private stellarRpc: StellarRpcService;
  private kaleToken: KaleTokenService;
  private marketService: MarketCreationService;
  private kaleIntegrationContractId: string;

  constructor(
    stellarRpc: StellarRpcService,
    kaleToken: KaleTokenService,
    marketService: MarketCreationService,
    kaleIntegrationContractId: string
  ) {
    this.stellarRpc = stellarRpc;
    this.kaleToken = kaleToken;
    this.marketService = marketService;
    this.kaleIntegrationContractId = kaleIntegrationContractId;
  }

  /**
   * Place a bet on a prediction market
   */
  async placeBet(request: BetRequest): Promise<Bet> {
    try {
      // Validate bet request
      this.validateBetRequest(request);

      // Get market information
      const market = await this.marketService.getMarketInfo(request.marketId);
      
      // Validate market is open for betting
      await this.validateMarketForBetting(market);

      // Validate outcome
      this.validateOutcome(request.outcome, market);

      // Check user balance
      const userBalance = await this.kaleToken.getBalance(request.userId);
      if (new Big(userBalance.balance).lt(new Big(request.amount))) {
        throw new Error('Insufficient KALE balance for bet');
      }

      // Create user keypair from secret
      const userKeypair = Keypair.fromSecret(request.userSecret);

      // Place bet on contract
      const betId = await this.placeBetOnContract(userKeypair, request);

      // Calculate odds
      const odds = await this.calculateOdds(request.marketId, request.outcome);

      // Create bet record
      const bet: Bet = {
        id: betId,
        marketId: request.marketId,
        userId: request.userId,
        outcome: request.outcome,
        amount: request.amount,
        placedAt: Date.now(),
        settled: false,
        odds: odds,
      };

      logger.info('Bet placed successfully:', {
        betId,
        marketId: request.marketId,
        userId: request.userId,
        outcome: request.outcome,
        amount: request.amount,
        odds,
      });

      return bet;
    } catch (error) {
      logger.error('Failed to place bet:', error);
      throw error;
    }
  }

  /**
   * Place bet on Soroban contract
   */
  private async placeBetOnContract(
    userKeypair: Keypair,
    request: BetRequest
  ): Promise<string> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      const result = await contract.call(
        'place_bet',
        userKeypair.publicKey(),
        request.marketId,
        request.outcome,
        request.amount
      );

      return result.toString();
    } catch (error) {
      logger.error('Failed to place bet on contract:', error);
      throw error;
    }
  }

  /**
   * Calculate payouts for a resolved market
   */
  async calculatePayouts(marketId: string, winningOutcome: string): Promise<PayoutCalculation[]> {
    try {
      // Get all bets for the market
      const bets = await this.getBetsForMarket(marketId);
      
      if (bets.length === 0) {
        logger.info('No bets found for market:', { marketId });
        return [];
      }

      // Calculate total pool and winning pool
      const totalPool = bets.reduce((sum, bet) => sum.plus(new Big(bet.amount)), new Big(0));
      const winningBets = bets.filter(bet => bet.outcome === winningOutcome);
      const winningPool = winningBets.reduce((sum, bet) => sum.plus(new Big(bet.amount)), new Big(0));

      if (winningPool.eq(0)) {
        logger.info('No winning bets found for market:', { marketId, winningOutcome });
        // All bets lose - no payouts
        return bets.map(bet => ({
          betId: bet.id,
          userId: bet.userId,
          outcome: bet.outcome,
          betAmount: bet.amount,
          payoutAmount: '0',
          isWinner: false,
          profitLoss: new Big(bet.amount).neg().toString(),
        }));
      }

      // Calculate payouts proportionally
      const payouts: PayoutCalculation[] = [];
      
      for (const bet of bets) {
        const isWinner = bet.outcome === winningOutcome;
        let payoutAmount = '0';
        let profitLoss = new Big(bet.amount).neg().toString();

        if (isWinner) {
          // Proportional payout: (bet_amount / winning_pool) * total_pool
          const betShare = new Big(bet.amount).div(winningPool);
          payoutAmount = betShare.mul(totalPool).toString();
          profitLoss = new Big(payoutAmount).minus(new Big(bet.amount)).toString();
        }

        payouts.push({
          betId: bet.id,
          userId: bet.userId,
          outcome: bet.outcome,
          betAmount: bet.amount,
          payoutAmount,
          isWinner,
          profitLoss,
        });
      }

      logger.info('Payouts calculated:', {
        marketId,
        winningOutcome,
        totalBets: bets.length,
        winningBets: winningBets.length,
        totalPool: totalPool.toString(),
        winningPool: winningPool.toString(),
      });

      return payouts;
    } catch (error) {
      logger.error('Failed to calculate payouts:', error);
      throw error;
    }
  }

  /**
   * Settle bets and distribute payouts
   */
  async settleBets(marketId: string, winningOutcome: string): Promise<TransactionResult[]> {
    try {
      const payouts = await this.calculatePayouts(marketId, winningOutcome);
      const transactions: TransactionResult[] = [];

      for (const payout of payouts) {
        if (payout.isWinner && new Big(payout.payoutAmount).gt(0)) {
          // Transfer payout to winner
          const userKeypair = Keypair.fromSecret(process.env.SYSTEM_SECRET || '');
          const transaction = await this.kaleToken.transfer(
            userKeypair,
            payout.userId,
            payout.payoutAmount,
            `Payout for bet ${payout.betId}`
          );
          transactions.push(transaction);
        }

        // Mark bet as settled
        await this.markBetAsSettled(payout.betId, payout.payoutAmount);
      }

      logger.info('Bets settled successfully:', {
        marketId,
        winningOutcome,
        totalPayouts: payouts.length,
        transactions: transactions.length,
      });

      return transactions;
    } catch (error) {
      logger.error('Failed to settle bets:', error);
      throw error;
    }
  }

  /**
   * Get bets for a specific market
   */
  async getBetsForMarket(marketId: string): Promise<Bet[]> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      const result = await contract.call('get_market_bets', marketId);
      
      return result.map((betData: any) => ({
        id: betData.id.toString(),
        marketId: betData.market_id.toString(),
        userId: betData.user_id.toString(),
        outcome: betData.outcome.toString(),
        amount: betData.amount.toString(),
        placedAt: betData.placed_at,
        settled: betData.settled,
        payoutAmount: betData.payout_amount?.toString(),
        transactionHash: betData.transaction_hash?.toString(),
        odds: betData.odds?.toString(),
      }));
    } catch (error) {
      logger.error('Failed to get bets for market:', error);
      throw error;
    }
  }

  /**
   * Get user's bets
   */
  async getUserBets(userId: string): Promise<Bet[]> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      const result = await contract.call('get_user_bets', userId);
      
      return result.map((betData: any) => ({
        id: betData.id.toString(),
        marketId: betData.market_id.toString(),
        userId: betData.user_id.toString(),
        outcome: betData.outcome.toString(),
        amount: betData.amount.toString(),
        placedAt: betData.placed_at,
        settled: betData.settled,
        payoutAmount: betData.payout_amount?.toString(),
        transactionHash: betData.transaction_hash?.toString(),
        odds: betData.odds?.toString(),
      }));
    } catch (error) {
      logger.error('Failed to get user bets:', error);
      throw error;
    }
  }

  /**
   * Get betting statistics for a user
   */
  async getUserBettingStats(userId: string): Promise<BettingStats> {
    try {
      const userBets = await this.getUserBets(userId);
      const settledBets = userBets.filter(bet => bet.settled);
      
      const totalBets = userBets.length;
      const totalVolume = userBets.reduce((sum, bet) => sum.plus(new Big(bet.amount)), new Big(0)).toString();
      
      const winningBets = settledBets.filter(bet => 
        bet.payoutAmount && new Big(bet.payoutAmount).gt(0)
      );
      const winRate = totalBets > 0 ? (winningBets.length / totalBets) * 100 : 0;
      
      const averageBetSize = totalBets > 0 
        ? new Big(totalVolume).div(totalBets).toString() 
        : '0';
      
      const totalPayouts = settledBets.reduce((sum, bet) => 
        sum.plus(new Big(bet.payoutAmount || '0')), new Big(0)
      ).toString();

      return {
        totalBets,
        totalVolume,
        winRate,
        averageBetSize,
        totalPayouts,
      };
    } catch (error) {
      logger.error('Failed to get user betting stats:', error);
      throw error;
    }
  }

  /**
   * Get market betting information
   */
  async getMarketBettingInfo(marketId: string): Promise<MarketBettingInfo> {
    try {
      const market = await this.marketService.getMarketInfo(marketId);
      const bets = await this.getBetsForMarket(marketId);
      
      const forBets = bets.filter(bet => bet.outcome === 'for' || bet.outcome === 'above');
      const againstBets = bets.filter(bet => bet.outcome === 'against' || bet.outcome === 'below');
      
      const totalFor = forBets.reduce((sum, bet) => sum.plus(new Big(bet.amount)), new Big(0)).toString();
      const totalAgainst = againstBets.reduce((sum, bet) => sum.plus(new Big(bet.amount)), new Big(0)).toString();
      const totalVolume = new Big(totalFor).plus(new Big(totalAgainst)).toString();
      
      const forOdds = this.calculateOddsFromPools(totalFor, totalAgainst);
      const againstOdds = this.calculateOddsFromPools(totalAgainst, totalFor);
      
      const activeBets = bets.filter(bet => !bet.settled).length;
      const resolvedBets = bets.filter(bet => bet.settled).length;

      return {
        marketId,
        totalFor,
        totalAgainst,
        totalVolume,
        forOdds,
        againstOdds,
        activeBets,
        resolvedBets,
      };
    } catch (error) {
      logger.error('Failed to get market betting info:', error);
      throw error;
    }
  }

  /**
   * Calculate odds for a specific outcome
   */
  async calculateOdds(marketId: string, outcome: string): Promise<string> {
    try {
      const bettingInfo = await this.getMarketBettingInfo(marketId);
      
      if (outcome === 'for' || outcome === 'above') {
        return bettingInfo.forOdds;
      } else {
        return bettingInfo.againstOdds;
      }
    } catch (error) {
      logger.error('Failed to calculate odds:', error);
      return '1.0';
    }
  }

  /**
   * Calculate odds from betting pools
   */
  private calculateOddsFromPools(outcomePool: string, oppositePool: string): string {
    try {
      const outcome = new Big(outcomePool);
      const opposite = new Big(oppositePool);
      const total = outcome.plus(opposite);
      
      if (total.eq(0)) {
        return '1.0';
      }
      
      // Decimal odds: total_pool / outcome_pool
      return total.div(outcome).toFixed(2);
    } catch (error) {
      logger.error('Failed to calculate odds from pools:', error);
      return '1.0';
    }
  }

  /**
   * Cancel a bet (if market allows it)
   */
  async cancelBet(betId: string, userSecret: string): Promise<TransactionResult> {
    try {
      const userKeypair = Keypair.fromSecret(userSecret);
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      
      const result = await contract.call('cancel_bet', userKeypair.publicKey(), betId);
      
      logger.info('Bet cancelled successfully:', { betId });
      
      return {
        hash: result.hash || '',
        ledger: result.ledger || 0,
        success: true,
        result: result,
      };
    } catch (error) {
      logger.error('Failed to cancel bet:', error);
      throw error;
    }
  }

  /**
   * Validate bet request
   */
  private validateBetRequest(request: BetRequest): void {
    if (!request.marketId) {
      throw new Error('Market ID is required');
    }
    
    if (!request.userId) {
      throw new Error('User ID is required');
    }
    
    if (!request.outcome) {
      throw new Error('Outcome is required');
    }
    
    if (!request.amount || new Big(request.amount).lte(0)) {
      throw new Error('Amount must be greater than 0');
    }
    
    if (!request.userSecret) {
      throw new Error('User secret is required for transaction signing');
    }
  }

  /**
   * Validate market is open for betting
   */
  private async validateMarketForBetting(market: MarketInfo): Promise<void> {
    const now = Date.now();
    
    if (market.resolved) {
      throw new Error('Market is already resolved');
    }
    
    if (now >= market.resolveTime) {
      throw new Error('Market betting period has ended');
    }
    
    // Additional validation could be added here for market start time
  }

  /**
   * Validate outcome is valid for the market
   */
  private validateOutcome(outcome: string, market: MarketInfo): void {
    const validOutcomes = ['for', 'against', 'above', 'below'];
    
    if (!validOutcomes.includes(outcome)) {
      throw new Error(`Invalid outcome: ${outcome}. Must be one of: ${validOutcomes.join(', ')}`);
    }
    
    // Additional validation based on market type
    if (market.condition === 'above' && !['above', 'below'].includes(outcome)) {
      throw new Error('Outcome must be "above" or "below" for this market type');
    }
  }

  /**
   * Mark bet as settled
   */
  private async markBetAsSettled(betId: string, payoutAmount: string): Promise<void> {
    try {
      const contract = new SorobanClient.Contract(this.kaleIntegrationContractId);
      await contract.call('settle_bet', betId, payoutAmount);
      
      logger.info('Bet marked as settled:', { betId, payoutAmount });
    } catch (error) {
      logger.error('Failed to mark bet as settled:', error);
      throw error;
    }
  }

  /**
   * Get global betting statistics
   */
  async getGlobalBettingStats(): Promise<BettingStats> {
    try {
      // This would typically aggregate data from all markets
      // For now, returning mock data
      return {
        totalBets: 0,
        totalVolume: '0',
        winRate: 0,
        averageBetSize: '0',
        totalPayouts: '0',
      };
    } catch (error) {
      logger.error('Failed to get global betting stats:', error);
      throw error;
    }
  }
}
