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
  Activity, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Settings,
  Info,
  Star,
  Award,
  Crown,
  Gem,
  Diamond,
  Flame,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Trophy,
  Medal
} from 'lucide-react';

interface ScalarRange {
  id: string;
  min: number;
  max: number;
  label: string;
  probability: number;
  odds: number;
  volume: number;
  liquidity: number;
  color: string;
  isExact?: boolean; // For exact value predictions
}

interface ScalarMarket {
  id: string;
  title: string;
  description: string;
  scalarType: 'price' | 'percentage' | 'count' | 'ratio' | 'temperature' | 'custom';
  unit: string;
  ranges: ScalarRange[];
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
  currentValue?: number;
  historicalData?: { value: number; timestamp: number }[];
  minRange: number;
  maxRange: number;
  precision: number; // Decimal places
}

interface ScalarMarketProps {
  market?: ScalarMarket;
  onBet?: (rangeId: string, amount: number, confidence: number) => void;
  onCreateMarket?: (marketData: Partial<ScalarMarket>) => void;
  onViewDetails?: (marketId: string) => void;
  showCreateButton?: boolean;
}

const ScalarMarket: React.FC<ScalarMarketProps> = ({
  market,
  onBet,
  onCreateMarket,
  onViewDetails,
  showCreateButton = false,
}) => {
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(50);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newMarket, setNewMarket] = useState<Partial<ScalarMarket>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'ranges' | 'analytics' | 'history'>('overview');

  // Mock scalar market data
  const mockMarket: ScalarMarket = {
    id: 'scalar_1',
    title: 'Exact Bitcoin Price on December 31, 2024',
    description: 'Predict the exact Bitcoin price at market close on December 31, 2024. Price will be determined by CoinGecko at 11:59 PM UTC.',
    scalarType: 'price',
    unit: 'USD',
    ranges: [
      {
        id: 'range_1',
        min: 0,
        max: 50000,
        label: 'Under $50,000',
        probability: 5,
        odds: 20.0,
        volume: 50000,
        liquidity: 100000,
        color: 'text-red-500'
      },
      {
        id: 'range_2',
        min: 50000,
        max: 60000,
        label: '$50,000 - $60,000',
        probability: 10,
        odds: 10.0,
        volume: 100000,
        liquidity: 200000,
        color: 'text-orange-500'
      },
      {
        id: 'range_3',
        min: 60000,
        max: 70000,
        label: '$60,000 - $70,000',
        probability: 15,
        odds: 6.67,
        volume: 150000,
        liquidity: 300000,
        color: 'text-yellow-500'
      },
      {
        id: 'range_4',
        min: 70000,
        max: 80000,
        label: '$70,000 - $80,000',
        probability: 25,
        odds: 4.0,
        volume: 250000,
        liquidity: 500000,
        color: 'text-green-500'
      },
      {
        id: 'range_5',
        min: 80000,
        max: 90000,
        label: '$80,000 - $90,000',
        probability: 20,
        odds: 5.0,
        volume: 200000,
        liquidity: 400000,
        color: 'text-blue-500'
      },
      {
        id: 'range_6',
        min: 90000,
        max: 100000,
        label: '$90,000 - $100,000',
        probability: 15,
        odds: 6.67,
        volume: 150000,
        liquidity: 300000,
        color: 'text-purple-500'
      },
      {
        id: 'range_7',
        min: 100000,
        max: 150000,
        label: '$100,000 - $150,000',
        probability: 8,
        odds: 12.5,
        volume: 80000,
        liquidity: 160000,
        color: 'text-indigo-500'
      },
      {
        id: 'range_8',
        min: 150000,
        max: Infinity,
        label: 'Over $150,000',
        probability: 2,
        odds: 50.0,
        volume: 20000,
        liquidity: 40000,
        color: 'text-pink-500'
      }
    ],
    creator: 'PriceOracle',
    category: 'Cryptocurrency',
    tags: ['crypto', 'btc', 'price', 'exact', 'scalar'],
    startTime: Date.now() - 86400000,
    endTime: Date.now() + 7776000000, // 90 days
    resolutionTime: Date.now() + 7776000000 + 86400000, // 91 days
    totalVolume: 1000000,
    totalLiquidity: 2000000,
    participants: 892,
    status: 'active',
    resolutionSource: 'oracle',
    minBet: 20,
    maxBet: 100000,
    feePercentage: 2.5,
    isPublic: true,
    createdAt: Date.now() - 86400000,
    currentValue: 85000,
    historicalData: [
      { value: 82000, timestamp: Date.now() - 86400000 },
      { value: 83500, timestamp: Date.now() - 43200000 },
      { value: 84500, timestamp: Date.now() - 21600000 },
      { value: 85000, timestamp: Date.now() }
    ],
    minRange: 0,
    maxRange: 200000,
    precision: 0
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

  const formatValue = (value: number) => {
    if (currentMarket.scalarType === 'price') {
      return formatCurrency(value);
    } else if (currentMarket.scalarType === 'percentage') {
      return `${value}%`;
    } else if (currentMarket.scalarType === 'temperature') {
      return `${value}°C`;
    } else {
      return value.toString();
    }
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

  const getRangeColor = (range: ScalarRange) => {
    const colors = [
      'bg-red-500/10 border-red-500/20',
      'bg-orange-500/10 border-orange-500/20',
      'bg-yellow-500/10 border-yellow-500/20',
      'bg-green-500/10 border-green-500/20',
      'bg-blue-500/10 border-blue-500/20',
      'bg-purple-500/10 border-purple-500/20',
      'bg-indigo-500/10 border-indigo-500/20',
      'bg-pink-500/10 border-pink-500/20'
    ];
    return colors[parseInt(range.id.split('_')[1]) - 1] || 'bg-gray-500/10 border-gray-500/20';
  };

  const handleBet = () => {
    if (selectedRange && betAmount > 0 && onBet) {
      onBet(selectedRange, betAmount, confidence);
      setShowBetDialog(false);
      setSelectedRange('');
      setBetAmount(0);
      setConfidence(50);
    }
  };

  const addRange = () => {
    const ranges = newMarket.ranges || [];
    const newRange: ScalarRange = {
      id: `range_${ranges.length + 1}`,
      min: 0,
      max: 100,
      label: '',
      probability: 0,
      odds: 0,
      volume: 0,
      liquidity: 0,
      color: 'text-gray-500'
    };
    setNewMarket({ ...newMarket, ranges: [...ranges, newRange] });
  };

  const removeRange = (index: number) => {
    const ranges = newMarket.ranges || [];
    if (ranges.length > 2) {
      setNewMarket({ ...newMarket, ranges: ranges.filter((_, i) => i !== index) });
    }
  };

  const updateRange = (index: number, field: keyof ScalarRange, value: any) => {
    const ranges = newMarket.ranges || [];
    const updatedRanges = [...ranges];
    updatedRanges[index] = { ...updatedRanges[index], [field]: value };
    setNewMarket({ ...newMarket, ranges: updatedRanges });
  };

  return (
    <div className="space-y-6">
      {/* Market Header */}
      <Card className="bg-gradient-card border-white/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <Badge variant="secondary" className="text-xs">
                  Scalar Market
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
                    Create Scalar Market
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Scalar Market</DialogTitle>
                    <DialogDescription>
                      Create a scalar prediction market for exact numerical values
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Market Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Market Title</Label>
                        <Input
                          id="title"
                          value={newMarket.title || ''}
                          onChange={(e) => setNewMarket({ ...newMarket, title: e.target.value })}
                          placeholder="e.g., Exact BTC price on Dec 31, 2024"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newMarket.category || ''}
                          onChange={(e) => setNewMarket({ ...newMarket, category: e.target.value })}
                          placeholder="e.g., Cryptocurrency, Economics, Weather"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Market Description</Label>
                      <Textarea
                        id="description"
                        value={newMarket.description || ''}
                        onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })}
                        placeholder="Describe the scalar market and resolution criteria"
                        rows={3}
                      />
                    </div>

                    {/* Scalar Type and Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scalarType">Scalar Type</Label>
                        <Select 
                          value={newMarket.scalarType} 
                          onValueChange={(value: any) => setNewMarket({ ...newMarket, scalarType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select scalar type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="ratio">Ratio</SelectItem>
                            <SelectItem value="temperature">Temperature</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          value={newMarket.unit || ''}
                          onChange={(e) => setNewMarket({ ...newMarket, unit: e.target.value })}
                          placeholder="e.g., USD, %, count, °C"
                        />
                      </div>
                    </div>

                    {/* Range Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="minRange">Minimum Range</Label>
                        <Input
                          id="minRange"
                          type="number"
                          value={newMarket.minRange || 0}
                          onChange={(e) => setNewMarket({ ...newMarket, minRange: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxRange">Maximum Range</Label>
                        <Input
                          id="maxRange"
                          type="number"
                          value={newMarket.maxRange || 100}
                          onChange={(e) => setNewMarket({ ...newMarket, maxRange: parseFloat(e.target.value) || 100 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="precision">Precision (Decimal Places)</Label>
                        <Input
                          id="precision"
                          type="number"
                          value={newMarket.precision || 0}
                          onChange={(e) => setNewMarket({ ...newMarket, precision: parseInt(e.target.value) || 0 })}
                          min="0"
                          max="8"
                        />
                      </div>
                    </div>

                    {/* Ranges */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Price Ranges</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addRange}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Range
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {newMarket.ranges?.map((range, index) => (
                          <div key={index} className="p-4 border rounded-lg space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <Label>Min Value</Label>
                                <Input
                                  type="number"
                                  value={range.min}
                                  onChange={(e) => updateRange(index, 'min', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <Label>Max Value</Label>
                                <Input
                                  type="number"
                                  value={range.max}
                                  onChange={(e) => updateRange(index, 'max', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <Label>Label</Label>
                                <Input
                                  value={range.label}
                                  onChange={(e) => updateRange(index, 'label', e.target.value)}
                                  placeholder="e.g., $50K - $60K"
                                />
                              </div>
                              <div>
                                <Label>Probability %</Label>
                                <Input
                                  type="number"
                                  value={range.probability}
                                  onChange={(e) => updateRange(index, 'probability', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                Range: {formatValue(range.min)} - {formatValue(range.max)}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRange(index)}
                                disabled={newMarket.ranges && newMarket.ranges.length <= 2}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                          value={newMarket.minBet || 20}
                          onChange={(e) => setNewMarket({ ...newMarket, minBet: parseFloat(e.target.value) || 20 })}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxBet">Maximum Bet</Label>
                        <Input
                          id="maxBet"
                          type="number"
                          value={newMarket.maxBet || 100000}
                          onChange={(e) => setNewMarket({ ...newMarket, maxBet: parseFloat(e.target.value) || 100000 })}
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
                    <Button onClick={() => onCreateMarket?.(newMarket)}>
                      Create Market
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-secondary/20 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <Eye className="h-4 w-4" /> },
          { id: 'ranges', label: 'Ranges', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <PieChart className="h-4 w-4" /> },
          { id: 'history', label: 'History', icon: <Activity className="h-4 w-4" /> }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Value */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Current Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatValue(currentMarket.currentValue || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Current {currentMarket.scalarType} value
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Range Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Range Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentMarket.ranges.map((range) => (
                  <div key={range.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{range.label}</span>
                      <span className="text-muted-foreground">{range.probability}%</span>
                    </div>
                    <Progress value={range.probability} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatValue(range.min)} - {formatValue(range.max)}</span>
                      <span>Odds: {range.odds.toFixed(2)}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'ranges' && (
        <div className="space-y-6">
          {/* Ranges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMarket.ranges.map((range) => (
              <Card 
                key={range.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRange === range.id ? 'ring-2 ring-primary bg-primary/5' : ''
                } ${getRangeColor(range)}`}
                onClick={() => setSelectedRange(range.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{range.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatValue(range.min)} - {formatValue(range.max)}
                      </p>
                    </div>
                    <Badge variant="secondary" className={`${range.color} bg-current/10`}>
                      {range.probability}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Probability</span>
                      <span className="font-semibold">{range.probability}%</span>
                    </div>
                    <Progress value={range.probability} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Odds</span>
                      <span className="font-semibold">{range.odds.toFixed(2)}x</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-semibold">{formatCurrency(range.volume)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Liquidity</span>
                      <span className="font-semibold">{formatCurrency(range.liquidity)}</span>
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
                      <Label>Selected Range</Label>
                      <div className="p-3 border rounded-lg bg-secondary/20">
                        {selectedRange ? (
                          <div>
                            <div className="font-semibold">
                              {currentMarket.ranges.find(r => r.id === selectedRange)?.label}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatValue(currentMarket.ranges.find(r => r.id === selectedRange)?.min || 0)} - 
                              {formatValue(currentMarket.ranges.find(r => r.id === selectedRange)?.max || 0)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Select a range above</span>
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
                        {selectedRange && betAmount > 0 ? (
                          formatCurrency(betAmount * (currentMarket.ranges.find(r => r.id === selectedRange)?.odds || 1))
                        ) : (
                          '$0.00'
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => setShowBetDialog(true)}
                      disabled={!selectedRange || betAmount < currentMarket.minBet || betAmount > currentMarket.maxBet}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Place Bet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Market Analytics
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
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Historical Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentMarket.historicalData?.map((dataPoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{formatValue(dataPoint.value)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(dataPoint.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Data Point</div>
                    <div className="font-semibold">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bet Confirmation Dialog */}
      <Dialog open={showBetDialog} onOpenChange={setShowBetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Scalar Bet</DialogTitle>
            <DialogDescription>
              Review your bet details before placing the order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-secondary/20 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Range:</span>
                <span className="font-semibold">
                  {currentMarket.ranges.find(r => r.id === selectedRange)?.label}
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
                  {currentMarket.ranges.find(r => r.id === selectedRange)?.odds.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Potential Payout:</span>
                <span className="font-bold text-green-500">
                  {formatCurrency(betAmount * (currentMarket.ranges.find(r => r.id === selectedRange)?.odds || 1))}
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

export default ScalarMarket;
