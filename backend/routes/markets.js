const express = require('express');
const Joi = require('joi');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { broadcastToAll, broadcastToMarket } = require('../utils/websocket');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createMarketSchema = Joi.object({
  description: Joi.string().required().min(10).max(500),
  asset_symbol: Joi.string().required().max(50),
  target_price: Joi.number().integer().positive().required(),
  condition: Joi.number().integer().valid(0, 1).required(), // 0: Above, 1: Below
  resolve_time: Joi.date().greater('now').required(),
  kale_token_address: Joi.string().required(),
  reflector_contract_address: Joi.string().required(),
});

const placeBetSchema = Joi.object({
  market_id: Joi.string().required(),
  amount: Joi.number().integer().positive().required(),
  side: Joi.boolean().required(), // true: For, false: Against
});

// Get all markets
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, resolved, creator } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (resolved !== undefined) {
      params.push(resolved === 'true');
      whereClause += ` AND resolved = $${params.length}`;
    }
    
    if (creator) {
      params.push(creator);
      whereClause += ` AND creator_address = $${params.length}`;
    }
    
    // Get markets with pagination
    const marketsQuery = `
      SELECT 
        id, description, creator_address, asset_symbol, target_price, 
        condition, resolve_time, created_at, resolved, outcome,
        total_for, total_against, kale_token_address, reflector_contract_address
      FROM markets 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(parseInt(limit), offset);
    const marketsResult = await query(marketsQuery, params);
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM markets ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, -2));
    
    const markets = marketsResult.rows.map(market => ({
      ...market,
      condition_text: market.condition === 0 ? 'Above' : 'Below',
      time_until_resolve: new Date(market.resolve_time) > new Date() 
        ? Math.floor((new Date(market.resolve_time) - new Date()) / 1000)
        : 0,
    }));
    
    res.json({
      markets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
    
  } catch (error) {
    logger.error('Failed to fetch markets:', error);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

// Get market by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const marketQuery = `
      SELECT 
        id, description, creator_address, asset_symbol, target_price, 
        condition, resolve_time, created_at, resolved, outcome,
        total_for, total_against, kale_token_address, reflector_contract_address
      FROM markets 
      WHERE id = $1
    `;
    
    const marketResult = await query(marketQuery, [id]);
    
    if (marketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Market not found' });
    }
    
    const market = marketResult.rows[0];
    
    // Get bets for this market
    const betsQuery = `
      SELECT user_address, amount, side, claimed, created_at, transaction_hash
      FROM bets 
      WHERE market_id = $1
      ORDER BY created_at DESC
    `;
    
    const betsResult = await query(betsQuery, [id]);
    
    res.json({
      ...market,
      condition_text: market.condition === 0 ? 'Above' : 'Below',
      time_until_resolve: new Date(market.resolve_time) > new Date() 
        ? Math.floor((new Date(market.resolve_time) - new Date()) / 1000)
        : 0,
      bets: betsResult.rows,
      total_bets: betsResult.rows.length,
    });
    
  } catch (error) {
    logger.error('Failed to fetch market:', error);
    res.status(500).json({ error: 'Failed to fetch market' });
  }
});

// Create new market
router.post('/', validateRequest(createMarketSchema), async (req, res) => {
  try {
    const {
      description,
      asset_symbol,
      target_price,
      condition,
      resolve_time,
      kale_token_address,
      reflector_contract_address,
    } = req.body;
    
    // For now, we'll use a mock market ID
    // In production, this would come from the blockchain transaction
    const marketId = `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const insertQuery = `
      INSERT INTO markets (
        id, description, creator_address, asset_symbol, target_price,
        condition, resolve_time, kale_token_address, reflector_contract_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const result = await query(insertQuery, [
      marketId,
      description,
      req.user?.address || 'mock_creator', // In production, get from auth
      asset_symbol,
      target_price,
      condition,
      resolve_time,
      kale_token_address,
      reflector_contract_address,
    ]);
    
    const market = result.rows[0];
    
    // Broadcast new market to all connected clients
    broadcastToAll({
      type: 'market_created',
      data: {
        id: market.id,
        description: market.description,
        creator: market.creator_address,
        resolve_time: market.resolve_time,
      },
    });
    
    logger.info('New market created:', { id: market.id, creator: market.creator_address });
    
    res.status(201).json({
      message: 'Market created successfully',
      market: {
        ...market,
        condition_text: market.condition === 0 ? 'Above' : 'Below',
      },
    });
    
  } catch (error) {
    logger.error('Failed to create market:', error);
    res.status(500).json({ error: 'Failed to create market' });
  }
});

// Place bet
router.post('/:id/bet', validateRequest(placeBetSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, side } = req.body;
    
    // Check if market exists and is not resolved
    const marketQuery = 'SELECT * FROM markets WHERE id = $1';
    const marketResult = await query(marketQuery, [id]);
    
    if (marketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Market not found' });
    }
    
    const market = marketResult.rows[0];
    
    if (market.resolved) {
      return res.status(400).json({ error: 'Market is already resolved' });
    }
    
    if (new Date(market.resolve_time) <= new Date()) {
      return res.status(400).json({ error: 'Market is closed for betting' });
    }
    
    // Insert bet
    const betQuery = `
      INSERT INTO bets (market_id, user_address, amount, side)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const betResult = await query(betQuery, [
      id,
      req.user?.address || 'mock_user', // In production, get from auth
      amount,
      side,
    ]);
    
    // Update market totals
    const updateQuery = `
      UPDATE markets 
      SET total_for = total_for + $1, total_against = total_against + $2
      WHERE id = $3
    `;
    
    const forAmount = side ? amount : 0;
    const againstAmount = side ? 0 : amount;
    
    await query(updateQuery, [forAmount, againstAmount, id]);
    
    const bet = betResult.rows[0];
    
    // Broadcast bet to market subscribers
    broadcastToMarket(id, {
      type: 'bet_placed',
      data: {
        user: bet.user_address,
        amount: bet.amount,
        side: bet.side,
        timestamp: bet.created_at,
      },
    });
    
    logger.info('Bet placed:', { 
      marketId: id, 
      user: bet.user_address, 
      amount: bet.amount, 
      side: bet.side 
    });
    
    res.status(201).json({
      message: 'Bet placed successfully',
      bet: {
        id: bet.id,
        market_id: bet.market_id,
        amount: bet.amount,
        side: bet.side,
        created_at: bet.created_at,
      },
    });
    
  } catch (error) {
    logger.error('Failed to place bet:', error);
    res.status(500).json({ error: 'Failed to place bet' });
  }
});

// Resolve market
router.post('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if market exists
    const marketQuery = 'SELECT * FROM markets WHERE id = $1';
    const marketResult = await query(marketQuery, [id]);
    
    if (marketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Market not found' });
    }
    
    const market = marketResult.rows[0];
    
    if (market.resolved) {
      return res.status(400).json({ error: 'Market is already resolved' });
    }
    
    if (new Date(market.resolve_time) > new Date()) {
      return res.status(400).json({ error: 'Market is not yet ready for resolution' });
    }
    
    // Mock outcome (in production, this would come from the oracle)
    const outcome = Math.random() > 0.5;
    
    // Update market
    const updateQuery = `
      UPDATE markets 
      SET resolved = true, outcome = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(updateQuery, [outcome, id]);
    const updatedMarket = result.rows[0];
    
    // Broadcast resolution to all clients
    broadcastToAll({
      type: 'market_resolved',
      data: {
        id: updatedMarket.id,
        outcome: updatedMarket.outcome,
        description: updatedMarket.description,
        total_for: updatedMarket.total_for,
        total_against: updatedMarket.total_against,
      },
    });
    
    logger.info('Market resolved:', { 
      id: updatedMarket.id, 
      outcome: updatedMarket.outcome 
    });
    
    res.json({
      message: 'Market resolved successfully',
      market: {
        id: updatedMarket.id,
        outcome: updatedMarket.outcome,
        resolved: updatedMarket.resolved,
      },
    });
    
  } catch (error) {
    logger.error('Failed to resolve market:', error);
    res.status(500).json({ error: 'Failed to resolve market' });
  }
});

// Get user bets for a market
router.get('/:id/bets/:user', async (req, res) => {
  try {
    const { id, user } = req.params;
    
    const betsQuery = `
      SELECT * FROM bets 
      WHERE market_id = $1 AND user_address = $2
      ORDER BY created_at DESC
    `;
    
    const result = await query(betsQuery, [id, user]);
    
    res.json({
      bets: result.rows,
      total_bets: result.rows.length,
    });
    
  } catch (error) {
    logger.error('Failed to fetch user bets:', error);
    res.status(500).json({ error: 'Failed to fetch user bets' });
  }
});

module.exports = router;
