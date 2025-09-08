import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { apiService, ApiError } from '@/services/api';
import { Market, MarketCondition } from '@/types/market';
import { ArrowRight } from 'lucide-react';
import MarketCard from './MarketCard';
import { useRealtimeMarkets } from '@/hooks/useRealtimeMarkets';

const MarketList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bettingLoading, setBettingLoading] = useState<string | null>(null);
  const { wallet } = useWallet();
  const { toast } = useToast();
  const { markets, updateMarkets } = useRealtimeMarkets();

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMarkets({ limit: 10 });
      updateMarkets(response.markets);
    } catch (error) {
      console.error('Error loading markets:', error);
      // Fallback to mock data if API is not available
      updateMarkets(getMockMarkets());
    } finally {
      setLoading(false);
    }
  };

  const getMockMarkets = (): Market[] => {
    return [
      {
        id: 'market_1',
        description: 'Will Bitcoin reach $100,000 by end of 2025?',
        creator: '0x1234...5678',
        oracleAsset: { type: 'other', code: 'BTC' },
        targetPrice: 100000,
        condition: MarketCondition.ABOVE,
        resolveTime: new Date('2025-12-31T23:59:59Z'),
        totalFor: 2400000,
        totalAgainst: 1600000,
        resolved: false,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        currentPrice: 92000,
        oracleConfidence: 0.95,
      },
      {
        id: 'market_2',
        description: 'Will Ethereum reach $5,000 by Q4 2025?',
        creator: '0x8765...4321',
        oracleAsset: { type: 'other', code: 'ETH' },
        targetPrice: 5000,
        condition: MarketCondition.ABOVE,
        resolveTime: new Date('2025-12-31T23:59:59Z'),
        totalFor: 1800000,
        totalAgainst: 900000,
        resolved: false,
        createdAt: new Date('2024-01-10T14:30:00Z'),
        currentPrice: 3800,
        oracleConfidence: 0.88,
      },
      {
        id: 'market_3',
        description: 'Will KALE token reach $1.00 by March 2025?',
        creator: '0xabcd...efgh',
        oracleAsset: { type: 'stellar', code: 'KALE', contractId: 'contract_123' },
        targetPrice: 100,
        condition: MarketCondition.ABOVE,
        resolveTime: new Date('2025-03-31T23:59:59Z'),
        totalFor: 850000,
        totalAgainst: 550000,
        resolved: false,
        createdAt: new Date('2024-01-05T09:15:00Z'),
        currentPrice: 85,
        oracleConfidence: 0.92,
      },
      {
        id: 'market_4',
        description: 'Will Tesla stock exceed $300 by Q2 2025?',
        creator: '0xdef0...1234',
        oracleAsset: { type: 'other', code: 'TSLA' },
        targetPrice: 300,
        condition: MarketCondition.ABOVE,
        resolveTime: new Date('2025-06-30T23:59:59Z'),
        totalFor: 750000,
        totalAgainst: 1120000,
        resolved: false,
        createdAt: new Date('2024-01-28T09:15:00Z'),
        currentPrice: 245,
        oracleConfidence: 0.89,
      },
      {
        id: 'market_5',
        description: 'Will the Fed raise rates in December 2025?',
        creator: '0x5678...9abc',
        oracleAsset: { type: 'other', code: 'FED_RATE' },
        targetPrice: 525,
        condition: MarketCondition.ABOVE,
        resolveTime: new Date('2025-12-15T16:00:00Z'),
        totalFor: 1520000,
        totalAgainst: 800000,
        resolved: false,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        currentPrice: 500,
        oracleConfidence: 0.93,
      },
      {
        id: 'market_6',
        description: 'Will Apple stock exceed $200 in 2025?',
        creator: '0x9abc...def0',
        oracleAsset: { type: 'other', code: 'AAPL' },
        targetPrice: 200,
        condition: MarketCondition.ABOVE,
        resolveTime: new Date('2025-12-31T23:59:59Z'),
        totalFor: 560000,
        totalAgainst: 1560000,
        resolved: false,
        createdAt: new Date('2024-02-01T11:45:00Z'),
        currentPrice: 180,
        oracleConfidence: 0.78,
      },
    ];
  };

  const handlePlaceBet = async (marketId: string, side: boolean, amount: number) => {
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
      const result = await apiService.placeBet(marketId, { amount, side }, wallet.publicKey!);
      
      toast({
        title: "Bet Placed Successfully!",
        description: `Your ${side ? 'FOR' : 'AGAINST'} bet of ${amount} KALE has been placed.`,
      });

      // Refresh markets to update totals
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
  };

  const formatTimeUntilResolve = (resolveTime: Date): string => {
    const now = new Date();
    const diff = resolveTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Resolved';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const calculateOdds = (forAmount: number, againstAmount: number, side: boolean): number => {
    const total = forAmount + againstAmount;
    if (total === 0) return 0;
    
    const winningPool = side ? forAmount : againstAmount;
    return total / winningPool;
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  if (loading) {
    return (
      <section id="markets" className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Live Prediction Markets</h2>
            <p className="text-xl text-muted-foreground">Stake KALE tokens on real-world events</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gradient-card border-white/10 shadow-card">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full mb-4 rounded-xl" />
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="markets" className="py-20 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4">Live Prediction Markets</h2>
          <p className="text-xl text-muted-foreground">Stake KALE tokens on real-world events</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              onPlaceBet={handlePlaceBet}
              bettingLoading={bettingLoading}
              formatTimeUntilResolve={formatTimeUntilResolve}
              calculateOdds={calculateOdds}
              formatAddress={formatAddress}
              formatAmount={formatAmount}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="group">
            Load More Markets
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MarketList;