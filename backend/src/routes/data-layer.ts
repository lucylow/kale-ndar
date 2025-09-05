import { Router, Request, Response } from 'express';
import { getDataLayerIntegration } from '../integration/data-layer-integration';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Data Layer API Routes
 * These routes demonstrate how to integrate the data layer with the existing backend
 */

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const health = await dataLayer.getHealthStatus();
    
    res.json({
      status: 'success',
      data: {
        overall: health.overall,
        services: {
          timescaleDB: health.timescaleDB,
          redisCluster: health.redisCluster,
          ipfsCluster: health.ipfsCluster,
          mongodb: health.mongodb,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test connections endpoint
router.get('/test-connections', async (req: Request, res: Response) => {
  try {
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const connections = await dataLayer.testConnections();
    
    res.json({
      status: 'success',
      data: {
        connections,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Connection test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Store farming event endpoint
router.post('/farming-events', async (req: Request, res: Response) => {
  try {
    const { eventTime, farmer, stakedAmount, workHash, reward, blockNumber, transactionHash } = req.body;
    
    // Validate required fields
    if (!eventTime || !farmer || !stakedAmount || !workHash || !reward) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: eventTime, farmer, stakedAmount, workHash, reward',
      });
    }
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const result = await dataLayer.storeFarmingEvent({
      eventTime: new Date(eventTime),
      farmer,
      stakedAmount,
      workHash,
      reward,
      blockNumber,
      transactionHash,
    });
    
    res.json({
      status: 'success',
      data: result,
      message: 'Farming event stored successfully',
    });
  } catch (error) {
    logger.error('Failed to store farming event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to store farming event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get farming statistics endpoint
router.get('/farming-stats/:farmer?', async (req: Request, res: Response) => {
  try {
    const { farmer } = req.params;
    const { startTime, endTime } = req.query;
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const stats = await dataLayer.getFarmingStats(
      farmer,
      startTime ? new Date(startTime as string) : undefined,
      endTime ? new Date(endTime as string) : undefined
    );
    
    res.json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get farming stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get farming stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Cache leaderboard endpoint
router.post('/leaderboards', async (req: Request, res: Response) => {
  try {
    const { name, entries, ttl } = req.body;
    
    if (!name || !entries) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, entries',
      });
    }
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    await dataLayer.cacheLeaderboard({ name, entries, ttl });
    
    res.json({
      status: 'success',
      message: 'Leaderboard cached successfully',
    });
  } catch (error) {
    logger.error('Failed to cache leaderboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cache leaderboard',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get leaderboard endpoint
router.get('/leaderboards/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { limit, offset, withScores } = req.query;
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const leaderboard = await dataLayer.getLeaderboard(name, {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      withScores: withScores === 'true',
    });
    
    res.json({
      status: 'success',
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Failed to get leaderboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get leaderboard',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Upload proof endpoint
router.post('/proofs', async (req: Request, res: Response) => {
  try {
    const { farmer, blockNumber, proofData } = req.body;
    
    if (!farmer || !proofData) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: farmer, proofData',
      });
    }
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const result = await dataLayer.uploadProof({ farmer, blockNumber, proofData });
    
    res.json({
      status: 'success',
      data: result,
      message: 'Proof uploaded successfully',
    });
  } catch (error) {
    logger.error('Failed to upload proof:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload proof',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get user profile endpoint
router.get('/users/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const profile = await dataLayer.getUserProfile(address);
    
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found',
      });
    }
    
    res.json({
      status: 'success',
      data: profile,
    });
  } catch (error) {
    logger.error('Failed to get user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update user profile endpoint
router.put('/users/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const updates = req.body;
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const profile = await dataLayer.updateUserProfile(address, updates);
    
    res.json({
      status: 'success',
      data: profile,
      message: 'User profile updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Cache market data endpoint
router.post('/markets/:marketId/cache', async (req: Request, res: Response) => {
  try {
    const { marketId } = req.params;
    const { data, ttl } = req.body;
    
    if (!data) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: data',
      });
    }
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    await dataLayer.cacheMarketData(marketId, data, ttl);
    
    res.json({
      status: 'success',
      message: 'Market data cached successfully',
    });
  } catch (error) {
    logger.error('Failed to cache market data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cache market data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get cached market data endpoint
router.get('/markets/:marketId/cache', async (req: Request, res: Response) => {
  try {
    const { marketId } = req.params;
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const data = await dataLayer.getCachedMarketData(marketId);
    
    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: 'Cached market data not found',
      });
    }
    
    res.json({
      status: 'success',
      data,
    });
  } catch (error) {
    logger.error('Failed to get cached market data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get cached market data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Cache price data endpoint
router.post('/prices/:symbol/cache', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { data, ttl } = req.body;
    
    if (!data) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: data',
      });
    }
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    await dataLayer.cachePriceData(symbol, data, ttl);
    
    res.json({
      status: 'success',
      message: 'Price data cached successfully',
    });
  } catch (error) {
    logger.error('Failed to cache price data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cache price data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get cached price data endpoint
router.get('/prices/:symbol/cache', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    const dataLayer = getDataLayerIntegration().getDataLayer();
    const data = await dataLayer.getCachedPriceData(symbol);
    
    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: 'Cached price data not found',
      });
    }
    
    res.json({
      status: 'success',
      data,
    });
  } catch (error) {
    logger.error('Failed to get cached price data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get cached price data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
