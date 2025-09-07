import { Router } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Mock data storage (replace with actual database)
let bets: any[] = [];
let markets: any[] = []; // This should be imported from markets service

// Place bet endpoint
router.post('/', async (req, res) => {
  try {
    const {
      marketId,
      optionId,
      amount,
      betType,
      userAddress,
    } = req.body;

    // Validation
    if (!marketId || !optionId || !amount || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Bet amount must be greater than 0',
      });
    }

    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Minimum bet is 1 KALE',
      });
    }

    // Find market
    const market = markets.find(m => m.id === marketId);

    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found',
      });
    }

    if (market.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Market is not accepting bets',
      });
    }

    // Check if market has ended
    if (new Date(market.endDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Market has ended',
      });
    }

    // Find option
    const option = market.options.find(opt => opt.id === optionId);

    if (!option) {
      return res.status(404).json({
        success: false,
        error: 'Option not found',
      });
    }

    // Check user balance (this should be a real check against user's KALE balance)
    // For now, we'll assume the user has sufficient balance

    // Create bet
    const bet = {
      id: uuidv4(),
      marketId,
      optionId,
      amount,
      betType,
      userAddress,
      odds: option.odds,
      estimatedPayout: amount * option.odds,
      potentialProfit: (amount * option.odds) - amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata: {
        marketTitle: market.title,
        optionName: option.name,
        category: market.category,
      },
    };

    bets.push(bet);

    // Update market statistics
    const marketIndex = markets.findIndex(m => m.id === marketId);
    if (marketIndex !== -1) {
      const optionIndex = markets[marketIndex].options.findIndex(opt => opt.id === optionId);
      if (optionIndex !== -1) {
        // Update option stats
        markets[marketIndex].options[optionIndex].bets += 1;
        markets[marketIndex].options[optionIndex].amount += amount;
        
        // Recalculate percentages
        const totalAmount = markets[marketIndex].options.reduce((sum, opt) => sum + opt.amount, 0);
        markets[marketIndex].options.forEach(opt => {
          opt.percentage = totalAmount > 0 ? (opt.amount / totalAmount) * 100 : 0;
        });

        // Update market stats
        markets[marketIndex].totalBets += 1;
        markets[marketIndex].totalLiquidity += amount;
        
        // Update participant count
        const uniqueParticipants = new Set(bets.filter(b => b.marketId === marketId).map(b => b.userAddress));
        markets[marketIndex].participants = uniqueParticipants.size;

        // Recalculate odds (simplified - in reality this would be more complex)
        markets[marketIndex].options.forEach(opt => {
          const totalBets = opt.amount;
          const totalMarketBets = markets[marketIndex].options.reduce((sum, o) => sum + o.amount, 0);
          opt.odds = totalMarketBets > 0 ? Math.max(1.0, totalMarketBets / totalBets) : 1.0;
        });
      }
    }

    logger.info(`Bet placed: ${bet.id} - ${amount} KALE on ${option.name} in market ${market.title}`);

    res.status(201).json({
      success: true,
      data: bet,
      message: 'Bet placed successfully',
    });

  } catch (error) {
    logger.error('Failed to place bet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place bet',
      message: error.message,
    });
  }
});

// Get user's bets
router.get('/user/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const { status, marketId, limit = 50, offset = 0 } = req.query;

    let userBets = bets.filter(bet => bet.userAddress === userAddress);

    // Filter by status
    if (status && status !== 'all') {
      userBets = userBets.filter(bet => bet.status === status);
    }

    // Filter by market
    if (marketId) {
      userBets = userBets.filter(bet => bet.marketId === marketId);
    }

    // Sort by creation date (newest first)
    userBets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = Number(offset);
    const endIndex = startIndex + Number(limit);
    const paginatedBets = userBets.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedBets,
      pagination: {
        total: userBets.length,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: endIndex < userBets.length,
      },
    });

  } catch (error) {
    logger.error('Failed to get user bets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user bets',
      message: error.message,
    });
  }
});

// Get bet details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bet = bets.find(b => b.id === id);

    if (!bet) {
      return res.status(404).json({
        success: false,
        error: 'Bet not found',
      });
    }

    res.json({
      success: true,
      data: bet,
    });

  } catch (error) {
    logger.error('Failed to get bet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bet',
      message: error.message,
    });
  }
});

// Cancel bet (if market allows it)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userAddress } = req.body;

    const betIndex = bets.findIndex(b => b.id === id);

    if (betIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Bet not found',
      });
    }

    const bet = bets[betIndex];

    // Check if user owns this bet
    if (bet.userAddress !== userAddress) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to cancel this bet',
      });
    }

    // Check if bet can be cancelled
    if (bet.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Bet cannot be cancelled',
      });
    }

    // Find market to check if cancellation is allowed
    const market = markets.find(m => m.id === bet.marketId);

    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found',
      });
    }

    // Check if market allows cancellation (this would be a market setting)
    // For now, we'll allow cancellation if market is still active and hasn't ended
    if (market.status !== 'active' || new Date(market.endDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Bet cannot be cancelled at this time',
      });
    }

    // Update bet status
    bets[betIndex] = {
      ...bet,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    };

    // Update market statistics
    const marketIndex = markets.findIndex(m => m.id === bet.marketId);
    if (marketIndex !== -1) {
      const optionIndex = markets[marketIndex].options.findIndex(opt => opt.id === bet.optionId);
      if (optionIndex !== -1) {
        // Update option stats
        markets[marketIndex].options[optionIndex].bets -= 1;
        markets[marketIndex].options[optionIndex].amount -= bet.amount;
        
        // Recalculate percentages
        const totalAmount = markets[marketIndex].options.reduce((sum, opt) => sum + opt.amount, 0);
        markets[marketIndex].options.forEach(opt => {
          opt.percentage = totalAmount > 0 ? (opt.amount / totalAmount) * 100 : 0;
        });

        // Update market stats
        markets[marketIndex].totalBets -= 1;
        markets[marketIndex].totalLiquidity -= bet.amount;
      }
    }

    logger.info(`Bet cancelled: ${id}`);

    res.json({
      success: true,
      data: bets[betIndex],
      message: 'Bet cancelled successfully',
    });

  } catch (error) {
    logger.error('Failed to cancel bet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel bet',
      message: error.message,
    });
  }
});

// Get betting statistics
router.get('/stats/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    const userBets = bets.filter(bet => bet.userAddress === userAddress);

    const stats = {
      totalBets: userBets.length,
      totalVolume: userBets.reduce((sum, bet) => sum + bet.amount, 0),
      pendingBets: userBets.filter(bet => bet.status === 'pending').length,
      wonBets: userBets.filter(bet => bet.status === 'won').length,
      lostBets: userBets.filter(bet => bet.status === 'lost').length,
      cancelledBets: userBets.filter(bet => bet.status === 'cancelled').length,
      winRate: userBets.length > 0 ? (userBets.filter(bet => bet.status === 'won').length / userBets.length) * 100 : 0,
      totalPayouts: userBets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + (bet.payout || 0), 0),
      totalProfit: userBets.reduce((sum, bet) => sum + (bet.profit || 0), 0),
      averageBetSize: userBets.length > 0 ? userBets.reduce((sum, bet) => sum + bet.amount, 0) / userBets.length : 0,
      favoriteCategory: getFavoriteCategory(userBets),
      currentStreak: calculateCurrentStreak(userBets),
      longestStreak: calculateLongestStreak(userBets),
    };

    res.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Failed to get betting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get betting stats',
      message: error.message,
    });
  }
});

// Helper functions
function getFavoriteCategory(userBets: any[]): string {
  const categoryCount: Record<string, number> = {};
  
  userBets.forEach(bet => {
    const category = bet.metadata?.category || 'unknown';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  return Object.keys(categoryCount).reduce((a, b) => 
    categoryCount[a] > categoryCount[b] ? a : b, 'unknown'
  );
}

function calculateCurrentStreak(userBets: any[]): number {
  const sortedBets = userBets
    .filter(bet => bet.status === 'won' || bet.status === 'lost')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  let streak = 0;
  let isWinning = true;

  for (const bet of sortedBets) {
    if (bet.status === 'won' && isWinning) {
      streak++;
    } else if (bet.status === 'lost' && !isWinning) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(userBets: any[]): number {
  const sortedBets = userBets
    .filter(bet => bet.status === 'won' || bet.status === 'lost')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let maxStreak = 0;
  let currentStreak = 0;
  let lastStatus = '';

  for (const bet of sortedBets) {
    if (bet.status === lastStatus) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
      lastStatus = bet.status;
    }
  }

  return Math.max(maxStreak, currentStreak);
}

export default router;
