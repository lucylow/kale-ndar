import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Market } from '@/types/market';

interface AIInsight {
  id: string;
  type: 'PREDICTION' | 'SENTIMENT' | 'TECHNICAL' | 'RISK' | 'OPPORTUNITY';
  title: string;
  description: string;
  confidence: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  factors: {
    historicalData: number;
    sentimentAnalysis: number;
    oracleData: number;
    marketConditions: number;
  };
  timestamp: number;
}

interface AIMarketInsightsProps {
  market: Market;
  onInsightClick?: (insight: AIInsight) => void;
}

const AIMarketInsights: React.FC<AIMarketInsightsProps> = ({
  market,
  onInsightClick,
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock AI insights data
  const generateMockInsights = (): AIInsight[] => [
    {
      id: '1',
      type: 'PREDICTION',
      title: 'AI Prediction: Bullish Trend Expected',
      description: 'Based on historical data analysis and current market sentiment, there\'s a 78% probability of upward movement in the next 24 hours.',
      confidence: 78,
      impact: 'HIGH',
      recommendation: 'BUY',
      factors: {
        historicalData: 85,
        sentimentAnalysis: 72,
        oracleData: 80,
        marketConditions: 75,
      },
      timestamp: Date.now(),
    },
    {
      id: '2',
      type: 'SENTIMENT',
      title: 'Social Sentiment Analysis',
      description: 'Recent social media mentions show 65% positive sentiment with increasing engagement from crypto influencers.',
      confidence: 65,
      impact: 'MEDIUM',
      recommendation: 'WATCH',
      factors: {
        historicalData: 60,
        sentimentAnalysis: 85,
        oracleData: 50,
        marketConditions: 70,
      },
      timestamp: Date.now() - 300000,
    },
    {
      id: '3',
      type: 'TECHNICAL',
      title: 'Technical Indicators Signal',
      description: 'RSI shows oversold conditions while MACD indicates potential reversal. Support level at $45,000 appears strong.',
      confidence: 72,
      impact: 'MEDIUM',
      recommendation: 'BUY',
      factors: {
        historicalData: 80,
        sentimentAnalysis: 60,
        oracleData: 75,
        marketConditions: 70,
      },
      timestamp: Date.now() - 600000,
    },
    {
      id: '4',
      type: 'RISK',
      title: 'Risk Assessment',
      description: 'High volatility detected. Consider position sizing and stop-loss orders. Market shows signs of manipulation.',
      confidence: 85,
      impact: 'HIGH',
      recommendation: 'HOLD',
      factors: {
        historicalData: 90,
        sentimentAnalysis: 70,
        oracleData: 85,
        marketConditions: 80,
      },
      timestamp: Date.now() - 900000,
    },
  ];

  useEffect(() => {
    setInsights(generateMockInsights());
  }, [market.id]);

  const refreshInsights = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setInsights(generateMockInsights());
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'PREDICTION': return <Brain className="h-4 w-4" />;
      case 'SENTIMENT': return <Eye className="h-4 w-4" />;
      case 'TECHNICAL': return <BarChart3 className="h-4 w-4" />;
      case 'RISK': return <AlertTriangle className="h-4 w-4" />;
      case 'OPPORTUNITY': return <Zap className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'PREDICTION': return 'text-blue-500';
      case 'SENTIMENT': return 'text-purple-500';
      case 'TECHNICAL': return 'text-green-500';
      case 'RISK': return 'text-red-500';
      case 'OPPORTUNITY': return 'text-yellow-500';
    }
  };

  const getRecommendationColor = (recommendation: AIInsight['recommendation']) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-500 bg-green-500/10';
      case 'SELL': return 'text-red-500 bg-red-500/10';
      case 'HOLD': return 'text-yellow-500 bg-yellow-500/10';
      case 'WATCH': return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'HIGH': return 'text-red-500';
      case 'MEDIUM': return 'text-yellow-500';
      case 'LOW': return 'text-green-500';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className="bg-gradient-card border-white/10 shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Market Insights</CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {insights.length} insights
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshInsights}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-4 bg-secondary/20 rounded-lg border border-white/10 hover:border-primary/20 transition-colors cursor-pointer"
            onClick={() => onInsightClick?.(insight)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getInsightColor(insight.type)} bg-current/10`}>
                {getInsightIcon(insight.type)}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRecommendationColor(insight.recommendation)}>
                      {insight.recommendation}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(insight.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-2" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Impact</span>
                    <span className={`font-medium ${getImpactColor(insight.impact)}`}>
                      {insight.impact}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Historical:</span>
                    <span className="font-medium">{insight.factors.historicalData}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sentiment:</span>
                    <span className="font-medium">{insight.factors.sentimentAnalysis}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oracle:</span>
                    <span className="font-medium">{insight.factors.oracleData}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conditions:</span>
                    <span className="font-medium">{insight.factors.marketConditions}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {insights.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No AI insights available for this market</p>
            <Button variant="outline" size="sm" onClick={refreshInsights} className="mt-2">
              Generate Insights
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating AI insights...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIMarketInsights;
