import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Market } from '@/types/market';

interface MarketUpdate {
  id: string;
  totalFor: number;
  totalAgainst: number;
  currentPrice?: number;
  lastUpdated: string;
}

export const useRealtimeMarkets = (initialMarkets: Market[] = []) => {
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Subscribe to real-time market updates
  useEffect(() => {
    const channel = supabase
      .channel('market-updates')
      .on('broadcast', { event: 'market_odds_update' }, (payload) => {
        const update = payload.payload as MarketUpdate;
        console.log('Received market update:', update);
        
        setMarkets(prev => prev.map(market => 
          market.id === update.id
            ? {
                ...market,
                totalFor: update.totalFor,
                totalAgainst: update.totalAgainst,
                currentPrice: update.currentPrice || market.currentPrice,
              }
            : market
        ));

        // Show toast notification for significant changes
        toast({
          title: "Market Updated",
          description: `Odds have changed for market ${update.id.slice(0, 8)}...`,
          duration: 3000,
        });
      })
      .on('broadcast', { event: 'market_resolved' }, (payload) => {
        const { marketId, outcome } = payload.payload;
        console.log('Market resolved:', marketId, outcome);
        
        setMarkets(prev => prev.map(market => 
          market.id === marketId
            ? { ...market, resolved: true }
            : market
        ));

        toast({
          title: "Market Resolved!",
          description: `Market ${marketId.slice(0, 8)}... has been resolved.`,
          duration: 5000,
        });
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Simulate real-time updates for demo purposes
  useEffect(() => {
    const simulateUpdates = () => {
      if (markets.length === 0) return;

      const randomMarket = markets[Math.floor(Math.random() * markets.length)];
      const priceChange = (Math.random() - 0.5) * 1000; // Random price change
      const betChange = Math.floor(Math.random() * 50000); // Random bet amount change

      const update: MarketUpdate = {
        id: randomMarket.id,
        totalFor: Math.max(0, randomMarket.totalFor + (Math.random() > 0.5 ? betChange : -betChange)),
        totalAgainst: Math.max(0, randomMarket.totalAgainst + (Math.random() > 0.5 ? betChange : -betChange)),
        currentPrice: randomMarket.currentPrice ? Math.max(0, randomMarket.currentPrice + priceChange) : undefined,
        lastUpdated: new Date().toISOString(),
      };

      // Simulate receiving the update
      setTimeout(() => {
        setMarkets(prev => prev.map(market => 
          market.id === update.id
            ? {
                ...market,
                totalFor: update.totalFor,
                totalAgainst: update.totalAgainst,
                currentPrice: update.currentPrice || market.currentPrice,
              }
            : market
        ));
      }, 100);
    };

    // Simulate updates every 5-15 seconds
    const interval = setInterval(simulateUpdates, Math.random() * 10000 + 5000);

    return () => clearInterval(interval);
  }, [markets]);

  const updateMarkets = useCallback((newMarkets: Market[]) => {
    setMarkets(newMarkets);
  }, []);

  const broadcastMarketUpdate = useCallback(async (update: MarketUpdate) => {
    const channel = supabase.channel('market-updates');
    await channel.send({
      type: 'broadcast',
      event: 'market_odds_update',
      payload: update
    });
  }, []);

  return {
    markets,
    isConnected,
    updateMarkets,
    broadcastMarketUpdate,
  };
};