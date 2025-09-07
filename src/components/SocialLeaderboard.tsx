import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Zap,
  Target,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  isVerified: boolean;
  score: number;
  accuracy: number;
  totalBets: number;
  winStreak: number;
  totalProfit: number;
  followers: number;
  following: number;
  socialScore: number;
  recentActivity: {
    type: 'BET' | 'COMMENT' | 'LIKE' | 'SHARE';
    description: string;
    timestamp: number;
  }[];
  badges: {
    id: string;
    name: string;
    icon: string;
    earnedAt: number;
  }[];
  isCurrentUser?: boolean;
  isFollowing?: boolean;
}

interface SocialLeaderboardProps {
  timeRange?: '24h' | '7d' | '30d' | 'all';
  category?: 'all' | 'crypto' | 'sports' | 'politics' | 'economics';
  onFollowUser?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

const SocialLeaderboard: React.FC<SocialLeaderboardProps> = ({
  timeRange = '7d',
  category = 'all',
  onFollowUser,
  onViewProfile,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);

  // Mock leaderboard data
  useEffect(() => {
    loadLeaderboard();
  }, [timeRange, category]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLeaderboard([
      {
        id: '1',
        rank: 1,
        name: 'CryptoOracle',
        avatar: '/avatars/crypto-oracle.jpg',
        isVerified: true,
        score: 2450,
        accuracy: 89.2,
        totalBets: 156,
        winStreak: 12,
        totalProfit: 12500,
        followers: 1250,
        following: 89,
        socialScore: 95,
        recentActivity: [
          { type: 'BET', description: 'Placed bet on BTC reaching $100K', timestamp: Date.now() - 3600000 },
          { type: 'COMMENT', description: 'Shared analysis on market trends', timestamp: Date.now() - 7200000 },
          { type: 'LIKE', description: 'Liked prediction about ETH', timestamp: Date.now() - 10800000 },
        ],
        badges: [
          { id: '1', name: 'Prediction Master', icon: '🎯', earnedAt: Date.now() - 86400000 },
          { id: '2', name: 'Streak King', icon: '🔥', earnedAt: Date.now() - 172800000 },
          { id: '3', name: 'Social Influencer', icon: '👑', earnedAt: Date.now() - 259200000 },
        ],
        isCurrentUser: false,
        isFollowing: false,
      },
      {
        id: '2',
        rank: 2,
        name: 'MarketAnalyst',
        avatar: '/avatars/market-analyst.jpg',
        isVerified: true,
        score: 2180,
        accuracy: 85.7,
        totalBets: 98,
        winStreak: 8,
        totalProfit: 8900,
        followers: 980,
        following: 156,
        socialScore: 88,
        recentActivity: [
          { type: 'BET', description: 'Predicted gold price movement', timestamp: Date.now() - 1800000 },
          { type: 'SHARE', description: 'Shared market analysis', timestamp: Date.now() - 5400000 },
        ],
        badges: [
          { id: '4', name: 'Risk Manager', icon: '🛡️', earnedAt: Date.now() - 43200000 },
          { id: '5', name: 'Data Driven', icon: '📊', earnedAt: Date.now() - 129600000 },
        ],
        isCurrentUser: false,
        isFollowing: true,
      },
      {
        id: '3',
        rank: 3,
        name: 'PredictionPro',
        avatar: '/avatars/prediction-pro.jpg',
        isVerified: false,
        score: 1950,
        accuracy: 82.1,
        totalBets: 134,
        winStreak: 6,
        totalProfit: 7600,
        followers: 750,
        following: 234,
        socialScore: 82,
        recentActivity: [
          { type: 'BET', description: 'Bet on election outcome', timestamp: Date.now() - 900000 },
          { type: 'COMMENT', description: 'Commented on sports prediction', timestamp: Date.now() - 2700000 },
        ],
        badges: [
          { id: '6', name: 'Sports Expert', icon: '⚽', earnedAt: Date.now() - 21600000 },
          { id: '7', name: 'Community Builder', icon: '🤝', earnedAt: Date.now() - 86400000 },
        ],
        isCurrentUser: false,
        isFollowing: false,
      },
      {
        id: '4',
        rank: 4,
        name: 'TrendWatcher',
        avatar: '/avatars/trend-watcher.jpg',
        isVerified: false,
        score: 1720,
        accuracy: 79.8,
        totalBets: 87,
        winStreak: 4,
        totalProfit: 5400,
        followers: 650,
        following: 178,
        socialScore: 75,
        recentActivity: [
          { type: 'LIKE', description: 'Liked crypto prediction', timestamp: Date.now() - 4500000 },
          { type: 'BET', description: 'Placed bet on market volatility', timestamp: Date.now() - 6300000 },
        ],
        badges: [
          { id: '8', name: 'Trend Spotter', icon: '📈', earnedAt: Date.now() - 172800000 },
        ],
        isCurrentUser: false,
        isFollowing: false,
      },
      {
        id: '5',
        rank: 5,
        name: 'You',
        avatar: '/avatars/current-user.jpg',
        isVerified: false,
        score: 1580,
        accuracy: 77.3,
        totalBets: 112,
        winStreak: 3,
        totalProfit: 4200,
        followers: 320,
        following: 145,
        socialScore: 68,
        recentActivity: [
          { type: 'BET', description: 'Your recent bet on DeFi tokens', timestamp: Date.now() - 1200000 },
          { type: 'COMMENT', description: 'You commented on market analysis', timestamp: Date.now() - 3600000 },
        ],
        badges: [
          { id: '9', name: 'Rising Star', icon: '⭐', earnedAt: Date.now() - 259200000 },
        ],
        isCurrentUser: true,
        isFollowing: false,
      },
    ]);
    setIsLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'BET': return <Target className="h-3 w-3 text-blue-500" />;
      case 'COMMENT': return <MessageCircle className="h-3 w-3 text-green-500" />;
      case 'LIKE': return <Heart className="h-3 w-3 text-red-500" />;
      case 'SHARE': return <Users className="h-3 w-3 text-purple-500" />;
      default: return <Star className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading leaderboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Leaderboard</h2>
          <p className="text-muted-foreground">
            Top performers based on accuracy, social engagement, and community impact
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadLeaderboard} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Time Range:</span>
          {['24h', '7d', '30d', 'all'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
            >
              {range}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Category:</span>
          {['all', 'crypto', 'sports', 'politics', 'economics'].map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              size="sm"
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((user, index) => (
          <Card key={user.id} className={`relative overflow-hidden ${
            index === 0 ? 'border-yellow-500/30 bg-yellow-500/5' :
            index === 1 ? 'border-gray-400/30 bg-gray-400/5' :
            'border-amber-600/30 bg-amber-600/5'
          }`}>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                {getRankIcon(user.rank)}
              </div>
              
              <Avatar className="h-16 w-16 mx-auto mb-3">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center justify-center gap-1 mb-2">
                <h3 className="font-semibold">{user.name}</h3>
                {user.isVerified && (
                  <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500">
                    Verified
                  </Badge>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-2xl font-bold text-primary">{user.score}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-semibold text-green-500">{user.accuracy}%</div>
                    <div className="text-muted-foreground">Accuracy</div>
                  </div>
                  <div>
                    <div className="font-semibold">{user.winStreak}</div>
                    <div className="text-muted-foreground">Streak</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile?.(user.id)}
                  className="flex-1 gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                {!user.isCurrentUser && (
                  <Button
                    variant={user.isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={() => onFollowUser?.(user.id)}
                    className="flex-1 gap-1"
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Complete Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  user.isCurrentUser 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-secondary/20 border-white/10 hover:border-primary/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    user.rank <= 3 ? getRankColor(user.rank) : 'text-muted-foreground'
                  }`}>
                    {user.rank <= 3 ? getRankIcon(user.rank) : `#${user.rank}`}
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{user.name}</span>
                      {user.isVerified && (
                        <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500">
                          ✓
                        </Badge>
                      )}
                      {user.isCurrentUser && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.followers} followers • {user.totalBets} bets
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm font-semibold">{user.score}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-500">{user.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{formatCurrency(user.totalProfit)}</div>
                    <div className="text-xs text-muted-foreground">Profit</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{user.socialScore}</div>
                    <div className="text-xs text-muted-foreground">Social</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProfile?.(user.id)}
                    className="gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  {!user.isCurrentUser && (
                    <Button
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={() => onFollowUser?.(user.id)}
                      className="gap-1"
                    >
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).flatMap(user => 
              user.recentActivity.map((activity, index) => (
                <div key={`${user.id}-${index}`} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-sm text-muted-foreground">{activity.description}</span>
                  </div>
                  
                  <div className="ml-auto text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialLeaderboard;
