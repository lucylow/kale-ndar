import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Sprout, 
  Shield, 
  ArrowUpRight,
  BarChart3,
  Calendar,
  Coins,
  Users,
  Zap,
  Activity,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWallet } from '@/contexts/WalletContext';

const Dashboard = () => {
  const { wallet, user } = useWallet();
  const [portfolioData, setPortfolioData] = useState([]);
  const [kaleStats, setKaleStats] = useState({
    balance: 1234.56,
    staked: 890.12,
    pending: 45.78,
    dailyYield: 2.34
  });

  const [reflectorStats, setReflectorStats] = useState({
    xrfBalance: 567.89,
    subscriptions: 3,
    totalSpent: 123.45,
    activePriceFeeds: 8
  });

  // Mock data for the chart
  useEffect(() => {
    const mockData = [
      { name: 'Jan', value: 4000, kale: 2400, xrf: 1600 },
      { name: 'Feb', value: 3000, kale: 1398, xrf: 1602 },
      { name: 'Mar', value: 5000, kale: 3800, xrf: 1200 },
      { name: 'Apr', value: 4500, kale: 3908, xrf: 592 },
      { name: 'May', value: 6000, kale: 4800, xrf: 1200 },
      { name: 'Jun', value: 7000, kale: 5800, xrf: 1200 }
    ];
    setPortfolioData(mockData);
  }, []);

  const quickActions = [
    { title: 'Start Farming', description: 'Begin KALE farming', link: '/kale', icon: Sprout, color: 'bg-green-500' },
    { title: 'View Prices', description: 'Check Reflector feeds', link: '/reflector', icon: TrendingUp, color: 'bg-blue-500' },
    { title: 'Manage Portfolio', description: 'View your assets', link: '/portfolio', icon: BarChart3, color: 'bg-purple-500' },
    { title: 'DeFi Protocols', description: 'Explore integrations', link: '/defi', icon: Shield, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">Here's your Stellar DeFi overview</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Portfolio</p>
                <p className="text-2xl font-bold text-gray-900">$12,345</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+5.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">KALE Balance</p>
                <p className="text-2xl font-bold text-gray-900">{kaleStats.balance}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm text-gray-500">+{kaleStats.dailyYield} today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">XRF Tokens</p>
                <p className="text-2xl font-bold text-gray-900">{reflectorStats.xrfBalance}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm text-gray-500">{reflectorStats.subscriptions} subscriptions</span>
                </div>
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
                <p className="text-sm text-gray-600">Active Positions</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">All profitable</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Portfolio Performance</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">7D</Button>
              <Button size="sm">30D</Button>
              <Button variant="outline" size="sm">90D</Button>
            </div>
          </div>
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
                <Line 
                  type="monotone" 
                  dataKey="kale" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="xrf" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="font-medium text-gray-900">{action.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest transactions and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'farming', description: 'Harvested 12.5 KALE', time: '2 hours ago', amount: '+12.5 KALE' },
              { type: 'oracle', description: 'Created price subscription', time: '5 hours ago', amount: '-50 XRF' },
              { type: 'stake', description: 'Staked KALE tokens', time: '1 day ago', amount: '100 KALE' },
              { type: 'trade', description: 'Swapped XLM for USDC', time: '2 days ago', amount: '500 XLM' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {activity.type === 'farming' && <Sprout className="w-4 h-4 text-green-600" />}
                    {activity.type === 'oracle' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'stake' && <Shield className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'trade' && <Coins className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${activity.amount.startsWith('+') ? 'text-green-600' : activity.amount.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                  {activity.amount}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
