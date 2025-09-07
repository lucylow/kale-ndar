import { Router } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Mock data storage (replace with actual database)
let markets: any[] = [];
let bets: any[] = [];

// Market creation endpoint
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      endDate,
      options,
      initialLiquidity,
      fee,
      oracleType,
      resolutionCriteria,
    } = req.body;

    // Validation
    if (!title || !description || !category || !endDate || !options || !initialLiquidity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    if (options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 options are required',
      });
    }

    if (initialLiquidity < 10) {
      return res.status(400).json({
        success: false,
        error: 'Minimum initial liquidity is 10 KALE',
      });
    }

    // Create market
    const market = {
      id: uuidv4(),
      title,
      description,
      category,
      endDate: new Date(endDate).toISOString(),
      status: 'active',
      options: options.map((option: string, index: number) => ({
        id: `option_${index}`,
        name: option,
        odds: 1.0, // Initial odds
        bets: 0,
        amount: 0,
        percentage: 0,
      })),
      totalLiquidity: initialLiquidity,
      totalBets: 0,
      participants: 0,
      creator: req.body.userAddress || 'anonymous',
      createdAt: new Date().toISOString(),
      fee,
      oracleType,
      resolutionCriteria,
      metadata: {
        initialLiquidity,
        creatorFee: fee,
      },
    };

    markets.push(market);

    logger.info(`Market created: ${market.id} - ${market.title}`);

    res.status(201).json({
      success: true,
      data: market,
      message: 'Market created successfully',
    });

  } catch (error) {
    logger.error('Failed to create market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create market',
      message: error.message,
    });
  }
});

// Get all markets
router.get('/', async (req, res) => {
  try {
    const { category, status, limit = 50, offset = 0 } = req.query;

    let filteredMarkets = [...markets];

    // Filter by category
    if (category && category !== 'all') {
      filteredMarkets = filteredMarkets.filter(market => market.category === category);
    }

    // Filter by status
    if (status && status !== 'all') {
      filteredMarkets = filteredMarkets.filter(market => market.status === status);
    }

    // Sort by creation date (newest first)
    filteredMarkets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = Number(offset);
    const endIndex = startIndex + Number(limit);
    const paginatedMarkets = filteredMarkets.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedMarkets,
      pagination: {
        total: filteredMarkets.length,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: endIndex < filteredMarkets.length,
      },
    });

  } catch (error) {
    logger.error('Failed to get markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get markets',
      message: error.message,
    });
  }
});

// Get single market
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const market = markets.find(m => m.id === id);

    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found',
      });
    }

    res.json({
      success: true,
      data: market,
    });

  } catch (error) {
    logger.error('Failed to get market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market',
      message: error.message,
    });
  }
});

// Update market (for resolution, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const marketIndex = markets.findIndex(m => m.id === id);

    if (marketIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Market not found',
      });
    }

    // Update market
    markets[marketIndex] = {
      ...markets[marketIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    logger.info(`Market updated: ${id}`);

    res.json({
      success: true,
      data: markets[marketIndex],
      message: 'Market updated successfully',
    });

  } catch (error) {
    logger.error('Failed to update market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update market',
      message: error.message,
    });
  }
});

// Resolve market
router.post('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { winningOption, resolutionData } = req.body;

    const marketIndex = markets.findIndex(m => m.id === id);

    if (marketIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Market not found',
      });
    }

    const market = markets[marketIndex];

    if (market.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Market is not active',
      });
    }

    // Update market status
    markets[marketIndex] = {
      ...market,
      status: 'settled',
      winningOption,
      resolutionData,
      resolvedAt: new Date().toISOString(),
    };

    // Calculate payouts for all bets
    const marketBets = bets.filter(bet => bet.marketId === id);
    
    for (const bet of marketBets) {
      if (bet.optionId === winningOption) {
        // Winner - calculate payout
        const option = market.options.find(opt => opt.id === winningOption);
        const payout = bet.amount * (option?.odds || 1);
        
        // Update bet with payout info
        const betIndex = bets.findIndex(b => b.id === bet.id);
        if (betIndex !== -1) {
          bets[betIndex] = {
            ...bet,
            status: 'won',
            payout,
            profit: payout - bet.amount,
            resolvedAt: new Date().toISOString(),
          };
        }
      } else {
        // Loser
        const betIndex = bets.findIndex(b => b.id === bet.id);
        if (betIndex !== -1) {
          bets[betIndex] = {
            ...bet,
            status: 'lost',
            payout: 0,
            profit: -bet.amount,
            resolvedAt: new Date().toISOString(),
          };
        }
      }
    }

    logger.info(`Market resolved: ${id} - Winner: ${winningOption}`);

    res.json({
      success: true,
      data: markets[marketIndex],
      message: 'Market resolved successfully',
    });

  } catch (error) {
    logger.error('Failed to resolve market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve market',
      message: error.message,
    });
  }
});

// Get market statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const market = markets.find(m => m.id === id);

    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found',
      });
    }

    const marketBets = bets.filter(bet => bet.marketId === id);

    const stats = {
      totalBets: marketBets.length,
      totalVolume: marketBets.reduce((sum, bet) => sum + bet.amount, 0),
      uniqueParticipants: new Set(marketBets.map(bet => bet.userAddress)).size,
      averageBetSize: marketBets.length > 0 ? marketBets.reduce((sum, bet) => sum + bet.amount, 0) / marketBets.length : 0,
      optionStats: market.options.map(option => {
        const optionBets = marketBets.filter(bet => bet.optionId === option.id);
        return {
          ...option,
          totalBets: optionBets.length,
          totalAmount: optionBets.reduce((sum, bet) => sum + bet.amount, 0),
          averageBetSize: optionBets.length > 0 ? optionBets.reduce((sum, bet) => sum + bet.amount, 0) / optionBets.length : 0,
        };
      }),
    };

    res.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Failed to get market stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market stats',
      message: error.message,
    });
  }
});

export default router;
