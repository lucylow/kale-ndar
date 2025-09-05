import React, { useState } from 'react';
import { TrendingUp, Eye, Plus, Zap, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ReflectorPage = () => {
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  const [selectedFeed, setSelectedFeed] = useState('');

  const oracleStats = {
    totalFeeds: 15,
    activeSubscriptions: 3,
    totalSpent: 123.45,
    xrfBalance: 567.89
  };

  const priceFeeds = [
    { symbol: 'XLM/USD', price: 0.1234, change: '+2.5%', volume: '1.2M', status: 'active' },
    { symbol: 'BTC/USD', price: 43250.67, change: '-1.2%', volume: '45.6M', status: 'active' },
    { symbol: 'ETH/USD', price: 2650.45, change: '+3.1%', volume: '23.4M', status: 'active' },
    { symbol: 'USDC/USD', price: 1.0001, change: '+0.01%', volume: '12.8M', status: 'active' },
  ];

  const subscriptions = [
    { feed: 'XLM/USD', cost: 10, frequency: 'hourly', status: 'active' },
    { feed: 'BTC/USD', cost: 25, frequency: 'daily', status: 'active' },
    { feed: 'ETH/USD', cost: 15, frequency: 'hourly', status: 'active' },
  ];

  const handleSubscribe = async () => {
    // Handle subscription logic
    console.log('Subscribing to feed:', selectedFeed, 'Amount:', subscriptionAmount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reflector Oracle</h1>
            <p className="text-blue-100 text-lg">
              Access real-time price feeds and create custom subscriptions for your DeFi applications
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Feeds</p>
                <p className="text-2xl font-bold text-gray-900">{oracleStats.totalFeeds}</p>
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
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{oracleStats.activeSubscriptions}</p>
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
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{oracleStats.totalSpent} XRF</p>
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
                <p className="text-sm text-gray-600">XRF Balance</p>
                <p className="text-2xl font-bold text-gray-900">{oracleStats.xrfBalance}</p>
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
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Feed
                </Button>
              </CardTitle>
              <CardDescription>
                Real-time price data for various assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priceFeeds.map((feed, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {feed.symbol.split('/')[0][0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{feed.symbol}</p>
                        <p className="text-sm text-gray-500">Volume: {feed.volume}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${feed.price.toLocaleString()}</p>
                      <Badge variant={feed.change.startsWith('+') ? 'default' : 'destructive'} className="text-xs">
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
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available XRF</span>
                      <span className="font-medium">{oracleStats.xrfBalance}</span>
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
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{sub.feed}</p>
                        <p className="text-sm text-gray-500">{sub.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{sub.cost} XRF</p>
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
