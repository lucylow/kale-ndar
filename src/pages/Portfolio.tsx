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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-indigo-100 text-lg">
              Track and manage your Stellar ecosystem investments
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <Briefcase className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">{totalChange}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assets</p>
                <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
                <p className="text-sm text-gray-500 mt-1">Diversified</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Best Performer</p>
                <p className="text-2xl font-bold text-gray-900">KALE</p>
                <p className="text-sm text-green-500 mt-1">+5.2%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
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
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Portfolio distribution</CardDescription>
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
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>Detailed breakdown of your holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {asset.symbol[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{asset.symbol}</p>
                        <p className="text-sm text-gray-500">{asset.balance.toLocaleString()} tokens</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${asset.value.toLocaleString()}</p>
                      <Badge variant={asset.changeType === 'positive' ? 'default' : 'destructive'} className="text-xs">
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
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent portfolio activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'swap', description: 'Swapped XLM for KALE', amount: '+100 KALE', time: '2 hours ago' },
                  { type: 'stake', description: 'Staked KALE tokens', amount: '50 KALE', time: '1 day ago' },
                  { type: 'harvest', description: 'Harvested farming rewards', amount: '+12.5 KALE', time: '2 days ago' },
                  { type: 'buy', description: 'Purchased XRF tokens', amount: '+25 XRF', time: '3 days ago' }
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {transaction.type === 'swap' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                        {transaction.type === 'stake' && <Briefcase className="w-4 h-4 text-green-600" />}
                        {transaction.type === 'harvest' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                        {transaction.type === 'buy' && <TrendingUp className="w-4 h-4 text-orange-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.time}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-600">{transaction.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio;
