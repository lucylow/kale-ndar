import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Target,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  totalVolume: number;
  totalUsers: number;
  activeMarkets: number;
  resolvedMarkets: number;
  averageAccuracy: number;
  totalFees: number;
  topPerformers: {
    id: string;
    name: string;
    accuracy: number;
    totalBets: number;
    profit: number;
  }[];
  marketCategories: {
    category: string;
    volume: number;
    markets: number;
  }[];
  dailyStats: {
    date: string;
    volume: number;
    users: number;
    bets: number;
  }[];
  riskMetrics: {
    volatility: number;
    liquidity: number;
    manipulationRisk: number;
  };
}

interface AnalyticsDashboardProps {
  timeRange?: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: string) => void;
  onExport?: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  timeRange = '7d',
  onTimeRangeChange,
  onExport,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'users' | 'accuracy'>('volume');

  // Mock analytics data
  const generateMockData = (): AnalyticsData => ({
    totalVolume: 2450000,
    totalUsers: 1250,
    activeMarkets: 45,
    resolvedMarkets: 120,
    averageAccuracy: 68.5,
    totalFees: 24500,
    topPerformers: [
      { id: '1', name: 'CryptoOracle', accuracy: 89.2, totalBets: 156, profit: 12500 },
      { id: '2', name: 'MarketAnalyst', accuracy: 85.7, totalBets: 98, profit: 8900 },
      { id: '3', name: 'PredictionPro', accuracy: 82.1, totalBets: 134, profit: 7600 },
      { id: '4', name: 'TrendWatcher', accuracy: 79.8, totalBets: 87, profit: 5400 },
      { id: '5', name: 'DataDriven', accuracy: 77.3, totalBets: 112, profit: 4200 },
    ],
    marketCategories: [
      { category: 'Crypto', volume: 1200000, markets: 25 },
      { category: 'Sports', volume: 650000, markets: 12 },
      { category: 'Politics', volume: 400000, markets: 8 },
      { category: 'Economics', volume: 200000, markets: 5 },
    ],
    dailyStats: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      volume: Math.floor(Math.random() * 500000) + 200000,
      users: Math.floor(Math.random() * 200) + 100,
      bets: Math.floor(Math.random() * 500) + 200,
    })),
    riskMetrics: {
      volatility: 72,
      liquidity: 85,
      manipulationRisk: 23,
    },
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAnalyticsData(generateMockData());
    setIsLoading(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-500';
    if (risk >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBgColor = (risk: number) => {
    if (risk >= 70) return 'bg-red-500/10';
    if (risk >= 40) return 'bg-yellow-500/10';
    return 'bg-green-500/10';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-secondary rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Platform performance and market insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Time Range:</span>
        {['24h', '7d', '30d', '90d'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeRangeChange?.(range)}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Volume</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalVolume)}</div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-accent-teal" />
              <span className="text-sm text-muted-foreground">Active Users</span>
            </div>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.totalUsers)}</div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Accuracy Rate</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.averageAccuracy}%</div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +2.1% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Active Markets</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.activeMarkets}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {analyticsData.resolvedMarkets} resolved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Stats Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Daily Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.dailyStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{stat.date}</span>
                    <span className="font-medium">{formatCurrency(stat.volume)}</span>
                  </div>
                  <Progress 
                    value={(stat.volume / Math.max(...analyticsData.dailyStats.map(s => s.volume))) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Market Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.marketCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-muted-foreground">{category.markets} markets</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{formatCurrency(category.volume)}</span>
                    <span>{((category.volume / analyticsData.totalVolume) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(category.volume / analyticsData.totalVolume) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{performer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {performer.totalBets} bets • {formatCurrency(performer.profit)} profit
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy</span>
                    <span className="font-medium">{performer.accuracy}%</span>
                  </div>
                  <Progress value={performer.accuracy} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg">
              <div className={`text-2xl font-bold mb-2 ${getRiskColor(analyticsData.riskMetrics.volatility)}`}>
                {analyticsData.riskMetrics.volatility}%
              </div>
              <div className="text-sm text-muted-foreground mb-2">Volatility</div>
              <Progress value={analyticsData.riskMetrics.volatility} className="h-2" />
            </div>
            <div className="text-center p-4 rounded-lg">
              <div className={`text-2xl font-bold mb-2 ${getRiskColor(100 - analyticsData.riskMetrics.liquidity)}`}>
                {analyticsData.riskMetrics.liquidity}%
              </div>
              <div className="text-sm text-muted-foreground mb-2">Liquidity</div>
              <Progress value={analyticsData.riskMetrics.liquidity} className="h-2" />
            </div>
            <div className="text-center p-4 rounded-lg">
              <div className={`text-2xl font-bold mb-2 ${getRiskColor(analyticsData.riskMetrics.manipulationRisk)}`}>
                {analyticsData.riskMetrics.manipulationRisk}%
              </div>
              <div className="text-sm text-muted-foreground mb-2">Manipulation Risk</div>
              <Progress value={analyticsData.riskMetrics.manipulationRisk} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
