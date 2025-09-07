import { useEffect, useRef, useState } from 'react';
import { WebSocketService, MarketUpdate, UserUpdate } from '@/services/websocket.service';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onMarketUpdate?: (update: MarketUpdate) => void;
  onUserUpdate?: (update: UserUpdate) => void;
  onNotification?: (notification: any) => void;
  onError?: (error: any) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    onMarketUpdate,
    onUserUpdate,
    onNotification,
    onError,
  } = options;

  const wsServiceRef = useRef<WebSocketService | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    // Initialize WebSocket service
    const config = {
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
    };

    wsServiceRef.current = new WebSocketService(config);

    // Set up event listeners
    wsServiceRef.current.on('connected', () => {
      setConnectionState('connected');
    });

    wsServiceRef.current.on('disconnected', () => {
      setConnectionState('disconnected');
    });

    wsServiceRef.current.on('reconnect_failed', () => {
      setConnectionState('reconnecting');
    });

    wsServiceRef.current.on('market_update', (update: MarketUpdate) => {
      onMarketUpdate?.(update);
    });

    wsServiceRef.current.on('user_update', (update: UserUpdate) => {
      onUserUpdate?.(update);
    });

    wsServiceRef.current.on('notification', (notification: any) => {
      onNotification?.(notification);
    });

    wsServiceRef.current.on('error', (error: any) => {
      onError?.(error);
    });

    // Auto-connect if enabled
    if (autoConnect) {
      wsServiceRef.current.connect().catch(error => {
        console.error('WebSocket connection failed:', error);
        onError?.(error);
      });
    }

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
    };
  }, [autoConnect, onMarketUpdate, onUserUpdate, onNotification, onError]);

  const connect = async () => {
    if (wsServiceRef.current) {
      try {
        await wsServiceRef.current.connect();
      } catch (error) {
        onError?.(error);
      }
    }
  };

  const disconnect = () => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
    }
  };

  const subscribeToMarket = (marketId: string) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.subscribeToMarket(marketId);
      setSubscriptions(prev => [...prev, `market:${marketId}`]);
    }
  };

  const unsubscribeFromMarket = (marketId: string) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.unsubscribeFromMarket(marketId);
      setSubscriptions(prev => prev.filter(sub => sub !== `market:${marketId}`));
    }
  };

  const subscribeToUser = (userId: string) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.subscribeToUser(userId);
      setSubscriptions(prev => [...prev, `user:${userId}`]);
    }
  };

  const unsubscribeFromUser = (userId: string) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.unsubscribeFromUser(userId);
      setSubscriptions(prev => prev.filter(sub => sub !== `user:${userId}`));
    }
  };

  const sendMessage = (type: string, data: any) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.send({
        type,
        data,
        timestamp: Date.now(),
      });
    }
  };

  return {
    connectionState,
    subscriptions,
    connect,
    disconnect,
    subscribeToMarket,
    unsubscribeFromMarket,
    subscribeToUser,
    unsubscribeFromUser,
    sendMessage,
    isConnected: connectionState === 'connected',
  };
};

export default useWebSocket;
