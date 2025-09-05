import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { apiService, ApiError } from '@/services/api';
import { Market, MarketCondition } from '@/types/market';
import { TrendingUp, TrendingDown, Clock, Users, DollarSign, Target, Calendar, ArrowRight } from 'lucide-react';

const MarketList: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [bettingLoading, setBettingLoading] = useState<string | null>(null);
  const { wallet, user } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMarkets({ limit: 10 });
      setMarkets(response.markets);
    } catch (error) {
      console.error('Error loading markets:', error);
      // Fallback to mock data if API is not available
      setMarkets(getMockMarkets());
    } finally {
      setLoading(false);
    }
  };

  const getMockMarkets = (): Market[] => {
    return [
      {
        id: 'market_1',
        description: 'Will Bitcoin reach $100,000 by end of 2024?',
        creator: '0x1234...5678',
        oracleAsset: { type: 'other', code: 'BTC' },
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
        description: 'Will Ethereum 2.0 launch before Q2 2024?',
        creator: '0x8765...4321',
        oracleAsset: { type: 'other', code: 'ETH' },
        targetPrice: 5000,
        condition: MarketCondition.BELOW,
        resolveTime: new Date('2024-06-30T23:59:59Z'),
        totalFor: 2200000,
        totalAgainst: 1200000,
        resolved: false,
        createdAt: new Date('2024-01-10T14:30:00Z'),
        currentPrice: 3200,
        oracleConfidence: 0.88,
      },
      {
        id: 'market_3',
        description: 'Will KALE token reach $1.00 by March 2024?',
        creator: '0xabcd...efgh',
        oracleAsset: { type: 'stellar', code: 'KALE', contractId: 'contract_123' },
        targetPrice: 100,
        condition: MarketCondition.ABOVE,
        resolveTime: new Date('2024-03-31T23:59:59Z'),
        totalFor: 500000,
        totalAgainst: 300000,
        resolved: false,
        createdAt: new Date('2024-01-05T09:15:00Z'),
        currentPrice: 75,
        oracleConfidence: 0.92,
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
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
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
            <Card key={market.id} className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {market.oracleAsset.code}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimeUntilResolve(market.resolveTime)}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {market.description}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  by {formatAddress(market.creator)}
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Market Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {formatAmount(market.totalFor)}
                    </div>
                    <div className="text-xs text-muted-foreground">FOR</div>
                  </div>
                  <div className="text-center p-3 bg-accent-teal/10 rounded-lg">
                    <div className="text-2xl font-bold text-accent-teal">
                      {formatAmount(market.totalAgainst)}
                    </div>
                    <div className="text-xs text-muted-foreground">AGAINST</div>
                  </div>
                </div>

                {/* Current Price */}
                {market.currentPrice && (
                  <div className="flex items-center justify-between mb-4 p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Current Price:</span>
                    </div>
                    <span className="font-semibold">${market.currentPrice.toLocaleString()}</span>
                  </div>
                )}

                {/* Betting Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="hero"
                    className="w-full group"
                    onClick={() => handlePlaceBet(market.id, true, 100)}
                    disabled={bettingLoading === market.id || market.resolved}
                  >
                    <TrendingUp className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Bet FOR
                    <span className="ml-auto text-xs opacity-80">
                      {calculateOdds(market.totalFor, market.totalAgainst, true).toFixed(2)}x
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full group border-accent-teal/30 text-accent-teal hover:bg-accent-teal/10"
                    onClick={() => handlePlaceBet(market.id, false, 100)}
                    disabled={bettingLoading === market.id || market.resolved}
                  >
                    <TrendingDown className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Bet AGAINST
                    <span className="ml-auto text-xs opacity-80">
                      {calculateOdds(market.totalFor, market.totalAgainst, false).toFixed(2)}x
                    </span>
                  </Button>
                </div>

                {/* Market Details */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Resolves: {market.resolveTime.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Target: ${market.targetPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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