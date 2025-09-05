import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { apiService, ApiError } from "@/services/api";
import { Market, MarketCondition } from "@/types/market";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  DollarSign, 
  Target, 
  Calendar, 
  ArrowRight,
  Plus,
  BarChart3,
  Wallet,
  Activity,
  Trophy,
  Star
} from "lucide-react";
import MarketList from "@/components/MarketList";
import { YieldOptimizer } from "@/components/YieldOptimizer";

const Dashboard: React.FC = () => {
  const { wallet, user, userStats, isLoading } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recentMarkets, setRecentMarkets] = useState<Market[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);

  // Redirect if not connected
  useEffect(() => {
    if (!isLoading && !wallet.isConnected) {
      navigate('/');
    }
  }, [wallet.isConnected, isLoading, navigate]);

  useEffect(() => {
    if (wallet.isConnected) {
      loadRecentMarkets();
    }
  }, [wallet.isConnected]);

  const loadRecentMarkets = async () => {
    try {
      setLoadingMarkets(true);
      const response = await apiService.getMarkets({ limit: 6 });
      setRecentMarkets(response.markets);
    } catch (error) {
      console.error('Error loading recent markets:', error);
      // Fallback to mock data
      setRecentMarkets(getMockMarkets());
    } finally {
      setLoadingMarkets(false);
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

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  const formatTimeUntilResolve = (resolveTime: Date): string => {
    const now = new Date();
    const diff = resolveTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Resolved';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-gradient-card border-white/10">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!wallet.isConnected) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome back, {user?.username || 'Trader'}!
            </h1>
            <p className="text-muted-foreground">
              Ready to make your next prediction?
            </p>
          </div>
          <Button variant="hero" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Market
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-card border-white/10 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bets</p>
                  <p className="text-2xl font-bold text-primary">
                    {userStats?.total_bets || 0}
                  </p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-white/10 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Winnings</p>
                  <p className="text-2xl font-bold text-accent-gold">
                    {formatAmount(userStats?.total_winnings || 0)} KALE
                  </p>
                </div>
                <div className="p-3 bg-accent-gold/20 rounded-lg">
                  <Trophy className="h-6 w-6 text-accent-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-white/10 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold text-accent-teal">
                    {(userStats?.win_rate || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-accent-teal/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-accent-teal" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-white/10 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Bets</p>
                  <p className="text-2xl font-bold text-foreground">
                    {userStats?.pending_claims || 0}
                  </p>
                </div>
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <Activity className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Info */}
        <Card className="bg-gradient-card border-white/10 shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connected Address</p>
                <p className="font-mono text-sm">{formatAddress(wallet.publicKey!)}</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                Verified
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Markets */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Recent Markets</h2>
            <Button variant="outline" onClick={() => navigate('/')}>
              View All Markets
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {loadingMarkets ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-gradient-card border-white/10">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentMarkets.map((market) => (
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
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="text-xl font-bold text-primary">
                          {formatAmount(market.totalFor)}
                        </div>
                        <div className="text-xs text-muted-foreground">FOR</div>
                      </div>
                      <div className="text-center p-3 bg-accent-teal/10 rounded-lg">
                        <div className="text-xl font-bold text-accent-teal">
                          {formatAmount(market.totalAgainst)}
                        </div>
                        <div className="text-xs text-muted-foreground">AGAINST</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="hero"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate('/')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Market
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Yield Optimizer */}
        <YieldOptimizer />
      </div>
    </div>
  );
};

export default Dashboard;
