import React, { useState, useEffect } from 'react';
import { MarketCreationModal } from '@/components/MarketCreationModal';
import { EnhancedMarketCard } from '@/components/EnhancedMarketCard';
import { marketService, Market } from '@/services/marketService';

export const MarketTest: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBalance] = useState(1000); // Mock user balance

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const result = await marketService.getMarkets();
      setMarkets(result.data);
    } catch (error) {
      console.error('Failed to load markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarketCreated = (newMarket: Market) => {
    setMarkets(prev => [newMarket, ...prev]);
    console.log('Market created:', newMarket);
  };

  const handleBetPlaced = (bet: any) => {
    console.log('Bet placed:', bet);
    // Refresh markets to show updated odds
    loadMarkets();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Market Test Page</h1>
        <MarketCreationModal onMarketCreated={handleMarketCreated} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <EnhancedMarketCard
            key={market.id}
            market={market}
            userBalance={userBalance}
            onBetPlaced={handleBetPlaced}
          />
        ))}
      </div>

      {markets.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-500 mb-2">No markets found</h3>
          <p className="text-gray-400">Create your first market to get started!</p>
        </div>
      )}
    </div>
  );
};
