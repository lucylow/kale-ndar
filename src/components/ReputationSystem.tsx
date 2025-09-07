import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Crown, 
  Shield, 
  Trophy, 
  Target, 
  TrendingUp,
  TrendingDown,
  Award,
  Medal,
  Zap,
  Flame,
  Diamond,
  Gem,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  BarChart3,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';

interface ReputationTier {
  id: string;
  name: string;
  level: number;
  minScore: number;
  maxScore: number;
  color: string;
  icon: React.ReactNode;
  benefits: string[];
  badge: string;
}

interface ReputationMetrics {
  overallScore: number;
  accuracyScore: number;
  consistencyScore: number;
  socialScore: number;
  innovationScore: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracyRate: number;
  currentStreak: number;
  longestStreak: number;
  averageConfidence: number;
  riskAdjustedReturn: number;
  socialEngagement: number;
  influenceScore: number;
  lastUpdated: number;
}

interface PredictionHistory {
  id: string;
  marketId: string;
  marketTitle: string;
  prediction: boolean;
  confidence: number;
  amount: number;
  outcome: boolean | null;
  profit: number;
  timestamp: number;
  socialData?: {
    likes: number;
    comments: number;
    shares: number;
    reasoning?: string;
  };
}

interface ReputationSystemProps {
  userId?: string;
  onViewProfile?: (userId: string) => void;
  onShareAchievement?: (achievement: any) => void;
}

const ReputationSystem: React.FC<ReputationSystemProps> = ({
  userId,
  onViewProfile,
  onShareAchievement,
}) => {
  const [reputationMetrics, setReputationMetrics] = useState<ReputationMetrics | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([]);
  const [currentTier, setCurrentTier] = useState<ReputationTier | null>(null);
  const [nextTier, setNextTier] = useState<ReputationTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reputation tiers
  const reputationTiers: ReputationTier[] = [
    {
      id: 'novice',
      name: 'Novice Predictor',
      level: 1,
      minScore: 0,
      maxScore: 200,
      color: 'text-gray-500',
      icon: <Target className="h-5 w-5" />,
      benefits: ['Basic prediction features', 'Community access'],
      badge: '🌱',
    },
    {
      id: 'apprentice',
      name: 'Apprentice Analyst',
      level: 2,
      minScore: 200,
      maxScore: 500,
      color: 'text-blue-500',
      icon: <Star className="h-5 w-5" />,
      benefits: ['Advanced analytics', 'Social features', 'Copy trading'],
      badge: '⭐',
    },
    {
      id: 'expert',
      name: 'Expert Trader',
      level: 3,
      minScore: 500,
      maxScore: 1000,
      color: 'text-green-500',
      icon: <Award className="h-5 w-5" />,
      benefits: ['Priority support', 'Early access', 'NFT rewards'],
      badge: '🏆',
    },
    {
      id: 'master',
      name: 'Master Predictor',
      level: 4,
      minScore: 1000,
      maxScore: 2000,
      color: 'text-purple-500',
      icon: <Crown className="h-5 w-5" />,
      benefits: ['Exclusive markets', 'VIP features', 'Premium NFTs'],
      badge: '👑',
    },
    {
      id: 'legend',
      name: 'Prediction Legend',
      level: 5,
      minScore: 2000,
      maxScore: 5000,
      color: 'text-yellow-500',
      icon: <Diamond className="h-5 w-5" />,
      benefits: ['Legendary status', 'Exclusive access', 'Rare NFTs'],
      badge: '💎',
    },
    {
      id: 'oracle',
      name: 'Market Oracle',
      level: 6,
      minScore: 5000,
      maxScore: Infinity,
      color: 'text-red-500',
      icon: <Gem className="h-5 w-5" />,
      benefits: ['Oracle status', 'Ultimate privileges', 'Legendary NFTs'],
      badge: '🔮',
    },
  ];

  useEffect(() => {
    loadReputationData();
  }, [userId]);

  const loadReputationData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock reputation metrics
    const mockMetrics: ReputationMetrics = {
      overallScore: 1250,
      accuracyScore: 95,
      consistencyScore: 88,
      socialScore: 92,
      innovationScore: 85,
      totalPredictions: 156,
      correctPredictions: 139,
      accuracyRate: 89.1,
      currentStreak: 12,
      longestStreak: 18,
      averageConfidence: 82.5,
      riskAdjustedReturn: 15.8,
      socialEngagement: 8.5,
      influenceScore: 95,
      lastUpdated: Date.now(),
    };

    // Mock prediction history
    const mockHistory: PredictionHistory[] = [
      {
        id: '1',
        marketId: 'market1',
        marketTitle: 'BTC to $100K by end of 2024',
        prediction: true,
        confidence: 85,
        amount: 500,
        outcome: true,
        profit: 125,
        timestamp: Date.now() - 3600000,
        socialData: {
          likes: 23,
          comments: 5,
          shares: 3,
          reasoning: 'Strong technical indicators suggest upward momentum',
        },
      },
      {
        id: '2',
        marketId: 'market2',
        marketTitle: 'ETH to $5K by Q2 2024',
        prediction: true,
        confidence: 78,
        amount: 300,
        outcome: true,
        profit: 90,
        timestamp: Date.now() - 7200000,
        socialData: {
          likes: 18,
          comments: 3,
          shares: 2,
          reasoning: 'Ethereum upgrades driving adoption',
        },
      },
      {
        id: '3',
        marketId: 'market3',
        marketTitle: 'SOL to $200 by end of 2024',
        prediction: false,
        confidence: 72,
        amount: 200,
        outcome: true,
        profit: 40,
        timestamp: Date.now() - 10800000,
        socialData: {
          likes: 12,
          comments: 2,
          shares: 1,
          reasoning: 'Market correction expected',
        },
      },
    ];

    setReputationMetrics(mockMetrics);
    setPredictionHistory(mockHistory);
    
    // Determine current and next tier
    const current = reputationTiers.find(tier => 
      mockMetrics.overallScore >= tier.minScore && mockMetrics.overallScore < tier.maxScore
    );
    const next = reputationTiers.find(tier => tier.level === (current?.level || 0) + 1);
    
    setCurrentTier(current || reputationTiers[0]);
    setNextTier(next || null);
    
    setIsLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/10';
    if (score >= 80) return 'bg-blue-500/10';
    if (score >= 70) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading reputation data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reputationMetrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reputation System</h2>
          <p className="text-muted-foreground">
            Track your prediction accuracy and build your reputation in the community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${getScoreBgColor(reputationMetrics.overallScore)} ${getScoreColor(reputationMetrics.overallScore)}`}>
            {currentTier?.badge} {currentTier?.name}
          </Badge>
        </div>
      </div>

      {/* Current Tier & Progress */}
      <Card className="bg-gradient-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentTier?.icon}
            Current Status: {currentTier?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary">{reputationMetrics.overallScore}</div>
              <div className="text-sm text-muted-foreground">Overall Reputation Score</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Level {currentTier?.level}</div>
              <div className="text-xs text-muted-foreground">
                {nextTier ? `Next: ${nextTier.name}` : 'Max Level'}
              </div>
            </div>
          </div>

          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier.name}</span>
                <span>{reputationMetrics.overallScore}/{nextTier.minScore}</span>
              </div>
              <Progress 
                value={(reputationMetrics.overallScore / nextTier.minScore) * 100} 
                className="h-2"
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-500">{reputationMetrics.accuracyRate}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-500">{reputationMetrics.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-500">{reputationMetrics.totalPredictions}</div>
              <div className="text-xs text-muted-foreground">Total Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-500">{reputationMetrics.influenceScore}</div>
              <div className="text-xs text-muted-foreground">Influence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Accuracy Score</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{reputationMetrics.accuracyScore}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {reputationMetrics.correctPredictions}/{reputationMetrics.totalPredictions} correct
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Consistency Score</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{reputationMetrics.consistencyScore}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {reputationMetrics.longestStreak} longest streak
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Social Score</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">{reputationMetrics.socialScore}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {reputationMetrics.socialEngagement}% engagement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Innovation Score</span>
            </div>
            <div className="text-2xl font-bold text-yellow-500">{reputationMetrics.innovationScore}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {reputationMetrics.averageConfidence}% avg confidence
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Tier Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reputationTiers.map((tier) => (
              <div
                key={tier.id}
                className={`p-4 rounded-lg border transition-colors ${
                  tier.id === currentTier?.id
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-secondary/20 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{tier.badge}</span>
                  <div>
                    <div className="font-semibold text-sm">{tier.name}</div>
                    <div className="text-xs text-muted-foreground">Level {tier.level}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {tier.benefits.map((benefit, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictionHistory.map((prediction) => (
              <div key={prediction.id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    prediction.outcome === true ? 'bg-green-500/10' : 
                    prediction.outcome === false ? 'bg-red-500/10' : 
                    'bg-gray-500/10'
                  }`}>
                    {prediction.outcome === true ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : prediction.outcome === false ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{prediction.marketTitle}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(prediction.timestamp)} • {prediction.confidence}% confidence
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm font-semibold">
                      {prediction.prediction ? 'FOR' : 'AGAINST'}
                    </div>
                    <div className="text-xs text-muted-foreground">Prediction</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{formatCurrency(prediction.amount)}</div>
                    <div className="text-xs text-muted-foreground">Amount</div>
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${
                      prediction.profit > 0 ? 'text-green-500' : 
                      prediction.profit < 0 ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {prediction.profit > 0 ? '+' : ''}{formatCurrency(prediction.profit)}
                    </div>
                    <div className="text-xs text-muted-foreground">Profit</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {prediction.socialData ? (
                        <div className="flex items-center justify-center gap-1">
                          <Heart className="h-3 w-3 text-red-500" />
                          {prediction.socialData.likes}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Social</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reputation Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Building Your Reputation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Accuracy Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Research markets thoroughly before predicting</li>
                <li>• Use multiple data sources for analysis</li>
                <li>• Be honest about your confidence levels</li>
                <li>• Learn from incorrect predictions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Social Engagement</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Share your reasoning with the community</li>
                <li>• Engage with other users' predictions</li>
                <li>• Help newcomers learn the platform</li>
                <li>• Participate in prediction leagues</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReputationSystem;
