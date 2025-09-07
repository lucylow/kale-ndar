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
  const { wallet, user } = useWallet();
  const [portfolioData, setPortfolioData] = useState([]);
  const [timeRange, setTimeRange] = useState('30D');
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
        case '90D':
          return [
            { name: 'Dec', value: 2000, kale: 1200, xrf: 800 },
            { name: 'Jan', value: 4000, kale: 2400, xrf: 1600 },
            { name: 'Feb', value: 3000, kale: 1398, xrf: 1602 },
            { name: 'Mar', value: 5000, kale: 3800, xrf: 1200 },
            { name: 'Apr', value: 4500, kale: 3908, xrf: 592 },
            { name: 'May', value: 6000, kale: 4800, xrf: 1200 },
            { name: 'Jun', value: 7000, kale: 5800, xrf: 1200 },
            { name: 'Jul', value: 7500, kale: 6000, xrf: 1500 },
            { name: 'Aug', value: 8000, kale: 6200, xrf: 1800 }
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

  const quickActions = [
    { title: 'Start Farming', description: 'Begin KALE farming', link: '/kale', icon: Sprout },
    { title: 'View Prices', description: 'Check Reflector feeds', link: '/reflector', icon: TrendingUp },
    { title: 'Prediction Markets', description: 'Bet on real-world events', link: '/markets', icon: Target },
    { title: 'Manage Portfolio', description: 'View your assets', link: '/portfolio', icon: BarChart3 },
    { title: 'DeFi Protocols', description: 'Explore integrations', link: '/defi', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 px-6">
      <div className="container mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-white/10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground mt-2 text-lg">Here's your Stellar DeFi overview</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Portfolio</p>
                <p className="text-2xl font-bold text-foreground">$12,345</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">+5.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">KALE Balance</p>
                <p className="text-2xl font-bold text-foreground">{kaleStats.balance}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm text-muted-foreground">+{kaleStats.dailyYield} today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">XRF Tokens</p>
                <p className="text-2xl font-bold text-foreground">{reflectorStats.xrfBalance}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm text-muted-foreground">{reflectorStats.subscriptions} subscriptions</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-accent-teal/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-2xl font-bold text-foreground">8</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">All profitable</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-accent-gold/20 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-accent-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <Card className="bg-gradient-card border-white/10 shadow-card animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Portfolio Performance</CardTitle>
            <div className="flex items-center space-x-2">
              {['7D', '30D', '90D'].map((range) => (
                <Button 
                  key={range}
                  variant={timeRange === range ? "hero" : "outline"} 
                  size="sm" 
                  className={timeRange !== range ? "border-white/20 hover:bg-accent/20" : ""}
                  onClick={() => handleTimeRangeChange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
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
                <Line 
                  type="monotone" 
                  dataKey="kale" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="xrf" 
                  stroke="hsl(var(--accent-purple))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent-purple))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-display font-bold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-gradient-card rounded-xl p-6 border border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 group hover-lift"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <action.icon className="w-6 h-6 text-background" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{action.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-card border-white/10 shadow-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <CardDescription className="text-muted-foreground">Your latest transactions and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'farming', description: 'Harvested 12.5 KALE', time: '2 hours ago', amount: '+12.5 KALE' },
              { type: 'oracle', description: 'Created price subscription', time: '5 hours ago', amount: '-50 XRF' },
              { type: 'stake', description: 'Staked KALE tokens', time: '1 day ago', amount: '100 KALE' },
              { type: 'trade', description: 'Swapped XLM for USDC', time: '2 days ago', amount: '500 XLM' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b border-white/10 last:border-b-0 hover:bg-accent/10 rounded-lg px-2 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/50 rounded-full flex items-center justify-center">
                    {activity.type === 'farming' && <Sprout className="w-5 h-5 text-primary" />}
                    {activity.type === 'oracle' && <TrendingUp className="w-5 h-5 text-accent-teal" />}
                    {activity.type === 'stake' && <Shield className="w-5 h-5 text-accent-purple" />}
                    {activity.type === 'trade' && <Coins className="w-5 h-5 text-accent-gold" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${activity.amount.startsWith('+') ? 'text-primary' : activity.amount.startsWith('-') ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {activity.amount}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Dashboard;
