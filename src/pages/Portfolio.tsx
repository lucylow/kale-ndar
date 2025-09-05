import React, { useState } from 'react';
import { Briefcase, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const Portfolio = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const portfolioData = [
    { name: 'Jan', value: 4000, kale: 2400, xrf: 1600 },
    { name: 'Feb', value: 3000, kale: 1398, xrf: 1602 },
    { name: 'Mar', value: 5000, kale: 3800, xrf: 1200 },
    { name: 'Apr', value: 4500, kale: 3908, xrf: 592 },
    { name: 'May', value: 6000, kale: 4800, xrf: 1200 },
    { name: 'Jun', value: 7000, kale: 5800, xrf: 1200 }
  ];

  const pieData = [
    { name: 'KALE', value: 45, color: '#10B981' },
    { name: 'XRF', value: 25, color: '#8B5CF6' },
    { name: 'XLM', value: 20, color: '#3B82F6' },
    { name: 'USDC', value: 10, color: '#F59E0B' }
  ];

  const assets = [
    { symbol: 'KALE', balance: 1234.56, value: 5678.90, change: '+5.2%', changeType: 'positive' },
    { symbol: 'XRF', balance: 567.89, value: 2345.67, change: '+2.1%', changeType: 'positive' },
    { symbol: 'XLM', balance: 2500.00, value: 312.50, change: '-1.5%', changeType: 'negative' },
    { symbol: 'USDC', balance: 1000.00, value: 1000.00, change: '+0.1%', changeType: 'positive' }
  ];

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange = '+3.2%';

  return (
    <div className="min-h-screen bg-background pt-20 px-6">
      <div className="container mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-hero rounded-xl p-8 text-foreground shadow-card border border-white/10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-4 text-gradient">Portfolio</h1>
            <p className="text-muted-foreground text-xl">
              Track and manage your Stellar ecosystem investments
            </p>
          </div>
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-primary" />
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">{totalChange}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assets</p>
                <p className="text-2xl font-bold text-foreground">{assets.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Diversified</p>
              </div>
              <div className="w-12 h-12 bg-accent-teal/20 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-accent-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Performer</p>
                <p className="text-2xl font-bold text-foreground">KALE</p>
                <p className="text-sm text-primary mt-1">+5.2%</p>
              </div>
              <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent-purple" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card className="bg-gradient-card border-white/10 shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground">Portfolio Performance</CardTitle>
                <CardDescription className="text-muted-foreground">Value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--accent-teal))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--accent-teal))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card className="bg-gradient-card border-white/10 shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground">Asset Allocation</CardTitle>
                <CardDescription className="text-muted-foreground">Portfolio distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card className="bg-gradient-card border-white/10 shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Your Assets</CardTitle>
              <CardDescription className="text-muted-foreground">Detailed breakdown of your holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-accent/10 transition-all duration-300 hover-lift">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-background font-bold text-lg">
                        {asset.symbol[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{asset.symbol}</p>
                        <p className="text-sm text-muted-foreground">{asset.balance.toLocaleString()} tokens</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${asset.value.toLocaleString()}</p>
                      <Badge variant={asset.changeType === 'positive' ? 'default' : 'destructive'} className="text-xs mt-1">
                        {asset.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-gradient-card border-white/10 shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Transaction History</CardTitle>
              <CardDescription className="text-muted-foreground">Recent portfolio activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'swap', description: 'Swapped XLM for KALE', amount: '+100 KALE', time: '2 hours ago' },
                  { type: 'stake', description: 'Staked KALE tokens', amount: '50 KALE', time: '1 day ago' },
                  { type: 'harvest', description: 'Harvested farming rewards', amount: '+12.5 KALE', time: '2 days ago' },
                  { type: 'buy', description: 'Purchased XRF tokens', amount: '+25 XRF', time: '3 days ago' }
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-white/10 last:border-b-0 hover:bg-accent/10 rounded-lg px-2 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary/50 rounded-full flex items-center justify-center">
                        {transaction.type === 'swap' && <TrendingUp className="w-5 h-5 text-accent-teal" />}
                        {transaction.type === 'stake' && <Briefcase className="w-5 h-5 text-primary" />}
                        {transaction.type === 'harvest' && <TrendingUp className="w-5 h-5 text-accent-purple" />}
                        {transaction.type === 'buy' && <TrendingUp className="w-5 h-5 text-accent-gold" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.time}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{transaction.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;
