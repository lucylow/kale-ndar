import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  BarChart3, 
  Award, 
  Zap, 
  Activity, 
  Crown,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  Info,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface MarketType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  minOutcomes: number;
  maxOutcomes: number;
  examples: string[];
  features: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  popularity: number;
  category: string;
}

interface MarketTypeSelectorProps {
  onSelectType?: (type: MarketType) => void;
  selectedType?: MarketType | null;
  showExamples?: boolean;
  showFeatures?: boolean;
  compact?: boolean;
}

const MarketTypeSelector: React.FC<MarketTypeSelectorProps> = ({
  onSelectType,
  selectedType,
  showExamples = true,
  showFeatures = true,
  compact = false,
}) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const marketTypes: MarketType[] = [
    {
      id: 'multiple_choice',
      name: 'Multiple Choice',
      description: 'Choose from several predefined options',
      icon: <Target className="h-6 w-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      minOutcomes: 3,
      maxOutcomes: 10,
      examples: [
        'Which crypto will perform best this quarter?',
        'Who will win the presidential election?',
        'Which movie will win Best Picture?',
        'Which team will win the championship?'
      ],
      features: [
        'Simple to understand',
        'Clear outcomes',
        'Easy to bet on',
        'Good for beginners'
      ],
      difficulty: 'Easy',
      popularity: 95,
      category: 'General'
    },
    {
      id: 'range_prediction',
      name: 'Range Prediction',
      description: 'Predict within a specific range or bracket',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      minOutcomes: 3,
      maxOutcomes: 8,
      examples: [
        'BTC price range: $50K-$60K, $60K-$70K, $70K+',
        'Temperature range: 20-25°C, 25-30°C, 30°C+',
        'Sales revenue: $1M-$2M, $2M-$3M, $3M+',
        'GDP growth: 2-3%, 3-4%, 4%+'
      ],
      features: [
        'Numerical ranges',
        'Statistical analysis',
        'Risk management',
        'Data-driven decisions'
      ],
      difficulty: 'Medium',
      popularity: 78,
      category: 'Financial'
    },
    {
      id: 'ranking',
      name: 'Ranking',
      description: 'Rank multiple options in order',
      icon: <Award className="h-6 w-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      minOutcomes: 3,
      maxOutcomes: 6,
      examples: [
        'Top 3 cryptocurrencies by market cap',
        'Best performing stocks this year',
        'Most popular social media platforms',
        'Top universities worldwide'
      ],
      features: [
        'Relative comparisons',
        'Multiple winners',
        'Complex scoring',
        'Strategic thinking'
      ],
      difficulty: 'Medium',
      popularity: 65,
      category: 'Comparative'
    },
    {
      id: 'conditional',
      name: 'Conditional',
      description: 'If-then scenarios with multiple outcomes',
      icon: <Zap className="h-6 w-6" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      minOutcomes: 2,
      maxOutcomes: 6,
      examples: [
        'If BTC hits $100K, then ETH will hit $10K',
        'If Fed cuts rates, then stocks will rally',
        'If election result is X, then policy Y will pass',
        'If company A merges with B, then stock C will rise'
      ],
      features: [
        'Complex logic',
        'Causal relationships',
        'Advanced strategies',
        'Risk assessment'
      ],
      difficulty: 'Hard',
      popularity: 45,
      category: 'Advanced'
    },
    {
      id: 'scalar',
      name: 'Scalar',
      description: 'Predict exact numerical values',
      icon: <Activity className="h-6 w-6" />,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      minOutcomes: 5,
      maxOutcomes: 20,
      examples: [
        'Exact BTC price on Dec 31, 2024',
        'GDP growth rate for Q4 2024',
        'Unemployment percentage next month',
        'Exact number of iPhone units sold'
      ],
      features: [
        'Precise predictions',
        'High accuracy required',
        'Statistical modeling',
        'Expert knowledge'
      ],
      difficulty: 'Expert',
      popularity: 32,
      category: 'Precision'
    },
    {
      id: 'tournament',
      name: 'Tournament',
      description: 'Sports or competition brackets',
      icon: <Crown className="h-6 w-6" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      minOutcomes: 4,
      maxOutcomes: 16,
      examples: [
        'World Cup winner bracket',
        'NBA championship playoffs',
        'Olympic gold medalists',
        'Tennis tournament winners'
      ],
      features: [
        'Sports knowledge',
        'Tournament structure',
        'Multiple rounds',
        'Fan engagement'
      ],
      difficulty: 'Medium',
      popularity: 88,
      category: 'Sports'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 bg-green-500/10';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'Hard': return 'text-orange-500 bg-orange-500/10';
      case 'Expert': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 80) return 'text-green-500';
    if (popularity >= 60) return 'text-yellow-500';
    if (popularity >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {marketTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedType?.id === type.id ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => onSelectType?.(type)}
          >
            <CardContent className="p-4 text-center">
              <div className={`mx-auto mb-2 p-2 rounded-lg ${type.bgColor} w-fit`}>
                <div className={type.color}>
                  {type.icon}
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">{type.name}</h3>
              <Badge variant="secondary" className={`text-xs ${getDifficultyColor(type.difficulty)}`}>
                {type.difficulty}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Market Type</h2>
        <p className="text-muted-foreground">
          Select the type of prediction market that best fits your question
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
              selectedType?.id === type.id ? 'ring-2 ring-primary bg-primary/5' : ''
            } ${hoveredType === type.id ? 'shadow-lg scale-105' : ''}`}
            onClick={() => onSelectType?.(type)}
            onMouseEnter={() => setHoveredType(type.id)}
            onMouseLeave={() => setHoveredType(null)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${type.bgColor}`}>
                    <div className={type.color}>
                      {type.icon}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="secondary" className={`text-xs ${getDifficultyColor(type.difficulty)}`}>
                    {type.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className={`text-xs font-semibold ${getPopularityColor(type.popularity)}`}>
                      {type.popularity}%
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold">Outcomes:</span>
                  <Badge variant="outline" className="text-xs">
                    {type.minOutcomes}-{type.maxOutcomes}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Category:</span>
                  <Badge variant="secondary" className="text-xs">
                    {type.category}
                  </Badge>
                </div>
              </div>

              {showFeatures && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showExamples && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Examples:</h4>
                  <div className="space-y-1">
                    {type.examples.slice(0, 2).map((example, index) => (
                      <div key={index} className="text-xs text-muted-foreground p-2 bg-secondary/20 rounded">
                        "{example}"
                      </div>
                    ))}
                    {type.examples.length > 2 && (
                      <div className="text-xs text-muted-foreground italic">
                        +{type.examples.length - 2} more examples
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {type.popularity}% popularity
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={selectedType?.id === type.id ? "default" : "outline"}
                  className="text-xs"
                >
                  {selectedType?.id === type.id ? 'Selected' : 'Select'}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Type Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Market Type Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Difficulty</th>
                  <th className="text-left p-2">Outcomes</th>
                  <th className="text-left p-2">Popularity</th>
                  <th className="text-left p-2">Best For</th>
                </tr>
              </thead>
              <tbody>
                {marketTypes.map((type) => (
                  <tr key={type.id} className="border-b">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className={type.color}>
                          {type.icon}
                        </div>
                        <span className="font-medium">{type.name}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="secondary" className={`text-xs ${getDifficultyColor(type.difficulty)}`}>
                        {type.difficulty}
                      </Badge>
                    </td>
                    <td className="p-2">{type.minOutcomes}-{type.maxOutcomes}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${type.popularity >= 80 ? 'bg-green-500' : type.popularity >= 60 ? 'bg-yellow-500' : type.popularity >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                            style={{ width: `${type.popularity}%` }}
                          />
                        </div>
                        <span className="text-xs">{type.popularity}%</span>
                      </div>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{type.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">For Beginners:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with Multiple Choice markets</li>
                <li>• Choose topics you know well</li>
                <li>• Start with small bet amounts</li>
                <li>• Read market descriptions carefully</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Advanced Users:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Try Conditional markets for complex scenarios</li>
                <li>• Use Scalar markets for precise predictions</li>
                <li>• Analyze historical data before betting</li>
                <li>• Consider risk management strategies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketTypeSelector;
