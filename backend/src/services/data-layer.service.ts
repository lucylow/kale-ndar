import { TimescaleDBService, FarmingEvent, MarketData, BlockData } from './timescaledb.service';
import { RedisClusterService, LeaderboardEntry } from './redis-cluster.service';
import { IPFSClusterService, IPFSUploadResult } from './ipfs-cluster.service';
import { MongoDBService, UserProfile, MarketMetadata, BetMetadata } from './mongodb.service';
import { DataLayerConfig } from '../config/data-layer.config';
import { logger } from '../utils/logger';

export interface DataLayerHealth {
  timescaleDB: boolean;
  redisCluster: boolean;
  ipfsCluster: boolean;
  mongodb: boolean;
  overall: boolean;
}

export interface FarmingEventData {
  eventTime: Date;
  farmer: string;
  stakedAmount: string;
  workHash: string;
  reward: string;
  blockNumber?: number;
  transactionHash?: string;
}

export interface LeaderboardData {
  name: string;
  entries: LeaderboardEntry[];
  ttl?: number;
}

export interface ProofData {
  farmer: string;
  blockNumber?: number;
  proofData: any;
}

export interface LogData {
  type: string;
  entries: any[];
}

export class DataLayerService {
  private timescaleDB: TimescaleDBService;
  private redisCluster: RedisClusterService;
  private ipfsCluster: IPFSClusterService;
  private mongodb: MongoDBService;
  private config: DataLayerConfig;
  private isInitialized: boolean = false;

  constructor(config: DataLayerConfig) {
    this.config = config;
    this.timescaleDB = new TimescaleDBService(config.timescaleDB);
    this.redisCluster = new RedisClusterService(config.redisCluster);
    this.ipfsCluster = new IPFSClusterService(config.ipfsCluster);
    this.mongodb = new MongoDBService(config.mongodb);
  }

  /**
   * Initialize all data layer services
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing data layer services...');

      // Initialize services in parallel
      await Promise.all([
        this.timescaleDB.initialize(),
        this.redisCluster.initialize(),
        this.ipfsCluster.initialize(),
        this.mongodb.initialize(),
      ]);

      this.isInitialized = true;
      logger.info('✅ All data layer services initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize data layer services:', error);
      throw error;
    }
  }

  /**
   * Store farming event with full data layer integration
   */
  async storeFarmingEvent(eventData: FarmingEventData): Promise<{
    timescaleDB: any;
    ipfs?: IPFSUploadResult;
    redis?: boolean;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Data layer not initialized');
      }

      // Store in TimescaleDB
      const timescaleResult = await this.timescaleDB.storeFarmingEvent({
        event_time: eventData.eventTime,
        farmer: eventData.farmer,
        staked_amount: eventData.stakedAmount,
        work_hash: eventData.workHash,
        reward: eventData.reward,
        block_number: eventData.blockNumber,
        transaction_hash: eventData.transactionHash,
      });

      const result: any = { timescaleDB: timescaleResult };

      // Store proof in IPFS if block number is provided
      if (eventData.blockNumber) {
        try {
          const proofData = {
            farmer: eventData.farmer,
            blockNumber: eventData.blockNumber,
            workHash: eventData.workHash,
            reward: eventData.reward,
            timestamp: eventData.eventTime,
          };
          
          const ipfsResult = await this.ipfsCluster.uploadProof(proofData, eventData.farmer, eventData.blockNumber);
          result.ipfs = ipfsResult;
          
          // Cache the IPFS CID in Redis
          await this.redisCluster.set(
            `proof:${eventData.farmer}:${eventData.blockNumber}`,
            ipfsResult.cid,
            { ttl: 86400 } // 24 hours
          );
        } catch (error) {
          logger.warn('Failed to store proof in IPFS:', error);
        }
      }

      // Update leaderboard in Redis
      try {
        await this.redisCluster.updateLeaderboardScore('farming_rewards', eventData.farmer, parseFloat(eventData.reward));
        result.redis = true;
      } catch (error) {
        logger.warn('Failed to update leaderboard:', error);
      }

      logger.debug('Farming event stored across data layer:', { farmer: eventData.farmer });
      return result;
    } catch (error) {
      logger.error('Failed to store farming event:', error);
      throw error;
    }
  }

  /**
   * Cache leaderboard data
   */
  async cacheLeaderboard(leaderboardData: LeaderboardData): Promise<void> {
    try {
      await this.redisCluster.cacheLeaderboard(leaderboardData.name, leaderboardData.entries, leaderboardData.ttl);
      logger.debug('Leaderboard cached:', { name: leaderboardData.name });
    } catch (error) {
      logger.error('Failed to cache leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get cached leaderboard
   */
  async getCachedLeaderboard(name: string): Promise<LeaderboardEntry[] | null> {
    try {
      return await this.redisCluster.getCachedLeaderboard(name);
    } catch (error) {
      logger.error('Failed to get cached leaderboard:', error);
      throw error;
    }
  }

  /**
   * Upload proof to IPFS
   */
  async uploadProof(proofData: ProofData): Promise<IPFSUploadResult> {
    try {
      const result = await this.ipfsCluster.uploadProof(proofData.proofData, proofData.farmer, proofData.blockNumber);
      
      // Cache the CID in Redis
      const cacheKey = `proof:${proofData.farmer}:${proofData.blockNumber || Date.now()}`;
      await this.redisCluster.set(cacheKey, result.cid, { ttl: 86400 });
      
      logger.debug('Proof uploaded to IPFS:', { cid: result.cid });
      return result;
    } catch (error) {
      logger.error('Failed to upload proof:', error);
      throw error;
    }
  }

  /**
   * Upload log to IPFS
   */
  async uploadLog(logData: LogData): Promise<IPFSUploadResult> {
    try {
      const result = await this.ipfsCluster.uploadLog(logData.entries, logData.type);
      
      // Cache the CID in Redis
      const cacheKey = `log:${logData.type}:${Date.now()}`;
      await this.redisCluster.set(cacheKey, result.cid, { ttl: 604800 }); // 7 days
      
      logger.debug('Log uploaded to IPFS:', { cid: result.cid });
      return result;
    } catch (error) {
      logger.error('Failed to upload log:', error);
      throw error;
    }
  }

  /**
   * Get user profile from MongoDB
   */
  async getUserProfile(address: string): Promise<UserProfile | null> {
    try {
      return await this.mongodb.getUserProfile(address);
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile in MongoDB
   */
  async updateUserProfile(address: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      return await this.mongodb.updateUserProfile(address, updates);
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Store market data in TimescaleDB
   */
  async storeMarketData(marketData: Omit<MarketData, 'id'>): Promise<MarketData> {
    try {
      return await this.timescaleDB.storeMarketData(marketData);
    } catch (error) {
      logger.error('Failed to store market data:', error);
      throw error;
    }
  }

  /**
   * Store market metadata in MongoDB
   */
  async storeMarketMetadata(marketMetadata: Partial<MarketMetadata>): Promise<MarketMetadata> {
    try {
      return await this.mongodb.upsertMarketMetadata(marketMetadata);
    } catch (error) {
      logger.error('Failed to store market metadata:', error);
      throw error;
    }
  }

  /**
   * Store bet metadata in MongoDB
   */
  async storeBetMetadata(betMetadata: Partial<BetMetadata>): Promise<BetMetadata> {
    try {
      return await this.mongodb.upsertBetMetadata(betMetadata);
    } catch (error) {
      logger.error('Failed to store bet metadata:', error);
      throw error;
    }
  }

  /**
   * Cache market data in Redis
   */
  async cacheMarketData(marketId: string, data: any, ttl: number = 60): Promise<void> {
    try {
      await this.redisCluster.cacheMarketData(marketId, data, ttl);
    } catch (error) {
      logger.error('Failed to cache market data:', error);
      throw error;
    }
  }

  /**
   * Get cached market data from Redis
   */
  async getCachedMarketData(marketId: string): Promise<any | null> {
    try {
      return await this.redisCluster.getCachedMarketData(marketId);
    } catch (error) {
      logger.error('Failed to get cached market data:', error);
      throw error;
    }
  }

  /**
   * Cache price data in Redis
   */
  async cachePriceData(symbol: string, priceData: any, ttl: number = 30): Promise<void> {
    try {
      await this.redisCluster.cachePriceData(symbol, priceData, ttl);
    } catch (error) {
      logger.error('Failed to cache price data:', error);
      throw error;
    }
  }

  /**
   * Get cached price data from Redis
   */
  async getCachedPriceData(symbol: string): Promise<any | null> {
    try {
      return await this.redisCluster.getCachedPriceData(symbol);
    } catch (error) {
      logger.error('Failed to get cached price data:', error);
      throw error;
    }
  }

  /**
   * Store block data in TimescaleDB
   */
  async storeBlockData(blockData: Omit<BlockData, 'id'>): Promise<BlockData> {
    try {
      return await this.timescaleDB.storeBlockData(blockData);
    } catch (error) {
      logger.error('Failed to store block data:', error);
      throw error;
    }
  }

  /**
   * Get farming statistics
   */
  async getFarmingStats(farmer?: string, startTime?: Date, endTime?: Date): Promise<any> {
    try {
      return await this.timescaleDB.getFarmingStats(farmer, startTime, endTime);
    } catch (error) {
      logger.error('Failed to get farming stats:', error);
      throw error;
    }
  }

  /**
   * Get latest blocks
   */
  async getLatestBlocks(limit: number = 10): Promise<BlockData[]> {
    try {
      return await this.timescaleDB.getLatestBlocks(limit);
    } catch (error) {
      logger.error('Failed to get latest blocks:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard from Redis
   */
  async getLeaderboard(name: string, options: any = {}): Promise<LeaderboardEntry[]> {
    try {
      return await this.redisCluster.getLeaderboard(name, options);
    } catch (error) {
      logger.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get health status of all services
   */
  async getHealthStatus(): Promise<DataLayerHealth> {
    try {
      const health: DataLayerHealth = {
        timescaleDB: this.timescaleDB.isHealthy(),
        redisCluster: this.redisCluster.isHealthy(),
        ipfsCluster: this.ipfsCluster.isHealthy(),
        mongodb: this.mongodb.isHealthy(),
        overall: false,
      };

      health.overall = health.timescaleDB && health.redisCluster && health.ipfsCluster && health.mongodb;
      
      return health;
    } catch (error) {
      logger.error('Failed to get health status:', error);
      return {
        timescaleDB: false,
        redisCluster: false,
        ipfsCluster: false,
        mongodb: false,
        overall: false,
      };
    }
  }

  /**
   * Test all connections
   */
  async testConnections(): Promise<{
    timescaleDB: boolean;
    redisCluster: boolean;
    ipfsCluster: boolean;
    mongodb: boolean;
  }> {
    try {
      const results = await Promise.allSettled([
        this.timescaleDB.query('SELECT 1'),
        this.redisCluster.ping(),
        this.ipfsCluster.testConnection(),
        this.mongodb.getDb().admin().ping(),
      ]);

      return {
        timescaleDB: results[0].status === 'fulfilled',
        redisCluster: results[1].status === 'fulfilled',
        ipfsCluster: results[2].status === 'fulfilled',
        mongodb: results[3].status === 'fulfilled',
      };
    } catch (error) {
      logger.error('Failed to test connections:', error);
      return {
        timescaleDB: false,
        redisCluster: false,
        ipfsCluster: false,
        mongodb: false,
      };
    }
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    try {
      await Promise.all([
        this.timescaleDB.close(),
        this.redisCluster.close(),
        this.mongodb.close(),
      ]);
      
      logger.info('All data layer connections closed');
    } catch (error) {
      logger.error('Error closing data layer connections:', error);
      throw error;
    }
  }

  /**
   * Get individual services for direct access
   */
  getTimescaleDB(): TimescaleDBService {
    return this.timescaleDB;
  }

  getRedisCluster(): RedisClusterService {
    return this.redisCluster;
  }

  getIPFSCluster(): IPFSClusterService {
    return this.ipfsCluster;
  }

  getMongoDB(): MongoDBService {
    return this.mongodb;
  }

  /**
   * Check if data layer is initialized
   */
  isInitialized(): boolean {
    return this.isInitialized;
  }
}
