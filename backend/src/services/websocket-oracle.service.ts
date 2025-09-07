import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { LiveOracleUpdatesService } from './live-oracle-updates.service';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface WebSocketMessage {
  type: 'priceUpdate' | 'metricsUpdate' | 'nodeStatus' | 'error' | 'ping' | 'pong';
  data?: any;
  timestamp: number;
  id?: string;
}

export interface WebSocketClient {
  id: string;
  ws: WebSocket;
  subscribedAssets: Set<string>;
  lastPing: number;
  isAlive: boolean;
}

export class WebSocketOracleService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private oracleService: LiveOracleUpdatesService;
  private pingInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(server: Server, oracleService: LiveOracleUpdatesService) {
    this.oracleService = oracleService;
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/oracle',
    });

    this.setupWebSocketServer();
    this.setupOracleEventListeners();
  }

  /**
   * Start the WebSocket service
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('WebSocket oracle service already running');
      return;
    }

    this.isRunning = true;
    this.startPingInterval();
    logger.info('WebSocket oracle service started');
  }

  /**
   * Stop the WebSocket service
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.stopPingInterval();
    
    // Close all client connections
    for (const client of this.clients.values()) {
      client.ws.close();
    }
    
    this.clients.clear();
    logger.info('WebSocket oracle service stopped');
  }

  /**
   * Get connected clients count
   */
  getConnectedClients(): number {
    return this.clients.size;
  }

  /**
   * Get client statistics
   */
  getClientStats(): {
    totalClients: number;
    subscribedAssets: Record<string, number>;
    averageSubscriptions: number;
  } {
    const assetSubscriptions: Record<string, number> = {};
    let totalSubscriptions = 0;

    for (const client of this.clients.values()) {
      totalSubscriptions += client.subscribedAssets.size;
      
      for (const asset of client.subscribedAssets) {
        assetSubscriptions[asset] = (assetSubscriptions[asset] || 0) + 1;
      }
    }

    return {
      totalClients: this.clients.size,
      subscribedAssets: assetSubscriptions,
      averageSubscriptions: this.clients.size > 0 ? totalSubscriptions / this.clients.size : 0,
    };
  }

  /**
   * Setup WebSocket server
   */
  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = uuidv4();
      const clientIp = request.socket.remoteAddress;
      
      logger.info('New WebSocket client connected', { clientId, clientIp });

      const client: WebSocketClient = {
        id: clientId,
        ws,
        subscribedAssets: new Set(),
        lastPing: Date.now(),
        isAlive: true,
      };

      this.clients.set(clientId, client);

      // Send welcome message
      this.sendMessage(client, {
        type: 'ping',
        data: { message: 'Connected to Reflector Oracle WebSocket', clientId },
        timestamp: Date.now(),
        id: uuidv4(),
      });

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;
          this.handleClientMessage(client, message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', { clientId, error });
          this.sendError(client, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        logger.info('WebSocket client disconnected', { clientId });
        this.clients.delete(clientId);
      });

      // Handle connection errors
      ws.on('error', (error) => {
        logger.error('WebSocket client error', { clientId, error });
        this.clients.delete(clientId);
      });

      // Set up ping/pong handling
      ws.on('pong', () => {
        client.isAlive = true;
        client.lastPing = Date.now();
      });
    });

    logger.info('WebSocket server setup complete');
  }

  /**
   * Setup oracle service event listeners
   */
  private setupOracleEventListeners(): void {
    // Listen for price updates
    this.oracleService.on('priceUpdates', (updates: any[]) => {
      this.broadcastPriceUpdates(updates);
    });

    // Listen for metrics updates
    this.oracleService.on('metricsUpdate', (metrics: any) => {
      this.broadcastMetricsUpdate(metrics);
    });

    // Listen for node status changes
    this.oracleService.on('nodeFailure', (node: any) => {
      this.broadcastNodeStatus('failure', node);
    });

    this.oracleService.on('nodeRecovery', (node: any) => {
      this.broadcastNodeStatus('recovery', node);
    });
  }

  /**
   * Handle incoming client message
   */
  private handleClientMessage(client: WebSocketClient, message: WebSocketMessage): void {
    try {
      switch (message.type) {
        case 'ping':
          this.sendMessage(client, {
            type: 'pong',
            data: { message: 'Pong' },
            timestamp: Date.now(),
            id: message.id,
          });
          break;

        case 'subscribe':
          this.handleSubscription(client, message.data);
          break;

        case 'unsubscribe':
          this.handleUnsubscription(client, message.data);
          break;

        case 'getLatestPrices':
          this.sendLatestPrices(client);
          break;

        case 'getMetrics':
          this.sendMetrics(client);
          break;

        case 'getNodeStatus':
          this.sendNodeStatus(client);
          break;

        default:
          this.sendError(client, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('Error handling client message', { clientId: client.id, error });
      this.sendError(client, 'Internal server error');
    }
  }

  /**
   * Handle asset subscription
   */
  private handleSubscription(client: WebSocketClient, data: any): void {
    const { assets } = data;
    
    if (!Array.isArray(assets)) {
      this.sendError(client, 'Assets must be an array');
      return;
    }

    for (const asset of assets) {
      client.subscribedAssets.add(asset);
    }

    logger.info('Client subscribed to assets', { 
      clientId: client.id, 
      assets: Array.from(client.subscribedAssets) 
    });

    this.sendMessage(client, {
      type: 'priceUpdate',
      data: { 
        message: 'Subscription successful',
        subscribedAssets: Array.from(client.subscribedAssets)
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Handle asset unsubscription
   */
  private handleUnsubscription(client: WebSocketClient, data: any): void {
    const { assets } = data;
    
    if (!Array.isArray(assets)) {
      this.sendError(client, 'Assets must be an array');
      return;
    }

    for (const asset of assets) {
      client.subscribedAssets.delete(asset);
    }

    logger.info('Client unsubscribed from assets', { 
      clientId: client.id, 
      assets: Array.from(client.subscribedAssets) 
    });

    this.sendMessage(client, {
      type: 'priceUpdate',
      data: { 
        message: 'Unsubscription successful',
        subscribedAssets: Array.from(client.subscribedAssets)
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Send latest prices to client
   */
  private sendLatestPrices(client: WebSocketClient): void {
    const latestPrices = this.oracleService.getAllLatestPrices();
    
    this.sendMessage(client, {
      type: 'priceUpdate',
      data: { latestPrices },
      timestamp: Date.now(),
    });
  }

  /**
   * Send metrics to client
   */
  private sendMetrics(client: WebSocketClient): void {
    const metrics = this.oracleService.getOracleMetrics();
    
    this.sendMessage(client, {
      type: 'metricsUpdate',
      data: { metrics },
      timestamp: Date.now(),
    });
  }

  /**
   * Send node status to client
   */
  private sendNodeStatus(client: WebSocketClient): void {
    const nodes = this.oracleService.getOracleNodes();
    
    this.sendMessage(client, {
      type: 'nodeStatus',
      data: { nodes },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast price updates to subscribed clients
   */
  private broadcastPriceUpdates(updates: any[]): void {
    const message: WebSocketMessage = {
      type: 'priceUpdate',
      data: { updates },
      timestamp: Date.now(),
    };

    for (const client of this.clients.values()) {
      // Only send updates for subscribed assets
      const relevantUpdates = updates.filter(update => 
        client.subscribedAssets.has(update.asset) || client.subscribedAssets.size === 0
      );

      if (relevantUpdates.length > 0) {
        this.sendMessage(client, {
          ...message,
          data: { updates: relevantUpdates },
        });
      }
    }
  }

  /**
   * Broadcast metrics update to all clients
   */
  private broadcastMetricsUpdate(metrics: any): void {
    const message: WebSocketMessage = {
      type: 'metricsUpdate',
      data: { metrics },
      timestamp: Date.now(),
    };

    this.broadcastToAllClients(message);
  }

  /**
   * Broadcast node status to all clients
   */
  private broadcastNodeStatus(status: string, node: any): void {
    const message: WebSocketMessage = {
      type: 'nodeStatus',
      data: { status, node },
      timestamp: Date.now(),
    };

    this.broadcastToAllClients(message);
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcastToAllClients(message: WebSocketMessage): void {
    for (const client of this.clients.values()) {
      this.sendMessage(client, message);
    }
  }

  /**
   * Send message to specific client
   */
  private sendMessage(client: WebSocketClient, message: WebSocketMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error('Failed to send message to client', { clientId: client.id, error });
        this.clients.delete(client.id);
      }
    }
  }

  /**
   * Send error message to client
   */
  private sendError(client: WebSocketClient, error: string): void {
    this.sendMessage(client, {
      type: 'error',
      data: { error },
      timestamp: Date.now(),
    });
  }

  /**
   * Start ping interval to check client health
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      for (const client of this.clients.values()) {
        if (!client.isAlive) {
          logger.info('Terminating inactive client', { clientId: client.id });
          client.ws.terminate();
          this.clients.delete(client.id);
          continue;
        }

        client.isAlive = false;
        client.ws.ping();
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
