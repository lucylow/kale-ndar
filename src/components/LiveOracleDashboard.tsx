import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Zap, 
  Clock, 
  Shield,
  Database,
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OraclePriceData {
  asset: string;
  price: string;
  formattedPrice: string;
  timestamp: number;
  confidence: number;
  source: string;
  decimals: number;
  change24h?: number;
  volume24h?: number;
  lastUpdate?: number;
}

interface OracleStats {
  totalUpdates: number;
  averageConfidence: number;
  lastUpdateTime: number;
  activeFeeds: number;
  uptime: number;
}

interface PriceHistory {
  timestamp: number;
  price: number;
  confidence: number;
}

const REFLECTOR_CONTRACT_ID = 'CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M';

const LiveOracleDashboard: React.FC = () => {
  const [priceFeeds, setPriceFeeds] = useState<Record<string, OraclePriceData>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, PriceHistory[]>>({});
  const [oracleStats, setOracleStats] = useState<OracleStats>({
    totalUpdates: 0,
    averageConfidence: 0,
    lastUpdateTime: 0,
    activeFeeds: 0,
    uptime: 100,
  });
  const [isConnected, setIsConnected] = useState(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Supported assets for demonstration
  const supportedAssets = [
    {
      id: 'KALE:GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE',
      name: 'KALE',
      symbol: 'KALE',
      description: 'KALE Token',
      basePrice: 0.15,
    },
    {
      id: 'XLM',
      name: 'Stellar Lumens',
      symbol: 'XLM',
      description: 'Native Stellar token',
      basePrice: 0.12,
    },
    {
      id: 'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      name: 'USD Coin',
      symbol: 'USDC',
      description: 'Stablecoin',
      basePrice: 1.00,
    },
    {
      id: 'BTC',
      name: 'Bitcoin',
      symbol: 'BTC',
      description: 'Bitcoin',
      basePrice: 45000,
    },
    {
      id: 'ETH',
      name: 'Ethereum',
      symbol: 'ETH',
      description: 'Ethereum',
      basePrice: 3200,
    },
  ];

  // Fetch price data from Reflector oracle
  const fetchOraclePrice = useCallback(async (assetId: string) => {
    try {
      const response = await fetch(
        `https://kkehvvfmcjsqitxkkmts.supabase.co/functions/v1/reflector-price?contract=${REFLECTOR_CONTRACT_ID}&asset=${assetId}`,
        {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWh2dmZtY2pzcWl0eGtrbXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjQyMTEsImV4cCI6MjA3MjM0MDIxMX0.69fEHRmdVFg8FJ6oBvgD1glnJe5u1ds1jy8SAOLyx8Q`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const priceData = await response.json();
      
      const oracleData: OraclePriceData = {
        asset: assetId,
        price: priceData.price,
        formattedPrice: priceData.formattedPrice,
        timestamp: priceData.timestamp,
        confidence: priceData.confidence || 95,
        source: priceData.source || 'reflector',
        decimals: priceData.decimals || 14,
        lastUpdate: Date.now(),
      };

      return oracleData;
    } catch (error) {
      console.error(`Failed to fetch price for ${assetId}:`, error);
      throw error;
    }
  }, []);

  // Update all price feeds
  const updateAllPrices = useCallback(async () => {
    setIsLoading(true);
    const updates: Record<string, OraclePriceData> = {};
    const historyUpdates: Record<string, PriceHistory[]> = { ...priceHistory };

    try {
      const promises = supportedAssets.map(async (asset) => {
        try {
          const priceData = await fetchOraclePrice(asset.id);
          updates[asset.id] = priceData;

          // Update price history
          if (!historyUpdates[asset.id]) {
            historyUpdates[asset.id] = [];
          }
          
          historyUpdates[asset.id].push({
            timestamp: priceData.timestamp,
            price: parseFloat(priceData.formattedPrice),
            confidence: priceData.confidence,
          });

          // Keep only last 50 data points
          if (historyUpdates[asset.id].length > 50) {
            historyUpdates[asset.id] = historyUpdates[asset.id].slice(-50);
          }

          return priceData;
        } catch (error) {
          console.error(`Failed to update ${asset.name}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(promises);
      const successfulUpdates = results.filter(r => r.status === 'fulfilled' && r.value).length;

      setPriceFeeds(prev => ({ ...prev, ...updates }));
      setPriceHistory(historyUpdates);

      // Update oracle stats
      const totalConfidence = Object.values(updates).reduce((sum, data) => sum + data.confidence, 0);
      const averageConfidence = Object.keys(updates).length > 0 ? totalConfidence / Object.keys(updates).length : 0;

      setOracleStats(prev => ({
        totalUpdates: prev.totalUpdates + successfulUpdates,
        averageConfidence,
        lastUpdateTime: Date.now(),
        activeFeeds: Object.keys(updates).length,
        uptime: successfulUpdates / supportedAssets.length * 100,
      }));

      setIsConnected(true);
    } catch (error) {
      console.error('Failed to update prices:', error);
      setIsConnected(false);
      toast.error('Failed to connect to Reflector oracle');
    } finally {
      setIsLoading(false);
    }
  }, [fetchOraclePrice, priceHistory]);

  // Auto-refresh effect
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(updateAllPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, updateAllPrices]);

  // Initial load
  useEffect(() => {
    updateAllPrices();
  }, []);

  const getPriceChange = (assetId: string) => {
    const history = priceHistory[assetId];
    if (!history || history.length < 2) return 0;

    const current = history[history.length - 1].price;
    const previous = history[history.length - 2].price;
    return ((current - previous) / previous) * 100;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-500';
    if (confidence >= 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 95) return 'default';
    if (confidence >= 85) return 'secondary';
    return 'destructive';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderPriceCard = (asset: typeof supportedAssets[0]) => {
    const priceData = priceFeeds[asset.id];
    const change = getPriceChange(asset.id);
    const history = priceHistory[asset.id] || [];

    return (
      <Card key={asset.id} className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{asset.symbol.charAt(0)}</span>
                </div>
                {asset.name}
              </CardTitle>
              <CardDescription>{asset.description}</CardDescription>
            </div>
            <div className="text-right">
              {priceData ? (
                <div className="flex items-center gap-2">
                  <Badge variant={getConfidenceBadge(priceData.confidence)}>
                    {priceData.confidence}%
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Loading...</Badge>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {priceData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  ${priceData.formattedPrice}
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {change > 0 ? <TrendingUp className="h-4 w-4" /> : 
                   change < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                  {change !== 0 && `${change.toFixed(2)}%`}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Confidence</span>
                  <span className={getConfidenceColor(priceData.confidence)}>
                    {priceData.confidence}%
                  </span>
                </div>
                <Progress value={priceData.confidence} className="h-2" />
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Last Update</span>
                <span>{formatTimestamp(priceData.timestamp)}</span>
              </div>

              {showHistory && history.length > 1 && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Price Trend (Last 10 updates)</div>
                  <div className="flex items-end gap-1 h-16">
                    {history.slice(-10).map((point, index) => {
                      const maxPrice = Math.max(...history.slice(-10).map(p => p.price));
                      const minPrice = Math.min(...history.slice(-10).map(p => p.price));
                      const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 100;
                      
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-primary/20 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderOracleStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Oracle Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-500">{oracleStats.activeFeeds}</div>
            <div className="text-sm text-muted-foreground">Active Feeds</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-500">{oracleStats.totalUpdates}</div>
            <div className="text-sm text-muted-foreground">Total Updates</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-purple-500">{oracleStats.averageConfidence.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-orange-500">{oracleStats.uptime.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status</span>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">Disconnected</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto Refresh</span>
            <div className="flex items-center gap-2">
              {isAutoRefresh ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Enabled</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Disabled</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Refresh Interval</span>
            <span className="text-sm text-muted-foreground">{refreshInterval / 1000}s</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Update</span>
            <span className="text-sm text-muted-foreground">
              {oracleStats.lastUpdateTime ? formatTimestamp(oracleStats.lastUpdateTime) : 'Never'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Activity className="h-8 w-8 text-blue-500" />
          Live Reflector Oracle Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time price feeds from the Reflector oracle on Stellar network
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={updateAllPrices}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isLoading ? 'Updating...' : 'Refresh Now'}
              </Button>

              <Button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                variant={isAutoRefresh ? 'default' : 'outline'}
                size="sm"
              >
                <Zap className="h-4 w-4" />
                Auto Refresh {isAutoRefresh ? 'ON' : 'OFF'}
              </Button>

              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant={showHistory ? 'default' : 'outline'}
                size="sm"
              >
                {showHistory ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showHistory ? 'Hide' : 'Show'} History
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Refresh Interval:</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oracle Stats */}
      {renderOracleStats()}

      {/* Price Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supportedAssets.map(renderPriceCard)}
      </div>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Reflector Oracle Contract
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Contract ID:</span>
              <span className="text-sm font-mono text-muted-foreground">
                {REFLECTOR_CONTRACT_ID}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Network:</span>
              <span className="text-sm text-muted-foreground">Stellar Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Update Frequency:</span>
              <span className="text-sm text-muted-foreground">Real-time</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Confidence Threshold:</span>
              <span className="text-sm text-muted-foreground">80% minimum</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveOracleDashboard;
