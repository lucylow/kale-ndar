import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: string;
    title: string;
    options: Array<{
      id: string;
      label: string;
      odds: number;
      totalBets: number;
      totalAmount: number;
    }>;
    totalPool: number;
  };
  onPlaceBet: (marketId: string, optionId: string, amount: number) => void;
}

const BetModal: React.FC<BetModalProps> = ({
  isOpen,
  onClose,
  market,
  onPlaceBet,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [isPlacing, setIsPlacing] = useState(false);

  const selectedOptionData = market.options.find(opt => opt.id === selectedOption);
  const betAmountNum = parseFloat(betAmount) || 0;
  const potentialPayout = selectedOptionData ? betAmountNum * selectedOptionData.odds : 0;
  const profit = potentialPayout - betAmountNum;

  const handlePlaceBet = async () => {
    if (!selectedOption || betAmountNum <= 0) return;
    
    setIsPlacing(true);
    try {
      await onPlaceBet(market.id, selectedOption, betAmountNum);
      // Reset form
      setSelectedOption('');
      setBetAmount('');
      onClose();
    } catch (error) {
      console.error('Failed to place bet:', error);
    } finally {
      setIsPlacing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Place Your Bet
          </DialogTitle>
          <DialogDescription>
            {market.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Market Info */}
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Market Pool</div>
            <div className="text-lg font-semibold">{formatCurrency(market.totalPool)}</div>
          </div>

          {/* Option Selection */}
          <div className="space-y-3">
            <Label>Select Your Prediction</Label>
            <div className="grid grid-cols-2 gap-3">
              {market.options.map((option) => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-white/10 hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{option.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {option.odds}x
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {option.totalBets} bets • {formatCurrency(option.totalAmount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bet Amount */}
          <div className="space-y-3">
            <Label htmlFor="betAmount">Bet Amount (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="betAmount"
                type="number"
                placeholder="0.00"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="pl-10"
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          {/* Bet Summary */}
          {selectedOption && betAmountNum > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected:</span>
                  <span className="font-semibold">{selectedOptionData?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bet Amount:</span>
                  <span className="font-semibold">{formatCurrency(betAmountNum)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Odds:</span>
                  <span className="font-semibold">{selectedOptionData?.odds}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Potential Payout:</span>
                  <span className="font-semibold text-green-500">{formatCurrency(potentialPayout)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-muted-foreground">Potential Profit:</span>
                  <span className="font-bold text-green-500">{formatCurrency(profit)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Risk Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              <strong>Risk Warning:</strong> Prediction markets involve risk. You may lose your entire bet amount if your prediction is incorrect.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPlacing}>
            Cancel
          </Button>
          <Button 
            onClick={handlePlaceBet}
            disabled={!selectedOption || betAmountNum <= 0 || isPlacing}
            className="bg-primary hover:bg-primary/90"
          >
            {isPlacing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Placing Bet...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Place Bet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BetModal;
