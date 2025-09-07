import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Plus, Zap, DollarSign, Activity, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CreateCustomFeedModal from '@/components/CreateCustomFeedModal';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';

const ReflectorPage = () => {
  const { toast } = useToast();
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  const [selectedFeed, setSelectedFeed] = useState('');
  const [customFeeds, setCustomFeeds] = useState<any[]>([]);
  const [realTimeData, setRealTimeData] = useState<any>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // WebSocket connection for real-time data
  const { connectionState, isConnected, subscribeToMarket, unsubscribeFromMarket } = useWebSocket({
    onMarketUpdate: (update) => {
      setRealTimeData(prev => ({
        ...prev,
        [update.marketId]: update.data
      }));
      setLastUpdate(new Date());
    },
    onNotification: (notification) => {
      toast({
        title: "Real-time Update",
        description: notification.message,
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time data feed",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const oracleStats = {
    totalFeeds: 15,
    activeSubscriptions: 3,
    totalSpent: 123.45,
    xrfBalance: 567.89
  };

  const [priceFeeds, setPriceFeeds] = useState([
    { symbol: 'XLM/USD', price: 0.1234, change: '+2.5%', volume: '1.2M', status: 'active', id: 'xlm-usd' },
    { symbol: 'BTC/USD', price: 43250.67, change: '-1.2%', volume: '45.6M', status: 'active', id: 'btc-usd' },
    { symbol: 'ETH/USD', price: 2650.45, change: '+3.1%', volume: '23.4M', status: 'active', id: 'eth-usd' },
    { symbol: 'USDC/USD', price: 1.0001, change: '+0.01%', volume: '12.8M', status: 'active', id: 'usdc-usd' },
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceFeeds(prev => prev.map(feed => {
        const change = (Math.random() - 0.5) * 0.1; // Random change between -5% and +5%
        const newPrice = feed.price * (1 + change);
        const changePercent = ((newPrice - feed.price) / feed.price * 100).toFixed(2);
        
        return {
          ...feed,
          price: newPrice,
          change: `${changePercent > 0 ? '+' : ''}${changePercent}%`,
          volume: (parseFloat(feed.volume.replace('M', '')) * (1 + Math.random() * 0.1)).toFixed(1) + 'M'
        };
      }));
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Subscribe to price feed updates when connected
  useEffect(() => {
    if (isConnected) {
      priceFeeds.forEach(feed => {
        subscribeToMarket(feed.id);
      });
    }
  }, [isConnected, subscribeToMarket]);

  const subscriptions = [
    { feed: 'XLM/USD', cost: 10, frequency: 'hourly', status: 'active' },
    { feed: 'BTC/USD', cost: 25, frequency: 'daily', status: 'active' },
    { feed: 'ETH/USD', cost: 15, frequency: 'hourly', status: 'active' },
  ];

  const handleSubscribe = async () => {
    // Handle subscription logic
    console.log('Subscribing to feed:', selectedFeed, 'Amount:', subscriptionAmount);
  };

  const handleCustomFeedCreated = (feed: any) => {
    setCustomFeeds(prev => [feed, ...prev]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-white/10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-display font-bold text-gradient">Reflector Oracle</h1>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    <Wifi className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-xl">
              Access real-time price feeds and create custom subscriptions for your DeFi applications
            </p>
          </div>
          <div className="w-20 h-20 bg-accent-teal/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-accent-teal" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feeds</p>
                <p className="text-2xl font-bold text-foreground">{oracleStats.totalFeeds}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold text-foreground">{oracleStats.activeSubscriptions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">{oracleStats.totalSpent} XRF</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">XRF Balance</p>
                <p className="text-2xl font-bold text-foreground">{oracleStats.xrfBalance}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Price Feeds */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Price Feeds</span>
                <CreateCustomFeedModal onFeedCreated={handleCustomFeedCreated} />
              </CardTitle>
              <CardDescription>
                Real-time price data for various assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Custom Feeds */}
                {customFeeds.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">Your Custom Feeds</h3>
                    {customFeeds.map((feed, index) => (
                      <div key={`custom-${index}`} className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {feed.assetCode[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{feed.name}</p>
                            <p className="text-sm text-muted-foreground">{feed.assetCode}/{feed.baseCurrency}</p>
                            <p className="text-xs text-blue-600">{feed.dataSource} • {feed.updateFrequency}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs mb-1">
                            {feed.status}
                          </Badge>
                          <p className="text-sm font-medium text-foreground">{feed.costPerUpdate} XRF</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Standard Feeds */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Standard Price Feeds</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPriceFeeds(prev => prev.map(feed => {
                          const change = (Math.random() - 0.5) * 0.1;
                          const newPrice = feed.price * (1 + change);
                          const changePercent = ((newPrice - feed.price) / feed.price * 100).toFixed(2);
                          
                          return {
                            ...feed,
                            price: newPrice,
                            change: `${changePercent > 0 ? '+' : ''}${changePercent}%`,
                            volume: (parseFloat(feed.volume.replace('M', '')) * (1 + Math.random() * 0.1)).toFixed(1) + 'M'
                          };
                        }));
                        setLastUpdate(new Date());
                      }}
                      className="h-8 px-3"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      {isConnected ? 'Live Updates' : 'Manual Refresh'}
                    </Badge>
                  </div>
                </div>
                {priceFeeds.map((feed, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-all duration-300 group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {feed.symbol.split('/')[0][0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{feed.symbol}</p>
                        <p className="text-sm text-muted-foreground">Volume: {feed.volume}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground transition-all duration-300 group-hover:scale-105">
                        ${feed.price.toLocaleString()}
                      </p>
                      <Badge 
                        variant={feed.change.startsWith('+') ? 'default' : 'destructive'} 
                        className={`text-xs transition-all duration-300 ${
                          feed.change.startsWith('+') 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {feed.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Management */}
        <div>
          <Tabs defaultValue="subscribe" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
              <TabsTrigger value="manage">Manage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscribe" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Subscription</CardTitle>
                  <CardDescription>
                    Subscribe to price feeds for your applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="feed">Select Feed</Label>
                    <select
                      id="feed"
                      value={selectedFeed}
                      onChange={(e) => setSelectedFeed(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    >
                      <option value="">Choose a feed...</option>
                      {priceFeeds.map((feed, index) => (
                        <option key={index} value={feed.symbol}>{feed.symbol}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">XRF Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={subscriptionAmount}
                      onChange={(e) => setSubscriptionAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available XRF</span>
                      <span className="font-medium text-foreground">{oracleStats.xrfBalance}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSubscribe}
                    disabled={!selectedFeed || !subscriptionAmount}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Create Subscription
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Subscriptions</CardTitle>
                  <CardDescription>
                    Manage your active price feed subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscriptions.map((sub, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{sub.feed}</p>
                        <p className="text-sm text-muted-foreground">{sub.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{sub.cost} XRF</p>
                        <Badge variant="default" className="text-xs">
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReflectorPage;
