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
  Clock,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWallet } from '@/contexts/WalletContext';

const Dashboard = () => {
  console.log('Dashboard component rendering...');
  const { wallet, user } = useWallet();
  console.log('Wallet state:', { isConnected: wallet.isConnected, publicKey: wallet.publicKey });
  
  const [portfolioData, setPortfolioData] = useState([]);
  const [timeRange, setTimeRange] = useState('30D');

  // Mock data for the chart - updates based on time range
  useEffect(() => {
    const generateMockData = (range: string) => {
      switch (range) {
        case '7D':
          return [
            { name: 'Mon', value: 6500, kale: 4800, xrf: 1700 },
            { name: 'Tue', value: 6200, kale: 4600, xrf: 1600 },
            { name: 'Wed', value: 6800, kale: 5000, xrf: 1800 },
            { name: 'Thu', value: 7200, kale: 5400, xrf: 1800 },
            { name: 'Fri', value: 7000, kale: 5200, xrf: 1800 },
            { name: 'Sat', value: 7400, kale: 5600, xrf: 1800 },
            { name: 'Sun', value: 7600, kale: 5800, xrf: 1800 }
          ];
        default: // 30D
          return [
            { name: 'Jan', value: 4000, kale: 2400, xrf: 1600 },
            { name: 'Feb', value: 3000, kale: 1398, xrf: 1602 },
            { name: 'Mar', value: 5000, kale: 3800, xrf: 1200 },
            { name: 'Apr', value: 4500, kale: 3908, xrf: 592 },
            { name: 'May', value: 6000, kale: 4800, xrf: 1200 },
            { name: 'Jun', value: 7000, kale: 5800, xrf: 1200 }
          ];
      }
    };
    
    setPortfolioData(generateMockData(timeRange));
  }, [timeRange]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  console.log('Dashboard rendering JSX...');

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-6" style={{ backgroundColor: '#1a1a2e', minHeight: '100vh' }}>
      <div className="container mx-auto space-y-8 text-white">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-gray-300 text-lg">Welcome to your KALE-ndar dashboard!</p>
          
          <div className="bg-gray-800 p-6 rounded-lg mt-6 border border-gray-600">
            <h2 className="text-xl font-semibold mb-3">Connection Status</h2>
            <p className="text-green-400">✓ Wallet connected: {wallet.isConnected ? 'Yes' : 'No'}</p>
            {wallet.publicKey && (
              <p className="text-gray-400 mt-2 font-mono text-sm">
                Public key: {wallet.publicKey.slice(0, 8)}...{wallet.publicKey.slice(-8)}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Portfolio</p>
                <p className="text-2xl font-bold text-white">$12,345</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+5.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">KALE Balance</p>
                <p className="text-2xl font-bold text-white">1,234.56</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm text-gray-400">+2.34 today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">XRF Tokens</p>
                <p className="text-2xl font-bold text-white">567.89</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm text-gray-400">3 subscriptions</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-teal-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Positions</p>
                <p className="text-2xl font-bold text-white">8</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">All profitable</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Portfolio Performance</h2>
            <div className="flex items-center space-x-2">
              {['7D', '30D'].map((range) => (
                <button 
                  key={range}
                  className={`px-3 py-1 rounded text-sm ${
                    timeRange === range 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => handleTimeRangeChange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80 text-white">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Start Farming', description: 'Begin KALE farming', link: '/kale', icon: Sprout },
              { title: 'View Prices', description: 'Check Reflector feeds', link: '/reflector', icon: TrendingUp },
              { title: 'Prediction Markets', description: 'Bet on real-world events', link: '/markets', icon: Target },
            ].map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <action.icon className="w-6 h-6 text-green-500" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                </div>
                <h3 className="font-semibold text-white group-hover:text-green-500 transition-colors">{action.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;