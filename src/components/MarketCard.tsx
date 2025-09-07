import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Users, DollarSign, Target, Calendar } from 'lucide-react';
import { Market } from '@/types/market';

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
  return (
    <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-primary hover:-translate-y-2 transition-all duration-500 group animate-fade-in hover:border-primary/30 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 animate-pulse group-hover:animate-none">
            {market.oracleAsset.code}
          </Badge>
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
            onClick={() => onPlaceBet(market.id, true, 100)}
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
            onClick={() => onPlaceBet(market.id, false, 100)}
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
  );
});

MarketCard.displayName = 'MarketCard';

export default MarketCard;