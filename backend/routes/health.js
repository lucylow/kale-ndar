const express = require('express');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { getConnectedClientsCount } = require('../utils/websocket');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Detailed health check with database connectivity
router.get('/detailed', async (req, res) => {
  try {
    // Check database connectivity
    const dbResult = await query('SELECT NOW() as current_time');
    
    // Check WebSocket connections
    const wsConnections = getConnectedClientsCount();
    
    // Get system info
    const systemInfo = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        currentTime: dbResult.rows[0].current_time,
      },
      websocket: {
        connections: wsConnections,
        status: 'active',
      },
      system: systemInfo,
    });
    
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'disconnected',
      },
    });
  }
});

// Database health check
router.get('/database', async (req, res) => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    
    res.json({
      status: 'connected',
      timestamp: new Date().toISOString(),
      database: {
        currentTime: result.rows[0].current_time,
        version: result.rows[0].version,
      },
    });
    
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({
      status: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// WebSocket health check
router.get('/websocket', (req, res) => {
  const connections = getConnectedClientsCount();
  
  res.json({
    status: 'active',
    timestamp: new Date().toISOString(),
    connections,
  });
});

module.exports = router;
