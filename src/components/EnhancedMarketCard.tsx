import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { BettingModal } from './BettingModal';
import { cn } from '@/lib/utils';

interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  status: 'active' | 'ended' | 'settled';
  options: Array<{
    id: string;
    name: string;
    odds: number;
    bets: number;
    amount: number;
    percentage: number;
  }>;
  totalLiquidity: number;
  totalBets: number;
  participants: number;
  creator: string;
  createdAt: string;
}

interface EnhancedMarketCardProps {
  market: Market;
  userBalance?: number;
  onBetPlaced?: (bet: any) => void;
  showDetails?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  crypto: 'bg-orange-100 text-orange-800',
  stocks: 'bg-green-100 text-green-800',
  sports: 'bg-blue-100 text-blue-800',
  politics: 'bg-purple-100 text-purple-800',
  economics: 'bg-yellow-100 text-yellow-800',
  stellar: 'bg-indigo-100 text-indigo-800',
  weather: 'bg-sky-100 text-sky-800',
  technology: 'bg-gray-100 text-gray-800',
};

const CATEGORY_ICONS: Record<string, string> = {
  crypto: '₿',
  stocks: '📈',
  sports: '⚽',
  politics: '🏛️',
  economics: '💰',
  stellar: '⭐',
  weather: '🌤️',
  technology: '💻',
};

export const EnhancedMarketCard: React.FC<EnhancedMarketCardProps> = ({
  market,
  userBalance = 0,
  onBetPlaced,
  showDetails = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-yellow-100 text-yellow-800';
      case 'settled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'ended': return '🟡';
      case 'settled': return '⚫';
      default: return '⚪';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isMarketActive = market.status === 'active' && new Date(market.endDate) > new Date();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={CATEGORY_COLORS[market.category] || 'bg-gray-100 text-gray-800'}>
                {CATEGORY_ICONS[market.category] || '📊'} {market.category}
              </Badge>
              <Badge className={getStatusColor(market.status)}>
                {getStatusIcon(market.status)} {market.status}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">{market.title}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Market Description */}
        {isExpanded && (
          <p className="text-gray-600 text-sm">{market.description}</p>
        )}

        {/* Market Options */}
        <div className="space-y-3">
          {market.options.map((option, index) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{option.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {option.odds.toFixed(2)}x
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {option.bets} bets • {option.amount.toLocaleString()} KALE
                </div>
              </div>
              <Progress value={option.percentage} className="h-2" />
            </div>
          ))}
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Total Pool</span>
            </div>
            <div className="font-semibold text-sm">
              {market.totalLiquidity.toLocaleString()} KALE
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Total Bets</span>
            </div>
            <div className="font-semibold text-sm">
              {market.totalBets}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Participants</span>
            </div>
            <div className="font-semibold text-sm">
              {market.participants}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Time Left</span>
            </div>
            <div className="font-semibold text-sm">
              {formatTimeRemaining(market.endDate)}
            </div>
          </div>
        </div>

        {/* End Date */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 pt-2 border-t">
          <Calendar className="w-4 h-4" />
          <span>Ends {formatDate(market.endDate)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {isMarketActive ? (
              <BettingModal
                market={market}
                userBalance={userBalance}
                onBetPlaced={onBetPlaced}
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-gray-400"
              >
                {market.status === 'ended' ? 'Market Ended' : 'Market Settled'}
              </Button>
            )}
          </div>
        </div>

        {/* Creator Info */}
        {isExpanded && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Created by {market.creator} • {formatDate(market.createdAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MarketCardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4 pt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-3">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};
