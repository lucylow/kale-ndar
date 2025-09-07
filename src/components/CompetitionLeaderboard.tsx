import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Crown, 
  Medal, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  Award,
  Star,
  Target,
  Zap,
  Share2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface CompetitionRanking {
  rank: number;
  participantId: string;
  userId: string;
  teamId?: string;
  username: string;
  teamName?: string;
  score: string;
  achievements: number;
  socialShares: number;
  bonusPoints: string;
  trend: 'up' | 'down' | 'stable';
  previousRank?: number;
}

interface CompetitionLeaderboard {
  competitionId: string;
  category: string;
  rankings: CompetitionRanking[];
  totalParticipants: number;
  lastUpdated: number;
}

interface CompetitionLeaderboardProps {
  competitionId: string;
  categories?: string[];
  refreshInterval?: number;
  showSocialStats?: boolean;
  onParticipantClick?: (participant: CompetitionRanking) => void;
}

const CompetitionLeaderboard: React.FC<CompetitionLeaderboardProps> = ({
  competitionId,
  categories = [],
  refreshInterval = 30000, // 30 seconds
  showSocialStats = true,
  onParticipantClick
}) => {
  const [leaderboards, setLeaderboards] = useState<CompetitionLeaderboard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  useEffect(() => {
    loadLeaderboards();
    
    if (refreshInterval > 0) {
      const interval = setInterval(loadLeaderboards, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [competitionId, refreshInterval]);

  const loadLeaderboards = async () => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual API
      const mockLeaderboards: CompetitionLeaderboard[] = [
        {
          competitionId,
          category: 'volume-master',
          totalParticipants: 150,
          lastUpdated: Date.now(),
          rankings: [
            {
              rank: 1,
              participantId: 'p1',
              userId: 'user1',
              username: 'CryptoWhale',
              score: '12500',
              achievements: 8,
              socialShares: 15,
              bonusPoints: '150',
              trend: 'up',
              previousRank: 2,
            },
            {
              rank: 2,
              participantId: 'p2',
              userId: 'user2',
              username: 'PredictionMaster',
              score: '11800',
              achievements: 7,
              socialShares: 12,
              bonusPoints: '120',
              trend: 'down',
              previousRank: 1,
            },
            {
              rank: 3,
              participantId: 'p3',
              userId: 'user3',
              username: 'MarketOracle',
              score: '11200',
              achievements: 6,
              socialShares: 10,
              bonusPoints: '100',
              trend: 'stable',
              previousRank: 3,
            },
            // Add more mock data...
            ...Array.from({ length: 17 }, (_, i) => ({
              rank: i + 4,
              participantId: `p${i + 4}`,
              userId: `user${i + 4}`,
              username: `Trader${i + 4}`,
              score: `${10000 - (i * 200)}`,
              achievements: Math.floor(Math.random() * 5) + 1,
              socialShares: Math.floor(Math.random() * 8) + 1,
              bonusPoints: `${Math.floor(Math.random() * 50) + 50}`,
              trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
              previousRank: i + 4,
            })),
          ],
        },
        {
          competitionId,
          category: 'accuracy-champion',
          totalParticipants: 120,
          lastUpdated: Date.now(),
          rankings: [
            {
              rank: 1,
              participantId: 'p1',
              userId: 'user1',
              username: 'AccuracyKing',
              score: '9800',
              achievements: 9,
              socialShares: 8,
              bonusPoints: '80',
              trend: 'up',
              previousRank: 2,
            },
            // Add more mock data for accuracy category...
            ...Array.from({ length: 19 }, (_, i) => ({
              rank: i + 2,
              participantId: `p${i + 2}`,
              userId: `user${i + 2}`,
              username: `Accurate${i + 2}`,
              score: `${9500 - (i * 150)}`,
              achievements: Math.floor(Math.random() * 6) + 1,
              socialShares: Math.floor(Math.random() * 6) + 1,
              bonusPoints: `${Math.floor(Math.random() * 40) + 40}`,
              trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
              previousRank: i + 2,
            })),
          ],
        },
      ];

      setLeaderboards(mockLeaderboards);
      
      if (mockLeaderboards.length > 0 && !selectedCategory) {
        setSelectedCategory(mockLeaderboards[0].category);
      }
      
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Failed to load leaderboards:', error);
      toast.error('Failed to load leaderboards');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-500" />;
    return <Trophy className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'volume-master':
        return <TrendingUp className="h-4 w-4" />;
      case 'accuracy-champion':
        return <Target className="h-4 w-4" />;
      case 'social-influencer':
        return <Share2 className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatScore = (score: string) => {
    return parseInt(score).toLocaleString();
  };

  const renderRankingCard = (ranking: CompetitionRanking, index: number) => (
    <div
      key={ranking.participantId}
      className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
        ranking.rank <= 3 
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
          : 'bg-card hover:bg-muted/50'
      }`}
      onClick={() => onParticipantClick?.(ranking)}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
          ranking.rank === 1 ? 'bg-yellow-500 text-white' :
          ranking.rank === 2 ? 'bg-gray-400 text-white' :
          ranking.rank === 3 ? 'bg-orange-500 text-white' :
          'bg-muted text-muted-foreground'
        }`}>
          {ranking.rank}
        </div>
        
        <div className="flex items-center gap-2">
          {getRankIcon(ranking.rank)}
          <div>
            <div className="font-semibold">{ranking.username}</div>
            {ranking.teamName && (
              <div className="text-sm text-muted-foreground">{ranking.teamName}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="font-bold text-lg">{formatScore(ranking.score)}</div>
          <div className="text-sm text-muted-foreground">points</div>
        </div>
        
        {showSocialStats && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              {ranking.achievements}
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              {ranking.socialShares}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              +{ranking.bonusPoints}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {getTrendIcon(ranking.trend)}
          {ranking.previousRank && ranking.previousRank !== ranking.rank && (
            <span className="text-xs text-muted-foreground">
              {ranking.previousRank > ranking.rank ? '↑' : '↓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const selectedLeaderboard = leaderboards.find(lb => lb.category === selectedCategory);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading leaderboards...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Competition Leaderboard
            </CardTitle>
            <CardDescription>
              Real-time rankings and performance metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {selectedLeaderboard?.totalParticipants || 0} participants
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {leaderboards.length > 1 ? (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3">
              {leaderboards.map((leaderboard) => (
                <TabsTrigger key={leaderboard.category} value={leaderboard.category}>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(leaderboard.category)}
                    <span>{formatCategoryName(leaderboard.category)}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {leaderboards.map((leaderboard) => (
              <TabsContent key={leaderboard.category} value={leaderboard.category}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {formatCategoryName(leaderboard.category)} Rankings
                    </h3>
                    <Badge variant="outline">
                      {leaderboard.totalParticipants} participants
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {leaderboard.rankings.map((ranking, index) => 
                      renderRankingCard(ranking, index)
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="space-y-4">
            {selectedLeaderboard && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {formatCategoryName(selectedLeaderboard.category)} Rankings
                  </h3>
                  <Badge variant="outline">
                    {selectedLeaderboard.totalParticipants} participants
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {selectedLeaderboard.rankings.map((ranking, index) => 
                    renderRankingCard(ranking, index)
                  )}
                </div>
              </>
            )}
          </div>
        )}
        
        {lastUpdated > 0 && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompetitionLeaderboard;
