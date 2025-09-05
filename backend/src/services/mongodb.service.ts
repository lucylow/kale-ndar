import { MongoClient, Db, Collection, ObjectId, Filter, UpdateFilter, FindOptions } from 'mongodb';
import { MongoDBConfig } from '../config/data-layer.config';
import { logger } from '../utils/logger';

export interface UserProfile {
  _id?: ObjectId;
  address: string;
  username?: string;
  email?: string;
  created_at: Date;
  last_login: Date;
  total_bets: number;
  total_winnings: number;
  preferences?: any;
  metadata?: any;
}

export interface MarketMetadata {
  _id?: ObjectId;
  market_id: string;
  creator_address: string;
  description: string;
  asset_symbol: string;
  target_price: string;
  condition: number;
  resolve_time: Date;
  created_at: Date;
  resolved: boolean;
  outcome?: boolean;
  total_for: string;
  total_against: string;
  kale_token_address: string;
  reflector_contract_address: string;
  metadata?: any;
}

export interface BetMetadata {
  _id?: ObjectId;
  bet_id: string;
  market_id: string;
  user_address: string;
  amount: string;
  side: boolean;
  claimed: boolean;
  created_at: Date;
  transaction_hash?: string;
  metadata?: any;
}

export interface SystemConfig {
  _id?: ObjectId;
  key: string;
  value: any;
  description?: string;
  updated_at: Date;
  updated_by?: string;
}

export interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 1 | 0>;
}

export class MongoDBService {
  private client: MongoClient;
  private db: Db | null = null;
  private config: MongoDBConfig;
  private isConnected: boolean = false;

  constructor(config: MongoDBConfig) {
    this.config = config;
    this.client = new MongoClient(config.uri, config.options);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('open', () => {
      logger.info('✅ MongoDB client connected');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      logger.error('❌ MongoDB client error:', err);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      logger.info('MongoDB client connection closed');
      this.isConnected = false;
    });
  }

  /**
   * Initialize MongoDB connection
   */
  async initialize(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(this.config.database);
      
      // Create indexes for better performance
      await this.createIndexes();
      
      logger.info('✅ MongoDB initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize MongoDB:', error);
      throw error;
    }
  }

  /**
   * Create database indexes
   */
  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      // User profiles indexes
      await this.db.collection('user_profiles').createIndex({ address: 1 }, { unique: true });
      await this.db.collection('user_profiles').createIndex({ username: 1 }, { sparse: true });
      await this.db.collection('user_profiles').createIndex({ email: 1 }, { sparse: true });
      await this.db.collection('user_profiles').createIndex({ created_at: 1 });

      // Market metadata indexes
      await this.db.collection('market_metadata').createIndex({ market_id: 1 }, { unique: true });
      await this.db.collection('market_metadata').createIndex({ creator_address: 1 });
      await this.db.collection('market_metadata').createIndex({ resolve_time: 1 });
      await this.db.collection('market_metadata').createIndex({ resolved: 1 });
      await this.db.collection('market_metadata').createIndex({ created_at: 1 });

      // Bet metadata indexes
      await this.db.collection('bet_metadata').createIndex({ bet_id: 1 }, { unique: true });
      await this.db.collection('bet_metadata').createIndex({ market_id: 1 });
      await this.db.collection('bet_metadata').createIndex({ user_address: 1 });
      await this.db.collection('bet_metadata').createIndex({ created_at: 1 });
      await this.db.collection('bet_metadata').createIndex({ claimed: 1 });

      // System config indexes
      await this.db.collection('system_config').createIndex({ key: 1 }, { unique: true });

      logger.info('✅ MongoDB indexes created successfully');
    } catch (error) {
      logger.error('Failed to create MongoDB indexes:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   */
  private getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB not initialized');
    }
    return this.db;
  }

  /**
   * Get collection instance
   */
  private getCollection<T>(name: string): Collection<T> {
    return this.getDb().collection<T>(name);
  }

  /**
   * Create or update user profile
   */
  async upsertUserProfile(user: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const collection = this.getCollection<UserProfile>('user_profiles');
      
      const filter = { address: user.address };
      const update: UpdateFilter<UserProfile> = {
        $set: {
          ...user,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
          total_bets: 0,
          total_winnings: 0,
        },
      };

      const options = { upsert: true, returnDocument: 'after' };
      const result = await collection.findOneAndUpdate(filter, update, options);
      
      if (!result) {
        throw new Error('Failed to upsert user profile');
      }

      logger.debug('User profile upserted:', { address: user.address });
      return result;
    } catch (error) {
      logger.error('Failed to upsert user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by address
   */
  async getUserProfile(address: string): Promise<UserProfile | null> {
    try {
      const collection = this.getCollection<UserProfile>('user_profiles');
      return await collection.findOne({ address });
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(address: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const collection = this.getCollection<UserProfile>('user_profiles');
      
      const filter = { address };
      const update: UpdateFilter<UserProfile> = {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      };

      const options = { returnDocument: 'after' };
      const result = await collection.findOneAndUpdate(filter, update, options);
      
      logger.debug('User profile updated:', { address });
      return result;
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Create or update market metadata
   */
  async upsertMarketMetadata(market: Partial<MarketMetadata>): Promise<MarketMetadata> {
    try {
      const collection = this.getCollection<MarketMetadata>('market_metadata');
      
      const filter = { market_id: market.market_id };
      const update: UpdateFilter<MarketMetadata> = {
        $set: {
          ...market,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      };

      const options = { upsert: true, returnDocument: 'after' };
      const result = await collection.findOneAndUpdate(filter, update, options);
      
      if (!result) {
        throw new Error('Failed to upsert market metadata');
      }

      logger.debug('Market metadata upserted:', { market_id: market.market_id });
      return result;
    } catch (error) {
      logger.error('Failed to upsert market metadata:', error);
      throw error;
    }
  }

  /**
   * Get market metadata by market ID
   */
  async getMarketMetadata(marketId: string): Promise<MarketMetadata | null> {
    try {
      const collection = this.getCollection<MarketMetadata>('market_metadata');
      return await collection.findOne({ market_id: marketId });
    } catch (error) {
      logger.error('Failed to get market metadata:', error);
      throw error;
    }
  }

  /**
   * Get markets by creator
   */
  async getMarketsByCreator(creatorAddress: string, options: QueryOptions = {}): Promise<MarketMetadata[]> {
    try {
      const collection = this.getCollection<MarketMetadata>('market_metadata');
      
      const findOptions: FindOptions<MarketMetadata> = {};
      if (options.limit) findOptions.limit = options.limit;
      if (options.skip) findOptions.skip = options.skip;
      if (options.sort) findOptions.sort = options.sort;
      if (options.projection) findOptions.projection = options.projection;

      return await collection.find({ creator_address: creatorAddress }, findOptions).toArray();
    } catch (error) {
      logger.error('Failed to get markets by creator:', error);
      throw error;
    }
  }

  /**
   * Create or update bet metadata
   */
  async upsertBetMetadata(bet: Partial<BetMetadata>): Promise<BetMetadata> {
    try {
      const collection = this.getCollection<BetMetadata>('bet_metadata');
      
      const filter = { bet_id: bet.bet_id };
      const update: UpdateFilter<BetMetadata> = {
        $set: {
          ...bet,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      };

      const options = { upsert: true, returnDocument: 'after' };
      const result = await collection.findOneAndUpdate(filter, update, options);
      
      if (!result) {
        throw new Error('Failed to upsert bet metadata');
      }

      logger.debug('Bet metadata upserted:', { bet_id: bet.bet_id });
      return result;
    } catch (error) {
      logger.error('Failed to upsert bet metadata:', error);
      throw error;
    }
  }

  /**
   * Get bet metadata by bet ID
   */
  async getBetMetadata(betId: string): Promise<BetMetadata | null> {
    try {
      const collection = this.getCollection<BetMetadata>('bet_metadata');
      return await collection.findOne({ bet_id: betId });
    } catch (error) {
      logger.error('Failed to get bet metadata:', error);
      throw error;
    }
  }

  /**
   * Get bets by user
   */
  async getBetsByUser(userAddress: string, options: QueryOptions = {}): Promise<BetMetadata[]> {
    try {
      const collection = this.getCollection<BetMetadata>('bet_metadata');
      
      const findOptions: FindOptions<BetMetadata> = {};
      if (options.limit) findOptions.limit = options.limit;
      if (options.skip) findOptions.skip = options.skip;
      if (options.sort) findOptions.sort = options.sort;
      if (options.projection) findOptions.projection = options.projection;

      return await collection.find({ user_address: userAddress }, findOptions).toArray();
    } catch (error) {
      logger.error('Failed to get bets by user:', error);
      throw error;
    }
  }

  /**
   * Get bets by market
   */
  async getBetsByMarket(marketId: string, options: QueryOptions = {}): Promise<BetMetadata[]> {
    try {
      const collection = this.getCollection<BetMetadata>('bet_metadata');
      
      const findOptions: FindOptions<BetMetadata> = {};
      if (options.limit) findOptions.limit = options.limit;
      if (options.skip) findOptions.skip = options.skip;
      if (options.sort) findOptions.sort = options.sort;
      if (options.projection) findOptions.projection = options.projection;

      return await collection.find({ market_id: marketId }, findOptions).toArray();
    } catch (error) {
      logger.error('Failed to get bets by market:', error);
      throw error;
    }
  }

  /**
   * Set system configuration
   */
  async setSystemConfig(key: string, value: any, description?: string, updatedBy?: string): Promise<SystemConfig> {
    try {
      const collection = this.getCollection<SystemConfig>('system_config');
      
      const filter = { key };
      const update: UpdateFilter<SystemConfig> = {
        $set: {
          value,
          description,
          updated_at: new Date(),
          updated_by: updatedBy,
        },
        $setOnInsert: {
          key,
        },
      };

      const options = { upsert: true, returnDocument: 'after' };
      const result = await collection.findOneAndUpdate(filter, update, options);
      
      if (!result) {
        throw new Error('Failed to set system config');
      }

      logger.debug('System config set:', { key });
      return result;
    } catch (error) {
      logger.error('Failed to set system config:', error);
      throw error;
    }
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(key: string): Promise<SystemConfig | null> {
    try {
      const collection = this.getCollection<SystemConfig>('system_config');
      return await collection.findOne({ key });
    } catch (error) {
      logger.error('Failed to get system config:', error);
      throw error;
    }
  }

  /**
   * Get all system configurations
   */
  async getAllSystemConfigs(): Promise<SystemConfig[]> {
    try {
      const collection = this.getCollection<SystemConfig>('system_config');
      return await collection.find({}).toArray();
    } catch (error) {
      logger.error('Failed to get all system configs:', error);
      throw error;
    }
  }

  /**
   * Delete system configuration
   */
  async deleteSystemConfig(key: string): Promise<boolean> {
    try {
      const collection = this.getCollection<SystemConfig>('system_config');
      const result = await collection.deleteOne({ key });
      
      logger.debug('System config deleted:', { key });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Failed to delete system config:', error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName: string): Promise<any> {
    try {
      const db = this.getDb();
      const stats = await db.collection(collectionName).stats();
      return stats;
    } catch (error) {
      logger.error('Failed to get collection stats:', error);
      throw error;
    }
  }

  /**
   * Execute aggregation pipeline
   */
  async aggregate(collectionName: string, pipeline: any[]): Promise<any[]> {
    try {
      const collection = this.getDb().collection(collectionName);
      return await collection.aggregate(pipeline).toArray();
    } catch (error) {
      logger.error('Failed to execute aggregation:', error);
      throw error;
    }
  }

  /**
   * Check if service is connected
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Close the MongoDB connection
   */
  async close(): Promise<void> {
    try {
      await this.client.close();
      logger.info('MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
}
