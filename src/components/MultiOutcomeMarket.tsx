import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Star,
  Award,
  Crown,
  Gem,
  Diamond,
  Flame,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Settings,
  Info
} from 'lucide-react';

interface MarketOutcome {
  id: string;
  title: string;
  description?: string;
  probability: number;
  odds: number;
  volume: number;
  liquidity: number;
  color: string;
  icon?: React.ReactNode;
}

interface MarketType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  minOutcomes: number;
  maxOutcomes: number;
  examples: string[];
}

interface MultiOutcomeMarket {
  id: string;
  title: string;
  description: string;
  marketType: MarketType;
  outcomes: MarketOutcome[];
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
}

interface MultiOutcomeMarketProps {
  market?: MultiOutcomeMarket;
  onBet?: (outcomeId: string, amount: number, confidence: number) => void;
  onCreateMarket?: (marketData: Partial<MultiOutcomeMarket>) => void;
  onViewDetails?: (marketId: string) => void;
  showCreateButton?: boolean;
}

const MultiOutcomeMarket: React.FC<MultiOutcomeMarketProps> = ({
  market,
  onBet,
  onCreateMarket,
  onViewDetails,
  showCreateButton = false,
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(50);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newMarket, setNewMarket] = useState<Partial<MultiOutcomeMarket>>({});

  // Market types
  const marketTypes: MarketType[] = [
    {
      id: 'multiple_choice',
      name: 'Multiple Choice',
      description: 'Choose from several predefined options',
      icon: <Target className="h-5 w-5" />,
      minOutcomes: 3,
      maxOutcomes: 10,
      examples: ['Which crypto will perform best?', 'Who will win the election?', 'Which movie will win Oscars?']
    },
    {
      id: 'range_prediction',
      name: 'Range Prediction',
      description: 'Predict within a specific range or bracket',
      icon: <BarChart3 className="h-5 w-5" />,
      minOutcomes: 3,
      maxOutcomes: 8,
      examples: ['BTC price range', 'Temperature range', 'Sales revenue bracket']
    },
    {
      id: 'ranking',
      name: 'Ranking',
      description: 'Rank multiple options in order',
      icon: <Award className="h-5 w-5" />,
      minOutcomes: 3,
      maxOutcomes: 6,
      examples: ['Top 3 cryptocurrencies', 'Best performing stocks', 'Most popular apps']
    },
    {
      id: 'conditional',
      name: 'Conditional',
      description: 'If-then scenarios with multiple outcomes',
      icon: <Zap className="h-5 w-5" />,
      minOutcomes: 2,
      maxOutcomes: 6,
      examples: ['If BTC hits $100K, then...', 'If Fed cuts rates, then...', 'If election result is X, then...']
    },
    {
      id: 'scalar',
      name: 'Scalar',
      description: 'Predict exact numerical values',
      icon: <Activity className="h-5 w-5" />,
      minOutcomes: 5,
      maxOutcomes: 20,
      examples: ['Exact BTC price', 'GDP growth rate', 'Unemployment percentage']
    },
    {
      id: 'tournament',
      name: 'Tournament',
      description: 'Sports or competition brackets',
      icon: <Crown className="h-5 w-5" />,
      minOutcomes: 4,
      maxOutcomes: 16,
      examples: ['World Cup winner', 'NBA champion', 'Olympic gold medalist']
    }
  ];

  // Mock market data
  const mockMarket: MultiOutcomeMarket = {
    id: 'market_1',
    title: 'Which Cryptocurrency Will Have the Highest Market Cap by End of 2024?',
    description: 'Predict which cryptocurrency will have the highest market capitalization by December 31, 2024. Market cap will be determined by CoinGecko data.',
    marketType: marketTypes[0],
    outcomes: [
      {
        id: 'btc',
        title: 'Bitcoin (BTC)',
        description: 'The original cryptocurrency',
        probability: 35,
        odds: 2.85,
        volume: 1250000,
        liquidity: 2500000,
        color: 'text-orange-500',
        icon: <Diamond className="h-4 w-4" />
      },
      {
        id: 'eth',
        title: 'Ethereum (ETH)',
        description: 'Smart contract platform',
        probability: 28,
        odds: 3.57,
        volume: 980000,
        liquidity: 1800000,
        color: 'text-blue-500',
        icon: <Gem className="h-4 w-4" />
      },
      {
        id: 'sol',
        title: 'Solana (SOL)',
        description: 'High-performance blockchain',
        probability: 18,
        odds: 5.56,
        volume: 650000,
        liquidity: 1200000,
        color: 'text-purple-500',
        icon: <Star className="h-4 w-4" />
      },
      {
        id: 'bnb',
        title: 'BNB (BNB)',
        description: 'Binance ecosystem token',
        probability: 12,
        odds: 8.33,
        volume: 420000,
        liquidity: 800000,
        color: 'text-yellow-500',
        icon: <Award className="h-4 w-4" />
      },
      {
        id: 'other',
        title: 'Other',
        description: 'Any other cryptocurrency',
        probability: 7,
        odds: 14.29,
        volume: 180000,
        liquidity: 350000,
        color: 'text-gray-500',
        icon: <Target className="h-4 w-4" />
      }
    ],
    creator: 'CryptoAnalyst',
    category: 'Cryptocurrency',
    tags: ['crypto', 'market-cap', '2024'],
    startTime: Date.now() - 86400000,
    endTime: Date.now() + 2592000000, // 30 days
    resolutionTime: Date.now() + 2592000000 + 86400000, // 31 days
    totalVolume: 3480000,
    totalLiquidity: 6650000,
    participants: 1247,
    status: 'active',
    resolutionSource: 'oracle',
    minBet: 10,
    maxBet: 100000,
    feePercentage: 2.5,
    isPublic: true,
    createdAt: Date.now() - 86400000
  };

  const currentMarket = market || mockMarket;

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

  const handleBet = () => {
    if (selectedOutcome && betAmount > 0 && onBet) {
      onBet(selectedOutcome, betAmount, confidence);
      setShowBetDialog(false);
      setSelectedOutcome('');
      setBetAmount(0);
      setConfidence(50);
    }
  };

  const handleCreateMarket = () => {
    if (onCreateMarket && newMarket.title && newMarket.outcomes && newMarket.outcomes.length >= 2) {
      onCreateMarket(newMarket);
      setShowCreateDialog(false);
      setNewMarket({});
    }
  };

  const addOutcome = () => {
    const outcomes = newMarket.outcomes || [];
    const newOutcome: MarketOutcome = {
      id: `outcome_${outcomes.length + 1}`,
      title: '',
      probability: 0,
      odds: 0,
      volume: 0,
      liquidity: 0,
      color: 'text-gray-500'
    };
    setNewMarket({ ...newMarket, outcomes: [...outcomes, newOutcome] });
  };

  const removeOutcome = (index: number) => {
    const outcomes = newMarket.outcomes || [];
    if (outcomes.length > 2) {
      setNewMarket({ ...newMarket, outcomes: outcomes.filter((_, i) => i !== index) });
    }
  };

  const updateOutcome = (index: number, field: keyof MarketOutcome, value: any) => {
    const outcomes = newMarket.outcomes || [];
    const updatedOutcomes = [...outcomes];
    updatedOutcomes[index] = { ...updatedOutcomes[index], [field]: value };
    setNewMarket({ ...newMarket, outcomes: updatedOutcomes });
  };

  return (
    <div className="space-y-6">
      {/* Market Header */}
      <Card className="bg-gradient-card border-white/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {currentMarket.marketType.icon}
                <Badge variant="secondary" className="text-xs">
                  {currentMarket.marketType.name}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(currentMarket.status)}`}>
                  {currentMarket.status.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-xl mb-2">{currentMarket.title}</CardTitle>
              <p className="text-muted-foreground text-sm mb-4">{currentMarket.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Ends: {formatTimeRemaining(currentMarket.endTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{currentMarket.participants} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatCurrency(currentMarket.totalVolume)} volume</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>{formatCurrency(currentMarket.totalLiquidity)} liquidity</span>
                </div>
              </div>
            </div>
            
            {showCreateButton && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Market
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Multi-Outcome Market</DialogTitle>
                    <DialogDescription>
                      Create a new prediction market with multiple possible outcomes
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Market Type Selection */}
                    <div>
                      <Label htmlFor="marketType">Market Type</Label>
                      <Select 
                        value={newMarket.marketType?.id} 
                        onValueChange={(value) => {
                          const type = marketTypes.find(t => t.id === value);
                          setNewMarket({ ...newMarket, marketType: type });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select market type" />
                        </SelectTrigger>
                        <SelectContent>
                          {marketTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center gap-2">
                                {type.icon}
                                <div>
                                  <div className="font-medium">{type.name}</div>
                                  <div className="text-xs text-muted-foreground">{type.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Market Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Market Title</Label>
                        <Input
                          id="title"
                          value={newMarket.title || ''}
                          onChange={(e) => setNewMarket({ ...newMarket, title: e.target.value })}
                          placeholder="Enter market title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newMarket.category || ''}
                          onChange={(e) => setNewMarket({ ...newMarket, category: e.target.value })}
                          placeholder="e.g., Cryptocurrency, Sports, Politics"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newMarket.description || ''}
                        onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })}
                        placeholder="Describe the market and resolution criteria"
                        rows={3}
                      />
                    </div>

                    {/* Outcomes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Market Outcomes</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOutcome}
                          disabled={newMarket.outcomes && newMarket.outcomes.length >= 10}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Outcome
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {newMarket.outcomes?.map((outcome, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="flex-1">
                              <Input
                                value={outcome.title}
                                onChange={(e) => updateOutcome(index, 'title', e.target.value)}
                                placeholder={`Outcome ${index + 1} title`}
                              />
                            </div>
                            <div className="w-32">
                              <Input
                                type="number"
                                value={outcome.probability}
                                onChange={(e) => updateOutcome(index, 'probability', parseFloat(e.target.value) || 0)}
                                placeholder="Probability %"
                                min="0"
                                max="100"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOutcome(index)}
                              disabled={newMarket.outcomes && newMarket.outcomes.length <= 2}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="minBet">Minimum Bet</Label>
                        <Input
                          id="minBet"
                          type="number"
                          value={newMarket.minBet || 10}
                          onChange={(e) => setNewMarket({ ...newMarket, minBet: parseFloat(e.target.value) || 10 })}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxBet">Maximum Bet</Label>
                        <Input
                          id="maxBet"
                          type="number"
                          value={newMarket.maxBet || 10000}
                          onChange={(e) => setNewMarket({ ...newMarket, maxBet: parseFloat(e.target.value) || 10000 })}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="feePercentage">Fee Percentage</Label>
                        <Input
                          id="feePercentage"
                          type="number"
                          value={newMarket.feePercentage || 2.5}
                          onChange={(e) => setNewMarket({ ...newMarket, feePercentage: parseFloat(e.target.value) || 2.5 })}
                          min="0"
                          max="10"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateMarket}>
                      Create Market
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Outcomes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentMarket.outcomes.map((outcome) => (
          <Card 
            key={outcome.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedOutcome === outcome.id ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedOutcome(outcome.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {outcome.icon}
                  <h3 className="font-semibold">{outcome.title}</h3>
                </div>
                <Badge variant="secondary" className={`${outcome.color} bg-current/10`}>
                  {outcome.probability}%
                </Badge>
              </div>
              
              {outcome.description && (
                <p className="text-sm text-muted-foreground mb-3">{outcome.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Probability</span>
                  <span className="font-semibold">{outcome.probability}%</span>
                </div>
                <Progress value={outcome.probability} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Odds</span>
                  <span className="font-semibold">{outcome.odds.toFixed(2)}x</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-semibold">{formatCurrency(outcome.volume)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Liquidity</span>
                  <span className="font-semibold">{formatCurrency(outcome.liquidity)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Betting Interface */}
      {currentMarket.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Place Your Bet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Selected Outcome</Label>
                  <div className="p-3 border rounded-lg bg-secondary/20">
                    {selectedOutcome ? (
                      <div className="flex items-center gap-2">
                        {currentMarket.outcomes.find(o => o.id === selectedOutcome)?.icon}
                        <span className="font-semibold">
                          {currentMarket.outcomes.find(o => o.id === selectedOutcome)?.title}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select an outcome above</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="betAmount">Bet Amount (USD)</Label>
                  <Input
                    id="betAmount"
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                    min={currentMarket.minBet}
                    max={currentMarket.maxBet}
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confidence">Confidence Level</Label>
                  <div className="space-y-2">
                    <Input
                      id="confidence"
                      type="number"
                      value={confidence}
                      onChange={(e) => setConfidence(parseInt(e.target.value) || 50)}
                      min="1"
                      max="100"
                    />
                    <Progress value={confidence} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Potential Payout</div>
                  <div className="text-lg font-semibold">
                    {selectedOutcome && betAmount > 0 ? (
                      formatCurrency(betAmount * (currentMarket.outcomes.find(o => o.id === selectedOutcome)?.odds || 1))
                    ) : (
                      '$0.00'
                    )}
                  </div>
                </div>
                <Button 
                  onClick={() => setShowBetDialog(true)}
                  disabled={!selectedOutcome || betAmount < currentMarket.minBet || betAmount > currentMarket.maxBet}
                  className="bg-primary hover:bg-primary/90"
                >
                  Place Bet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Market Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentMarket.participants}</div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{formatCurrency(currentMarket.totalVolume)}</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{formatCurrency(currentMarket.totalLiquidity)}</div>
              <div className="text-sm text-muted-foreground">Total Liquidity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{currentMarket.feePercentage}%</div>
              <div className="text-sm text-muted-foreground">Platform Fee</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bet Confirmation Dialog */}
      <Dialog open={showBetDialog} onOpenChange={setShowBetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Bet</DialogTitle>
            <DialogDescription>
              Review your bet details before placing the order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-secondary/20 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outcome:</span>
                <span className="font-semibold">
                  {currentMarket.outcomes.find(o => o.id === selectedOutcome)?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bet Amount:</span>
                <span className="font-semibold">{formatCurrency(betAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-semibold">{confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Odds:</span>
                <span className="font-semibold">
                  {currentMarket.outcomes.find(o => o.id === selectedOutcome)?.odds.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Potential Payout:</span>
                <span className="font-bold text-green-500">
                  {formatCurrency(betAmount * (currentMarket.outcomes.find(o => o.id === selectedOutcome)?.odds || 1))}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBet} className="bg-primary hover:bg-primary/90">
              Confirm Bet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiOutcomeMarket;
