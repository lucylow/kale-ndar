import React, { useState } from 'react';
import { Shield, TrendingUp, Coins, ArrowUpRight, Zap, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DeFiPage = () => {
  const [selectedProtocol, setSelectedProtocol] = useState('');

  const defiStats = {
    totalValueLocked: 2400000,
    activeProtocols: 8,
    totalYield: 12.5,
    users: 1200
  };

  const protocols = [
    {
      name: 'StellarSwap',
      type: 'DEX',
      tvl: 1200000,
      apy: 8.5,
      description: 'Decentralized exchange for Stellar assets',
      features: ['Swap', 'Liquidity', 'Farming'],
      status: 'active'
    },
    {
      name: 'LendFi',
      type: 'Lending',
      tvl: 800000,
      apy: 12.3,
      description: 'Lending and borrowing protocol',
      features: ['Lend', 'Borrow', 'Collateral'],
      status: 'active'
    },
    {
      name: 'YieldFarm',
      type: 'Yield',
      tvl: 400000,
      apy: 15.7,
      description: 'Automated yield farming strategies',
      features: ['Auto-compound', 'Multi-asset', 'Risk-adjusted'],
      status: 'active'
    }
  ];

  const yieldStrategies = [
    {
      name: 'Conservative',
      apy: 8.2,
      risk: 'Low',
      assets: ['XLM', 'USDC'],
      description: 'Low-risk strategy with stable returns'
    },
    {
      name: 'Balanced',
      apy: 12.5,
      risk: 'Medium',
      assets: ['XLM', 'BTC', 'USDC'],
      description: 'Balanced risk-reward strategy'
    },
    {
      name: 'Aggressive',
      apy: 18.9,
      risk: 'High',
      assets: ['XLM', 'BTC', 'ETH', 'Altcoins'],
      description: 'High-risk, high-reward strategy'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-white/10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-4 text-gradient">DeFi Protocols</h1>
            <p className="text-muted-foreground text-xl">
              Build sophisticated lending, borrowing, and yield farming strategies
            </p>
          </div>
          <div className="w-20 h-20 bg-accent-purple/20 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-accent-purple" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value Locked</p>
                <p className="text-2xl font-bold text-gray-900">${(defiStats.totalValueLocked / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Protocols</p>
                <p className="text-2xl font-bold text-gray-900">{defiStats.activeProtocols}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Yield</p>
                <p className="text-2xl font-bold text-gray-900">{defiStats.totalYield}%</p>
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
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{defiStats.users.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="protocols" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="strategies">Yield Strategies</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {protocols.map((protocol, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{protocol.name}</CardTitle>
                    <Badge variant="default">{protocol.type}</Badge>
                  </div>
                  <CardDescription>{protocol.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TVL</span>
                      <span className="font-medium">${(protocol.tvl / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">APY</span>
                      <span className="font-medium text-green-600">{protocol.apy}%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {protocol.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Explore Protocol
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {yieldStrategies.map((strategy, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <Badge 
                      variant={strategy.risk === 'Low' ? 'default' : strategy.risk === 'Medium' ? 'secondary' : 'destructive'}
                    >
                      {strategy.risk} Risk
                    </Badge>
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{strategy.apy}%</p>
                    <p className="text-sm text-muted-foreground">Expected APY</p>
                  </div>
                  
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
                  
                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Strategy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your DeFi Portfolio</CardTitle>
              <CardDescription>
                Track your positions across different protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Positions</h3>
                  <p className="text-gray-600 mb-4">
                    Start by exploring protocols or yield strategies above
                  </p>
                  <Button>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Explore Protocols
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeFiPage;
