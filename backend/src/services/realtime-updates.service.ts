import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

export interface RealtimeEvent {
  id: string;
  type: 'market_created' | 'bet_placed' | 'market_updated' | 'market_resolved' | 'transaction_confirmed';
  data: any;
  timestamp: number;
  marketId?: string;
  userId?: string;
}

export interface WebSocketConnection {
  id: string;
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
  lastPing: number;
}

export class RealtimeUpdatesService {
  private wss: WebSocketServer;
  private connections: Map<string, WebSocketConnection> = new Map();
  private heartbeatInterval: NodeJS.Timeout;
  private cleanupInterval: NodeJS.Timeout;

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
    this.startHeartbeat();
    this.startCleanup();
    
    logger.info(`WebSocket server started on port ${port}`);
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const connectionId = randomUUID();
      const connection: WebSocketConnection = {
        id: connectionId,
        ws,
        subscriptions: new Set(),
        lastPing: Date.now(),
      };

      this.connections.set(connectionId, connection);

      logger.info(`New WebSocket connection: ${connectionId}`);

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(connectionId, message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error);
        }
      });

      // Handle connection close
      ws.on('close', () => {
        this.connections.delete(connectionId);
        logger.info(`WebSocket connection closed: ${connectionId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for connection ${connectionId}:`, error);
        this.connections.delete(connectionId);
      });

      // Send welcome message
      this.sendToConnection(connectionId, {
        type: 'connection_established',
        data: { connectionId },
        timestamp: Date.now(),
      });
    });
  }

  private handleMessage(connectionId: string, message: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(connectionId, message.data);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(connectionId, message.data);
        break;
      case 'ping':
        this.handlePing(connectionId);
        break;
      case 'authenticate':
        this.handleAuthenticate(connectionId, message.data);
        break;
      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
  }

  private handleSubscribe(connectionId: string, data: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    if (data.marketId) {
      connection.subscriptions.add(`market:${data.marketId}`);
    }
    if (data.userId) {
      connection.subscriptions.add(`user:${data.userId}`);
    }
    if (data.type === 'all_markets') {
      connection.subscriptions.add('all_markets');
    }

    this.sendToConnection(connectionId, {
      type: 'subscription_confirmed',
      data: { subscriptions: Array.from(connection.subscriptions) },
      timestamp: Date.now(),
    });
  }

  private handleUnsubscribe(connectionId: string, data: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    if (data.marketId) {
      connection.subscriptions.delete(`market:${data.marketId}`);
    }
    if (data.userId) {
      connection.subscriptions.delete(`user:${data.userId}`);
    }
    if (data.type === 'all_markets') {
      connection.subscriptions.delete('all_markets');
    }
  }

  private handlePing(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastPing = Date.now();
      this.sendToConnection(connectionId, {
        type: 'pong',
        data: {},
        timestamp: Date.now(),
      });
    }
  }

  private handleAuthenticate(connectionId: string, data: any): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.userId = data.userId;
      logger.info(`User ${data.userId} authenticated on connection ${connectionId}`);
    }
  }

  private sendToConnection(connectionId: string, event: RealtimeEvent): void {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) return;

    try {
      connection.ws.send(JSON.stringify(event));
    } catch (error) {
      logger.error(`Failed to send message to connection ${connectionId}:`, error);
      this.connections.delete(connectionId);
    }
  }

  /**
   * Broadcast event to all connections
   */
  public broadcastEvent(event: RealtimeEvent): void {
    this.connections.forEach((connection, connectionId) => {
      if (this.shouldSendToConnection(connection, event)) {
        this.sendToConnection(connectionId, event);
      }
    });
  }

  /**
   * Send event to specific user
   */
  public sendToUser(userId: string, event: RealtimeEvent): void {
    this.connections.forEach((connection, connectionId) => {
      if (connection.userId === userId) {
        this.sendToConnection(connectionId, event);
      }
    });
  }

  /**
   * Send event to market subscribers
   */
  public sendToMarket(marketId: string, event: RealtimeEvent): void {
    this.connections.forEach((connection, connectionId) => {
      if (connection.subscriptions.has(`market:${marketId}`) || 
          connection.subscriptions.has('all_markets')) {
        this.sendToConnection(connectionId, event);
      }
    });
  }

  private shouldSendToConnection(connection: WebSocketConnection, event: RealtimeEvent): boolean {
    // Send to all_markets subscribers
    if (connection.subscriptions.has('all_markets')) {
      return true;
    }

    // Send to specific market subscribers
    if (event.marketId && connection.subscriptions.has(`market:${event.marketId}`)) {
      return true;
    }

    // Send to specific user
    if (event.userId && connection.userId === event.userId) {
      return true;
    }

    return false;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.connections.forEach((connection, connectionId) => {
        if (connection.ws.readyState === WebSocket.OPEN) {
          try {
            connection.ws.ping();
          } catch (error) {
            logger.error(`Failed to ping connection ${connectionId}:`, error);
            this.connections.delete(connectionId);
          }
        }
      });
    }, 30000); // 30 seconds
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      this.connections.forEach((connection, connectionId) => {
        // Remove connections that haven't pinged in 2 minutes
        if (now - connection.lastPing > 120000) {
          logger.info(`Cleaning up stale connection: ${connectionId}`);
          connection.ws.close();
          this.connections.delete(connectionId);
        }
      });
    }, 60000); // 1 minute
  }

  /**
   * Market created event
   */
  public notifyMarketCreated(market: any): void {
    const event: RealtimeEvent = {
      id: randomUUID(),
      type: 'market_created',
      data: market,
      timestamp: Date.now(),
      marketId: market.id,
    };

    this.broadcastEvent(event);
  }

  /**
   * Bet placed event
   */
  public notifyBetPlaced(bet: any, marketId: string): void {
    const event: RealtimeEvent = {
      id: randomUUID(),
      type: 'bet_placed',
      data: bet,
      timestamp: Date.now(),
      marketId,
      userId: bet.userAddress,
    };

    this.broadcastEvent(event);
  }

  /**
   * Market updated event
   */
  public notifyMarketUpdated(market: any): void {
    const event: RealtimeEvent = {
      id: randomUUID(),
      type: 'market_updated',
      data: market,
      timestamp: Date.now(),
      marketId: market.id,
    };

    this.sendToMarket(market.id, event);
  }

  /**
   * Market resolved event
   */
  public notifyMarketResolved(market: any): void {
    const event: RealtimeEvent = {
      id: randomUUID(),
      type: 'market_resolved',
      data: market,
      timestamp: Date.now(),
      marketId: market.id,
    };

    this.broadcastEvent(event);
  }

  /**
   * Transaction confirmed event
   */
  public notifyTransactionConfirmed(transactionHash: string, data: any): void {
    const event: RealtimeEvent = {
      id: randomUUID(),
      type: 'transaction_confirmed',
      data: { transactionHash, ...data },
      timestamp: Date.now(),
    };

    this.broadcastEvent(event);
  }

  /**
   * Get connection stats
   */
  public getStats(): any {
    return {
      totalConnections: this.connections.size,
      connections: Array.from(this.connections.values()).map(conn => ({
        id: conn.id,
        userId: conn.userId,
        subscriptions: Array.from(conn.subscriptions),
        lastPing: conn.lastPing,
      })),
    };
  }

  /**
   * Close all connections
   */
  public close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.connections.forEach((connection) => {
      connection.ws.close();
    });
    
    this.wss.close();
  }
}
