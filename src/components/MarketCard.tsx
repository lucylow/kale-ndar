import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Users, DollarSign, Target, Calendar, Wifi, WifiOff, AlertTriangle, BarChart3 } from 'lucide-react';
import { Market } from '@/types/market';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLoadingState } from '@/hooks/useLoadingState';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import btcChart from '@/assets/market-chart-btc.jpg';
import ethChart from '@/assets/market-chart-eth.jpg';
import kaleChart from '@/assets/market-chart-kale.jpg';

interface MarketCardProps {
  market: Market;
  onPlaceBet: (marketId: string, side: boolean, amount: number) => void;
  bettingLoading: string | null;
  formatTimeUntilResolve: (resolveTime: Date) => string;
  calculateOdds: (forAmount: number, againstAmount: number, side: boolean) => number;
  formatAddress: (address: string) => string;
  formatAmount: (amount: number) => string;
}

const MarketCard = React.memo<MarketCardProps>(({
  market,
  onPlaceBet,
  bettingLoading,
  formatTimeUntilResolve,
  calculateOdds,
  formatAddress,
  formatAmount,
}) => {
  const { handleError } = useErrorHandler();
  const { loadingState, startLoading, stopLoading } = useLoadingState();
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [priceChange, setPriceChange] = useState<number | null>(null);
  
  // Generate mock chart data
  const generateChartData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: (market.currentPrice || 100) + Math.sin(i * 0.5) * 10 + (Math.random() - 0.5) * 5,
    }));
  };
  
  const [chartData] = useState(() => generateChartData());
  
  // Get chart image based on asset
  const getChartImage = () => {
    const code = market.oracleAsset.code.toLowerCase();
    if (code.includes('btc')) return btcChart;
    if (code.includes('eth')) return ethChart;
    if (code.includes('kale')) return kaleChart;
    return btcChart; // default
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate small price changes
      if (market.currentPrice) {
        const change = (Math.random() - 0.5) * 0.02; // ±1% change
        setPriceChange(change);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [market.currentPrice]);

  const handleBetClick = async (side: boolean, amount: number) => {
    try {
      startLoading({ message: 'Placing bet...' });
      await onPlaceBet(market.id, side, amount);
      stopLoading();
    } catch (error) {
      handleError(error, { 
        fallbackMessage: 'Failed to place bet. Please try again.' 
      });
      stopLoading();
    }
  };

  const getPriceChangeColor = (change: number | null) => {
    if (!change) return 'text-muted-foreground';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  const getPriceChangeIcon = (change: number | null) => {
    if (!change) return null;
    return change > 0 ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  return (
    <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-primary hover:-translate-y-2 transition-all duration-500 group animate-fade-in hover:border-primary/30 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 animate-pulse group-hover:animate-none">
              {market.oracleAsset.code}
            </Badge>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs text-muted-foreground">
                Live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-accent-teal transition-colors duration-300">
            <Clock className="h-3 w-3 animate-pulse" />
            {formatTimeUntilResolve(market.resolveTime)}
          </div>
        </div>
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-all duration-300 line-clamp-2 group-hover:scale-105 origin-left">
          {market.description}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          <Users className="h-3 w-3 group-hover:text-accent-teal transition-colors duration-300" />
          by {formatAddress(market.creator)}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {/* Market Chart Visualization */}
        <div className="mb-6 relative overflow-hidden rounded-xl bg-gradient-to-br from-background/50 to-background/20 border border-white/10">
          {/* Chart Image Background */}
          <div className="absolute inset-0 opacity-30">
            <img 
              src={getChartImage()} 
              alt={`${market.oracleAsset.code} chart`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Mini Chart Overlay */}
          <div className="relative z-10 h-32 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Price Trend
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                24h
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={chartData}>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Enhanced Market Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 group/stat">
            <div className="text-2xl font-bold text-primary group-hover/stat:scale-110 transition-transform duration-300">
              {formatAmount(market.totalFor)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              FOR
            </div>
          </div>
          <div className="text-center p-4 bg-accent-teal/10 rounded-xl border border-accent-teal/20 hover:border-accent-teal/40 transition-all duration-300 hover:scale-105 group/stat">
            <div className="text-2xl font-bold text-accent-teal group-hover/stat:scale-110 transition-transform duration-300">
              {formatAmount(market.totalAgainst)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <TrendingDown className="h-3 w-3" />
              AGAINST
            </div>
          </div>
        </div>

        {/* Current Price with Real-time Updates */}
        {market.currentPrice && (
          <div className="flex items-center justify-between mb-4 p-3 bg-secondary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Price:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">${market.currentPrice.toLocaleString()}</span>
              {priceChange !== null && (
                <div className={`flex items-center gap-1 text-xs ${getPriceChangeColor(priceChange)}`}>
                  {getPriceChangeIcon(priceChange)}
                  <span>{priceChange > 0 ? '+' : ''}{(priceChange * 100).toFixed(2)}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Update Indicator */}
        <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>

        {/* Betting Buttons with Loading States */}
        <div className="space-y-3">
          <Button
            variant="hero"
            className="w-full group"
            onClick={() => handleBetClick(true, 100)}
            disabled={bettingLoading === market.id || market.resolved || loadingState.isLoading}
          >
            {loadingState.isLoading && bettingLoading === market.id ? (
              <LoadingSpinner size="sm" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            )}
            Bet FOR
            <span className="ml-auto text-xs opacity-80">
              {calculateOdds(market.totalFor, market.totalAgainst, true).toFixed(2)}x
            </span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full group border-accent-teal/30 text-accent-teal hover:bg-accent-teal/10"
            onClick={() => handleBetClick(false, 100)}
            disabled={bettingLoading === market.id || market.resolved || loadingState.isLoading}
          >
            {loadingState.isLoading && bettingLoading === market.id ? (
              <LoadingSpinner size="sm" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            )}
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
  );
});

MarketCard.displayName = 'MarketCard';

export default MarketCard;