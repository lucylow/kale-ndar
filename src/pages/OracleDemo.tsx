import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Zap, 
  Shield,
  TrendingUp,
  TrendingDown,
  Loader2,
  Play,
  Pause,
  Settings,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import LiveOracleDashboard from '@/components/LiveOracleDashboard';
import RealTimePriceChart from '@/components/RealTimePriceChart';
import { getHybridOracleClient, PriceUpdate, OracleMetrics, OracleNode, ConnectionMode } from '@/services/hybrid-oracle-client';

const OracleDemo: React.FC = () => {
  const [oracleClient] = useState(() => getHybridOracleClient());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('offline');
  const [priceUpdates, setPriceUpdates] = useState<Record<string, PriceUpdate>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, any[]>>({});
  const [oracleMetrics, setOracleMetrics] = useState<OracleMetrics | null>(null);
  const [oracleNodes, setOracleNodes] = useState<OracleNode[]>([]);
  const [isLiveUpdates, setIsLiveUpdates] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Supported assets
  const supportedAssets = [
    {
      id: 'KALE:GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE',
      symbol: 'KALE',
      name: 'KALE Token',
    },
    {
      id: 'XLM',
      symbol: 'XLM',
      name: 'Stellar Lumens',
    },
    {
      id: 'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      symbol: 'USDC',
      name: 'USD Coin',
    },
    {
      id: 'BTC',
      symbol: 'BTC',
      name: 'Bitcoin',
    },
    {
      id: 'ETH',
      symbol: 'ETH',
      name: 'Ethereum',
    },
  ];

  useEffect(() => {
    // Setup hybrid oracle client event listeners
    oracleClient.on('connected', (data: any) => {
      setIsConnected(true);
      setConnectionMode(data.mode);
      setConnectionError(null);
      
      const modeText = data.mode === 'websocket' ? 'WebSocket' : 'HTTP';
      toast.success(`Connected to Reflector Oracle via ${modeText}`);
      
      // Subscribe to all assets
      const assetIds = supportedAssets.map(asset => asset.id);
      oracleClient.subscribeToAssets(assetIds);
      
      // Request initial data
      oracleClient.requestLatestPrices();
      oracleClient.requestMetrics();
      oracleClient.requestNodeStatus();
    });

    oracleClient.on('disconnected', () => {
      setIsConnected(false);
      setConnectionMode('offline');
      toast.error('Disconnected from Reflector Oracle');
    });

    oracleClient.on('modeChanged', (data: any) => {
      const modeText = data.to === 'websocket' ? 'WebSocket' : 'HTTP';
      toast.info(`Switched to ${modeText} mode`);
      setConnectionMode(data.to);
    });

    oracleClient.on('priceUpdate', (data: any) => {
      if (data.updates) {
        // Handle batch updates
        data.updates.forEach((update: PriceUpdate) => {
          setPriceUpdates(prev => ({
            ...prev,
            [update.asset]: update,
          }));

          // Update price history
          setPriceHistory(prev => {
            const assetHistory = prev[update.asset] || [];
            const newHistory = [...assetHistory, {
              timestamp: update.timestamp,
              price: parseFloat(update.formattedPrice),
              confidence: update.confidence,
              volume: update.volume24h,
            }].slice(-100); // Keep last 100 data points

            return {
              ...prev,
              [update.asset]: newHistory,
            };
          });
        });
      } else if (data.latestPrices) {
        // Handle latest prices response
        setPriceUpdates(data.latestPrices);
      }
    });

    oracleClient.on('metricsUpdate', (data: any) => {
      if (data.metrics) {
        setOracleMetrics(data.metrics);
      }
    });

    oracleClient.on('nodeStatus', (data: any) => {
      if (data.nodes) {
        setOracleNodes(data.nodes);
      } else if (data.status && data.node) {
        // Handle node status change
        setOracleNodes(prev => 
          prev.map(node => 
            node.id === data.node.id 
              ? { ...node, isActive: data.status === 'recovery' }
              : node
          )
        );
      }
    });

    oracleClient.on('error', (error: any) => {
      console.error('Oracle client error:', error);
      setConnectionError(`Connection error: ${error.error?.message || 'Unknown error'}`);
      
      if (error.mode === 'websocket') {
        toast.error('WebSocket connection failed, trying HTTP fallback...');
      } else {
        toast.error('HTTP connection failed');
      }
    });

    // Connect to oracle service
    oracleClient.connect();

    return () => {
      oracleClient.disconnect();
    };
  }, [oracleClient]);

  const toggleLiveUpdates = () => {
    setIsLiveUpdates(!isLiveUpdates);
    if (!isLiveUpdates) {
      oracleClient.requestLatestPrices();
    }
  };

  const refreshData = () => {
    oracleClient.requestLatestPrices();
    oracleClient.requestMetrics();
    oracleClient.requestNodeStatus();
    toast.success('Data refreshed');
  };

  const switchToHttp = () => {
    oracleClient.switchToHttp();
  };

  const switchToWebSocket = () => {
    oracleClient.switchToWebSocket();
  };

  const simulateNodeFailure = (nodeId: string) => {
    // This would typically call a backend endpoint to simulate node failure
    toast.info(`Simulating failure for node: ${nodeId}`);
  };

  const getPriceChange = (assetId: string) => {
    const history = priceHistory[assetId];
    if (!history || history.length < 2) return 0;

    const current = history[history.length - 1].price;
    const previous = history[history.length - 2].price;
    return ((current - previous) / previous) * 100;
  };

  const renderPriceCard = (asset: typeof supportedAssets[0]) => {
    const priceData = priceUpdates[asset.id];
    const change = getPriceChange(asset.id);
    const history = priceHistory[asset.id] || [];

    return (
      <Card 
        key={asset.id} 
        className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedAsset === asset.id ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => setSelectedAsset(asset.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{asset.name}</CardTitle>
              <CardDescription>{asset.symbol}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {priceData ? (
                <Badge variant={priceData.confidence >= 95 ? 'default' : 'secondary'}>
                  {priceData.confidence}%
                </Badge>
              ) : (
                <Badge variant="outline">Loading...</Badge>
              )}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {priceData ? (
            <div className="space-y-3">
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

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>24h Change:</span>
                  <span className={priceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Volume:</span>
                  <span>${priceData.volume24h.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Oracle Node:</span>
                  <span className="font-mono text-xs">{priceData.oracleNode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span>{new Date(priceData.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
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

  const renderOracleMetrics = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Oracle Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {oracleMetrics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{oracleMetrics.totalUpdates}</div>
              <div className="text-sm text-muted-foreground">Total Updates</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">{oracleMetrics.averageConfidence.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{oracleMetrics.activeNodes}</div>
              <div className="text-sm text-muted-foreground">Active Nodes</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{oracleMetrics.updateFrequency}</div>
              <div className="text-sm text-muted-foreground">Updates/min</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderOracleNodes = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Oracle Nodes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {oracleNodes.map((node) => (
            <div key={node.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${node.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <div className="font-medium">{node.name}</div>
                  <div className="text-sm text-muted-foreground font-mono">{node.address}</div>
                </div>
              </div>
              
              <div className="text-right text-sm">
                <div className="font-medium">{node.updateCount} updates</div>
                <div className="text-muted-foreground">{node.averageConfidence.toFixed(1)}% avg confidence</div>
                <div className="text-muted-foreground">{node.reliability.toFixed(2)} reliability</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Activity className="h-8 w-8 text-blue-500" />
          Live Reflector Oracle Demonstration
        </h1>
        <p className="text-muted-foreground">
          Real-time price feeds, WebSocket updates, and oracle node monitoring
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-500" />
                    <span className="text-green-500 font-medium">
                      Connected ({connectionMode.toUpperCase()})
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-500" />
                    <span className="text-red-500 font-medium">Disconnected</span>
                  </>
                )}
              </div>

              {connectionError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{connectionError}</span>
                </div>
              )}

              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>

              <Button
                onClick={toggleLiveUpdates}
                variant={isLiveUpdates ? 'default' : 'outline'}
                size="sm"
              >
                {isLiveUpdates ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isLiveUpdates ? 'Pause' : 'Resume'} Updates
              </Button>

              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>

              {showAdvanced && (
                <>
                  <Button
                    onClick={switchToWebSocket}
                    variant={connectionMode === 'websocket' ? 'default' : 'outline'}
                    size="sm"
                    disabled={!isConnected}
                  >
                    <Wifi className="h-4 w-4" />
                    WebSocket
                  </Button>

                  <Button
                    onClick={switchToHttp}
                    variant={connectionMode === 'http' ? 'default' : 'outline'}
                    size="sm"
                    disabled={!isConnected}
                  >
                    <RefreshCw className="h-4 w-4" />
                    HTTP
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Reflector Oracle Contract</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Chart</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="nodes">Oracle Nodes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <LiveOracleDashboard />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          {selectedAsset ? (
            <RealTimePriceChart
              asset={selectedAsset}
              symbol={supportedAssets.find(a => a.id === selectedAsset)?.symbol || ''}
              priceData={priceHistory[selectedAsset] || []}
              isLive={isLiveUpdates}
              onToggleLive={toggleLiveUpdates}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select an Asset</h3>
                <p className="text-muted-foreground">Choose an asset from the dashboard to view its real-time chart</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {renderOracleMetrics()}
        </TabsContent>

        <TabsContent value="nodes" className="space-y-6">
          {renderOracleNodes()}
        </TabsContent>
      </Tabs>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supportedAssets.map(renderPriceCard)}
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Controls
            </CardTitle>
            <CardDescription>
              Debug and testing controls for oracle demonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => wsClient.requestLatestPrices()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Request Latest Prices
              </Button>
              
              <Button
                onClick={() => wsClient.requestMetrics()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Request Metrics
              </Button>
              
              <Button
                onClick={() => wsClient.requestNodeStatus()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Request Node Status
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Connection Info</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Status: {oracleClient.getConnectionStatus().isConnected ? 'Connected' : 'Disconnected'}</div>
                <div>Mode: {oracleClient.getConnectionStatus().mode.toUpperCase()}</div>
                <div>Subscribed Assets: {oracleClient.getConnectionStatus().subscribedAssets.length}</div>
                <div>Reconnect Attempts: {oracleClient.getConnectionStatus().reconnectAttempts}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OracleDemo;
