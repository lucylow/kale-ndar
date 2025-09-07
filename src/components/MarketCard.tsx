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
    <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 group animate-fade-in">
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