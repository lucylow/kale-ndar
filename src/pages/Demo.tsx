import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Trophy, 
  Star,
  Target,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Wallet,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { mockMarkets, mockUsers, mockBets, mockLeaderboard, mockPriceData, mockKaleBalances } from '@/data/mockData';
import { mockUserProfiles } from '@/data/mockUserProfiles';
import { useToast } from '@/hooks/use-toast';
import TeamBettingDemo from '@/components/demo/TeamBettingDemo';
import NFTReceiptsDemo from '@/components/demo/NFTReceiptsDemo';
import DemoDataManager from '@/components/demo/DemoDataManager';

const Demo = () => {
  const { toast } = useToast();
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [demoProgress, setDemoProgress] = useState(0);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  // Simulate demo progress
  useEffect(() => {
    if (isRunningDemo) {
      const interval = setInterval(() => {
        setDemoProgress(prev => {
          if (prev >= 100) {
            setIsRunningDemo(false);
            toast({
              title: "Demo Complete! 🎉",
              description: "You've seen all the key features of KALE-ndar",
              duration: 3000,
            });
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isRunningDemo, toast]);

  const startFullDemo = () => {
    setIsRunningDemo(true);
    setDemoProgress(0);
    toast({
      title: "Starting Demo 🚀",
      description: "Watch as we showcase KALE-ndar's key features",
      duration: 2000,
    });
  };

  const demoFeatures = [
    {
      id: 'team-betting',
      title: 'Team Betting',
      description: 'Collaborative betting with friends',
      icon: Users,
      color: 'bg-blue-500',
      demo: () => {
        toast({
          title: "Team Betting Demo",
          description: "Creating a team vault with 3 friends...",
          duration: 3000,
        });
      }
    },
    {
      id: 'nft-receipts',
      title: 'NFT Receipts',
      description: 'Tradable bet tokens on Stellar DEX',
      icon: Target,
      color: 'bg-purple-500',
      demo: () => {
        toast({
          title: "NFT Receipt Demo",
          description: "Minting NFT receipt for your bet...",
          duration: 3000,
        });
      }
    },
    {
      id: 'dynamic-markets',
      title: 'Dynamic Markets',
      description: 'Auto-generated markets from oracle data',
      icon: Zap,
      color: 'bg-green-500',
      demo: () => {
        toast({
          title: "Dynamic Market Demo",
          description: "Creating market based on BTC price movement...",
          duration: 3000,
        });
      }
    },
    {
      id: 'gamification',
      title: 'Gamification',
      description: 'Achievements, badges, and leaderboards',
      icon: Trophy,
      color: 'bg-yellow-500',
      demo: () => {
        toast({
          title: "Gamification Demo",
          description: "Earning achievement badge for 5 wins in a row!",
          duration: 3000,
        });
      }
    },
    {
      id: 'defi-integration',
      title: 'DeFi Integration',
      description: 'Yield farming with prediction markets',
      icon: Shield,
      color: 'bg-red-500',
      demo: () => {
        toast({
          title: "DeFi Integration Demo",
          description: "Staking KALE tokens for additional rewards...",
          duration: 3000,
        });
      }
    },
    {
      id: 'oracle-automation',
      title: 'Oracle Automation',
      description: 'Reflector Oracle price feeds',
      icon: Globe,
      color: 'bg-indigo-500',
      demo: () => {
        toast({
          title: "Oracle Automation Demo",
          description: "Fetching real-time price data from Reflector...",
          duration: 3000,
        });
      }
    }
  ];

  const mockStats = {
    totalMarkets: mockMarkets.length,
    totalUsers: mockUsers.length,
    totalVolume: mockMarkets.reduce((sum, market) => sum + market.totalFor + market.totalAgainst, 0),
    activeBets: mockBets.length,
    topPerformer: mockLeaderboard[0],
    kalePrice: mockPriceData.KALE.price,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          KALE-ndar Demo Center
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience the future of prediction markets with our comprehensive demo showcasing 
          team betting, NFT receipts, dynamic markets, and more!
        </p>
        
        {/* Demo Progress */}
        {isRunningDemo && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Demo Progress</span>
                  <span>{demoProgress}%</span>
                </div>
                <Progress value={demoProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Markets</p>
                <p className="text-2xl font-bold">{mockStats.totalMarkets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{mockStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">${(mockStats.totalVolume / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">KALE Price</p>
                <p className="text-2xl font-bold">${mockStats.kalePrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Demo Controls
          </CardTitle>
          <CardDescription>
            Choose how you want to experience KALE-ndar's features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={startFullDemo}
              disabled={isRunningDemo}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunningDemo ? 'Running Demo...' : 'Start Full Demo'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setActiveDemo('features')}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Feature Showcase
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setActiveDemo('markets')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Live Markets
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setActiveDemo('leaderboard')}
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setActiveDemo('data-manager')}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Data Manager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Key Features Demo
          </CardTitle>
          <CardDescription>
            Click on any feature to see it in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    if (feature.id === 'team-betting') {
                      setSelectedFeature('team-betting');
                    } else if (feature.id === 'nft-receipts') {
                      setSelectedFeature('nft-receipts');
                    } else {
                      feature.demo();
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demos */}
      {selectedFeature === 'team-betting' && (
        <TeamBettingDemo />
      )}
      
      {selectedFeature === 'nft-receipts' && (
        <NFTReceiptsDemo />
      )}

      {/* Data Manager */}
      {activeDemo === 'data-manager' && (
        <DemoDataManager />
      )}

      {/* Live Markets Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Markets Demo
          </CardTitle>
          <CardDescription>
            Real-time prediction markets with mock data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMarkets.slice(0, 3).map((market) => (
              <Card key={market.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{market.description}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Resolves: {market.resolveTime.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Current: ${market.currentPrice}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Target: ${market.targetPrice}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          YES: ${(market.totalFor / 1000).toFixed(0)}K
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-red-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          NO: ${(market.totalAgainst / 1000).toFixed(0)}K
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" className="mt-2">
                      Place Bet
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>
            See who's leading the prediction game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLeaderboard.slice(0, 5).map((user, index) => (
              <div key={user.address} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.total_bets} bets • {user.win_rate}% win rate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ${(user.total_winnings / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-muted-foreground">Total Winnings</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mock User Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Profiles
          </CardTitle>
          <CardDescription>
            Explore user profiles and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockUserProfiles.slice(0, 2).map((profile) => (
              <Card key={profile.id} className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={profile.avatar} 
                    alt={profile.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{profile.displayName}</h3>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>
                <p className="text-sm mb-3">{profile.bio}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Level</span>
                      <p className="font-semibold">{profile.level}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">XP</span>
                      <p className="font-semibold">{profile.xp}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Win Rate</span>
                      <p className="font-semibold">{profile.stats.winRate}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {profile.badges.slice(0, 3).map((badge) => (
                    <Badge key={badge.id} variant="secondary" className="text-xs">
                      {badge.icon} {badge.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Demo Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">For Judges & Evaluators:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Click "Start Full Demo" for automated showcase</li>
                <li>• Try individual feature demos</li>
                <li>• Explore live markets with mock data</li>
                <li>• Check leaderboard and user profiles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Features to Highlight:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Team betting with collaborative decision-making</li>
                <li>• NFT receipts for tradable bet tokens</li>
                <li>• Dynamic market generation from oracle data</li>
                <li>• Gamification with achievements and badges</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Demo;
