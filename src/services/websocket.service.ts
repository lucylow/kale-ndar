import { EventEmitter } from 'events';

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

export interface MarketUpdate {
  marketId: string;
  type: 'PRICE_UPDATE' | 'ODDS_UPDATE' | 'VOLUME_UPDATE' | 'RESOLUTION' | 'NEW_BET';
  data: any;
  timestamp: number;
}

export interface UserUpdate {
  userId: string;
  type: 'BALANCE_UPDATE' | 'BET_SETTLED' | 'STREAK_UPDATE' | 'ACHIEVEMENT';
  data: any;
  timestamp: number;
}

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private subscriptions = new Set<string>();

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
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
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.subscriptions.clear();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    
    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval! * Math.pow(2, Math.min(this.reconnectAttempts - 1, 5));
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
        this.emit('reconnect_failed', error);
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send({ type: 'ping', data: {}, timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'pong':
        // Heartbeat response
        break;
      case 'market_update':
        this.emit('market_update', message.data as MarketUpdate);
        break;
      case 'user_update':
        this.emit('user_update', message.data as UserUpdate);
        break;
      case 'notification':
        this.emit('notification', message.data);
        break;
      case 'error':
        this.emit('websocket_error', message.data);
        break;
      default:
        this.emit('message', message);
    }
  }

  send(message: WebSocketMessage): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  subscribeToMarket(marketId: string): void {
    this.subscriptions.add(`market:${marketId}`);
    this.send({
      type: 'subscribe',
      data: { channel: `market:${marketId}` },
      timestamp: Date.now(),
    });
  }

  unsubscribeFromMarket(marketId: string): void {
    this.subscriptions.delete(`market:${marketId}`);
    this.send({
      type: 'unsubscribe',
      data: { channel: `market:${marketId}` },
      timestamp: Date.now(),
    });
  }

  subscribeToUser(userId: string): void {
    this.subscriptions.add(`user:${userId}`);
    this.send({
      type: 'subscribe',
      data: { channel: `user:${userId}` },
      timestamp: Date.now(),
    });
  }

  unsubscribeFromUser(userId: string): void {
    this.subscriptions.delete(`user:${userId}`);
    this.send({
      type: 'unsubscribe',
      data: { channel: `user:${userId}` },
      timestamp: Date.now(),
    });
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'reconnecting' {
    if (this.isConnected) return 'connected';
    if (this.reconnectTimer) return 'reconnecting';
    if (this.ws?.readyState === WebSocket.CONNECTING) return 'connecting';
    return 'disconnected';
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }
}

// Singleton instance
let wsService: WebSocketService | null = null;

export const getWebSocketService = (config?: WebSocketConfig): WebSocketService => {
  if (!wsService && config) {
    wsService = new WebSocketService(config);
  }
  
  if (!wsService) {
    throw new Error('WebSocket service not initialized. Call with config first.');
  }
  
  return wsService;
};

export default WebSocketService;
