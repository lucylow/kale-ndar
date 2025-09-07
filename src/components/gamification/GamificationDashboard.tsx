import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Crown, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  Shield,
  Award,
  BarChart3,
  Clock,
  Flame
} from 'lucide-react';
import { AdvancedBadgeCard, BadgeCollection, BadgeNotification } from './AdvancedBadgeDisplay';

interface UserGamificationProfile {
  address: string;
  level: number;
  experience: number;
  experienceToNext: number;
  reputation: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: {
      level: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
      color: string;
      glowEffect: boolean;
      animationType: 'none' | 'pulse' | 'rotate' | 'float' | 'sparkle';
      dropRate: number;
    };
    category: {
      id: string;
      name: string;
      description: string;
      icon: string;
      color: string;
    };
    isEarned: boolean;
    earnedAt?: number;
    progress?: number;
    maxProgress?: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    progress: number;
    maxProgress: number;
    isCompleted: boolean;
    points: number;
    category: string;
  }>;
  stats: {
    totalBets: number;
    winningBets: number;
    winRate: number;
    currentStreak: number;
    longestStreak: number;
    totalVolume: number;
    totalPayouts: number;
    marketsCreated: number;
    followers: number;
    following: number;
  };
  ranking: {
    overall: number;
    accuracy: number;
    volume: number;
    streak: number;
    totalUsers: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'badge_earned' | 'achievement_unlocked' | 'level_up' | 'streak_broken' | 'milestone_reached';
    title: string;
    description: string;
    timestamp: number;
    icon: string;
  }>;
}

interface GamificationDashboardProps {
  userAddress: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ userAddress }) => {
  const [profile, setProfile] = useState<UserGamificationProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [newBadge, setNewBadge] = useState<any>(null);

  useEffect(() => {
    // Fetch user gamification profile
    fetchUserProfile();
  }, [userAddress]);

  const fetchUserProfile = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProfile: UserGamificationProfile = {
        address: userAddress,
        level: 15,
        experience: 2450,
        experienceToNext: 550,
        reputation: 1250,
        badges: [
          {
            id: 'first_bet',
            name: 'First Bet',
            description: 'Placed your first bet',
            icon: '🎯',
            rarity: {
              level: 'common',
              color: '#6B7280',
              glowEffect: false,
              animationType: 'none',
              dropRate: 100,
            },
            category: {
              id: 'betting',
              name: 'Betting',
              description: 'Betting related badges',
              icon: '🎲',
              color: '#3B82F6',
            },
            isEarned: true,
            earnedAt: Date.now() - 86400000 * 30,
          },
          {
            id: 'crypto_oracle',
            name: 'Crypto Oracle',
            description: 'Achieve 80%+ accuracy in cryptocurrency predictions',
            icon: '₿',
            rarity: {
              level: 'epic',
              color: '#F59E0B',
              glowEffect: true,
              animationType: 'pulse',
              dropRate: 5,
            },
            category: {
              id: 'prediction_mastery',
              name: 'Prediction Mastery',
              description: 'Badges for excelling in specific prediction areas',
              icon: '🎯',
              color: '#3B82F6',
            },
            isEarned: true,
            earnedAt: Date.now() - 86400000 * 7,
          },
          {
            id: 'streak_destroyer',
            name: 'Streak Destroyer',
            description: 'Break someone else\'s winning streak',
            icon: '💥',
            rarity: {
              level: 'rare',
              color: '#EF4444',
              glowEffect: true,
              animationType: 'sparkle',
              dropRate: 15,
            },
            category: {
              id: 'social_trading',
              name: 'Social Trading',
              description: 'Badges for social features and community engagement',
              icon: '👥',
              color: '#8B5CF6',
            },
            isEarned: false,
            progress: 0,
            maxProgress: 1,
          },
        ],
        achievements: [
          {
            id: 'bet_master',
            name: 'Bet Master',
            description: 'Place 100 bets',
            icon: '🎲',
            progress: 45,
            maxProgress: 100,
            isCompleted: false,
            points: 100,
            category: 'volume',
          },
          {
            id: 'volume_king',
            name: 'Volume King',
            description: 'Bet 1,000,000 KALE total',
            icon: '👑',
            progress: 25000,
            maxProgress: 1000000,
            isCompleted: false,
            points: 200,
            category: 'volume',
          },
          {
            id: 'streak_legend',
            name: 'Streak Legend',
            description: 'Achieve a 20-win streak',
            icon: '🏆',
            progress: 8,
            maxProgress: 20,
            isCompleted: false,
            points: 500,
            category: 'streak',
          },
        ],
        stats: {
          totalBets: 45,
          winningBets: 31,
          winRate: 68.9,
          currentStreak: 3,
          longestStreak: 8,
          totalVolume: 25000,
          totalPayouts: 12500,
          marketsCreated: 3,
          followers: 127,
          following: 89,
        },
        ranking: {
          overall: 15,
          accuracy: 8,
          volume: 25,
          streak: 12,
          totalUsers: 1250,
        },
        recentActivity: [
          {
            id: '1',
            type: 'badge_earned',
            title: 'Crypto Oracle Badge Earned!',
            description: 'You achieved 80%+ accuracy in crypto predictions',
            timestamp: Date.now() - 86400000 * 2,
            icon: '₿',
          },
          {
            id: '2',
            type: 'level_up',
            title: 'Level Up!',
            description: 'You reached level 15!',
            timestamp: Date.now() - 86400000 * 5,
            icon: '⭐',
          },
          {
            id: '3',
            type: 'streak_broken',
            title: 'Streak Broken',
            description: 'Your 8-win streak was broken',
            timestamp: Date.now() - 86400000 * 7,
            icon: '💥',
          },
        ],
      };
      setProfile(mockProfile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelExp = profile.level * 1000;
    const nextLevelExp = (profile.level + 1) * 1000;
    const progress = ((profile.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getRankingPercentile = (rank: number, total: number) => {
    return Math.round(((total - rank + 1) / total) * 100);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gamification Dashboard</h1>
          <p className="text-gray-600">Track your progress and achievements</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">Level {profile.level}</div>
          <div className="text-sm text-gray-500">{profile.experience} XP</div>
        </div>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">⭐</div>
              <div>
                <h3 className="text-lg font-semibold">Level {profile.level}</h3>
                <p className="text-sm text-gray-600">
                  {profile.experienceToNext} XP to next level
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Reputation</div>
              <div className="text-xl font-bold text-purple-600">{profile.reputation}</div>
            </div>
          </div>
          <Progress value={getLevelProgress()} className="h-3" />
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{profile.stats.winRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{profile.stats.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{profile.stats.totalVolume.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Volume</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{profile.stats.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Your Rankings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">#{profile.ranking.overall}</div>
              <div className="text-sm text-gray-600">Overall</div>
              <div className="text-xs text-gray-500">
                Top {getRankingPercentile(profile.ranking.overall, profile.ranking.totalUsers)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">#{profile.ranking.accuracy}</div>
              <div className="text-sm text-gray-600">Accuracy</div>
              <div className="text-xs text-gray-500">
                Top {getRankingPercentile(profile.ranking.accuracy, profile.ranking.totalUsers)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">#{profile.ranking.volume}</div>
              <div className="text-sm text-gray-600">Volume</div>
              <div className="text-xs text-gray-500">
                Top {getRankingPercentile(profile.ranking.volume, profile.ranking.totalUsers)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">#{profile.ranking.streak}</div>
              <div className="text-sm text-gray-600">Streak</div>
              <div className="text-xs text-gray-500">
                Top {getRankingPercentile(profile.ranking.streak, profile.ranking.totalUsers)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Recent Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-4">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <span className="text-sm text-gray-500">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Badge Showcase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5" />
                <span>Recent Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.badges.filter(badge => badge.isEarned).slice(0, 4).map((badge) => (
                  <div key={badge.id} className="text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <div className="text-sm font-medium">{badge.name}</div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {badge.rarity.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <BadgeCollection 
            badges={profile.badges}
            title="Your Badges"
          />
        </TabsContent>

        <TabsContent value="achievements">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2" 
                          />
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-xs">
                              {achievement.category}
                            </Badge>
                            <span className="text-sm font-medium text-yellow-600">
                              {achievement.points} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Badge Notification */}
      {showNotification && newBadge && (
        <BadgeNotification 
          badge={newBadge}
          onClose={() => {
            setShowNotification(false);
            setNewBadge(null);
          }}
        />
      )}
    </div>
  );
};
