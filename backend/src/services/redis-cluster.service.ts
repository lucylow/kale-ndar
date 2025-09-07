import Redis from 'ioredis';
import { RedisClusterConfig } from '../config/data-layer.config';
import { logger } from '../utils/logger';

export interface LeaderboardEntry {
  address: string;
  score: number;
  rank: number;
  metadata?: any;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  nx?: boolean; // Only set if key doesn't exist
  xx?: boolean; // Only set if key exists
}

export interface LeaderboardOptions {
  limit?: number;
  offset?: number;
  withScores?: boolean;
  withMetadata?: boolean;
}

export class RedisClusterService {
  private cluster: Redis.Cluster;
  private config: RedisClusterConfig;
  private isConnected: boolean = false;

  constructor(config: RedisClusterConfig) {
    this.config = config;
    this.cluster = new Redis.Cluster(config.nodes, config.options);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.cluster.on('connect', () => {
      logger.info('✅ Redis Cluster connected');
      this.isConnected = true;
    });

    this.cluster.on('ready', () => {
      logger.info('✅ Redis Cluster ready');
    });

    this.cluster.on('error', (err) => {
      logger.error('❌ Redis Cluster error:', err);
      this.isConnected = false;
    });

    this.cluster.on('close', () => {
      logger.info('Redis Cluster connection closed');
      this.isConnected = false;
    });

    this.cluster.on('reconnecting', () => {
      logger.info('Redis Cluster reconnecting...');
    });
  }

  /**
   * Initialize Redis Cluster connection
   */
  async initialize(): Promise<void> {
    try {
      // Test connection
      await this.cluster.ping();
      logger.info('✅ Redis Cluster initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Redis Cluster:', error);
      throw error;
    }
  }

  /**
   * Set a key-value pair with optional TTL
   */
  async set(key: string, value: string, options?: CacheOptions): Promise<boolean> {
    try {
      if (options?.ttl) {
        await this.cluster.setex(key, options.ttl, value);
      } else if (options?.nx) {
        const result = await this.cluster.setnx(key, value);
        return result === 1;
      } else if (options?.xx) {
        const result = await this.cluster.set(key, value, 'XX');
        return result === 'OK';
      } else {
        await this.cluster.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Failed to set key:', error);
      throw error;
    }
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.cluster.get(key);
    } catch (error) {
      logger.error('Failed to get key:', error);
      throw error;
    }
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    try {
      return await this.cluster.del(key);
    } catch (error) {
      logger.error('Failed to delete key:', error);
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.cluster.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Failed to check key existence:', error);
      throw error;
    }
  }

  /**
   * Set TTL for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.cluster.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Failed to set TTL:', error);
      throw error;
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.cluster.ttl(key);
    } catch (error) {
      logger.error('Failed to get TTL:', error);
      throw error;
    }
  }

  /**
   * Cache leaderboard data
   */
  async cacheLeaderboard(name: string, leaderboardData: LeaderboardEntry[], ttl: number = 300): Promise<void> {
    try {
      const key = `leaderboard:${name}`;
      const data = JSON.stringify(leaderboardData);
      await this.set(key, data, { ttl });
      logger.debug('Leaderboard cached:', { name, entries: leaderboardData.length });
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
      const key = `leaderboard:${name}`;
      const data = await this.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get cached leaderboard:', error);
      throw error;
    }
  }

  /**
   * Update leaderboard score using sorted sets
   */
  async updateLeaderboardScore(leaderboardName: string, address: string, score: number): Promise<void> {
    try {
      const key = `leaderboard:sorted:${leaderboardName}`;
      await this.cluster.zadd(key, score, address);
      logger.debug('Leaderboard score updated:', { leaderboardName, address, score });
    } catch (error) {
      logger.error('Failed to update leaderboard score:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard from sorted set
   */
  async getLeaderboard(leaderboardName: string, options: LeaderboardOptions = {}): Promise<LeaderboardEntry[]> {
    try {
      const key = `leaderboard:sorted:${leaderboardName}`;
      const limit = options.limit || 100;
      const offset = options.offset || 0;
      
      let result;
      if (options.withScores) {
        result = await this.cluster.zrevrange(key, offset, offset + limit - 1, 'WITHSCORES');
      } else {
        result = await this.cluster.zrevrange(key, offset, offset + limit - 1);
      }

      const leaderboard: LeaderboardEntry[] = [];
      
      if (options.withScores && Array.isArray(result)) {
        for (let i = 0; i < result.length; i += 2) {
          leaderboard.push({
            address: result[i],
            score: parseFloat(result[i + 1]),
            rank: offset + Math.floor(i / 2) + 1,
          });
        }
      } else if (Array.isArray(result)) {
        for (let i = 0; i < result.length; i++) {
          const score = await this.cluster.zscore(key, result[i]);
          leaderboard.push({
            address: result[i],
            score: parseFloat(score || '0'),
            rank: offset + i + 1,
          });
        }
      }

      return leaderboard;
    } catch (error) {
      logger.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get rank of a specific address in leaderboard
   */
  async getLeaderboardRank(leaderboardName: string, address: string): Promise<number | null> {
    try {
      const key = `leaderboard:sorted:${leaderboardName}`;
      const rank = await this.cluster.zrevrank(key, address);
      return rank !== null ? rank + 1 : null; // Convert 0-based to 1-based ranking
    } catch (error) {
      logger.error('Failed to get leaderboard rank:', error);
      throw error;
    }
  }

  /**
   * Cache user session data
   */
  async cacheUserSession(sessionId: string, userData: any, ttl: number = 3600): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      const data = JSON.stringify(userData);
      await this.set(key, data, { ttl });
      logger.debug('User session cached:', { sessionId });
    } catch (error) {
      logger.error('Failed to cache user session:', error);
      throw error;
    }
  }

  /**
   * Get user session data
   */
  async getUserSession(sessionId: string): Promise<any | null> {
    try {
      const key = `session:${sessionId}`;
      const data = await this.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get user session:', error);
      throw error;
    }
  }

  /**
   * Cache market data
   */
  async cacheMarketData(marketId: string, data: any, ttl: number = 60): Promise<void> {
    try {
      const key = `market:${marketId}`;
      const jsonData = JSON.stringify(data);
      await this.set(key, jsonData, { ttl });
      logger.debug('Market data cached:', { marketId });
    } catch (error) {
      logger.error('Failed to cache market data:', error);
      throw error;
    }
  }

  /**
   * Get cached market data
   */
  async getCachedMarketData(marketId: string): Promise<any | null> {
    try {
      const key = `market:${marketId}`;
      const data = await this.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get cached market data:', error);
      throw error;
    }
  }

  /**
   * Cache price data
   */
  async cachePriceData(symbol: string, priceData: any, ttl: number = 30): Promise<void> {
    try {
      const key = `price:${symbol}`;
      const data = JSON.stringify(priceData);
      await this.set(key, data, { ttl });
      logger.debug('Price data cached:', { symbol });
    } catch (error) {
      logger.error('Failed to cache price data:', error);
      throw error;
    }
  }

  /**
   * Get cached price data
   */
  async getCachedPriceData(symbol: string): Promise<any | null> {
    try {
      const key = `price:${symbol}`;
      const data = await this.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get cached price data:', error);
      throw error;
    }
  }

  /**
   * Increment a counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.cluster.incrby(key, amount);
    } catch (error) {
      logger.error('Failed to increment counter:', error);
      throw error;
    }
  }

  /**
   * Decrement a counter
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.cluster.decrby(key, amount);
    } catch (error) {
      logger.error('Failed to decrement counter:', error);
      throw error;
    }
  }

  /**
   * Get multiple keys
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.cluster.mget(...keys);
    } catch (error) {
      logger.error('Failed to get multiple keys:', error);
      throw error;
    }
  }

  /**
   * Set multiple key-value pairs
   */
  async mset(keyValuePairs: Record<string, string>): Promise<void> {
    try {
      const args: string[] = [];
      for (const [key, value] of Object.entries(keyValuePairs)) {
        args.push(key, value);
      }
      await this.cluster.mset(...args);
    } catch (error) {
      logger.error('Failed to set multiple keys:', error);
      throw error;
    }
  }

  /**
   * Get keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.cluster.keys(pattern);
    } catch (error) {
      logger.error('Failed to get keys by pattern:', error);
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
   * Get cluster info
   */
  async getClusterInfo(): Promise<any> {
    try {
      const info = await this.cluster.cluster('info');
      return info;
    } catch (error) {
      logger.error('Failed to get cluster info:', error);
      throw error;
    }
  }

  /**
   * Close the cluster connection
   */
  async close(): Promise<void> {
    try {
      await this.cluster.quit();
      logger.info('Redis Cluster connection closed');
    } catch (error) {
      logger.error('Error closing Redis Cluster:', error);
      throw error;
    }
  }
}

