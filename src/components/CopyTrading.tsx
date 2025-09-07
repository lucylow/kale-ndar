import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Copy, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star,
  Crown,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  DollarSign,
  Target,
  BarChart3
} from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  totalFollowers: number;
  totalCopied: number;
  winRate: number;
  totalProfit: number;
  avgBetSize: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  tradingStyle: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  specialties: string[];
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  recentTrades: {
    id: string;
    market: string;
    outcome: boolean;
    amount: number;
    profit: number;
    timestamp: number;
  }[];
  isFollowing: boolean;
  copySettings?: CopySettings;
}

interface CopySettings {
  maxAmountPerTrade: number;
  copyPercentage: number;
  riskLimits: {
    dailyLossLimit: number;
    maxOpenPositions: number;
    stopLossPercentage: number;
  };
  categories: string[];
  isActive: boolean;
}

interface CopyTradingProps {
  onStartCopyTrading: (traderId: string, settings: CopySettings) => void;
  onStopCopyTrading: (traderId: string) => void;
  onUpdateSettings: (traderId: string, settings: CopySettings) => void;
}

const CopyTrading: React.FC<CopyTradingProps> = ({
  onStartCopyTrading,
  onStopCopyTrading,
  onUpdateSettings,
}) => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copySettings, setCopySettings] = useState<CopySettings>({
    maxAmountPerTrade: 1000,
    copyPercentage: 50,
    riskLimits: {
      dailyLossLimit: 500,
      maxOpenPositions: 5,
      stopLossPercentage: 20,
    },
    categories: ['crypto', 'sports'],
    isActive: true,
  });

  // Mock traders data
  useEffect(() => {
    setTraders([
      {
        id: '1',
        name: 'CryptoOracle',
        avatar: '/avatars/crypto-oracle.jpg',
        isVerified: true,
        totalFollowers: 1250,
        totalCopied: 890,
        winRate: 89.2,
        totalProfit: 12500,
        avgBetSize: 500,
        riskLevel: 'MEDIUM',
        tradingStyle: 'MODERATE',
        specialties: ['Crypto', 'Technical Analysis'],
        performance: {
          daily: 2.5,
          weekly: 15.8,
          monthly: 45.2,
          yearly: 180.5,
        },
        recentTrades: [
          { id: '1', market: 'BTC to $100K', outcome: true, amount: 500, profit: 125, timestamp: Date.now() - 3600000 },
          { id: '2', market: 'ETH to $5K', outcome: true, amount: 300, profit: 90, timestamp: Date.now() - 7200000 },
          { id: '3', market: 'SOL to $200', outcome: false, amount: 200, profit: -40, timestamp: Date.now() - 10800000 },
        ],
        isFollowing: false,
      },
      {
        id: '2',
        name: 'MarketAnalyst',
        avatar: '/avatars/market-analyst.jpg',
        isVerified: true,
        totalFollowers: 980,
        totalCopied: 650,
        winRate: 85.7,
        totalProfit: 8900,
        avgBetSize: 400,
        riskLevel: 'LOW',
        tradingStyle: 'CONSERVATIVE',
        specialties: ['Fundamental Analysis', 'Risk Management'],
        performance: {
          daily: 1.8,
          weekly: 12.5,
          monthly: 38.9,
          yearly: 145.2,
        },
        recentTrades: [
          { id: '4', market: 'Gold to $2000', outcome: true, amount: 400, profit: 80, timestamp: Date.now() - 1800000 },
          { id: '5', market: 'Oil to $100', outcome: true, amount: 350, profit: 70, timestamp: Date.now() - 5400000 },
        ],
        isFollowing: true,
        copySettings: {
          maxAmountPerTrade: 800,
          copyPercentage: 75,
          riskLimits: {
            dailyLossLimit: 300,
            maxOpenPositions: 3,
            stopLossPercentage: 15,
          },
          categories: ['economics', 'commodities'],
          isActive: true,
        },
      },
      {
        id: '3',
        name: 'PredictionPro',
        avatar: '/avatars/prediction-pro.jpg',
        isVerified: false,
        totalFollowers: 750,
        totalCopied: 420,
        winRate: 82.1,
        totalProfit: 7600,
        avgBetSize: 600,
        riskLevel: 'HIGH',
        tradingStyle: 'AGGRESSIVE',
        specialties: ['Sports', 'Politics'],
        performance: {
          daily: 3.2,
          weekly: 18.5,
          monthly: 52.8,
          yearly: 195.3,
        },
        recentTrades: [
          { id: '6', market: 'Election Outcome', outcome: true, amount: 600, profit: 180, timestamp: Date.now() - 900000 },
          { id: '7', market: 'Championship Winner', outcome: false, amount: 500, profit: -100, timestamp: Date.now() - 2700000 },
        ],
        isFollowing: false,
      },
    ]);
  }, []);

  const handleStartCopyTrading = (trader: Trader) => {
    setSelectedTrader(trader);
    setShowSettings(true);
  };

  const handleStopCopyTrading = (traderId: string) => {
    setTraders(prev => prev.map(trader => 
      trader.id === traderId 
        ? { ...trader, isFollowing: false, copySettings: undefined }
        : trader
    ));
    onStopCopyTrading(traderId);
  };

  const handleSaveSettings = () => {
    if (selectedTrader) {
      setTraders(prev => prev.map(trader => 
        trader.id === selectedTrader.id 
          ? { ...trader, isFollowing: true, copySettings }
          : trader
      ));
      onStartCopyTrading(selectedTrader.id, copySettings);
      setShowSettings(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-500 bg-green-500/10';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10';
      case 'HIGH': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPerformanceColor = (performance: number) => {
    return performance > 0 ? 'text-green-500' : 'text-red-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Copy Trading</h2>
          <p className="text-muted-foreground">
            Follow successful traders and automatically copy their strategies
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {traders.filter(t => t.isFollowing).length} Following
        </Badge>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {traders.slice(0, 3).map((trader, index) => (
              <div key={trader.id} className="p-4 bg-secondary/20 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={trader.avatar} />
                    <AvatarFallback>
                      {trader.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{trader.name}</span>
                      {trader.isVerified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trader.totalFollowers} followers
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span className="font-medium text-green-500">{trader.winRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Profit</span>
                    <span className="font-medium">{formatCurrency(trader.totalProfit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly</span>
                    <span className={`font-medium ${getPerformanceColor(trader.performance.monthly)}`}>
                      {trader.performance.monthly > 0 ? '+' : ''}{trader.performance.monthly}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <Badge className={getRiskColor(trader.riskLevel)}>
                    {trader.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traders List */}
      <div className="space-y-4">
        {traders.map((trader) => (
          <Card key={trader.id} className="bg-gradient-card border-white/10 hover:border-primary/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={trader.avatar} />
                  <AvatarFallback>
                    {trader.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  {/* Trader Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{trader.name}</h3>
                        {trader.isVerified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        <Badge className={getRiskColor(trader.riskLevel)}>
                          {trader.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {trader.specialties.join(' • ')}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {trader.totalFollowers} followers
                        </div>
                        <div className="flex items-center gap-1">
                          <Copy className="h-3 w-3" />
                          {trader.totalCopied} copied
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-green-500">
                        {formatCurrency(trader.totalProfit)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Profit
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold">{trader.winRate}%</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold">{formatCurrency(trader.avgBetSize)}</div>
                      <div className="text-xs text-muted-foreground">Avg Bet</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${getPerformanceColor(trader.performance.weekly)}`}>
                        {trader.performance.weekly > 0 ? '+' : ''}{trader.performance.weekly}%
                      </div>
                      <div className="text-xs text-muted-foreground">7D</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${getPerformanceColor(trader.performance.monthly)}`}>
                        {trader.performance.monthly > 0 ? '+' : ''}{trader.performance.monthly}%
                      </div>
                      <div className="text-xs text-muted-foreground">30D</div>
                    </div>
                  </div>

                  {/* Recent Trades */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recent Trades</h4>
                    <div className="space-y-2">
                      {trader.recentTrades.slice(0, 3).map((trade) => (
                        <div key={trade.id} className="flex items-center justify-between text-xs p-2 bg-secondary/20 rounded">
                          <div className="flex items-center gap-2">
                            {trade.outcome ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className="truncate max-w-32">{trade.market}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={trade.profit > 0 ? 'text-green-500' : 'text-red-500'}>
                              {trade.profit > 0 ? '+' : ''}{formatCurrency(trade.profit)}
                            </span>
                            <span className="text-muted-foreground">
                              {formatTimeAgo(trade.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {trader.isFollowing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStopCopyTrading(trader.id)}
                          className="gap-2"
                        >
                          <Pause className="h-4 w-4" />
                          Stop Copying
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTrader(trader);
                            setCopySettings(trader.copySettings || copySettings);
                            setShowSettings(true);
                          }}
                          className="gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleStartCopyTrading(trader)}
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start Copying
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Copy Settings Modal */}
      {showSettings && selectedTrader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Copy Trading Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how to copy {selectedTrader.name}'s trades
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxAmount">Max Amount Per Trade (KALE)</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  value={copySettings.maxAmountPerTrade}
                  onChange={(e) => setCopySettings(prev => ({
                    ...prev,
                    maxAmountPerTrade: Number(e.target.value)
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="copyPercentage">Copy Percentage</Label>
                <div className="space-y-2">
                  <Slider
                    value={[copySettings.copyPercentage]}
                    onValueChange={(value) => setCopySettings(prev => ({
                      ...prev,
                      copyPercentage: value[0]
                    }))}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-center text-sm font-medium">
                    {copySettings.copyPercentage}%
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="dailyLossLimit">Daily Loss Limit (KALE)</Label>
                <Input
                  id="dailyLossLimit"
                  type="number"
                  value={copySettings.riskLimits.dailyLossLimit}
                  onChange={(e) => setCopySettings(prev => ({
                    ...prev,
                    riskLimits: {
                      ...prev.riskLimits,
                      dailyLossLimit: Number(e.target.value)
                    }
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="maxPositions">Max Open Positions</Label>
                <Input
                  id="maxPositions"
                  type="number"
                  value={copySettings.riskLimits.maxOpenPositions}
                  onChange={(e) => setCopySettings(prev => ({
                    ...prev,
                    riskLimits: {
                      ...prev.riskLimits,
                      maxOpenPositions: Number(e.target.value)
                    }
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="stopLoss">Stop Loss Percentage</Label>
                <div className="space-y-2">
                  <Slider
                    value={[copySettings.riskLimits.stopLossPercentage]}
                    onValueChange={(value) => setCopySettings(prev => ({
                      ...prev,
                      riskLimits: {
                        ...prev.riskLimits,
                        stopLossPercentage: value[0]
                      }
                    }))}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-center text-sm font-medium">
                    {copySettings.riskLimits.stopLossPercentage}%
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={copySettings.isActive}
                  onCheckedChange={(checked) => setCopySettings(prev => ({
                    ...prev,
                    isActive: checked
                  }))}
                />
                <Label htmlFor="isActive">Enable Copy Trading</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSettings} className="flex-1">
                  Save Settings
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CopyTrading;
