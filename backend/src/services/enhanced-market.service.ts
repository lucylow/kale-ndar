import { Keypair, Asset, Operation, Memo } from '@stellar/stellar-sdk';
import { SorobanClient } from '@stellar/soroban-client';
import { StellarRpcService, TransactionResult } from './stellar-rpc.service';
import { KaleIntegrationService } from './kale-integration.service';
import { ReflectorIntegrationService } from './reflector-integration.service';
import { logger } from '../utils/logger';
import Big from 'big.js';
import { v4 as uuidv4 } from 'uuid';

export enum MarketType {
  BINARY = 'binary',
  MULTIPLE = 'multiple',
  SCALAR = 'scalar',
  CONDITIONAL = 'conditional',
}

export enum ResolutionSource {
  ORACLE = 'oracle',
  COMMUNITY = 'community',
  ADMIN = 'admin',
  AUTOMATED = 'automated',
}

export interface Market {
  id: string;
  creator: string;
  title: string;
  description: string;
  marketType: MarketType;
  outcomes: string[];
  resolutionSource: ResolutionSource;
  resolutionCriteria: string;
  creationTime: number;
  bettingStart: number;
  bettingEnd: number;
  resolutionTime: number;
  minBet: string;
  maxBet: string;
  totalVolume: string;
  totalLiquidity: string;
  isResolved: boolean;
  winningOutcome?: number;
  category: string;
  tags: string[];
  feePercentage: number; // Basis points (100 = 1%)
  kaleBoostEnabled: boolean;
  leagueId?: string;
  contractAddress?: string;
}

export interface MarketLiquidity {
  marketId: string;
  outcomePools: string[];
  totalKaleStaked: string;
  liquidityProviders: string[];
  providerShares: string[];
  lastUpdate: number;
}

export interface PredictionLeague {
  id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  entryFee: string;
  prizePool: string;
  maxParticipants: number;
  marketIds: string[];
  participants: string[];
  leaderboard: Array<{ address: string; score: string }>;
  isTeamBased: boolean;
  teamSize: number;
  createdAt: number;
  isActive: boolean;
}

export interface ConditionalMarketData {
  conditionOracle: string;
  conditionThreshold: string;
  outcomeOracle: string;
  conditionDescription: string;
  outcomeDescription: string;
}

export interface MarketCreationRequest {
  creator: string;
  title: string;
  description: string;
  marketType: MarketType;
  outcomes: string[];
  resolutionSource: ResolutionSource;
  resolutionCriteria: string;
  bettingDuration: number; // seconds
  resolutionDelay: number; // seconds
  category: string;
  tags: string[];
  kaleBoostEnabled: boolean;
  minBet?: string;
  maxBet?: string;
  feePercentage?: number;
  conditionalData?: ConditionalMarketData;
}

export enum MarketError {
  MARKET_NOT_FOUND = 'MARKET_NOT_FOUND',
  INVALID_OUTCOMES = 'INVALID_OUTCOMES',
  ALREADY_RESOLVED = 'ALREADY_RESOLVED',
  RESOLUTION_TOO_EARLY = 'RESOLUTION_TOO_EARLY',
  INVALID_RESOLUTION_SOURCE = 'INVALID_RESOLUTION_SOURCE',
  LEAGUE_NOT_FOUND = 'LEAGUE_NOT_FOUND',
  UNSUPPORTED_MARKET_TYPE = 'UNSUPPORTED_MARKET_TYPE',
  CONDITIONAL_DATA_NOT_FOUND = 'CONDITIONAL_DATA_NOT_FOUND',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
}

export class EnhancedMarketService {
  private stellarRpc: StellarRpcService;
  private kaleService: KaleIntegrationService;
  private reflectorService: ReflectorIntegrationService;
  private markets: Map<string, Market> = new Map();
  private liquidity: Map<string, MarketLiquidity> = new Map();
  private leagues: Map<string, PredictionLeague> = new Map();
  private conditionalMarkets: Map<string, ConditionalMarketData> = new Map();

  constructor(
    stellarRpc: StellarRpcService,
    kaleService: KaleIntegrationService,
    reflectorService: ReflectorIntegrationService
  ) {
    this.stellarRpc = stellarRpc;
    this.kaleService = kaleService;
    this.reflectorService = reflectorService;
  }

  /**
   * Create advanced market with multiple resolution sources
   */
  async createAdvancedMarket(
    creatorKeypair: Keypair,
    request: MarketCreationRequest
  ): Promise<Market> {
    try {
      // Validate market parameters
      this.validateMarketParams(request);

      // Check creator has enough KALE for market fee
      const marketFee = this.calculateMarketFee(request);
      const creatorBalance = await this.kaleService.getPredictionStats(creatorKeypair.publicKey());
      if (new Big(creatorBalance.totalVolume).lt(new Big(marketFee))) {
        throw new Error('Insufficient KALE balance for market creation fee');
      }

      const marketId = uuidv4();
      const currentTime = Date.now();

      // Create market
      const market: Market = {
        id: marketId,
        creator: creatorKeypair.publicKey(),
        title: request.title,
        description: request.description,
        marketType: request.marketType,
        outcomes: request.outcomes,
        resolutionSource: request.resolutionSource,
        resolutionCriteria: request.resolutionCriteria,
        creationTime: currentTime,
        bettingStart: currentTime,
        bettingEnd: currentTime + (request.bettingDuration * 1000),
        resolutionTime: currentTime + ((request.bettingDuration + request.resolutionDelay) * 1000),
        minBet: request.minBet || '1000000', // 1 KALE minimum
        maxBet: request.maxBet || '1000000000000', // 1M KALE maximum
        totalVolume: '0',
        totalLiquidity: '0',
        isResolved: false,
        category: request.category,
        tags: request.tags,
        feePercentage: request.feePercentage || 250, // 2.5% fee
        kaleBoostEnabled: request.kaleBoostEnabled,
      };

      // Initialize market liquidity pools
      const liquidity: MarketLiquidity = {
        marketId,
        outcomePools: request.outcomes.map(() => '0'),
        totalKaleStaked: '0',
        liquidityProviders: [],
        providerShares: [],
        lastUpdate: currentTime,
      };

      // Store market data
      this.markets.set(marketId, market);
      this.liquidity.set(marketId, liquidity);

      // Set up oracle subscription if needed
      if (request.resolutionSource === ResolutionSource.ORACLE) {
        await this.setupOracleSubscription(marketId, request.resolutionCriteria);
      }

      // Store conditional market data if applicable
      if (request.marketType === MarketType.CONDITIONAL && request.conditionalData) {
        this.conditionalMarkets.set(marketId, request.conditionalData);
      }

      // Create market on blockchain
      await this.createMarketOnBlockchain(creatorKeypair, market);

      logger.info('Advanced market created:', {
        marketId,
        creator: creatorKeypair.publicKey(),
        title: request.title,
        marketType: request.marketType,
        resolutionSource: request.resolutionSource,
      });

      return market;
    } catch (error) {
      logger.error('Failed to create advanced market:', error);
      throw error;
    }
  }

  /**
   * Create conditional market (If X then Y)
   */
  async createConditionalMarket(
    creatorKeypair: Keypair,
    conditionDescription: string,
    conditionOracle: string,
    conditionThreshold: string,
    outcomeDescription: string,
    outcomeOracle: string,
    resolutionTime: number
  ): Promise<Market> {
    try {
      const request: MarketCreationRequest = {
        creator: creatorKeypair.publicKey(),
        title: `If ${conditionDescription} then ${outcomeDescription}`,
        description: `Conditional market: If ${conditionDescription} reaches ${conditionThreshold}, will ${outcomeDescription}?`,
        marketType: MarketType.CONDITIONAL,
        outcomes: ['Yes', 'No'],
        resolutionSource: ResolutionSource.AUTOMATED,
        resolutionCriteria: `${conditionOracle}:${conditionThreshold}`,
        bettingDuration: (resolutionTime - Date.now()) / 1000,
        resolutionDelay: 3600, // 1 hour resolution delay
        category: 'conditional',
        tags: ['conditional', 'automated'],
        kaleBoostEnabled: true,
        conditionalData: {
          conditionOracle,
          conditionThreshold,
          outcomeOracle,
          conditionDescription,
          outcomeDescription,
        },
      };

      return await this.createAdvancedMarket(creatorKeypair, request);
    } catch (error) {
      logger.error('Failed to create conditional market:', error);
      throw error;
    }
  }

  /**
   * Create prediction league with team support
   */
  async createPredictionLeague(
    creatorKeypair: Keypair,
    name: string,
    description: string,
    durationDays: number,
    entryFee: string,
    maxParticipants: number,
    isTeamBased: boolean = false,
    teamSize: number = 4
  ): Promise<PredictionLeague> {
    try {
      const leagueId = uuidv4();
      const currentTime = Date.now();
      const durationMs = durationDays * 24 * 60 * 60 * 1000;

      const league: PredictionLeague = {
        id: leagueId,
        name,
        description,
        startTime: currentTime,
        endTime: currentTime + durationMs,
        entryFee,
        prizePool: '0',
        maxParticipants,
        marketIds: [],
        participants: [],
        leaderboard: [],
        isTeamBased,
        teamSize,
        createdAt: currentTime,
        isActive: true,
      };

      this.leagues.set(leagueId, league);

      logger.info('Prediction league created:', {
        leagueId,
        creator: creatorKeypair.publicKey(),
        name,
        durationDays,
        maxParticipants,
        isTeamBased,
      });

      return league;
    } catch (error) {
      logger.error('Failed to create prediction league:', error);
      throw error;
    }
  }

  /**
   * Add market to prediction league
   */
  async addMarketToLeague(leagueId: string, marketId: string): Promise<void> {
    try {
      const league = this.leagues.get(leagueId);
      if (!league) {
        throw new Error('League not found');
      }

      const market = this.markets.get(marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      // Add market to league
      league.marketIds.push(marketId);
      market.leagueId = leagueId;

      // Update storage
      this.leagues.set(leagueId, league);
      this.markets.set(marketId, market);

      logger.info('Market added to league:', { leagueId, marketId });
    } catch (error) {
      logger.error('Failed to add market to league:', error);
      throw error;
    }
  }

  /**
   * Automated market resolution with multiple oracle sources
   */
  async resolveMarketWithOracles(marketId: string): Promise<number> {
    try {
      const market = this.markets.get(marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      if (market.isResolved) {
        throw new Error('Market already resolved');
      }

      if (Date.now() < market.resolutionTime) {
        throw new Error('Resolution time not reached');
      }

      let winningOutcome: number;

      switch (market.resolutionSource) {
        case ResolutionSource.ORACLE:
          const resolutionData = await this.reflectorService.resolveMarketWithConfidence(
            marketId,
            market.resolutionCriteria,
            80 // 80% confidence required
          );
          winningOutcome = await this.determineOutcomeFromPrice(market, resolutionData.resolutionValue);
          break;

        case ResolutionSource.AUTOMATED:
          winningOutcome = await this.resolveConditionalMarket(market);
          break;

        default:
          throw new Error('Invalid resolution source for automated resolution');
      }

      // Update market with resolution
      market.isResolved = true;
      market.winningOutcome = winningOutcome;
      this.markets.set(marketId, market);

      // Distribute rewards to winners
      await this.distributeMarketRewards(marketId, winningOutcome);

      // Update league leaderboard if applicable
      if (market.leagueId) {
        await this.updateLeagueLeaderboard(market.leagueId, marketId);
      }

      logger.info('Market resolved:', {
        marketId,
        winningOutcome,
        resolutionSource: market.resolutionSource,
      });

      return winningOutcome;
    } catch (error) {
      logger.error('Failed to resolve market with oracles:', error);
      throw error;
    }
  }

  /**
   * Dynamic market liquidity management
   */
  async addLiquidityToMarket(
    providerKeypair: Keypair,
    marketId: string,
    kaleAmount: string
  ): Promise<void> {
    try {
      const market = this.markets.get(marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      const liquidity = this.liquidity.get(marketId);
      if (!liquidity) {
        throw new Error('Market liquidity not found');
      }

      // Validate provider has sufficient KALE
      const providerBalance = await this.kaleService.getPredictionStats(providerKeypair.publicKey());
      if (new Big(providerBalance.totalVolume).lt(new Big(kaleAmount))) {
        throw new Error('Insufficient KALE balance');
      }

      // Transfer KALE from provider (simplified - would use actual token transfer)
      const totalLiquidity = new Big(liquidity.totalKaleStaked);
      const providerShare = totalLiquidity.eq(0) ? 
        new Big(kaleAmount) : 
        new Big(kaleAmount).mul(1000000).div(totalLiquidity.plus(kaleAmount));

      // Update liquidity data
      liquidity.totalKaleStaked = totalLiquidity.plus(kaleAmount).toString();

      // Add or update provider
      const existingIndex = liquidity.liquidityProviders.indexOf(providerKeypair.publicKey());
      if (existingIndex >= 0) {
        const currentShare = new Big(liquidity.providerShares[existingIndex]);
        liquidity.providerShares[existingIndex] = currentShare.plus(providerShare).toString();
      } else {
        liquidity.liquidityProviders.push(providerKeypair.publicKey());
        liquidity.providerShares.push(providerShare.toString());
      }

      // Distribute liquidity across outcome pools
      const outcomesCount = liquidity.outcomePools.length;
      const amountPerOutcome = new Big(kaleAmount).div(outcomesCount);

      for (let i = 0; i < outcomesCount; i++) {
        const currentPool = new Big(liquidity.outcomePools[i]);
        liquidity.outcomePools[i] = currentPool.plus(amountPerOutcome).toString();
      }

      liquidity.lastUpdate = Date.now();
      this.liquidity.set(marketId, liquidity);

      logger.info('Liquidity added to market:', {
        marketId,
        provider: providerKeypair.publicKey(),
        amount: kaleAmount,
        providerShare: providerShare.toString(),
      });
    } catch (error) {
      logger.error('Failed to add liquidity to market:', error);
      throw error;
    }
  }

  /**
   * Get market information
   */
  async getMarket(marketId: string): Promise<Market | null> {
    try {
      return this.markets.get(marketId) || null;
    } catch (error) {
      logger.error('Failed to get market:', error);
      throw error;
    }
  }

  /**
   * Get market liquidity information
   */
  async getMarketLiquidity(marketId: string): Promise<MarketLiquidity | null> {
    try {
      return this.liquidity.get(marketId) || null;
    } catch (error) {
      logger.error('Failed to get market liquidity:', error);
      throw error;
    }
  }

  /**
   * Get prediction league information
   */
  async getPredictionLeague(leagueId: string): Promise<PredictionLeague | null> {
    try {
      return this.leagues.get(leagueId) || null;
    } catch (error) {
      logger.error('Failed to get prediction league:', error);
      throw error;
    }
  }

  /**
   * Get all markets for a user
   */
  async getUserMarkets(userAddress: string): Promise<Market[]> {
    try {
      return Array.from(this.markets.values())
        .filter(market => market.creator === userAddress);
    } catch (error) {
      logger.error('Failed to get user markets:', error);
      throw error;
    }
  }

  /**
   * Get all active markets
   */
  async getActiveMarkets(): Promise<Market[]> {
    try {
      const now = Date.now();
      return Array.from(this.markets.values())
        .filter(market => 
          !market.isResolved && 
          now >= market.bettingStart && 
          now <= market.bettingEnd
        );
    } catch (error) {
      logger.error('Failed to get active markets:', error);
      throw error;
    }
  }

  /**
   * Get markets by category
   */
  async getMarketsByCategory(category: string): Promise<Market[]> {
    try {
      return Array.from(this.markets.values())
        .filter(market => market.category === category);
    } catch (error) {
      logger.error('Failed to get markets by category:', error);
      throw error;
    }
  }

  /**
   * Search markets by title or description
   */
  async searchMarkets(query: string): Promise<Market[]> {
    try {
      const lowercaseQuery = query.toLowerCase();
      return Array.from(this.markets.values())
        .filter(market => 
          market.title.toLowerCase().includes(lowercaseQuery) ||
          market.description.toLowerCase().includes(lowercaseQuery) ||
          market.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
    } catch (error) {
      logger.error('Failed to search markets:', error);
      throw error;
    }
  }

  /**
   * Internal helper functions
   */
  private validateMarketParams(request: MarketCreationRequest): void {
    if (!request.title || request.title.length < 5) {
      throw new Error('Title must be at least 5 characters long');
    }

    if (!request.description || request.description.length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }

    if (!Object.values(MarketType).includes(request.marketType)) {
      throw new Error('Invalid market type');
    }

    if (!Object.values(ResolutionSource).includes(request.resolutionSource)) {
      throw new Error('Invalid resolution source');
    }

    switch (request.marketType) {
      case MarketType.BINARY:
        if (request.outcomes.length !== 2) {
          throw new Error('Binary markets must have exactly 2 outcomes');
        }
        break;
      case MarketType.MULTIPLE:
        if (request.outcomes.length < 3 || request.outcomes.length > 10) {
          throw new Error('Multiple choice markets must have 3-10 outcomes');
        }
        break;
    }

    if (request.bettingDuration <= 0) {
      throw new Error('Betting duration must be positive');
    }

    if (request.resolutionDelay < 0) {
      throw new Error('Resolution delay must be non-negative');
    }
  }

  private calculateMarketFee(request: MarketCreationRequest): string {
    try {
      const baseFee = new Big('1000000'); // 1 KALE base fee
      const complexityMultiplier = request.marketType === MarketType.CONDITIONAL ? 2 : 1;
      const oracleMultiplier = request.resolutionSource === ResolutionSource.ORACLE ? 1.5 : 1;
      
      return baseFee.mul(complexityMultiplier).mul(oracleMultiplier).toString();
    } catch (error) {
      logger.error('Failed to calculate market fee:', error);
      return '1000000'; // Default fee
    }
  }

  private async setupOracleSubscription(marketId: string, resolutionCriteria: string): Promise<void> {
    try {
      // Parse resolution criteria to extract asset information
      const [asset, threshold] = resolutionCriteria.split(':');
      
      await this.reflectorService.createMarketSubscription(
        marketId,
        { base: asset, quote: 'USD' },
        100, // 1% price change threshold
        `${process.env.API_BASE_URL}/webhook/reflector/${marketId}`
      );
    } catch (error) {
      logger.error('Failed to setup oracle subscription:', error);
    }
  }

  private async createMarketOnBlockchain(creatorKeypair: Keypair, market: Market): Promise<void> {
    try {
      // Create market creation transaction
      const memo = Memo.text(JSON.stringify({
        type: 'MARKET_CREATION',
        marketId: market.id,
        marketType: market.marketType,
        resolutionSource: market.resolutionSource,
        timestamp: Date.now(),
      }));

      // This would typically call a Soroban contract
      // For now, we'll simulate the transaction
      logger.info('Market created on blockchain:', {
        marketId: market.id,
        creator: creatorKeypair.publicKey(),
      });
    } catch (error) {
      logger.error('Failed to create market on blockchain:', error);
      throw error;
    }
  }

  private async determineOutcomeFromPrice(market: Market, price: string): Promise<number> {
    try {
      if (market.marketType === MarketType.BINARY) {
        // Parse threshold from resolution criteria
        const threshold = new Big(market.resolutionCriteria.split(':')[1] || '0');
        const currentPrice = new Big(price);
        
        return currentPrice.gt(threshold) ? 0 : 1; // 0 = "Yes", 1 = "No"
      }
      
      throw new Error('Unsupported market type for price-based resolution');
    } catch (error) {
      logger.error('Failed to determine outcome from price:', error);
      throw error;
    }
  }

  private async resolveConditionalMarket(market: Market): Promise<number> {
    try {
      const conditionalData = this.conditionalMarkets.get(market.id);
      if (!conditionalData) {
        throw new Error('Conditional market data not found');
      }

      // Check if condition is met
      const conditionPrice = await this.reflectorService.getCurrentPrice(conditionalData.conditionOracle);
      if (!conditionPrice) {
        throw new Error('Unable to get condition price');
      }

      const conditionThreshold = new Big(conditionalData.conditionThreshold);
      const currentPrice = new Big(conditionPrice.price);

      if (currentPrice.gte(conditionThreshold)) {
        // Condition met, check outcome
        const outcomePrice = await this.reflectorService.getCurrentPrice(conditionalData.outcomeOracle);
        if (!outcomePrice) {
          throw new Error('Unable to get outcome price');
        }

        const outcomeThreshold = new Big(conditionalData.conditionThreshold);
        const outcomeCurrentPrice = new Big(outcomePrice.price);

        // Determine if outcome occurred
        return outcomeCurrentPrice.gt(outcomeThreshold) ? 0 : 1; // 0 = Yes, 1 = No
      } else {
        return 1; // Condition not met, so "No"
      }
    } catch (error) {
      logger.error('Failed to resolve conditional market:', error);
      throw error;
    }
  }

  private async distributeMarketRewards(marketId: string, winningOutcome: number): Promise<void> {
    try {
      // This would typically get all bets for this market and distribute rewards
      // For now, we'll simulate the distribution
      logger.info('Market rewards distributed:', {
        marketId,
        winningOutcome,
      });
    } catch (error) {
      logger.error('Failed to distribute market rewards:', error);
    }
  }

  private async updateLeagueLeaderboard(leagueId: string, marketId: string): Promise<void> {
    try {
      const league = this.leagues.get(leagueId);
      if (!league) {
        return;
      }

      // This would typically recalculate scores based on market results
      // For now, we'll simulate the update
      logger.info('League leaderboard updated:', {
        leagueId,
        marketId,
      });
    } catch (error) {
      logger.error('Failed to update league leaderboard:', error);
    }
  }
}
