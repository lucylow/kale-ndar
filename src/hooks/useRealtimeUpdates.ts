import { useEffect, useState, useCallback } from 'react';
import { websocketService, RealtimeEvent } from '@/services/websocketService';

export interface UseRealtimeUpdatesOptions {
  marketId?: string;
  userId?: string;
  subscribeToAllMarkets?: boolean;
}

export interface RealtimeUpdate {
  type: string;
  data: any;
  timestamp: number;
  marketId?: string;
  userId?: string;
}

export const useRealtimeUpdates = (options: UseRealtimeUpdatesOptions = {}) => {
  const [isConnected, setIsConnected] = useState(websocketService.getConnectionStatus());
  const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null);
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);

  const handleEvent = useCallback((event: RealtimeEvent) => {
    const update: RealtimeUpdate = {
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
      marketId: event.marketId,
      userId: event.userId,
    };

    setLastUpdate(update);
    setUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates
  }, []);

  const handleConnectionChange = useCallback((event: any) => {
    setIsConnected(event.type === 'connected');
  }, []);

  useEffect(() => {
    // Set up event listeners
    websocketService.on('connection', handleConnectionChange);
    
    // Subscribe to specific events
    if (options.marketId) {
      websocketService.subscribeToMarket(options.marketId);
      websocketService.on('market_updated', handleEvent);
      websocketService.on('market_resolved', handleEvent);
    }

    if (options.userId) {
      websocketService.subscribeToUser(options.userId);
      websocketService.on('bet_placed', handleEvent);
      websocketService.on('transaction_confirmed', handleEvent);
    }

    if (options.subscribeToAllMarkets) {
      websocketService.subscribeToAllMarkets();
      websocketService.on('market_created', handleEvent);
      websocketService.on('market_updated', handleEvent);
      websocketService.on('bet_placed', handleEvent);
    }

    // Cleanup
    return () => {
      websocketService.off('connection', handleConnectionChange);
      
      if (options.marketId) {
        websocketService.unsubscribeFromMarket(options.marketId);
        websocketService.off('market_updated', handleEvent);
        websocketService.off('market_resolved', handleEvent);
      }

      if (options.userId) {
        websocketService.off('bet_placed', handleEvent);
        websocketService.off('transaction_confirmed', handleEvent);
      }

      if (options.subscribeToAllMarkets) {
        websocketService.unsubscribeFromAllMarkets();
        websocketService.off('market_created', handleEvent);
        websocketService.off('market_updated', handleEvent);
        websocketService.off('bet_placed', handleEvent);
      }
    };
  }, [options.marketId, options.userId, options.subscribeToAllMarkets, handleEvent, handleConnectionChange]);

  return {
    isConnected,
    lastUpdate,
    updates,
    reconnect: websocketService.reconnect.bind(websocketService),
  };
};

export const useMarketUpdates = (marketId: string) => {
  return useRealtimeUpdates({ marketId });
};

export const useUserUpdates = (userId: string) => {
  return useRealtimeUpdates({ userId });
};

export const useAllMarketUpdates = () => {
  return useRealtimeUpdates({ subscribeToAllMarkets: true });
};
