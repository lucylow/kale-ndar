import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { apiService, ApiError } from '@/services/api';
import { Market, MarketCondition } from '@/types/market';
import { ArrowRight } from 'lucide-react';
import MarketCard from './MarketCard';

const ITEMS_PER_PAGE = 10;
const VIRTUAL_HEIGHT = 400; // Height of each item

interface SimpleVirtualListProps {
  items: Market[];
  onPlaceBet: (marketId: string, side: boolean, amount: number) => void;
  bettingLoading: string | null;
  utilityFunctions: {
    formatTimeUntilResolve: (resolveTime: Date) => string;
    calculateOdds: (forAmount: number, againstAmount: number, side: boolean) => number;
    formatAddress: (address: string) => string;
    formatAmount: (amount: number) => string;
  };
}

const SimpleVirtualList: React.FC<SimpleVirtualListProps> = ({
  items,
  onPlaceBet,
  bettingLoading,
  utilityFunctions,
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: ITEMS_PER_PAGE });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const handleScroll = useCallback((e: Event) => {
    if (!containerRef) return;
    
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const start = Math.floor(scrollTop / VIRTUAL_HEIGHT);
    const end = Math.min(start + ITEMS_PER_PAGE, items.length);
    
    setVisibleRange({ start, end });
  }, [containerRef, items.length]);

  useEffect(() => {
    if (!containerRef) return;
    
    containerRef.addEventListener('scroll', handleScroll);
    return () => containerRef.removeEventListener('scroll', handleScroll);
  }, [containerRef, handleScroll]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * VIRTUAL_HEIGHT;
  const offsetY = visibleRange.start * VIRTUAL_HEIGHT;

  return (
    <div
      ref={setContainerRef}
      className="h-[800px] overflow-auto bg-gradient-card/30 rounded-xl p-6 border border-white/10"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((market, index) => (
            <div
              key={market.id}
              style={{ height: VIRTUAL_HEIGHT }}
              className="px-3 pb-6"
            >
              <MarketCard
                market={market}
                onPlaceBet={onPlaceBet}
                bettingLoading={bettingLoading}
                {...utilityFunctions}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EnhancedMarketList: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [bettingLoading, setBettingLoading] = useState<string | null>(null);
  const { wallet } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getMarkets({ limit: 50 });
      setMarkets(response.markets);
    } catch (error) {
      console.error('Error loading markets:', error);
      setMarkets(getMockMarkets());
    } finally {
      setLoading(false);
    }
  }, []);

  const getMockMarkets = useCallback((): Market[] => {
    const baseMarkets = [
      {
        id: 'market_1',
        description: 'Will Bitcoin reach $100,000 by end of 2024?',
        creator: '0x1234...5678',
        oracleAsset: { type: 'other' as const, code: 'BTC' },
        targetPrice: 100000,
        condition: MarketCondition.ABOVE,
        resolveTime: new Date('2024-12-31T23:59:59Z'),
        totalFor: 1500000,
        totalAgainst: 800000,
        resolved: false,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        currentPrice: 85000,
        oracleConfidence: 0.95,
      },
      {
        id: 'market_2',
        description: 'Will Ethereum reach $5,000 by Q2 2024?',
        creator: '0x8765...4321',
        oracleAsset: { type: 'other' as const, code: 'ETH' },
        targetPrice: 5000,
        condition: MarketCondition.ABOVE,
        resolveTime: new Date('2024-06-30T23:59:59Z'),
        totalFor: 2200000,
        totalAgainst: 1200000,
        resolved: false,
        createdAt: new Date('2024-01-10T14:30:00Z'),
        currentPrice: 3200,
        oracleConfidence: 0.88,
      },
    ];

    const additionalMarkets = Array.from({ length: 48 }, (_, index) => ({
      ...baseMarkets[index % 2],
      id: `market_${index + 3}`,
      description: `Mock Market ${index + 3}: ${baseMarkets[index % 2].description}`,
      totalFor: Math.floor(Math.random() * 2000000) + 500000,
      totalAgainst: Math.floor(Math.random() * 1500000) + 300000,
    }));

    return [...baseMarkets, ...additionalMarkets];
  }, []);

  const handlePlaceBet = useCallback(async (marketId: string, side: boolean, amount: number) => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place bets.",
        variant: "destructive",
      });
      return;
    }

    try {
      setBettingLoading(marketId);
      await apiService.placeBet(marketId, { amount, side }, wallet.publicKey!);
      
      toast({
        title: "Bet Placed Successfully!",
        description: `Your ${side ? 'FOR' : 'AGAINST'} bet of ${amount} KALE has been placed.`,
      });

      await loadMarkets();
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Bet Failed",
        description: error instanceof ApiError ? error.message : "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBettingLoading(null);
    }
  }, [wallet.isConnected, wallet.publicKey, toast, loadMarkets]);

  const utilityFunctions = useMemo(() => ({
    formatTimeUntilResolve: (resolveTime: Date): string => {
      const now = new Date();
      const diff = resolveTime.getTime() - now.getTime();
      
      if (diff <= 0) return 'Resolved';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    },

    calculateOdds: (forAmount: number, againstAmount: number, side: boolean): number => {
      const total = forAmount + againstAmount;
      if (total === 0) return 0;
      
      const winningPool = side ? forAmount : againstAmount;
      return total / winningPool;
    },

    formatAddress: (address: string): string => {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    formatAmount: (amount: number): string => {
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
      return amount.toString();
    },
  }), []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Enhanced Markets</h2>
            <p className="text-xl text-muted-foreground">Virtual scrolling for better performance</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gradient-card border-white/10 shadow-card rounded-lg p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4">Enhanced Markets</h2>
          <p className="text-xl text-muted-foreground">Virtual scrolling • {markets.length} markets loaded</p>
        </div>
        
        <SimpleVirtualList
          items={markets}
          onPlaceBet={handlePlaceBet}
          bettingLoading={bettingLoading}
          utilityFunctions={utilityFunctions}
        />

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="group" onClick={loadMarkets}>
            Refresh Markets
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EnhancedMarketList;