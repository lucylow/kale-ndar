export interface RealtimeEvent {
  id: string;
  type: 'market_created' | 'bet_placed' | 'market_updated' | 'market_resolved' | 'transaction_confirmed' | 'connection_established' | 'subscription_confirmed' | 'pong';
  data: any;
  timestamp: number;
  marketId?: string;
  userId?: string;
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'authenticate';
  data?: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<(event: RealtimeEvent) => void>> = new Map();
  private isConnected = false;
  private userId: string | null = null;

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection', { type: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('connection', { type: 'disconnected' });
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('connection', { type: 'error', error });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection', { type: 'failed' });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(event: RealtimeEvent): void {
    // Handle specific event types
    switch (event.type) {
      case 'connection_established':
        console.log('Connection established:', event.data);
        break;
      case 'subscription_confirmed':
        console.log('Subscription confirmed:', event.data);
        break;
      case 'pong':
        // Heartbeat response
        break;
      default:
        // Emit to listeners
        this.emit(event.type, event);
    }
  }

  private send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }

  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Subscribe to market updates
   */
  public subscribeToMarket(marketId: string): void {
    this.send({
      type: 'subscribe',
      data: { marketId }
    });
  }

  /**
   * Subscribe to all markets
   */
  public subscribeToAllMarkets(): void {
    this.send({
      type: 'subscribe',
      data: { type: 'all_markets' }
    });
  }

  /**
   * Subscribe to user updates
   */
  public subscribeToUser(userId: string): void {
    this.userId = userId;
    this.send({
      type: 'authenticate',
      data: { userId }
    });
    this.send({
      type: 'subscribe',
      data: { userId }
    });
  }

  /**
   * Unsubscribe from market updates
   */
  public unsubscribeFromMarket(marketId: string): void {
    this.send({
      type: 'unsubscribe',
      data: { marketId }
    });
  }

  /**
   * Unsubscribe from all markets
   */
  public unsubscribeFromAllMarkets(): void {
    this.send({
      type: 'unsubscribe',
      data: { type: 'all_markets' }
    });
  }

  /**
   * Add event listener
   */
  public on(eventType: string, listener: (event: RealtimeEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Remove event listener
   */
  public off(eventType: string, listener: (event: RealtimeEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect
   */
  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Reconnect manually
   */
  public reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
