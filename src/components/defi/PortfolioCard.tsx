import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { PortfolioPosition } from '@/services/defiService';

interface PortfolioCardProps {
  position: PortfolioPosition;
  onWithdraw: (positionId: string) => Promise<void>;
  onViewDetails?: (positionId: string) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ 
  position, 
  onWithdraw,
  onViewDetails 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'completed': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'withdrawn': return <TrendingDown className="w-4 h-4 text-gray-600" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysActive = () => {
    const now = new Date();
    const start = new Date(position.startDate);
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateEarned = () => {
    const daysActive = calculateDaysActive();
    const dailyRate = position.apy / 365 / 100;
    return (position.amount * dailyRate * daysActive).toFixed(2);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(position.status)}
            <CardTitle className="text-lg">{position.strategy}</CardTitle>
          </div>
          <Badge className={getStatusColor(position.status)}>
            {position.status}
          </Badge>
        </div>
        <CardDescription>
          {position.protocol} • {position.asset}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Position Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Deposited</p>
            <p className="text-lg font-semibold">{position.amount} {position.asset}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-lg font-semibold">${position.value.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">APY</p>
            <p className="text-lg font-semibold text-green-600">{position.apy}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Days Active</p>
            <p className="text-lg font-semibold">{calculateDaysActive()}</p>
          </div>
        </div>
        
        {/* Earnings */}
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Estimated Earnings</span>
            <span className="font-semibold text-green-600">
              {calculateEarned()} {position.asset}
            </span>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Started</span>
            <span>{formatDate(position.startDate)}</span>
          </div>
          {position.endDate && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ended</span>
              <span>{formatDate(position.endDate)}</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {position.status === 'active' && (
            <EnhancedButton
              className="flex-1"
              variant="outline"
              onAsyncClick={() => onWithdraw(position.id)}
              successText={`Successfully withdrew ${position.amount} ${position.asset}`}
              errorText="Failed to withdraw position"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Withdraw
            </EnhancedButton>
          )}
          
          {onViewDetails && (
            <EnhancedButton
              variant="ghost"
              onClick={() => onViewDetails(position.id)}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Details
            </EnhancedButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioCard;
