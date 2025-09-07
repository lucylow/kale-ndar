import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Gift, 
  Share2, 
  TrendingUp, 
  Award,
  Target,
  Zap,
  Crown,
  Star,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SeasonalCompetition {
  id: string;
  name: string;
  description: string;
  season: string;
  startDate: number;
  endDate: number;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  competitionType: 'individual' | 'team' | 'mixed';
  categories: CompetitionCategory[];
  totalPrizePool: string;
  participantCount: number;
  socialSharingEnabled: boolean;
}

interface CompetitionCategory {
  id: string;
  name: string;
  description: string;
  prizePool: string;
  criteria: 'volume' | 'accuracy' | 'streak' | 'innovation' | 'social';
  weight: number;
}

interface CompetitionParticipant {
  id: string;
  competitionId: string;
  userId: string;
  teamId?: string;
  category: string;
  currentScore: string;
  currentRank: number;
  achievements: CompetitionAchievement[];
  socialShares: SocialShare[];
}

interface CompetitionAchievement {
  id: string;
  name: string;
  description: string;
  points: number;
  earnedAt: number;
}

interface SocialShare {
  id: string;
  platform: 'twitter' | 'discord' | 'telegram' | 'reddit' | 'linkedin';
  content: string;
  sharedAt: number;
  bonusPoints: number;
}

interface CompetitionLeaderboard {
  competitionId: string;
  category: string;
  rankings: CompetitionRanking[];
  totalParticipants: number;
}

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
}

const SeasonalCompetitions: React.FC = () => {
  const [competitions, setCompetitions] = useState<SeasonalCompetition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<SeasonalCompetition | null>(null);
  const [participant, setParticipant] = useState<CompetitionParticipant | null>(null);
  const [leaderboards, setLeaderboards] = useState<CompetitionLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareContent, setShareContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'twitter' | 'discord' | 'telegram' | 'reddit' | 'linkedin'>('twitter');

  // Load active competitions
  useEffect(() => {
    loadActiveCompetitions();
  }, []);

  const loadActiveCompetitions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('seasonal-competitions/active');
      
      if (error) throw error;
      
      setCompetitions(data.data || []);
      
      if (data.data && data.data.length > 0) {
        setSelectedCompetition(data.data[0]);
        await loadCompetitionDetails(data.data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load competitions:', err);
      toast.error('Failed to load competitions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompetitionDetails = async (competitionId: string) => {
    try {
      // Load leaderboards
      const { data: leaderboardData, error: leaderboardError } = await supabase.functions.invoke(
        'seasonal-competitions/leaderboard',
        { body: { competitionId } }
      );
      
      if (!leaderboardError && leaderboardData.data) {
        setLeaderboards(leaderboardData.data);
      }

      // Check if user is participating
      // This would need to be implemented based on your user context
      // const { data: participantData } = await supabase.functions.invoke(
      //   'seasonal-competitions/user-participation',
      //   { body: { competitionId, userId: userAddress } }
      // );
    } catch (err: any) {
      console.error('Failed to load competition details:', err);
    }
  };

  const joinCompetition = async (competitionId: string, category: string) => {
    try {
      setIsJoining(true);
      
      const { data, error } = await supabase.functions.invoke('seasonal-competitions/join', {
        body: {
          competitionId,
          category,
          userSecret: 'S...', // This would come from user context
        },
      });

      if (error) throw error;

      setParticipant(data.data);
      toast.success('Successfully joined competition!');
    } catch (err: any) {
      console.error('Failed to join competition:', err);
      toast.error(err.message || 'Failed to join competition');
    } finally {
      setIsJoining(false);
    }
  };

  const recordSocialShare = async () => {
    if (!selectedCompetition || !shareContent.trim()) {
      toast.error('Please enter share content');
      return;
    }

    try {
      setIsSharing(true);
      
      const { data, error } = await supabase.functions.invoke('seasonal-competitions/social-share', {
        body: {
          competitionId: selectedCompetition.id,
          platform: selectedPlatform,
          content: shareContent,
          userSecret: 'S...', // This would come from user context
        },
      });

      if (error) throw error;

      toast.success('Social share recorded! Bonus points earned!');
      setShareContent('');
      
      // Refresh participant data
      if (participant) {
        // Reload participant data to show updated score
      }
    } catch (err: any) {
      console.error('Failed to record social share:', err);
      toast.error(err.message || 'Failed to record social share');
    } finally {
      setIsSharing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return '🐦';
      case 'discord': return '💬';
      case 'telegram': return '✈️';
      case 'reddit': return '🤖';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  const getCriteriaIcon = (criteria: string) => {
    switch (criteria) {
      case 'volume': return <TrendingUp className="h-4 w-4" />;
      case 'accuracy': return <Target className="h-4 w-4" />;
      case 'streak': return <Zap className="h-4 w-4" />;
      case 'innovation': return <Star className="h-4 w-4" />;
      case 'social': return <Share2 className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const formatPrizePool = (amount: string) => {
    return `${parseInt(amount).toLocaleString()} KALE`;
  };

  const getTimeRemaining = (endDate: number) => {
    const now = Date.now();
    const remaining = endDate - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h remaining`;
  };

  const renderCompetitionCard = (competition: SeasonalCompetition) => (
    <Card 
      key={competition.id}
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selectedCompetition?.id === competition.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => {
        setSelectedCompetition(competition);
        loadCompetitionDetails(competition.id);
      }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">{competition.name}</CardTitle>
          </div>
          <Badge variant={competition.status === 'active' ? 'default' : 'secondary'}>
            {competition.status}
          </Badge>
        </div>
        <CardDescription>{competition.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{competition.season}</span>
            <span>•</span>
            <span>{getTimeRemaining(competition.endDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gift className="h-4 w-4" />
            <span>Prize Pool: {formatPrizePool(competition.totalPrizePool)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{competition.participantCount} participants</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {competition.categories.map((category) => (
              <Badge key={category.id} variant="outline" className="text-xs">
                {getCriteriaIcon(category.criteria)}
                <span className="ml-1">{category.name}</span>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLeaderboard = (leaderboard: CompetitionLeaderboard) => (
    <div key={leaderboard.category} className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Crown className="h-5 w-5 text-yellow-500" />
        {leaderboard.category.replace('-', ' ').toUpperCase()} Leaderboard
      </h3>
      
      <div className="space-y-2">
        {leaderboard.rankings.slice(0, 10).map((ranking) => (
          <div 
            key={ranking.participantId}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              ranking.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                ranking.rank === 1 ? 'bg-yellow-500 text-white' :
                ranking.rank === 2 ? 'bg-gray-400 text-white' :
                ranking.rank === 3 ? 'bg-orange-500 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {ranking.rank}
              </div>
              <div>
                <div className="font-medium">{ranking.username}</div>
                {ranking.teamName && (
                  <div className="text-sm text-muted-foreground">{ranking.teamName}</div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold">{ranking.score} pts</div>
              <div className="text-sm text-muted-foreground">
                {ranking.achievements} achievements • {ranking.socialShares} shares
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSocialSharing = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Social Sharing
        </CardTitle>
        <CardDescription>
          Share your competition progress for bonus points!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {['twitter', 'discord', 'telegram', 'reddit', 'linkedin'].map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPlatform(platform as any)}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <span className="text-lg">{getPlatformIcon(platform)}</span>
              <span className="text-xs capitalize">{platform}</span>
            </Button>
          ))}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Share Content</label>
          <textarea
            value={shareContent}
            onChange={(e) => setShareContent(e.target.value)}
            placeholder="Share your competition progress..."
            className="w-full p-3 border rounded-lg resize-none"
            rows={3}
          />
        </div>
        
        <Button 
          onClick={recordSocialShare}
          disabled={isSharing || !shareContent.trim()}
          className="w-full"
        >
          {isSharing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          {isSharing ? 'Sharing...' : 'Share for Bonus Points'}
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading competitions...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Seasonal Competitions
        </h1>
        <p className="text-muted-foreground">
          Compete in seasonal tournaments and earn KALE rewards through prediction mastery and social engagement
        </p>
      </div>

      <Tabs defaultValue="competitions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="competitions">Active Competitions</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboards</TabsTrigger>
          <TabsTrigger value="social">Social Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map(renderCompetitionCard)}
          </div>
          
          {selectedCompetition && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {selectedCompetition.name}
                </CardTitle>
                <CardDescription>{selectedCompetition.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Gift className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="font-bold text-lg">{formatPrizePool(selectedCompetition.totalPrizePool)}</div>
                    <div className="text-sm text-muted-foreground">Total Prize Pool</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="font-bold text-lg">{selectedCompetition.participantCount}</div>
                    <div className="text-sm text-muted-foreground">Participants</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <div className="font-bold text-lg">{getTimeRemaining(selectedCompetition.endDate)}</div>
                    <div className="text-sm text-muted-foreground">Time Remaining</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Competition Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCompetition.categories.map((category) => (
                      <Card key={category.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getCriteriaIcon(category.criteria)}
                            <h4 className="font-semibold">{category.name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{formatPrizePool(category.prizePool)}</Badge>
                            <Button 
                              size="sm"
                              onClick={() => joinCompetition(selectedCompetition.id, category.id)}
                              disabled={isJoining}
                            >
                              {isJoining ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Join Category'
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          {leaderboards.length > 0 ? (
            <div className="space-y-6">
              {leaderboards.map(renderLeaderboard)}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Leaderboard Data</h3>
                <p className="text-muted-foreground">Join a competition to see leaderboards!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          {renderSocialSharing()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeasonalCompetitions;
