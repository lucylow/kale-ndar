import { logger } from '../utils/logger';

export interface TimescaleDBConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  ssl?: boolean | object;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface RedisClusterConfig {
  nodes: Array<{
    host: string;
    port: number;
  }>;
  options?: {
    redisOptions?: {
      password?: string;
      db?: number;
    };
    enableOfflineQueue?: boolean;
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
  };
}

export interface IPFSClusterConfig {
  apiUrl: string;
  gatewayUrl?: string;
  timeout?: number;
  maxFileSize?: number;
}

export interface MongoDBConfig {
  uri: string;
  database: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
  };
}

export interface DataLayerConfig {
  timescaleDB: TimescaleDBConfig;
  redisCluster: RedisClusterConfig;
  ipfsCluster: IPFSClusterConfig;
  mongodb: MongoDBConfig;
}

// Default configuration
export const defaultDataLayerConfig: DataLayerConfig = {
  timescaleDB: {
    user: process.env.TIMESCALEDB_USER || 'postgres',
    host: process.env.TIMESCALEDB_HOST || 'localhost',
    database: process.env.TIMESCALEDB_DATABASE || 'kale_timeseries',
    password: process.env.TIMESCALEDB_PASSWORD || 'password',
    port: parseInt(process.env.TIMESCALEDB_PORT || '5432'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  redisCluster: {
    nodes: [
      { host: process.env.REDIS_NODE1_HOST || 'localhost', port: parseInt(process.env.REDIS_NODE1_PORT || '7000') },
      { host: process.env.REDIS_NODE2_HOST || 'localhost', port: parseInt(process.env.REDIS_NODE2_PORT || '7001') },
      { host: process.env.REDIS_NODE3_HOST || 'localhost', port: parseInt(process.env.REDIS_NODE3_PORT || '7002') },
    ],
    options: {
      redisOptions: {
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
    },
  },
  ipfsCluster: {
    apiUrl: process.env.IPFS_CLUSTER_API_URL || 'http://localhost:9094/api/v0',
    gatewayUrl: process.env.IPFS_GATEWAY_URL || 'http://localhost:8080/ipfs',
    timeout: parseInt(process.env.IPFS_TIMEOUT || '30000'),
    maxFileSize: parseInt(process.env.IPFS_MAX_FILE_SIZE || '104857600'), // 100MB
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'kale_ndar',
    options: {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '2'),
      maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '30000'),
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000'),
    },
  },
};

// Validate configuration
export function validateDataLayerConfig(config: DataLayerConfig): boolean {
  try {
    // Validate TimescaleDB config
    if (!config.timescaleDB.host || !config.timescaleDB.database) {
      logger.error('TimescaleDB configuration is incomplete');
      return false;
    }

    // Validate Redis Cluster config
    if (!config.redisCluster.nodes || config.redisCluster.nodes.length === 0) {
      logger.error('Redis Cluster configuration is incomplete');
      return false;
    }

    // Validate IPFS Cluster config
    if (!config.ipfsCluster.apiUrl) {
      logger.error('IPFS Cluster configuration is incomplete');
      return false;
    }

    // Validate MongoDB config
    if (!config.mongodb.uri || !config.mongodb.database) {
      logger.error('MongoDB configuration is incomplete');
      return false;
    }

    logger.info('✅ Data layer configuration validation passed');
    return true;
  } catch (error) {
    logger.error('❌ Data layer configuration validation failed:', error);
    return false;
  }
}

// Get configuration from environment or use defaults
export function getDataLayerConfig(): DataLayerConfig {
  const config = defaultDataLayerConfig;
  
  if (!validateDataLayerConfig(config)) {
    logger.warn('⚠️  Using default configuration with potential issues');
  }
  
  return config;
}

