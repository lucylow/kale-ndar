import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator, 
  AlertCircle, 
  CheckCircle,
  Wallet,
  Target,
  Clock,
  Users
} from 'lucide-react';
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

interface BettingModalProps {
  market: Market;
  userBalance?: number;
  onBetPlaced?: (bet: any) => void;
}

interface BetFormData {
  selectedOption: string;
  amount: number;
  betType: 'yes' | 'no';
}

export const BettingModal: React.FC<BettingModalProps> = ({ 
  market, 
  userBalance = 0, 
  onBetPlaced 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [formData, setFormData] = useState<BetFormData>({
    selectedOption: market.options[0]?.id || '',
    amount: 0,
    betType: 'yes',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estimatedPayout, setEstimatedPayout] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);

  useEffect(() => {
    if (formData.amount > 0 && formData.selectedOption) {
      const selectedOption = market.options.find(opt => opt.id === formData.selectedOption);
      if (selectedOption) {
        const payout = formData.amount * selectedOption.odds;
        const profit = payout - formData.amount;
        setEstimatedPayout(payout);
        setPotentialProfit(profit);
      }
    } else {
      setEstimatedPayout(0);
      setPotentialProfit(0);
    }
  }, [formData.amount, formData.selectedOption, market.options]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.selectedOption) {
      newErrors.selectedOption = 'Please select an option';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Bet amount must be greater than 0';
    } else if (formData.amount < 1) {
      newErrors.amount = 'Minimum bet is 1 KALE';
    } else if (formData.amount > userBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    if (market.status !== 'active') {
      newErrors.general = 'This market is no longer accepting bets';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceBet = async () => {
    if (!validateForm()) return;

    setIsPlacingBet(true);
    try {
      const betData = {
        marketId: market.id,
        optionId: formData.selectedOption,
        amount: formData.amount,
        betType: formData.betType,
        timestamp: new Date().toISOString(),
        estimatedPayout,
        potentialProfit,
      };

      // Call API to place bet
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        throw new Error('Failed to place bet');
      }

      const placedBet = await response.json();
      
      // Reset form
      setFormData({
        selectedOption: market.options[0]?.id || '',
        amount: 0,
        betType: 'yes',
      });
      setErrors({});
      setIsOpen(false);

      // Notify parent component
      if (onBetPlaced) {
        onBetPlaced(placedBet);
      }

      // Show success notification
      // You can implement a toast notification here

    } catch (error) {
      console.error('Error placing bet:', error);
      setErrors({ general: 'Failed to place bet. Please try again.' });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const selectedOption = market.options.find(opt => opt.id === formData.selectedOption);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          Place Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Place Your Bet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          {/* Market Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{market.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-600">{market.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Ends {new Date(market.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{market.participants} participants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{market.totalLiquidity.toLocaleString()} KALE</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Market State */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Market State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {market.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{option.name}</span>
                        <Badge variant="outline">{option.odds.toFixed(2)}x</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {option.bets} bets • {option.amount.toLocaleString()} KALE
                      </div>
                    </div>
                    <Progress value={option.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Betting Interface */}
          <Tabs value={formData.betType} onValueChange={(value) => setFormData(prev => ({ ...prev, betType: value as 'yes' | 'no' }))}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="yes" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Bet YES</span>
              </TabsTrigger>
              <TabsTrigger value="no" className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4" />
                <span>Bet NO</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="yes" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-700 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Betting YES</span>
                </div>
                <p className="text-sm text-green-600">
                  You believe this outcome will happen. If you're right, you'll win your bet multiplied by the odds.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="no" className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-700 mb-2">
                  <TrendingDown className="w-5 h-5" />
                  <span className="font-semibold">Betting NO</span>
                </div>
                <p className="text-sm text-red-600">
                  You believe this outcome will not happen. If you're right, you'll win your bet multiplied by the odds.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Option Selection */}
          <div className="space-y-2">
            <Label>Select Outcome</Label>
            <div className="grid grid-cols-2 gap-3">
              {market.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, selectedOption: option.id }))}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    formData.selectedOption === option.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.name}</span>
                    <Badge variant="outline">{option.odds.toFixed(2)}x</Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {option.percentage.toFixed(1)}% of total bets
                  </div>
                </button>
              ))}
            </div>
            {errors.selectedOption && <p className="text-sm text-red-500">{errors.selectedOption}</p>}
          </div>

          {/* Bet Amount */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Bet Amount (KALE)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max={userBalance}
                step="1"
                value={formData.amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className={errors.amount ? 'border-red-500' : ''}
                placeholder="Enter amount to bet"
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label>Quick Amounts</Label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, amount }))}
                    disabled={amount > userBalance}
                  >
                    {amount} KALE
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, amount: userBalance }))}
                >
                  Max ({userBalance} KALE)
                </Button>
              </div>
            </div>

            {/* Balance Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Wallet className="w-4 h-4" />
              <span>Available Balance: {userBalance.toLocaleString()} KALE</span>
            </div>
          </div>

          {/* Bet Summary */}
          {formData.amount > 0 && selectedOption && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bet Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Betting on:</span>
                    <span className="font-medium">{selectedOption.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bet Amount:</span>
                    <span className="font-medium">{formData.amount.toLocaleString()} KALE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Odds:</span>
                    <span className="font-medium">{selectedOption.odds.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Payout:</span>
                    <span className="font-medium text-green-600">{estimatedPayout.toLocaleString()} KALE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential Profit:</span>
                    <span className={cn(
                      'font-medium',
                      potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {potentialProfit >= 0 ? '+' : ''}{potentialProfit.toLocaleString()} KALE
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePlaceBet} 
              disabled={isPlacingBet || !formData.amount || !formData.selectedOption}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPlacingBet ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Placing Bet...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Place Bet
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
