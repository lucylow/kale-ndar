import React, { useState } from 'react';
import { Zap, TrendingUp, Shield, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { YieldStrategy } from '@/services/defiService';

interface StrategyCardProps {
  strategy: YieldStrategy;
  onStartStrategy: (strategyId: string, amount: number) => Promise<void>;
  userBalance?: number;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ 
  strategy, 
  onStartStrategy,
  userBalance = 1000 
}) => {
  const [amount, setAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return <Shield className="w-4 h-4 text-green-600" />;
      case 'Medium': return <Shield className="w-4 h-4 text-yellow-600" />;
      case 'High': return <Shield className="w-4 h-4 text-red-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleStartStrategy = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      throw new Error('Please enter a valid amount');
    }
    
    await onStartStrategy(strategy.id, depositAmount);
    setIsDialogOpen(false);
    setAmount('');
  };

  const isValidAmount = () => {
    const depositAmount = parseFloat(amount);
    return !isNaN(depositAmount) && 
           depositAmount >= strategy.minDeposit && 
           (!strategy.maxDeposit || depositAmount <= strategy.maxDeposit) &&
           depositAmount <= userBalance;
  };

  const getExpectedReturn = () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount)) return 0;
    return (depositAmount * strategy.apy / 100).toFixed(2);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRiskIcon(strategy.risk)}
            <CardTitle className="text-lg">{strategy.name}</CardTitle>
          </div>
          <Badge className={getRiskColor(strategy.risk)}>
            {strategy.risk} Risk
          </Badge>
        </div>
        <CardDescription>{strategy.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* APY Display */}
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">{strategy.apy}%</p>
          <p className="text-sm text-muted-foreground">Expected APY</p>
        </div>
        
        {/* Strategy Details */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Supported Assets</p>
            <div className="flex flex-wrap gap-2">
              {strategy.assets.map((asset, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {asset}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Min Deposit</p>
              <p className="font-medium">{strategy.minDeposit} XLM</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max Deposit</p>
              <p className="font-medium">
                {strategy.maxDeposit ? `${strategy.maxDeposit} XLM` : 'No limit'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Lock Period</p>
              <p className="font-medium">{strategy.lockPeriod} days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Management Fee</p>
              <p className="font-medium">{strategy.fees.management}%</p>
            </div>
          </div>
        </div>
        
        {/* Start Strategy Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <EnhancedButton className="w-full" variant="gradient">
              <Zap className="w-4 h-4 mr-2" />
              Start Strategy
            </EnhancedButton>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start {strategy.name} Strategy</DialogTitle>
              <DialogDescription>
                Enter the amount you want to deposit into this yield strategy.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Deposit Amount (XLM)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`Min: ${strategy.minDeposit} XLM`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={strategy.minDeposit}
                  max={strategy.maxDeposit || userBalance}
                />
                <p className="text-xs text-muted-foreground">
                  Available balance: {userBalance} XLM
                </p>
              </div>
              
              {amount && isValidAmount() && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Expected annual return:</span>
                    <span className="font-medium text-green-600">
                      {getExpectedReturn()} XLM
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Management fee:</span>
                    <span className="font-medium">
                      {(parseFloat(amount) * strategy.fees.management / 100).toFixed(2)} XLM
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <EnhancedButton
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </EnhancedButton>
              <EnhancedButton
                onAsyncClick={handleStartStrategy}
                disabled={!isValidAmount()}
                successText={`Successfully started ${strategy.name} strategy`}
                errorText="Failed to start strategy"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Strategy
              </EnhancedButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StrategyCard;
