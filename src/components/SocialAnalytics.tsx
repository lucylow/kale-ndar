import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Target,
  Zap,
  Crown,
  Star,
  Activity,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

interface SocialMetrics {
  totalFollowers: number;
  totalFollowing: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalViews: number;
  engagementRate: number;
  influenceScore: number;
  socialRank: number;
  weeklyGrowth: {
    followers: number;
    likes: number;
    comments: number;
    shares: number;
  };
  topContent: {
    id: string;
    type: 'BET' | 'COMMENT' | 'ANALYSIS';
    title: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    engagement: number;
  }[];
  audienceInsights: {
    demographics: {
      ageGroups: { range: string; percentage: number }[];
      locations: { country: string; percentage: number }[];
      interests: { category: string; percentage: number }[];
    };
    behavior: {
      activeHours: { hour: number; activity: number }[];
      preferredContent: { type: string; percentage: number }[];
      interactionPatterns: { pattern: string; frequency: number }[];
    };
  };
  competitorAnalysis: {
    name: string;
    followers: number;
    engagementRate: number;
    influenceScore: number;
    comparison: 'BETTER' | 'SAME' | 'WORSE';
  }[];
}

interface SocialAnalyticsProps {
  userId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onExport?: () => void;
}

const SocialAnalytics: React.FC<SocialAnalyticsProps> = ({
  userId,
  timeRange = '30d',
  onExport,
}) => {
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'growth' | 'audience'>('engagement');

  useEffect(() => {
    loadSocialMetrics();
  }, [userId, timeRange]);

  const loadSocialMetrics = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setMetrics({
      totalFollowers: 1250,
      totalFollowing: 89,
      totalLikes: 5420,
      totalComments: 890,
      totalShares: 234,
      totalViews: 15600,
      engagementRate: 8.5,
      influenceScore: 95,
      socialRank: 12,
      weeklyGrowth: {
        followers: 45,
        likes: 320,
        comments: 67,
        shares: 18,
      },
      topContent: [
        {
          id: '1',
          type: 'BET',
          title: 'BTC to $100K by end of 2024',
          likes: 156,
          comments: 23,
          shares: 12,
          views: 890,
          engagement: 21.5,
        },
        {
          id: '2',
          type: 'ANALYSIS',
          title: 'Market sentiment analysis for Q4',
          likes: 134,
          comments: 18,
          shares: 8,
          views: 650,
          engagement: 24.6,
        },
        {
          id: '3',
          type: 'COMMENT',
          title: 'Response to ETH price prediction',
          likes: 89,
          comments: 12,
          shares: 5,
          views: 420,
          engagement: 25.2,
        },
      ],
      audienceInsights: {
        demographics: {
          ageGroups: [
            { range: '18-24', percentage: 25 },
            { range: '25-34', percentage: 40 },
            { range: '35-44', percentage: 22 },
            { range: '45-54', percentage: 10 },
            { range: '55+', percentage: 3 },
          ],
          locations: [
            { country: 'US', percentage: 45 },
            { country: 'EU', percentage: 30 },
            { country: 'Asia', percentage: 25 },
          ],
          interests: [
            { category: 'Finance', percentage: 60 },
            { category: 'Technology', percentage: 35 },
            { category: 'Gaming', percentage: 25 },
          ],
        },
        behavior: {
          activeHours: [
            { hour: 9, activity: 85 },
            { hour: 12, activity: 95 },
            { hour: 15, activity: 78 },
            { hour: 18, activity: 92 },
            { hour: 21, activity: 88 },
          ],
          preferredContent: [
            { type: 'Market Analysis', percentage: 35 },
            { type: 'Betting Predictions', percentage: 28 },
            { type: 'Educational Content', percentage: 20 },
            { type: 'Social Commentary', percentage: 17 },
          ],
          interactionPatterns: [
            { pattern: 'Like & Comment', frequency: 45 },
            { pattern: 'Share Only', frequency: 25 },
            { pattern: 'View Only', frequency: 20 },
            { pattern: 'Follow & Engage', frequency: 10 },
          ],
        },
      },
      competitorAnalysis: [
        {
          name: 'CryptoOracle',
          followers: 1250,
          engagementRate: 8.5,
          influenceScore: 95,
          comparison: 'SAME',
        },
        {
          name: 'MarketAnalyst',
          followers: 980,
          engagementRate: 7.2,
          influenceScore: 88,
          comparison: 'BETTER',
        },
        {
          name: 'PredictionPro',
          followers: 750,
          engagementRate: 6.8,
          influenceScore: 82,
          comparison: 'BETTER',
        },
        {
          name: 'TrendWatcher',
          followers: 650,
          engagementRate: 5.9,
          influenceScore: 75,
          comparison: 'BETTER',
        },
      ],
    });
    setIsLoading(false);
  };

  const getComparisonColor = (comparison: string) => {
    switch (comparison) {
      case 'BETTER': return 'text-green-500';
      case 'SAME': return 'text-yellow-500';
      case 'WORSE': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getComparisonIcon = (comparison: string) => {
    switch (comparison) {
      case 'BETTER': return <TrendingUp className="h-4 w-4" />;
      case 'SAME': return <Target className="h-4 w-4" />;
      case 'WORSE': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading social analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Analytics</h2>
          <p className="text-muted-foreground">
            Track your social influence and engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadSocialMetrics} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Followers</span>
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalFollowers)}</div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{metrics.weeklyGrowth.followers} this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Engagement Rate</span>
            </div>
            <div className="text-2xl font-bold">{metrics.engagementRate}%</div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +1.2% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Influence Score</span>
            </div>
            <div className="text-2xl font-bold">{metrics.influenceScore}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Rank #{metrics.socialRank} globally
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Views</span>
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalViews)}</div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Engagement Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{formatNumber(metrics.totalLikes)}</div>
              <div className="text-sm text-muted-foreground mb-2">Total Likes</div>
              <div className="text-xs text-green-500">+{metrics.weeklyGrowth.likes} this week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{formatNumber(metrics.totalComments)}</div>
              <div className="text-sm text-muted-foreground mb-2">Comments</div>
              <div className="text-xs text-green-500">+{metrics.weeklyGrowth.comments} this week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{formatNumber(metrics.totalShares)}</div>
              <div className="text-sm text-muted-foreground mb-2">Shares</div>
              <div className="text-xs text-green-500">+{metrics.weeklyGrowth.shares} this week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{formatNumber(metrics.totalViews)}</div>
              <div className="text-sm text-muted-foreground mb-2">Views</div>
              <div className="text-xs text-green-500">+15.2% this week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Performing Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topContent.map((content) => (
              <div key={content.id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {content.type}
                  </Badge>
                  <div>
                    <div className="font-semibold text-sm">{content.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {content.views} views • {content.engagement}% engagement
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm font-semibold text-red-500">{content.likes}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-500">{content.comments}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-purple-500">{content.shares}</div>
                    <div className="text-xs text-muted-foreground">Shares</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-blue-500">{content.views}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audience Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Audience Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Age Groups</h4>
                <div className="space-y-2">
                  {metrics.audienceInsights.demographics.ageGroups.map((group, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{group.range}</span>
                        <span className="font-medium">{group.percentage}%</span>
                      </div>
                      <Progress value={group.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Top Locations</h4>
                <div className="space-y-2">
                  {metrics.audienceInsights.demographics.locations.slice(0, 5).map((location, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{location.country}</span>
                        <span className="font-medium">{location.percentage}%</span>
                      </div>
                      <Progress value={location.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Behavior Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Most Active Hours</h4>
                <div className="space-y-2">
                  {metrics.audienceInsights.behavior.activeHours.map((hour, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{hour.hour}:00</span>
                        <span className="font-medium">{hour.activity}%</span>
                      </div>
                      <Progress value={hour.activity} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Preferred Content</h4>
                <div className="space-y-2">
                  {metrics.audienceInsights.behavior.preferredContent.map((content, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{content.type}</span>
                        <span className="font-medium">{content.percentage}%</span>
                      </div>
                      <Progress value={content.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.competitorAnalysis.map((competitor, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getComparisonColor(competitor.comparison)} bg-current/10`}>
                    {getComparisonIcon(competitor.comparison)}
                  </div>
                  <div>
                    <div className="font-semibold">{competitor.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(competitor.followers)} followers
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm font-semibold">{competitor.engagementRate}%</div>
                    <div className="text-xs text-muted-foreground">Engagement</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{competitor.influenceScore}</div>
                    <div className="text-xs text-muted-foreground">Influence</div>
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${getComparisonColor(competitor.comparison)}`}>
                      {competitor.comparison}
                    </div>
                    <div className="text-xs text-muted-foreground">vs You</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialAnalytics;
