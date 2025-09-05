import { DataLayerService } from '../services/data-layer.service';
import { getDataLayerConfig } from '../config/data-layer.config';
import { logger } from '../utils/logger';

/**
 * Data Layer Integration for KALE-ndar Backend
 * This module integrates the data layer services with the existing backend infrastructure
 */

export class DataLayerIntegration {
  private dataLayer: DataLayerService;
  private isInitialized: boolean = false;

  constructor() {
    const config = getDataLayerConfig();
    this.dataLayer = new DataLayerService(config);
  }

  /**
   * Initialize the data layer integration
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        logger.warn('Data layer integration already initialized');
        return;
      }

      await this.dataLayer.initialize();
      this.isInitialized = true;
      
      logger.info('✅ Data layer integration initialized successfully');
      
      // Perform initial health check
      await this.performHealthCheck();
      
    } catch (error) {
      logger.error('❌ Failed to initialize data layer integration:', error);
      throw error;
    }
  }

  /**
   * Perform health check on all services
   */
  async performHealthCheck(): Promise<void> {
    try {
      const health = await this.dataLayer.getHealthStatus();
      
      if (health.overall) {
        logger.info('✅ All data layer services are healthy');
      } else {
        logger.warn('⚠️  Some data layer services are unhealthy:', health);
      }
      
      // Log individual service status
      logger.info('Data layer health status:', {
        timescaleDB: health.timescaleDB ? '✅' : '❌',
        redisCluster: health.redisCluster ? '✅' : '❌',
        ipfsCluster: health.ipfsCluster ? '✅' : '❌',
        mongodb: health.mongodb ? '✅' : '❌',
      });
      
    } catch (error) {
      logger.error('Failed to perform health check:', error);
    }
  }

  /**
   * Get the data layer service instance
   */
  getDataLayer(): DataLayerService {
    if (!this.isInitialized) {
      throw new Error('Data layer integration not initialized');
    }
    return this.dataLayer;
  }

  /**
   * Check if integration is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Close the data layer integration
   */
  async close(): Promise<void> {
    try {
      if (this.dataLayer) {
        await this.dataLayer.close();
      }
      this.isInitialized = false;
      logger.info('Data layer integration closed');
    } catch (error) {
      logger.error('Error closing data layer integration:', error);
      throw error;
    }
  }

  /**
   * Setup periodic health checks
   */
  setupHealthChecks(intervalMs: number = 30000): void {
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Health check failed:', error);
      }
    }, intervalMs);
    
    logger.info(`Health checks scheduled every ${intervalMs}ms`);
  }
}

// Singleton instance for global access
let dataLayerIntegration: DataLayerIntegration | null = null;

/**
 * Get the global data layer integration instance
 */
export function getDataLayerIntegration(): DataLayerIntegration {
  if (!dataLayerIntegration) {
    dataLayerIntegration = new DataLayerIntegration();
  }
  return dataLayerIntegration;
}

/**
 * Initialize the global data layer integration
 */
export async function initializeDataLayer(): Promise<DataLayerIntegration> {
  const integration = getDataLayerIntegration();
  await integration.initialize();
  return integration;
}

/**
 * Close the global data layer integration
 */
export async function closeDataLayer(): Promise<void> {
  if (dataLayerIntegration) {
    await dataLayerIntegration.close();
    dataLayerIntegration = null;
  }
}

export default DataLayerIntegration;
