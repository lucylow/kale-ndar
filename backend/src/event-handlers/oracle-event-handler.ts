import { OracleService } from '../services/oracle.service';
import { MarketResolutionService } from '../services/market-resolution.service';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface OracleEventHandlerConfig {
  oracleService: OracleService;
  resolutionService: MarketResolutionService;
  enableAutoResolution: boolean;
  maxRetries: number;
  retryDelay: number;
}

export interface ProcessedEvent {
  id: string;
  subscriptionId: string;
  marketId: string;
  eventType: string;
  timestamp: number;
  processed: boolean;
  retryCount: number;
  error?: string;
}

export class OracleEventHandler {
  private config: OracleEventHandlerConfig;
  private processedEvents: Map<string, ProcessedEvent> = new Map();
  private eventQueue: ProcessedEvent[] = [];
  private isProcessing: boolean = false;

  constructor(config: OracleEventHandlerConfig) {
    this.config = config;
    this.startEventProcessor();
  }

  /**
   * Handle incoming oracle webhook
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      const eventId = uuidv4();
      const processedEvent: ProcessedEvent = {
        id: eventId,
        subscriptionId: payload.subscriptionId,
        marketId: payload.marketId || '',
        eventType: payload.eventType,
        timestamp: Date.now(),
        processed: false,
        retryCount: 0,
      };

      // Add to queue for processing
      this.eventQueue.push(processedEvent);
      this.processedEvents.set(eventId, processedEvent);

      logger.info('Oracle webhook received and queued:', {
        eventId,
        subscriptionId: payload.subscriptionId,
        eventType: payload.eventType,
        queueLength: this.eventQueue.length,
      });

      // Process immediately if not already processing
      if (!this.isProcessing) {
        await this.processEventQueue();
      }
    } catch (error) {
      logger.error('Failed to handle oracle webhook:', error);
      throw error;
    }
  }

  /**
   * Start the event processor
   */
  private startEventProcessor(): void {
    // Process events every 5 seconds
    setInterval(async () => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        await this.processEventQueue();
      }
    }, 5000);

    // Clean up old processed events every hour
    setInterval(() => {
      this.cleanupProcessedEvents();
    }, 60 * 60 * 1000);

    logger.info('Oracle event handler started');
  }

  /**
   * Process the event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (!event) continue;

        await this.processEvent(event);
      }
    } catch (error) {
      logger.error('Error processing event queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single event
   */
  private async processEvent(event: ProcessedEvent): Promise<void> {
    try {
      logger.info('Processing oracle event:', {
        eventId: event.id,
        subscriptionId: event.subscriptionId,
        eventType: event.eventType,
        retryCount: event.retryCount,
      });

      // Handle different event types
      switch (event.eventType) {
        case 'price_update':
          await this.handlePriceUpdate(event);
          break;
          
        case 'threshold_breach':
          await this.handleThresholdBreach(event);
          break;
          
        case 'heartbeat':
          await this.handleHeartbeat(event);
          break;
          
        case 'event_data':
          await this.handleEventData(event);
          break;
          
        default:
          logger.warn('Unknown oracle event type:', event.eventType);
          event.processed = true;
          event.error = 'Unknown event type';
      }

      // Mark as processed
      event.processed = true;
      this.processedEvents.set(event.id, event);

      logger.info('Oracle event processed successfully:', {
        eventId: event.id,
        eventType: event.eventType,
      });
    } catch (error) {
      logger.error('Failed to process oracle event:', {
        eventId: event.id,
        error: error.message,
        retryCount: event.retryCount,
      });

      // Handle retry logic
      event.retryCount++;
      event.error = error.message;

      if (event.retryCount < this.config.maxRetries) {
        // Retry after delay
        setTimeout(() => {
          this.eventQueue.push(event);
        }, this.config.retryDelay * event.retryCount);
      } else {
        // Max retries exceeded, mark as failed
        event.processed = true;
        logger.error('Oracle event failed after max retries:', {
          eventId: event.id,
          retryCount: event.retryCount,
        });
      }

      this.processedEvents.set(event.id, event);
    }
  }

  /**
   * Handle price update event
   */
  private async handlePriceUpdate(event: ProcessedEvent): Promise<void> {
    try {
      // Get oracle data for the market
      const oracleData = await this.config.oracleService.getOracleDataForMarket(event.marketId);
      
      if (!oracleData) {
        throw new Error('No oracle data found for market');
      }

      logger.info('Price update processed:', {
        marketId: event.marketId,
        price: oracleData.price,
        timestamp: oracleData.timestamp,
      });

      // Check if this triggers market resolution
      if (this.config.enableAutoResolution) {
        await this.checkMarketResolution(event.marketId, oracleData);
      }
    } catch (error) {
      logger.error('Failed to handle price update:', error);
      throw error;
    }
  }

  /**
   * Handle threshold breach event
   */
  private async handleThresholdBreach(event: ProcessedEvent): Promise<void> {
    try {
      logger.info('Threshold breach detected:', {
        marketId: event.marketId,
        subscriptionId: event.subscriptionId,
      });

      // This could trigger immediate market resolution
      if (this.config.enableAutoResolution) {
        const oracleData = await this.config.oracleService.getOracleDataForMarket(event.marketId);
        if (oracleData) {
          await this.checkMarketResolution(event.marketId, oracleData);
        }
      }
    } catch (error) {
      logger.error('Failed to handle threshold breach:', error);
      throw error;
    }
  }

  /**
   * Handle heartbeat event
   */
  private async handleHeartbeat(event: ProcessedEvent): Promise<void> {
    try {
      logger.info('Oracle heartbeat received:', {
        subscriptionId: event.subscriptionId,
        marketId: event.marketId,
      });

      // Update subscription status
      // This would typically update the database
    } catch (error) {
      logger.error('Failed to handle heartbeat:', error);
      throw error;
    }
  }

  /**
   * Handle event data
   */
  private async handleEventData(event: ProcessedEvent): Promise<void> {
    try {
      logger.info('Event data received:', {
        marketId: event.marketId,
        subscriptionId: event.subscriptionId,
      });

      // Process event data and check for resolution triggers
      if (this.config.enableAutoResolution) {
        const oracleData = await this.config.oracleService.getOracleDataForMarket(event.marketId);
        if (oracleData) {
          await this.checkMarketResolution(event.marketId, oracleData);
        }
      }
    } catch (error) {
      logger.error('Failed to handle event data:', error);
      throw error;
    }
  }

  /**
   * Check if oracle data triggers market resolution
   */
  private async checkMarketResolution(marketId: string, oracleData: any): Promise<void> {
    try {
      // Try to resolve market based on oracle data
      const resolutionResult = await this.config.resolutionService.processOracleResolution(marketId);
      
      if (resolutionResult && resolutionResult.success) {
        logger.info('Market resolved via oracle:', {
          marketId,
          winningOutcome: resolutionResult.winningOutcome,
          resolutionType: resolutionResult.resolutionType,
          totalBets: resolutionResult.totalBets,
          totalPayouts: resolutionResult.totalPayouts,
        });
      } else {
        logger.info('Oracle data insufficient for market resolution:', {
          marketId,
          hasOracleData: !!oracleData,
        });
      }
    } catch (error) {
      logger.error('Failed to check market resolution:', error);
      throw error;
    }
  }

  /**
   * Clean up old processed events
   */
  private cleanupProcessedEvents(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [eventId, event] of this.processedEvents.entries()) {
      if (event.processed && event.timestamp < cutoffTime) {
        this.processedEvents.delete(eventId);
      }
    }

    logger.info('Cleaned up old processed events:', {
      remainingEvents: this.processedEvents.size,
    });
  }

  /**
   * Get event processing statistics
   */
  getEventStats(): {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    queueLength: number;
    isProcessing: boolean;
  } {
    const totalEvents = this.processedEvents.size;
    const processedEvents = Array.from(this.processedEvents.values()).filter(e => e.processed).length;
    const failedEvents = Array.from(this.processedEvents.values()).filter(e => e.processed && e.error).length;

    return {
      totalEvents,
      processedEvents,
      failedEvents,
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Get failed events for debugging
   */
  getFailedEvents(): ProcessedEvent[] {
    return Array.from(this.processedEvents.values()).filter(e => e.processed && e.error);
  }

  /**
   * Retry failed events
   */
  async retryFailedEvents(): Promise<void> {
    const failedEvents = this.getFailedEvents();
    
    for (const event of failedEvents) {
      event.processed = false;
      event.retryCount = 0;
      event.error = undefined;
      this.eventQueue.push(event);
    }

    logger.info('Retrying failed events:', {
      count: failedEvents.length,
    });

    if (!this.isProcessing) {
      await this.processEventQueue();
    }
  }

  /**
   * Stop the event handler
   */
  stop(): void {
    logger.info('Oracle event handler stopped');
  }
}
