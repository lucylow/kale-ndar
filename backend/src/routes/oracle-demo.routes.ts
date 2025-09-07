import express from 'express';
import { LiveOracleUpdatesService } from '../services/live-oracle-updates.service';
import { logger } from '../utils/logger';

const router = express.Router();

// Initialize the live oracle service
const oracleService = new LiveOracleUpdatesService();

// Start live updates when the service is first accessed
let isServiceStarted = false;

const ensureServiceStarted = () => {
  if (!isServiceStarted) {
    oracleService.startLiveUpdates(5000); // 5 second intervals
    isServiceStarted = true;
    logger.info('Live oracle updates service started');
  }
};

/**
 * Get all latest prices
 */
router.get('/latest-prices', async (req, res) => {
  try {
    ensureServiceStarted();
    const latestPrices = oracleService.getAllLatestPrices();
    
    res.json({
      success: true,
      data: latestPrices,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Failed to get latest prices:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get latest prices' 
    });
  }
});

/**
 * Get price history for an asset
 */
router.get('/price-history/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    const { hours = 24 } = req.query;
    
    ensureServiceStarted();
    const history = oracleService.getPriceHistory(assetId, parseInt(hours as string));
    
    res.json({
      success: true,
      data: {
        assetId,
        history,
        hours: parseInt(hours as string),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Failed to get price history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get price history' 
    });
  }
});

/**
 * Get oracle metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    ensureServiceStarted();
    const metrics = oracleService.getOracleMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Failed to get oracle metrics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get oracle metrics' 
    });
  }
});

/**
 * Get oracle nodes status
 */
router.get('/nodes', async (req, res) => {
  try {
    ensureServiceStarted();
    const nodes = oracleService.getOracleNodes();
    
    res.json({
      success: true,
      data: nodes,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Failed to get oracle nodes:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get oracle nodes' 
    });
  }
});

/**
 * Simulate node failure
 */
router.post('/simulate-failure/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    
    ensureServiceStarted();
    oracleService.simulateNodeFailure(nodeId);
    
    res.json({
      success: true,
      message: `Node ${nodeId} failure simulated`,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Failed to simulate node failure:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to simulate node failure' 
    });
  }
});

/**
 * Simulate node recovery
 */
router.post('/simulate-recovery/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    
    ensureServiceStarted();
    oracleService.simulateNodeRecovery(nodeId);
    
    res.json({
      success: true,
      message: `Node ${nodeId} recovery simulated`,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Failed to simulate node recovery:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to simulate node recovery' 
    });
  }
});

/**
 * Get service status
 */
router.get('/status', async (req, res) => {
  try {
    ensureServiceStarted();
    const status = oracleService.getStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Failed to get service status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get service status' 
    });
  }
});

/**
 * Force price update
 */
router.post('/force-update', async (req, res) => {
  try {
    ensureServiceStarted();
    
    // Trigger immediate price update
    (oracleService as any).generatePriceUpdates();
    
    res.json({
      success: true,
      message: 'Price update triggered',
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Failed to force price update:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to force price update' 
    });
  }
});

export default router;
