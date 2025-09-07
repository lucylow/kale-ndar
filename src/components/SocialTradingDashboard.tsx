import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Copy, 
  Trophy, 
  BarChart3, 
  TrendingUp,
  Zap,
  Crown,
  Star,
  Activity,
  Target,
  Heart,
  MessageCircle,
  Share2,
  Eye
} from 'lucide-react';
import CopyTrading from './CopyTrading';
import SocialLeaderboard from './SocialLeaderboard';
import SocialAnalytics from './SocialAnalytics';
import SocialBetting from './SocialBetting';

interface SocialTradingDashboardProps {
  onStartCopyTrading: (traderId: string, settings: any) => void;
  onStopCopyTrading: (traderId: string) => void;
  onUpdateSettings: (traderId: string, settings: any) => void;
  onFollowUser: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onPlaceSocialBet: (bet: any) => void;
  onLikeBet: (betId: string) => void;
  onCommentBet: (betId: string, comment: string) => void;
  onCopyBet: (betId: string) => void;
}

const SocialTradingDashboard: React.FC<SocialTradingDashboardProps> = ({
  onStartCopyTrading,
  onStopCopyTrading,
  onUpdateSettings,
  onFollowUser,
  onViewProfile,
  onPlaceSocialBet,
  onLikeBet,
  onCommentBet,
  onCopyBet,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock overview data
  const overviewStats = {
    totalFollowers: 1250,
    totalFollowing: 89,
    activeCopyTrades: 3,
    totalCopied: 890,
    winRate: 89.2,
    totalProfit: 12500,
    socialScore: 95,
    rank: 12,
    weeklyGrowth: {
      followers: 45,
      profit: 1250,
      accuracy: 2.1,
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Trading Hub</h1>
          <p className="text-muted-foreground">
            Connect, learn, and profit from the community's collective intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Rank #{overviewStats.rank}
          </Badge>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            {overviewStats.winRate}% Win Rate
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Followers</span>
            </div>
            <div className="text-2xl font-bold">{formatNumber(overviewStats.totalFollowers)}</div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{overviewStats.weeklyGrowth.followers} this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="h-5 w-5 text-accent-teal" />
              <span className="text-sm text-muted-foreground">Copy Trades</span>
            </div>
            <div className="text-2xl font-bold">{overviewStats.activeCopyTrades}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {overviewStats.totalCopied} total copied
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Total Profit</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(overviewStats.totalProfit)}</div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{formatCurrency(overviewStats.weeklyGrowth.profit)} this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Social Score</span>
            </div>
            <div className="text-2xl font-bold">{overviewStats.socialScore}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Top {overviewStats.rank} globally
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('copy-trading')}>
              <Copy className="h-6 w-6" />
              <span className="text-sm">Copy Trading</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('leaderboard')}>
              <Trophy className="h-6 w-6" />
              <span className="text-sm">Leaderboard</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('analytics')}>
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('social-betting')}>
              <Users className="h-6 w-6" />
              <span className="text-sm">Social Betting</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="copy-trading" className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Trading
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Copied CryptoOracle's BTC bet</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                    <div className="text-sm font-semibold text-green-500">+$125</div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Heart className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Liked MarketAnalyst's analysis</div>
                      <div className="text-xs text-muted-foreground">4 hours ago</div>
                    </div>
                    <div className="text-sm text-muted-foreground">+1 like</div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Commented on ETH prediction</div>
                      <div className="text-xs text-muted-foreground">6 hours ago</div>
                    </div>
                    <div className="text-sm text-muted-foreground">+3 replies</div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Achieved "Streak Master" badge</div>
                      <div className="text-xs text-muted-foreground">1 day ago</div>
                    </div>
                    <div className="text-sm text-muted-foreground">New badge</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Crown className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">CryptoOracle</div>
                      <div className="text-xs text-muted-foreground">89.2% accuracy • 12 streak</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-500">+$1,250</div>
                      <div className="text-xs text-muted-foreground">this week</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-400/10 rounded-lg border border-gray-400/20">
                    <div className="w-8 h-8 bg-gray-400/20 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">MarketAnalyst</div>
                      <div className="text-xs text-muted-foreground">85.7% accuracy • 8 streak</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-500">+$890</div>
                      <div className="text-xs text-muted-foreground">this week</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-amber-600/10 rounded-lg border border-amber-600/20">
                    <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">PredictionPro</div>
                      <div className="text-xs text-muted-foreground">82.1% accuracy • 6 streak</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-500">+$760</div>
                      <div className="text-xs text-muted-foreground">this week</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">CO</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">CryptoOracle</span>
                      <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500">
                        Verified
                      </Badge>
                      <span className="text-xs text-muted-foreground">2h ago</span>
                    </div>
                    <p className="text-sm mb-3">
                      Just placed a bet on BTC reaching $100K by end of 2024. Technical analysis shows strong support at $45K with bullish momentum building. Confidence: 85%
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        156 likes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        23 comments
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        12 shares
                      </div>
                      <div className="flex items-center gap-1">
                        <Copy className="h-3 w-3" />
                        45 copied
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-lg">
                  <div className="w-10 h-10 bg-accent-teal/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-accent-teal">MA</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">MarketAnalyst</span>
                      <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500">
                        Verified
                      </Badge>
                      <span className="text-xs text-muted-foreground">4h ago</span>
                    </div>
                    <p className="text-sm mb-3">
                      Market sentiment analysis for Q4 shows mixed signals. While crypto remains bullish, traditional markets face headwinds. Diversification key.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        134 likes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        18 comments
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        8 shares
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copy-trading">
          <CopyTrading
            onStartCopyTrading={onStartCopyTrading}
            onStopCopyTrading={onStopCopyTrading}
            onUpdateSettings={onUpdateSettings}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <SocialLeaderboard
            onFollowUser={onFollowUser}
            onViewProfile={onViewProfile}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <SocialAnalytics />
        </TabsContent>

        <TabsContent value="social-betting">
          <SocialBetting
            market={{
              id: '1',
              description: 'Will Bitcoin reach $100K by end of 2024?',
              oracleAsset: { code: 'BTC' },
              resolveTime: new Date('2024-12-31'),
              creator: '0x123...',
              totalFor: 50000,
              totalAgainst: 30000,
              targetPrice: 100000,
              currentPrice: 45000,
              resolved: false,
            }}
            onPlaceSocialBet={onPlaceSocialBet}
            onLikeBet={onLikeBet}
            onCommentBet={onCommentBet}
            onFollowUser={onFollowUser}
            onCopyBet={onCopyBet}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialTradingDashboard;
