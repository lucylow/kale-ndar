const express = require('express');
const Joi = require('joi');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
});

// Get user profile
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const userQuery = `
      SELECT id, address, username, email, created_at, last_login,
             total_bets, total_winnings
      FROM users 
      WHERE address = $1
    `;
    
    const userResult = await query(userQuery, [address]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get user's recent bets
    const betsQuery = `
      SELECT b.*, m.description as market_description, m.resolved, m.outcome
      FROM bets b
      JOIN markets m ON b.market_id = m.id
      WHERE b.user_address = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `;
    
    const betsResult = await query(betsQuery, [address]);
    
    // Get user's active markets (markets they've bet on that aren't resolved)
    const activeMarketsQuery = `
      SELECT DISTINCT m.*
      FROM markets m
      JOIN bets b ON m.id = b.market_id
      WHERE b.user_address = $1 AND m.resolved = false
      ORDER BY m.resolve_time ASC
    `;
    
    const activeMarketsResult = await query(activeMarketsQuery, [address]);
    
    res.json({
      ...user,
      recent_bets: betsResult.rows,
      active_markets: activeMarketsResult.rows.map(market => ({
        ...market,
        condition_text: market.condition === 0 ? 'Above' : 'Below',
        time_until_resolve: Math.floor((new Date(market.resolve_time) - new Date()) / 1000),
      })),
    });
    
  } catch (error) {
    logger.error('Failed to fetch user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Create or update user profile
router.post('/:address', validateRequest(updateUserSchema), async (req, res) => {
  try {
    const { address } = req.params;
    const { username, email } = req.body;
    
    // Check if user exists
    const existingUserQuery = 'SELECT * FROM users WHERE address = $1';
    const existingUserResult = await query(existingUserQuery, [address]);
    
    if (existingUserResult.rows.length > 0) {
      // Update existing user
      const updateQuery = `
        UPDATE users 
        SET username = COALESCE($1, username), 
            email = COALESCE($2, email),
            last_login = CURRENT_TIMESTAMP
        WHERE address = $3
        RETURNING *
      `;
      
      const result = await query(updateQuery, [username, email, address]);
      
      res.json({
        message: 'User profile updated successfully',
        user: result.rows[0],
      });
      
    } else {
      // Create new user
      const insertQuery = `
        INSERT INTO users (address, username, email)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await query(insertQuery, [address, username, email]);
      
      res.status(201).json({
        message: 'User profile created successfully',
        user: result.rows[0],
      });
    }
    
  } catch (error) {
    logger.error('Failed to create/update user profile:', error);
    res.status(500).json({ error: 'Failed to create/update user profile' });
  }
});

// Get user statistics
router.get('/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Get total bets and winnings
    const statsQuery = `
      SELECT 
        COUNT(*) as total_bets,
        SUM(amount) as total_bet_amount,
        COUNT(CASE WHEN claimed = true THEN 1 END) as claimed_bets,
        COUNT(CASE WHEN claimed = false AND m.resolved = true THEN 1 END) as pending_claims
      FROM bets b
      LEFT JOIN markets m ON b.market_id = m.id
      WHERE b.user_address = $1
    `;
    
    const statsResult = await query(statsQuery, [address]);
    const stats = statsResult.rows[0];
    
    // Get win/loss ratio
    const winLossQuery = `
      SELECT 
        COUNT(CASE WHEN (b.side = m.outcome) THEN 1 END) as wins,
        COUNT(CASE WHEN (b.side != m.outcome) THEN 1 END) as losses
      FROM bets b
      JOIN markets m ON b.market_id = m.id
      WHERE b.user_address = $1 AND m.resolved = true
    `;
    
    const winLossResult = await query(winLossQuery, [address]);
    const winLoss = winLossResult.rows[0];
    
    // Calculate win rate
    const totalResolved = winLoss.wins + winLoss.losses;
    const winRate = totalResolved > 0 ? (winLoss.wins / totalResolved) * 100 : 0;
    
    // Get recent activity
    const recentActivityQuery = `
      SELECT 
        b.created_at,
        b.amount,
        b.side,
        m.description,
        m.resolved,
        m.outcome
      FROM bets b
      JOIN markets m ON b.market_id = m.id
      WHERE b.user_address = $1
      ORDER BY b.created_at DESC
      LIMIT 5
    `;
    
    const recentActivityResult = await query(recentActivityQuery, [address]);
    
    res.json({
      total_bets: parseInt(stats.total_bets),
      total_bet_amount: parseInt(stats.total_bet_amount || 0),
      claimed_bets: parseInt(stats.claimed_bets),
      pending_claims: parseInt(stats.pending_claims),
      wins: parseInt(winLoss.wins),
      losses: parseInt(winLoss.losses),
      win_rate: Math.round(winRate * 100) / 100,
      recent_activity: recentActivityResult.rows,
    });
    
  } catch (error) {
    logger.error('Failed to fetch user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get user's betting history
router.get('/:address/bets', async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const betsQuery = `
      SELECT 
        b.*,
        m.description as market_description,
        m.resolved,
        m.outcome,
        m.resolve_time
      FROM bets b
      JOIN markets m ON b.market_id = m.id
      WHERE b.user_address = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const betsResult = await query(betsQuery, [address, parseInt(limit), offset]);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bets b
      JOIN markets m ON b.market_id = m.id
      WHERE b.user_address = $1
    `;
    
    const countResult = await query(countQuery, [address]);
    
    const bets = betsResult.rows.map(bet => ({
      ...bet,
      market: {
        id: bet.market_id,
        description: bet.market_description,
        resolved: bet.resolved,
        outcome: bet.outcome,
        resolve_time: bet.resolve_time,
      },
      result: bet.resolved ? (bet.side === bet.outcome ? 'win' : 'loss') : 'pending',
    }));
    
    res.json({
      bets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
    
  } catch (error) {
    logger.error('Failed to fetch user bets:', error);
    res.status(500).json({ error: 'Failed to fetch user bets' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboardQuery = `
      SELECT 
        u.address,
        u.username,
        u.total_bets,
        u.total_winnings,
        COUNT(CASE WHEN (b.side = m.outcome) THEN 1 END) as wins,
        COUNT(CASE WHEN (b.side != m.outcome) THEN 1 END) as losses
      FROM users u
      LEFT JOIN bets b ON u.address = b.user_address
      LEFT JOIN markets m ON b.market_id = m.id AND m.resolved = true
      GROUP BY u.address, u.username, u.total_bets, u.total_winnings
      HAVING u.total_bets > 0
      ORDER BY u.total_winnings DESC, u.total_bets DESC
      LIMIT $1
    `;
    
    const result = await query(leaderboardQuery, [parseInt(limit)]);
    
    const leaderboard = result.rows.map((user, index) => ({
      rank: index + 1,
      address: user.address,
      username: user.username || 'Anonymous',
      total_bets: parseInt(user.total_bets),
      total_winnings: parseInt(user.total_winnings),
      wins: parseInt(user.wins || 0),
      losses: parseInt(user.losses || 0),
      win_rate: user.wins && user.losses 
        ? Math.round((user.wins / (user.wins + user.losses)) * 100 * 100) / 100 
        : 0,
    }));
    
    res.json({
      leaderboard,
      updated_at: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('Failed to fetch leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
