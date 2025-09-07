import { EventEmitter } from '@/lib/event-emitter';

export interface WebSocketMessage {
  type: 'priceUpdate' | 'metricsUpdate' | 'nodeStatus' | 'error' | 'ping' | 'pong' | 'subscribe' | 'unsubscribe' | 'getLatestPrices' | 'getMetrics' | 'getNodeStatus';
  data?: any;
  timestamp: number;
  id?: string;
}

export interface PriceUpdate {
  id: string;
  asset: string;
  symbol: string;
  price: string;
  formattedPrice: string;
  timestamp: number;
  confidence: number;
  source: string;
  change24h: number;
  volume24h: number;
  oracleNode: string;
  transactionHash?: string;
}

export interface OracleMetrics {
  totalUpdates: number;
  averageConfidence: number;
  activeNodes: number;
  uptime: number;
  lastUpdateTime: number;
  updateFrequency: number;
}

export interface OracleNode {
  id: string;
  address: string;
  name: string;
  isActive: boolean;
  lastUpdate: number;
  updateCount: number;
  averageConfidence: number;
  reliability: number;
}

export class WebSocketOracleClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private subscribedAssets: Set<string> = new Set();
  private url: string;

  constructor(url: string = 'ws://localhost:3000/ws/oracle') {
    super();
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isConnected = false;
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.emit('disconnected');
  }

  /**
   * Subscribe to price updates for specific assets
   */
  subscribeToAssets(assets: string[]): void {
    this.subscribedAssets = new Set(assets);
    
    if (this.isConnected && this.ws) {
      this.sendMessage({
        type: 'subscribe',
        data: { assets },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Unsubscribe from price updates for specific assets
   */
  unsubscribeFromAssets(assets: string[]): void {
    assets.forEach(asset => this.subscribedAssets.delete(asset));
    
    if (this.isConnected && this.ws) {
      this.sendMessage({
        type: 'unsubscribe',
        data: { assets },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Request latest prices
   */
  requestLatestPrices(): void {
    if (this.isConnected && this.ws) {
      this.sendMessage({
        type: 'getLatestPrices',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Request oracle metrics
   */
  requestMetrics(): void {
    if (this.isConnected && this.ws) {
      this.sendMessage({
        type: 'getMetrics',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Request node status
   */
  requestNodeStatus(): void {
    if (this.isConnected && this.ws) {
      this.sendMessage({
        type: 'getNodeStatus',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean;
    subscribedAssets: string[];
    url: string;
  } {
    return {
      isConnected: this.isConnected,
      subscribedAssets: Array.from(this.subscribedAssets),
      url: this.url,
    };
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startPingInterval();
      
      // Resubscribe to assets if any
      if (this.subscribedAssets.size > 0) {
        this.subscribeToAssets(Array.from(this.subscribedAssets));
      }

      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected', { code: event.code, reason: event.reason });
      this.isConnected = false;
      this.stopPingInterval();
      
      if (event.code !== 1000) { // Not a normal closure
        this.handleReconnect();
      }
      
      this.emit('disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'priceUpdate':
        this.emit('priceUpdate', message.data);
        break;
        
      case 'metricsUpdate':
        this.emit('metricsUpdate', message.data);
        break;
        
      case 'nodeStatus':
        this.emit('nodeStatus', message.data);
        break;
        
      case 'error':
        console.error('Server error:', message.data?.error);
        this.emit('serverError', message.data?.error);
        break;
        
      case 'ping':
        this.sendMessage({
          type: 'pong',
          data: { message: 'Pong' },
          timestamp: Date.now(),
          id: message.id,
        });
        break;
        
      case 'pong':
        // Handle pong response
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Send message to WebSocket server
   */
  private sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.sendMessage({
          type: 'ping',
          data: { message: 'Ping' },
          timestamp: Date.now(),
        });
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

// Singleton instance
let wsClientInstance: WebSocketOracleClient | null = null;

export const getWebSocketOracleClient = (url?: string): WebSocketOracleClient => {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketOracleClient(url);
  }
  return wsClientInstance;
};

export default WebSocketOracleClient;
