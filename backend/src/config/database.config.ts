import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: 'postgres' | 'mysql' | 'sqlite';
  logging?: boolean;
  pool?: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

export class DatabaseService {
  private sequelize: Sequelize;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.sequelize = new Sequelize({
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      dialect: config.dialect,
      logging: config.logging ? (sql) => logger.debug(sql) : false,
      pool: config.pool || {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
    });
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      logger.info('Database connection established successfully');
    } catch (error) {
      logger.error('Unable to connect to the database:', error);
      throw error;
    }
  }

  /**
   * Sync database models
   */
  async sync(force: boolean = false): Promise<void> {
    try {
      await this.sequelize.sync({ force });
      logger.info('Database models synchronized successfully');
    } catch (error) {
      logger.error('Failed to sync database models:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    try {
      await this.sequelize.close();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Failed to close database connection:', error);
      throw error;
    }
  }

  /**
   * Get Sequelize instance
   */
  getSequelize(): Sequelize {
    return this.sequelize;
  }

  /**
   * Run raw SQL query
   */
  async query(sql: string, options?: any): Promise<any> {
    try {
      return await this.sequelize.query(sql, options);
    } catch (error) {
      logger.error('Failed to execute query:', error);
      throw error;
    }
  }

  /**
   * Start transaction
   */
  async transaction<T>(callback: (transaction: any) => Promise<T>): Promise<T> {
    try {
      return await this.sequelize.transaction(callback);
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    connectionCount: number;
    maxConnections: number;
    activeConnections: number;
    idleConnections: number;
  }> {
    try {
      const pool = (this.sequelize as any).connectionManager.pool;
      return {
        connectionCount: pool.size,
        maxConnections: pool.max,
        activeConnections: pool.using,
        idleConnections: pool.available,
      };
    } catch (error) {
      logger.error('Failed to get database stats:', error);
      return {
        connectionCount: 0,
        maxConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
      };
    }
  }
}

// Default database configuration
export const defaultDatabaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kale_ndar',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dialect: (process.env.DB_DIALECT as 'postgres' | 'mysql' | 'sqlite') || 'postgres',
  logging: process.env.NODE_ENV === 'development',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '5'),
    min: parseInt(process.env.DB_POOL_MIN || '0'),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
    idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
  },
};

// Create singleton instance
export const databaseService = new DatabaseService(defaultDatabaseConfig);
