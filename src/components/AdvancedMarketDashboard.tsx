import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Search,
  Filter,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Award,
  Zap,
  Activity,
  Crown,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Settings,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Flame,
  Gem,
  Diamond,
  Trophy,
  Medal,
  Shield,
  Info,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

import MultiOutcomeMarket from './MultiOutcomeMarket';
import ConditionalMarket from './ConditionalMarket';
import MarketTypeSelector from './MarketTypeSelector';

interface Market {
  id: string;
  title: string;
  description: string;
  marketType: 'multiple_choice' | 'range_prediction' | 'ranking' | 'conditional' | 'scalar' | 'tournament';
  outcomes: any[];
  creator: string;
  category: string;
  tags: string[];
  startTime: number;
  endTime: number;
  resolutionTime: number;
  totalVolume: number;
  totalLiquidity: number;
  participants: number;
  status: 'upcoming' | 'active' | 'closing' | 'resolved';
  resolutionSource: 'oracle' | 'community' | 'admin' | 'automated';
  minBet: number;
  maxBet: number;
  feePercentage: number;
  isPublic: boolean;
  leagueId?: string;
  createdAt: number;
  popularity: number;
  accuracy?: number;
}

interface AdvancedMarketDashboardProps {
  onMarketSelect?: (market: Market) => void;
  onCreateMarket?: (marketData: Partial<Market>) => void;
  onViewDetails?: (marketId: string) => void;
  showCreateButton?: boolean;
}

const AdvancedMarketDashboard: React.FC<AdvancedMarketDashboardProps> = ({
  onMarketSelect,
  onCreateMarket,
  onViewDetails,
  showCreateButton = true,
}) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedMarketType, setSelectedMarketType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'volume' | 'participants' | 'endTime'>('popularity');
  const [showMarketTypeSelector, setShowMarketTypeSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock market data
  const mockMarkets: Market[] = [
    {
      id: 'market_1',
      title: 'Which Cryptocurrency Will Have the Highest Market Cap by End of 2024?',
      description: 'Predict which cryptocurrency will have the highest market capitalization by December 31, 2024.',
      marketType: 'multiple_choice',
      outcomes: [
        { id: 'btc', title: 'Bitcoin (BTC)', probability: 35, odds: 2.85, volume: 1250000 },
        { id: 'eth', title: 'Ethereum (ETH)', probability: 28, odds: 3.57, volume: 980000 },
        { id: 'sol', title: 'Solana (SOL)', probability: 18, odds: 5.56, volume: 650000 },
        { id: 'bnb', title: 'BNB (BNB)', probability: 12, odds: 8.33, volume: 420000 },
        { id: 'other', title: 'Other', probability: 7, odds: 14.29, volume: 180000 }
      ],
      creator: 'CryptoAnalyst',
      category: 'Cryptocurrency',
      tags: ['crypto', 'market-cap', '2024'],
      startTime: Date.now() - 86400000,
      endTime: Date.now() + 2592000000,
      resolutionTime: Date.now() + 2592000000 + 86400000,
      totalVolume: 3480000,
      totalLiquidity: 6650000,
      participants: 1247,
      status: 'active',
      resolutionSource: 'oracle',
      minBet: 10,
      maxBet: 100000,
      feePercentage: 2.5,
      isPublic: true,
      createdAt: Date.now() - 86400000,
      popularity: 95,
      accuracy: 89
    },
    {
      id: 'market_2',
      title: 'If Bitcoin Hits $100K, Then What Happens to Ethereum?',
      description: 'Conditional market exploring the relationship between Bitcoin and Ethereum prices.',
      marketType: 'conditional',
      outcomes: [
        { id: 'eth_rises', title: 'Ethereum Rises Above $8K', probability: 45, odds: 2.22, volume: 450000 },
        { id: 'eth_stable', title: 'Ethereum Stays Stable ($5K-$8K)', probability: 30, odds: 3.33, volume: 300000 },
        { id: 'eth_falls', title: 'Ethereum Falls Below $5K', probability: 15, odds: 6.67, volume: 150000 },
        { id: 'btc_no_100k', title: 'Bitcoin Never Hits $100K', probability: 10, odds: 10.0, volume: 100000 }
      ],
      creator: 'MarketOracle',
      category: 'Cryptocurrency',
      tags: ['crypto', 'conditional', 'btc', 'eth', 'correlation'],
      startTime: Date.now() - 86400000,
      endTime: Date.now() + 2592000000,
      resolutionTime: Date.now() + 2592000000 + 86400000,
      totalVolume: 1000000,
      totalLiquidity: 2000000,
      participants: 456,
      status: 'active',
      resolutionSource: 'automated',
      minBet: 25,
      maxBet: 50000,
      feePercentage: 3.0,
      isPublic: true,
      createdAt: Date.now() - 86400000,
      popularity: 78,
      accuracy: 82
    },
    {
      id: 'market_3',
      title: 'BTC Price Range Prediction for Q4 2024',
      description: 'Predict which price range Bitcoin will be in at the end of Q4 2024.',
      marketType: 'range_prediction',
      outcomes: [
        { id: 'under_50k', title: 'Under $50,000', probability: 5, odds: 20.0, volume: 50000 },
        { id: '50k_60k', title: '$50,000 - $60,000', probability: 15, odds: 6.67, volume: 150000 },
        { id: '60k_70k', title: '$60,000 - $70,000', probability: 25, odds: 4.0, volume: 250000 },
        { id: '70k_80k', title: '$70,000 - $80,000', probability: 30, odds: 3.33, volume: 300000 },
        { id: '80k_90k', title: '$80,000 - $90,000', probability: 20, odds: 5.0, volume: 200000 },
        { id: 'over_90k', title: 'Over $90,000', probability: 5, odds: 20.0, volume: 50000 }
      ],
      creator: 'PricePredictor',
      category: 'Cryptocurrency',
      tags: ['crypto', 'btc', 'price', 'range', 'q4'],
      startTime: Date.now() - 86400000,
      endTime: Date.now() + 7776000000, // 90 days
      resolutionTime: Date.now() + 7776000000 + 86400000,
      totalVolume: 1000000,
      totalLiquidity: 2000000,
      participants: 789,
      status: 'active',
      resolutionSource: 'oracle',
      minBet: 15,
      maxBet: 75000,
      feePercentage: 2.5,
      isPublic: true,
      createdAt: Date.now() - 86400000,
      popularity: 88,
      accuracy: 85
    },
    {
      id: 'market_4',
      title: 'Top 3 Cryptocurrencies by Market Cap (End of 2024)',
      description: 'Rank the top 3 cryptocurrencies by market capitalization at the end of 2024.',
      marketType: 'ranking',
      outcomes: [
        { id: 'btc_eth_sol', title: 'BTC, ETH, SOL', probability: 40, odds: 2.5, volume: 400000 },
        { id: 'btc_eth_bnb', title: 'BTC, ETH, BNB', probability: 25, odds: 4.0, volume: 250000 },
        { id: 'btc_eth_ada', title: 'BTC, ETH, ADA', probability: 15, odds: 6.67, volume: 150000 },
        { id: 'btc_eth_dot', title: 'BTC, ETH, DOT', probability: 10, odds: 10.0, volume: 100000 },
        { id: 'other_combination', title: 'Other Combination', probability: 10, odds: 10.0, volume: 100000 }
      ],
      creator: 'RankingExpert',
      category: 'Cryptocurrency',
      tags: ['crypto', 'ranking', 'market-cap', 'top-3'],
      startTime: Date.now() - 86400000,
      endTime: Date.now() + 2592000000,
      resolutionTime: Date.now() + 2592000000 + 86400000,
      totalVolume: 1000000,
      totalLiquidity: 2000000,
      participants: 623,
      status: 'active',
      resolutionSource: 'oracle',
      minBet: 20,
      maxBet: 60000,
      feePercentage: 3.0,
      isPublic: true,
      createdAt: Date.now() - 86400000,
      popularity: 72,
      accuracy: 87
    }
  ];

  useEffect(() => {
    loadMarkets();
  }, []);

  useEffect(() => {
    filterMarkets();
  }, [markets, searchQuery, selectedMarketType, sortBy]);

  const loadMarkets = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMarkets(mockMarkets);
    setIsLoading(false);
  };

  const filterMarkets = () => {
    let filtered = [...markets];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(market =>
        market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by market type
    if (selectedMarketType !== 'all') {
      filtered = filtered.filter(market => market.marketType === selectedMarketType);
    }

    // Sort markets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'volume':
          return b.totalVolume - a.totalVolume;
        case 'participants':
          return b.participants - a.participants;
        case 'endTime':
          return a.endTime - b.endTime;
        default:
          return 0;
      }
    });

    setFilteredMarkets(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-500 bg-blue-500/10';
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'closing': return 'text-yellow-500 bg-yellow-500/10';
      case 'resolved': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getMarketTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return <Target className="h-4 w-4" />;
      case 'range_prediction': return <BarChart3 className="h-4 w-4" />;
      case 'ranking': return <Award className="h-4 w-4" />;
      case 'conditional': return <Zap className="h-4 w-4" />;
      case 'scalar': return <Activity className="h-4 w-4" />;
      case 'tournament': return <Crown className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getMarketTypeName = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'Multiple Choice';
      case 'range_prediction': return 'Range Prediction';
      case 'ranking': return 'Ranking';
      case 'conditional': return 'Conditional';
      case 'scalar': return 'Scalar';
      case 'tournament': return 'Tournament';
      default: return 'Unknown';
    }
  };

  const handleMarketSelect = (market: Market) => {
    setSelectedMarket(market);
    onMarketSelect?.(market);
  };

  const handleCreateMarket = (marketData: Partial<Market>) => {
    onCreateMarket?.(marketData);
    setShowMarketTypeSelector(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading markets...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showMarketTypeSelector) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create New Market</h2>
            <p className="text-muted-foreground">Choose the type of prediction market you want to create</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowMarketTypeSelector(false)}
          >
            Back to Markets
          </Button>
        </div>
        <MarketTypeSelector onSelectType={(type) => {
          // Handle market type selection and show appropriate creation form
          console.log('Selected market type:', type);
        }} />
      </div>
    );
  }

  if (selectedMarket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedMarket.title}</h2>
            <p className="text-muted-foreground">{selectedMarket.description}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedMarket(null)}
          >
            Back to Markets
          </Button>
        </div>
        
        {selectedMarket.marketType === 'conditional' ? (
          <ConditionalMarket market={selectedMarket as any} />
        ) : (
          <MultiOutcomeMarket market={selectedMarket as any} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Markets</h2>
          <p className="text-muted-foreground">
            Explore multi-outcome prediction markets with advanced features
          </p>
        </div>
        {showCreateButton && (
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowMarketTypeSelector(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Market
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedMarketType} onValueChange={setSelectedMarketType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="range_prediction">Range Prediction</SelectItem>
                  <SelectItem value="ranking">Ranking</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                  <SelectItem value="scalar">Scalar</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="participants">Participants</SelectItem>
                  <SelectItem value="endTime">End Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map((market) => (
          <Card
            key={market.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => handleMarketSelect(market)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getMarketTypeIcon(market.marketType)}
                  <Badge variant="secondary" className="text-xs">
                    {getMarketTypeName(market.marketType)}
                  </Badge>
                </div>
                <Badge className={`text-xs ${getStatusColor(market.status)}`}>
                  {market.status.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2">{market.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{market.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Market Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{market.participants}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatCurrency(market.totalVolume)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTimeRemaining(market.endTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>{market.popularity}%</span>
                </div>
              </div>

              {/* Top Outcomes */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Top Outcomes:</h4>
                <div className="space-y-1">
                  {market.outcomes.slice(0, 3).map((outcome) => (
                    <div key={outcome.id} className="flex justify-between text-xs">
                      <span className="truncate">{outcome.title}</span>
                      <span className="text-muted-foreground">{outcome.probability}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {market.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {market.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{market.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">View Details</span>
                </div>
                <Button size="sm" variant="outline">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMarkets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No markets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedMarketType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No markets are available at the moment'
              }
            </p>
            {showCreateButton && (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowMarketTypeSelector(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Market
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Market Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{markets.length}</div>
              <div className="text-sm text-muted-foreground">Total Markets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(markets.reduce((sum, market) => sum + market.totalVolume, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {markets.reduce((sum, market) => sum + market.participants, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {markets.filter(market => market.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Markets</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedMarketDashboard;
