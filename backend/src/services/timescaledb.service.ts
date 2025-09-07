import { Pool, PoolClient } from 'pg';
import { TimescaleDBConfig } from '../config/data-layer.config';
import { logger } from '../utils/logger';

export interface FarmingEvent {
  id?: number;
  event_time: Date;
  farmer: string;
  staked_amount: string;
  work_hash: string;
  reward: string;
  block_number?: number;
  transaction_hash?: string;
}

export interface MarketData {
  id?: number;
  timestamp: Date;
  market_id: string;
  price: string;
  volume: string;
  liquidity: string;
  participants: number;
}

export interface BlockData {
  id?: number;
  block_number: number;
  timestamp: Date;
  hash: string;
  previous_hash: string;
  transactions_count: number;
  total_fees: string;
  miner_reward: string;
}

export interface TimeSeriesQuery {
  startTime: Date;
  endTime: Date;
  interval?: string;
  limit?: number;
  offset?: number;
}

export class TimescaleDBService {
  private pool: Pool;
  private config: TimescaleDBConfig;
  private isConnected: boolean = false;

  constructor(config: TimescaleDBConfig) {
    this.config = config;
    this.pool = new Pool(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', () => {
      logger.info('✅ TimescaleDB client connected');
      this.isConnected = true;
    });

    this.pool.on('error', (err) => {
      logger.error('❌ TimescaleDB pool error:', err);
      this.isConnected = false;
    });

    this.pool.on('remove', () => {
      logger.info('TimescaleDB client removed from pool');
    });
  }

  /**
   * Initialize TimescaleDB connection and create hypertables
   */
  async initialize(): Promise<void> {
    try {
      const client = await this.pool.connect();
      
      try {
        // Enable TimescaleDB extension
        await client.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;');
        
        // Create farming_events hypertable
        await client.query(`
          CREATE TABLE IF NOT EXISTS farming_events (
            id SERIAL PRIMARY KEY,
            event_time TIMESTAMPTZ NOT NULL,
            farmer VARCHAR(64) NOT NULL,
            staked_amount BIGINT NOT NULL,
            work_hash VARCHAR(128) NOT NULL,
            reward BIGINT NOT NULL,
            block_number BIGINT,
            transaction_hash VARCHAR(255),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        // Convert to hypertable if not already
        await client.query(`
          SELECT create_hypertable('farming_events', 'event_time', if_not_exists => TRUE);
        `);

        // Create market_data hypertable
        await client.query(`
          CREATE TABLE IF NOT EXISTS market_data (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMPTZ NOT NULL,
            market_id VARCHAR(255) NOT NULL,
            price BIGINT NOT NULL,
            volume BIGINT NOT NULL,
            liquidity BIGINT NOT NULL,
            participants INTEGER NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          SELECT create_hypertable('market_data', 'timestamp', if_not_exists => TRUE);
        `);

        // Create block_data hypertable
        await client.query(`
          CREATE TABLE IF NOT EXISTS block_data (
            id SERIAL PRIMARY KEY,
            block_number BIGINT UNIQUE NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL,
            hash VARCHAR(255) NOT NULL,
            previous_hash VARCHAR(255) NOT NULL,
            transactions_count INTEGER NOT NULL,
            total_fees BIGINT NOT NULL,
            miner_reward BIGINT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          SELECT create_hypertable('block_data', 'timestamp', if_not_exists => TRUE);
        `);

        // Create indexes for better performance
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_farming_events_farmer ON farming_events(farmer);
          CREATE INDEX IF NOT EXISTS idx_farming_events_block ON farming_events(block_number);
          CREATE INDEX IF NOT EXISTS idx_market_data_market ON market_data(market_id);
          CREATE INDEX IF NOT EXISTS idx_block_data_number ON block_data(block_number);
        `);

        logger.info('✅ TimescaleDB initialized successfully');
        
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('❌ Failed to initialize TimescaleDB:', error);
      throw error;
    }
  }

  /**
   * Store a farming event
   */
  async storeFarmingEvent(event: Omit<FarmingEvent, 'id'>): Promise<FarmingEvent> {
    try {
      const query = `
        INSERT INTO farming_events (event_time, farmer, staked_amount, work_hash, reward, block_number, transaction_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        event.event_time,
        event.farmer,
        event.staked_amount,
        event.work_hash,
        event.reward,
        event.block_number || null,
        event.transaction_hash || null,
      ];

      const result = await this.pool.query(query, values);
      logger.debug('Farming event stored:', { id: result.rows[0].id, farmer: event.farmer });
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to store farming event:', error);
      throw error;
    }
  }

  /**
   * Get farming events for a farmer
   */
  async getFarmingEvents(farmer: string, query: TimeSeriesQuery): Promise<FarmingEvent[]> {
    try {
      const sql = `
        SELECT * FROM farming_events 
        WHERE farmer = $1 
        AND event_time >= $2 
        AND event_time <= $3
        ORDER BY event_time DESC
        LIMIT $4 OFFSET $5
      `;
      
      const values = [
        farmer,
        query.startTime,
        query.endTime,
        query.limit || 100,
        query.offset || 0,
      ];

      const result = await this.pool.query(sql, values);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get farming events:', error);
      throw error;
    }
  }

  /**
   * Store market data point
   */
  async storeMarketData(data: Omit<MarketData, 'id'>): Promise<MarketData> {
    try {
      const query = `
        INSERT INTO market_data (timestamp, market_id, price, volume, liquidity, participants)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [
        data.timestamp,
        data.market_id,
        data.price,
        data.volume,
        data.liquidity,
        data.participants,
      ];

      const result = await this.pool.query(query, values);
      logger.debug('Market data stored:', { id: result.rows[0].id, market_id: data.market_id });
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to store market data:', error);
      throw error;
    }
  }

  /**
   * Get market data for a specific market
   */
  async getMarketData(marketId: string, query: TimeSeriesQuery): Promise<MarketData[]> {
    try {
      const sql = `
        SELECT * FROM market_data 
        WHERE market_id = $1 
        AND timestamp >= $2 
        AND timestamp <= $3
        ORDER BY timestamp DESC
        LIMIT $4 OFFSET $5
      `;
      
      const values = [
        marketId,
        query.startTime,
        query.endTime,
        query.limit || 100,
        query.offset || 0,
      ];

      const result = await this.pool.query(sql, values);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get market data:', error);
      throw error;
    }
  }

  /**
   * Store block data
   */
  async storeBlockData(data: Omit<BlockData, 'id'>): Promise<BlockData> {
    try {
      const query = `
        INSERT INTO block_data (block_number, timestamp, hash, previous_hash, transactions_count, total_fees, miner_reward)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (block_number) DO UPDATE SET
          timestamp = EXCLUDED.timestamp,
          hash = EXCLUDED.hash,
          previous_hash = EXCLUDED.previous_hash,
          transactions_count = EXCLUDED.transactions_count,
          total_fees = EXCLUDED.total_fees,
          miner_reward = EXCLUDED.miner_reward
        RETURNING *
      `;
      
      const values = [
        data.block_number,
        data.timestamp,
        data.hash,
        data.previous_hash,
        data.transactions_count,
        data.total_fees,
        data.miner_reward,
      ];

      const result = await this.pool.query(query, values);
      logger.debug('Block data stored:', { id: result.rows[0].id, block_number: data.block_number });
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to store block data:', error);
      throw error;
    }
  }

  /**
   * Get latest blocks
   */
  async getLatestBlocks(limit: number = 10): Promise<BlockData[]> {
    try {
      const sql = `
        SELECT * FROM block_data 
        ORDER BY block_number DESC
        LIMIT $1
      `;
      
      const result = await this.pool.query(sql, [limit]);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get latest blocks:', error);
      throw error;
    }
  }

  /**
   * Get aggregated farming statistics
   */
  async getFarmingStats(farmer?: string, startTime?: Date, endTime?: Date): Promise<any> {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total_events,
          SUM(staked_amount) as total_staked,
          SUM(reward) as total_rewards,
          AVG(reward) as avg_reward,
          MAX(reward) as max_reward,
          MIN(reward) as min_reward
        FROM farming_events
        WHERE 1=1
      `;
      
      const values: any[] = [];
      let paramCount = 0;

      if (farmer) {
        sql += ` AND farmer = $${++paramCount}`;
        values.push(farmer);
      }

      if (startTime) {
        sql += ` AND event_time >= $${++paramCount}`;
        values.push(startTime);
      }

      if (endTime) {
        sql += ` AND event_time <= $${++paramCount}`;
        values.push(endTime);
      }

      const result = await this.pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get farming stats:', error);
      throw error;
    }
  }

  /**
   * Execute custom query
   */
  async query(sql: string, params?: any[]): Promise<any> {
    try {
      const result = await this.pool.query(sql, params);
      return result;
    } catch (error) {
      logger.error('Failed to execute query:', error);
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Check if service is connected
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      logger.info('TimescaleDB connection pool closed');
    } catch (error) {
      logger.error('Error closing TimescaleDB pool:', error);
      throw error;
    }
  }
}

