import { EventEmitter } from 'events';
import { WebSocketOracleClient } from './websocket-oracle-client';
import { HttpOracleClient } from './http-oracle-client';

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

export type ConnectionMode = 'websocket' | 'http' | 'offline';

export class HybridOracleClient extends EventEmitter {
  private wsClient: WebSocketOracleClient;
  private httpClient: HttpOracleClient;
  private currentMode: ConnectionMode = 'offline';
  private preferredMode: 'websocket' | 'http' = 'websocket';
  private fallbackDelay = 5000; // 5 seconds
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isRunning = false;
  private subscribedAssets: Set<string> = new Set();

  constructor(
    wsUrl: string = 'ws://localhost:3000/ws/oracle',
    httpUrl: string = 'http://localhost:3000/api/oracle-demo'
  ) {
    super();
    this.wsClient = new WebSocketOracleClient(wsUrl);
    this.httpClient = new HttpOracleClient(httpUrl);
    
    this.setupEventListeners();
  }

  /**
   * Connect using the preferred method with automatic fallback
   */
  connect(): void {
    if (this.isRunning) {
      console.log('Hybrid oracle client already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting hybrid oracle client with preferred mode:', this.preferredMode);

    if (this.preferredMode === 'websocket') {
      this.connectWebSocket();
    } else {
      this.connectHttp();
    }
  }

  /**
   * Disconnect from all services
   */
  disconnect(): void {
    this.isRunning = false;
    this.currentMode = 'offline';
    
    this.wsClient.disconnect();
    this.httpClient.stop();
    
    this.emit('disconnected');
  }

  /**
   * Subscribe to assets
   */
  subscribeToAssets(assets: string[]): void {
    this.subscribedAssets = new Set(assets);
    
    if (this.currentMode === 'websocket') {
      this.wsClient.subscribeToAssets(assets);
    } else if (this.currentMode === 'http') {
      this.httpClient.subscribeToAssets(assets);
    }
  }

  /**
   * Unsubscribe from assets
   */
  unsubscribeFromAssets(assets: string[]): void {
    assets.forEach(asset => this.subscribedAssets.delete(asset));
    
    if (this.currentMode === 'websocket') {
      this.wsClient.unsubscribeFromAssets(assets);
    } else if (this.currentMode === 'http') {
      this.httpClient.unsubscribeFromAssets(assets);
    }
  }

  /**
   * Request latest prices
   */
  requestLatestPrices(): void {
    if (this.currentMode === 'websocket') {
      this.wsClient.requestLatestPrices();
    } else if (this.currentMode === 'http') {
      // HTTP client automatically fetches latest prices
      this.httpClient.forceUpdate();
    }
  }

  /**
   * Request metrics
   */
  requestMetrics(): void {
    if (this.currentMode === 'websocket') {
      this.wsClient.requestMetrics();
    } else if (this.currentMode === 'http') {
      // HTTP client automatically fetches metrics
    }
  }

  /**
   * Request node status
   */
  requestNodeStatus(): void {
    if (this.currentMode === 'websocket') {
      this.wsClient.requestNodeStatus();
    } else if (this.currentMode === 'http') {
      // HTTP client automatically fetches node status
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    mode: ConnectionMode;
    isConnected: boolean;
    subscribedAssets: string[];
    reconnectAttempts: number;
  } {
    return {
      mode: this.currentMode,
      isConnected: this.currentMode !== 'offline',
      subscribedAssets: Array.from(this.subscribedAssets),
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Set preferred connection mode
   */
  setPreferredMode(mode: 'websocket' | 'http'): void {
    this.preferredMode = mode;
    console.log('Preferred mode set to:', mode);
  }

  /**
   * Force switch to HTTP mode
   */
  switchToHttp(): void {
    console.log('Switching to HTTP mode');
    this.wsClient.disconnect();
    this.connectHttp();
  }

  /**
   * Force switch to WebSocket mode
   */
  switchToWebSocket(): void {
    console.log('Switching to WebSocket mode');
    this.httpClient.stop();
    this.connectWebSocket();
  }

  /**
   * Setup event listeners for both clients
   */
  private setupEventListeners(): void {
    // WebSocket client events
    this.wsClient.on('connected', () => {
      console.log('WebSocket connected successfully');
      this.currentMode = 'websocket';
      this.reconnectAttempts = 0;
      this.emit('connected', { mode: 'websocket' });
    });

    this.wsClient.on('disconnected', () => {
      console.log('WebSocket disconnected');
      if (this.currentMode === 'websocket') {
        this.handleWebSocketDisconnection();
      }
    });

    this.wsClient.on('priceUpdate', (data) => {
      this.emit('priceUpdate', data);
    });

    this.wsClient.on('metricsUpdate', (data) => {
      this.emit('metricsUpdate', data);
    });

    this.wsClient.on('nodeStatus', (data) => {
      this.emit('nodeStatus', data);
    });

    this.wsClient.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', { mode: 'websocket', error });
    });

    this.wsClient.on('maxReconnectAttemptsReached', () => {
      console.log('WebSocket max reconnection attempts reached, falling back to HTTP');
      this.fallbackToHttp();
    });

    // HTTP client events
    this.httpClient.on('started', () => {
      console.log('HTTP client started');
      this.currentMode = 'http';
      this.emit('connected', { mode: 'http' });
    });

    this.httpClient.on('stopped', () => {
      console.log('HTTP client stopped');
      if (this.currentMode === 'http') {
        this.currentMode = 'offline';
        this.emit('disconnected');
      }
    });

    this.httpClient.on('priceUpdate', (data) => {
      this.emit('priceUpdate', data);
    });

    this.httpClient.on('metricsUpdate', (data) => {
      this.emit('metricsUpdate', data);
    });

    this.httpClient.on('nodeStatus', (data) => {
      this.emit('nodeStatus', data);
    });

    this.httpClient.on('error', (error) => {
      console.error('HTTP client error:', error);
      this.emit('error', { mode: 'http', error });
    });
  }

  /**
   * Connect using WebSocket
   */
  private connectWebSocket(): void {
    console.log('Attempting WebSocket connection...');
    this.wsClient.connect();
  }

  /**
   * Connect using HTTP
   */
  private connectHttp(): void {
    console.log('Starting HTTP client...');
    this.httpClient.start(5000); // 5 second intervals
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleWebSocketDisconnection(): void {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      console.log(`WebSocket reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        if (this.isRunning && this.currentMode === 'websocket') {
          this.connectWebSocket();
        }
      }, this.fallbackDelay);
    } else {
      console.log('WebSocket max reconnection attempts reached, falling back to HTTP');
      this.fallbackToHttp();
    }
  }

  /**
   * Fallback to HTTP mode
   */
  private fallbackToHttp(): void {
    console.log('Falling back to HTTP mode');
    this.currentMode = 'http';
    this.reconnectAttempts = 0;
    
    // Start HTTP client
    this.httpClient.start(5000);
    
    // Resubscribe to assets
    if (this.subscribedAssets.size > 0) {
      this.httpClient.subscribeToAssets(Array.from(this.subscribedAssets));
    }
    
    this.emit('modeChanged', { from: 'websocket', to: 'http' });
  }

  /**
   * Try to reconnect WebSocket
   */
  private tryReconnectWebSocket(): void {
    if (this.preferredMode === 'websocket' && this.currentMode === 'http') {
      console.log('Attempting to reconnect WebSocket...');
      this.wsClient.connect();
    }
  }
}

// Singleton instance
let hybridClientInstance: HybridOracleClient | null = null;

export const getHybridOracleClient = (
  wsUrl?: string,
  httpUrl?: string
): HybridOracleClient => {
  if (!hybridClientInstance) {
    hybridClientInstance = new HybridOracleClient(wsUrl, httpUrl);
  }
  return hybridClientInstance;
};

export default HybridOracleClient;
