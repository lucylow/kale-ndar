import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { blockchainService } from '@/services/blockchain';
import { reflectorOracleService } from '@/services/reflector-oracle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Coins, 
  Target, 
  Calendar, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface MarketCreationForm {
  title: string;
  description: string;
  assetCode: string;
  targetPrice: string;
  condition: 'above' | 'below';
  resolveTime: string;
  minBetAmount: string;
  maxBetAmount: string;
  creatorFee: string;
}

const MarketCreation: React.FC = () => {
  const { wallet } = useWallet();
  const [form, setForm] = useState<MarketCreationForm>({
    title: '',
    description: '',
    assetCode: 'KALE',
    targetPrice: '',
    condition: 'above',
    resolveTime: '',
    minBetAmount: '100',
    maxBetAmount: '10000',
    creatorFee: '2',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [kaleBalance, setKaleBalance] = useState<number>(0);
  const [harvestableRewards, setHarvestableRewards] = useState<number>(0);
  const [oracleConfidence, setOracleConfidence] = useState<number>(0);

  useEffect(() => {
    if (wallet.isConnected && wallet.publicKey) {
      loadUserData();
    }
  }, [wallet.isConnected, wallet.publicKey]);

  useEffect(() => {
    if (form.assetCode) {
      loadAssetPrice();
    }
  }, [form.assetCode]);

  const loadUserData = async () => {
    if (!wallet.publicKey) return;

    try {
      const [balance, stakeInfo] = await Promise.all([
        blockchainService.getKaleBalance(wallet.publicKey),
        blockchainService.getStakeInfo(wallet.publicKey),
      ]);

      setKaleBalance(balance);
      setHarvestableRewards(stakeInfo?.accumulatedRewards || 0);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAssetPrice = async () => {
    try {
      const priceData = await reflectorOracleService.getAssetPrice(
        form.assetCode,
        form.assetCode === 'XLM' ? 'STELLAR_ASSETS' : 'EXTERNAL_CEX_DEX'
      );
      setCurrentPrice(priceData.price);
      setOracleConfidence(priceData.confidence);
    } catch (error) {
      console.error('Error loading asset price:', error);
      setCurrentPrice(null);
      setOracleConfidence(0);
    }
  };

  const handleHarvestAndBet = async () => {
    if (!wallet.isConnected || !wallet.publicKey) return;

    try {
      setIsLoading(true);
      
      // Step 1: Harvest KALE rewards
      const harvestResult = await blockchainService.harvestKale(
        wallet.publicKey,
        'stake_1', // Mock stake ID
        wallet.signTransaction
      );

      if (harvestResult.claimedAmount > 0) {
        // Step 2: Use harvested KALE to create market
        await handleCreateMarket(harvestResult.claimedAmount);
      } else {
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: "No Harvestable Rewards",
          description: "You don't have any harvestable KALE rewards at the moment",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error in harvest and bet:', error);
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: "Harvest Failed",
        description: error instanceof Error ? error.message : "Error harvesting and creating market",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMarket = async (useAmount?: number) => {
    if (!wallet.isConnected || !wallet.publicKey) return;

    try {
      setIsLoading(true);

      const marketParams = {
        description: form.description,
        oracleAsset: {
          type: (form.assetCode === 'XLM' ? 'stellar' : 'other') as 'stellar' | 'other',
          code: form.assetCode,
        },
        targetPrice: parseFloat(form.targetPrice),
        condition: form.condition === 'above' ? 0 : 1,
        resolveTime: new Date(form.resolveTime),
      };

      const result = await blockchainService.createMarket(
        wallet.publicKey,
        marketParams,
        wallet.signTransaction
      );

      if (result.status === 'success') {
        // Use toast instead of alert
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: "Market Created Successfully! 🎉",
          description: `Transaction hash: ${result.hash.substring(0, 8)}...`,
          duration: 5000,
        });
        
        // Reset form
        setForm({
          title: '',
          description: '',
          assetCode: 'KALE',
          targetPrice: '',
          condition: 'above',
          resolveTime: '',
          minBetAmount: '100',
          maxBetAmount: '10000',
          creatorFee: '2',
        });
      } else {
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: "Market Creation Failed",
          description: result.message || "Failed to create market",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error creating market:', error);
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: "Error Creating Market",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.description || !form.targetPrice || !form.resolveTime) {
      return 'Please fill in all required fields';
    }

    const targetPrice = parseFloat(form.targetPrice);
    if (isNaN(targetPrice) || targetPrice <= 0) {
      return 'Invalid target price';
    }

    const resolveTime = new Date(form.resolveTime);
    if (resolveTime <= new Date()) {
      return 'Resolution time must be in the future';
    }

    if (currentPrice && oracleConfidence < 80) {
      return 'Oracle confidence too low for this asset';
    }

    return null;
  };

  const getAssetIcon = (assetCode: string) => {
    const icons: Record<string, string> = {
      'KALE': '🥬',
      'BTC': '₿',
      'ETH': 'Ξ',
      'XLM': '⭐',
      'USDC': '💵',
      'SOL': '◎',
    };
    return icons[assetCode] || '📊';
  };

  const getConditionIcon = (condition: string) => {
    return condition === 'above' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Create Prediction Market</h2>
        <p className="text-muted-foreground">
          Turn your KALE farming rewards into prediction markets
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">KALE Balance</p>
                <p className="text-lg font-bold">{kaleBalance.toLocaleString()} KALE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Harvestable Rewards</p>
                <p className="text-lg font-bold">{harvestableRewards.toFixed(2)} KALE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Oracle Confidence</p>
                <p className="text-lg font-bold">{oracleConfidence}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* One-Click Harvest & Bet */}
      {harvestableRewards > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Zap className="h-5 w-5" />
              <span>Quick Action: Harvest & Create Market</span>
            </CardTitle>
            <CardDescription>
              Instantly harvest your KALE rewards and use them to create a prediction market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleHarvestAndBet}
              disabled={isLoading}
              className="w-full flex items-center space-x-2"
              variant="default"
            >
              {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              <span>Harvest {harvestableRewards.toFixed(2)} KALE & Create Market</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Market Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New Prediction Market</span>
          </CardTitle>
          <CardDescription>
            Define the event, set the target, and let the community bet with KALE tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Market Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Market Title</label>
              <Input
                placeholder="e.g., Will KALE reach $1.00 by December 31, 2025?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Detailed description of the prediction market..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          {/* Asset Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Asset</label>
              <Select
                value={form.assetCode}
                onValueChange={(value) => setForm({ ...form, assetCode: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KALE">
                    <span className="flex items-center space-x-2">
                      <span>{getAssetIcon('KALE')}</span>
                      <span>KALE</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="BTC">
                    <span className="flex items-center space-x-2">
                      <span>{getAssetIcon('BTC')}</span>
                      <span>Bitcoin</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="ETH">
                    <span className="flex items-center space-x-2">
                      <span>{getAssetIcon('ETH')}</span>
                      <span>Ethereum</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="XLM">
                    <span className="flex items-center space-x-2">
                      <span>{getAssetIcon('XLM')}</span>
                      <span>Stellar</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="SOL">
                    <span className="flex items-center space-x-2">
                      <span>{getAssetIcon('SOL')}</span>
                      <span>Solana</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Target Price</label>
              <Input
                type="number"
                placeholder="1.00"
                value={form.targetPrice}
                onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
                disabled={isLoading}
              />
              {currentPrice && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current: ${currentPrice.toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Condition</label>
              <Select
                value={form.condition}
                onValueChange={(value: 'above' | 'below') => setForm({ ...form, condition: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">
                    <span className="flex items-center space-x-2">
                      {getConditionIcon('above')}
                      <span>Above</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="below">
                    <span className="flex items-center space-x-2">
                      {getConditionIcon('below')}
                      <span>Below</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Market Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Resolution Time</label>
              <Input
                type="datetime-local"
                value={form.resolveTime}
                onChange={(e) => setForm({ ...form, resolveTime: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Min Bet (KALE)</label>
              <Input
                type="number"
                placeholder="100"
                value={form.minBetAmount}
                onChange={(e) => setForm({ ...form, minBetAmount: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Max Bet (KALE)</label>
              <Input
                type="number"
                placeholder="10000"
                value={form.maxBetAmount}
                onChange={(e) => setForm({ ...form, maxBetAmount: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Creator Fee */}
          <div>
            <label className="text-sm font-medium">Creator Fee (%)</label>
            <Input
              type="number"
              placeholder="2"
              value={form.creatorFee}
              onChange={(e) => setForm({ ...form, creatorFee: e.target.value })}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of total pool that goes to market creator
            </p>
          </div>

          {/* Validation */}
          {(() => {
            const error = validateForm();
            return error ? (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            ) : null;
          })()}

          {/* Oracle Status */}
          {currentPrice && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Oracle Status:</span>
                <Badge variant={oracleConfidence >= 80 ? "default" : "destructive"}>
                  {oracleConfidence >= 80 ? "Ready" : "Low Confidence"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Current Price: ${currentPrice.toLocaleString()}
              </div>
            </div>
          )}

          {/* Create Market Button */}
          <Button 
            onClick={() => handleCreateMarket()}
            disabled={isLoading || !!validateForm()}
            className="w-full flex items-center space-x-2"
            size="lg"
          >
            {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Create Prediction Market</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketCreation;
