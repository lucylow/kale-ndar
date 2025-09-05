const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'kalendar',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('✅ Connected to PostgreSQL database');
    client.release();
    
    // Initialize database tables if they don't exist
    await initializeTables();
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    logger.warn('⚠️  Running in mock mode - database operations will be simulated');
    // Don't throw error, allow server to start in mock mode
  }
};

// Initialize database tables
const initializeTables = async () => {
  const client = await pool.connect();
  
  try {
    // Create markets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS markets (
        id VARCHAR(255) PRIMARY KEY,
        description TEXT NOT NULL,
        creator_address VARCHAR(255) NOT NULL,
        asset_symbol VARCHAR(50) NOT NULL,
        target_price BIGINT NOT NULL,
        condition SMALLINT NOT NULL,
        resolve_time TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved BOOLEAN DEFAULT FALSE,
        outcome BOOLEAN,
        total_for BIGINT DEFAULT 0,
        total_against BIGINT DEFAULT 0,
        kale_token_address VARCHAR(255) NOT NULL,
        reflector_contract_address VARCHAR(255) NOT NULL
      );
    `);

    // Create bets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        market_id VARCHAR(255) REFERENCES markets(id) ON DELETE CASCADE,
        user_address VARCHAR(255) NOT NULL,
        amount BIGINT NOT NULL,
        side BOOLEAN NOT NULL,
        claimed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        transaction_hash VARCHAR(255)
      );
    `);

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        address VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        total_bets BIGINT DEFAULT 0,
        total_winnings BIGINT DEFAULT 0
      );
    `);

    // Create market_events table for tracking events
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_events (
        id SERIAL PRIMARY KEY,
        market_id VARCHAR(255) REFERENCES markets(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB,
        block_number BIGINT,
        transaction_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bets_market ON bets(market_id);
      CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_address);
      CREATE INDEX IF NOT EXISTS idx_markets_creator ON markets(creator_address);
      CREATE INDEX IF NOT EXISTS idx_markets_resolve_time ON markets(resolve_time);
      CREATE INDEX IF NOT EXISTS idx_markets_resolved ON markets(resolved);
      CREATE INDEX IF NOT EXISTS idx_events_market ON market_events(market_id);
      CREATE INDEX IF NOT EXISTS idx_events_type ON market_events(event_type);
    `);

    logger.info('✅ Database tables initialized successfully');
    
  } catch (error) {
    logger.error('❌ Failed to initialize database tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query error:', error);
    // In mock mode, return empty results instead of throwing
    logger.warn('⚠️  Database query failed, returning mock data');
    return { rows: [], rowCount: 0 };
  }
};

// Helper function to get a client from the pool
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  connectDB,
  query,
  getClient,
  pool,
};
