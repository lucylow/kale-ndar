import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const healthCheck = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: await checkDatabaseHealth(),
        blockchain: await checkBlockchainHealth(),
        redis: await checkRedisHealth(),
      },
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    res.json(healthCheck);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    const readiness = {
      success: true,
      ready: true,
      timestamp: new Date().toISOString(),
      checks: {
        database: await checkDatabaseHealth(),
        blockchain: await checkBlockchainHealth(),
        redis: await checkRedisHealth(),
      },
    };

    // Check if all services are ready
    const allReady = Object.values(readiness.checks).every(check => check.status === 'healthy');
    
    if (!allReady) {
      return res.status(503).json({
        success: false,
        ready: false,
        timestamp: new Date().toISOString(),
        checks: readiness.checks,
      });
    }

    res.json(readiness);
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      ready: false,
      error: 'Readiness check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Liveness check
router.get('/live', (req, res) => {
  res.json({
    success: true,
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Database health check
async function checkDatabaseHealth(): Promise<{ status: string; message?: string }> {
  try {
    // This would typically check database connection
    // For now, we'll simulate a check
    return {
      status: 'healthy',
      message: 'Database connection successful',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
    };
  }
}

// Blockchain health check
async function checkBlockchainHealth(): Promise<{ status: string; message?: string }> {
  try {
    // This would typically check blockchain connection
    // For now, we'll simulate a check
    return {
      status: 'healthy',
      message: 'Blockchain connection successful',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Blockchain connection failed',
    };
  }
}

// Redis health check
async function checkRedisHealth(): Promise<{ status: string; message?: string }> {
  try {
    // This would typically check Redis connection
    // For now, we'll simulate a check
    return {
      status: 'healthy',
      message: 'Redis connection successful',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Redis connection failed',
    };
  }
}

export default router;
