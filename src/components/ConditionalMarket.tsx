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
  Zap, 
  ArrowRight, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Settings,
  Info,
  BarChart3,
  PieChart,
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
  ExternalLink
} from 'lucide-react';

interface ConditionalRule {
  id: string;
  condition: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
  value: string | number;
  value2?: string | number; // For 'between' operator
  description: string;
  isActive: boolean;
}

interface ConditionalOutcome {
  id: string;
  title: string;
  description: string;
  probability: number;
  odds: number;
  volume: number;
  liquidity: number;
  color: string;
  icon?: React.ReactNode;
  conditions: string[]; // Which conditions must be met
}

interface ConditionalMarket {
  id: string;
  title: string;
  description: string;
  conditionDescription: string;
  rules: ConditionalRule[];
  outcomes: ConditionalOutcome[];
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
  currentData?: any; // Current market data for conditions
}

interface ConditionalMarketProps {
  market?: ConditionalMarket;
  onBet?: (outcomeId: string, amount: number, confidence: number) => void;
  onCreateMarket?: (marketData: Partial<ConditionalMarket>) => void;
  onViewDetails?: (marketId: string) => void;
  showCreateButton?: boolean;
}

const ConditionalMarket: React.FC<ConditionalMarketProps> = ({
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
  const [newMarket, setNewMarket] = useState<Partial<ConditionalMarket>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'conditions' | 'outcomes' | 'analytics'>('overview');

  // Mock conditional market data
  const mockMarket: ConditionalMarket = {
    id: 'conditional_1',
    title: 'If Bitcoin Hits $100K, Then What Happens to Ethereum?',
    description: 'This conditional market explores the relationship between Bitcoin and Ethereum prices. If Bitcoin reaches $100,000, predict what will happen to Ethereum.',
    conditionDescription: 'Bitcoin (BTC) price reaches or exceeds $100,000 USD',
    rules: [
      {
        id: 'rule_1',
        condition: 'BTC_PRICE',
        operator: 'greater_than',
        value: 100000,
        description: 'Bitcoin price must be $100,000 or higher',
        isActive: true
      }
    ],
    outcomes: [
      {
        id: 'eth_rises',
        title: 'Ethereum Rises Above $8K',
        description: 'If BTC hits $100K, ETH will rise above $8,000',
        probability: 45,
        odds: 2.22,
        volume: 450000,
        liquidity: 900000,
        color: 'text-green-500',
        icon: <TrendingUp className="h-4 w-4" />,
        conditions: ['rule_1']
      },
      {
        id: 'eth_stable',
        title: 'Ethereum Stays Stable ($5K-$8K)',
        description: 'If BTC hits $100K, ETH will remain between $5,000-$8,000',
        probability: 30,
        odds: 3.33,
        volume: 300000,
        liquidity: 600000,
        color: 'text-blue-500',
        icon: <Activity className="h-4 w-4" />,
        conditions: ['rule_1']
      },
      {
        id: 'eth_falls',
        title: 'Ethereum Falls Below $5K',
        description: 'If BTC hits $100K, ETH will fall below $5,000',
        probability: 15,
        odds: 6.67,
        volume: 150000,
        liquidity: 300000,
        color: 'text-red-500',
        icon: <TrendingDown className="h-4 w-4" />,
        conditions: ['rule_1']
      },
      {
        id: 'btc_no_100k',
        title: 'Bitcoin Never Hits $100K',
        description: 'Bitcoin fails to reach $100,000 by market end',
        probability: 10,
        odds: 10.0,
        volume: 100000,
        liquidity: 200000,
        color: 'text-gray-500',
        icon: <AlertCircle className="h-4 w-4" />,
        conditions: []
      }
    ],
    creator: 'CryptoAnalyst',
    category: 'Cryptocurrency',
    tags: ['crypto', 'conditional', 'btc', 'eth', 'correlation'],
    startTime: Date.now() - 86400000,
    endTime: Date.now() + 2592000000, // 30 days
    resolutionTime: Date.now() + 2592000000 + 86400000, // 31 days
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
    currentData: {
      btc_price: 85000,
      eth_price: 3200,
      btc_change_24h: 2.5,
      eth_change_24h: 1.8
    }
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

  const evaluateCondition = (rule: ConditionalRule) => {
    if (!currentMarket.currentData) return false;
    
    const currentValue = currentMarket.currentData[rule.condition.toLowerCase()];
    if (currentValue === undefined) return false;
    
    switch (rule.operator) {
      case 'equals':
        return currentValue === rule.value;
      case 'greater_than':
        return currentValue > rule.value;
      case 'less_than':
        return currentValue < rule.value;
      case 'between':
        return currentValue >= rule.value && currentValue <= (rule.value2 || rule.value);
      case 'contains':
        return String(currentValue).includes(String(rule.value));
      default:
        return false;
    }
  };

  const getConditionStatus = (rule: ConditionalRule) => {
    const isMet = evaluateCondition(rule);
    return {
      isMet,
      color: isMet ? 'text-green-500' : 'text-red-500',
      icon: isMet ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />,
      bgColor: isMet ? 'bg-green-500/10' : 'bg-red-500/10'
    };
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

  const addRule = () => {
    const rules = newMarket.rules || [];
    const newRule: ConditionalRule = {
      id: `rule_${rules.length + 1}`,
      condition: '',
      operator: 'greater_than',
      value: '',
      description: '',
      isActive: true
    };
    setNewMarket({ ...newMarket, rules: [...rules, newRule] });
  };

  const removeRule = (index: number) => {
    const rules = newMarket.rules || [];
    if (rules.length > 1) {
      setNewMarket({ ...newMarket, rules: rules.filter((_, i) => i !== index) });
    }
  };

  const updateRule = (index: number, field: keyof ConditionalRule, value: any) => {
    const rules = newMarket.rules || [];
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setNewMarket({ ...newMarket, rules: updatedRules });
  };

  return (
    <div className="space-y-6">
      {/* Market Header */}
      <Card className="bg-gradient-card border-white/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <Badge variant="secondary" className="text-xs">
                  Conditional Market
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
                    Create Conditional Market
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Conditional Market</DialogTitle>
                    <DialogDescription>
                      Create a conditional prediction market with if-then logic
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
                          placeholder="If X happens, then what happens to Y?"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newMarket.category || ''}
                          onChange={(e) => setNewMarket({ ...newMarket, category: e.target.value })}
                          placeholder="e.g., Cryptocurrency, Economics, Politics"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Market Description</Label>
                      <Textarea
                        id="description"
                        value={newMarket.description || ''}
                        onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })}
                        placeholder="Describe the conditional relationship and market logic"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="conditionDescription">Condition Description</Label>
                      <Input
                        id="conditionDescription"
                        value={newMarket.conditionDescription || ''}
                        onChange={(e) => setNewMarket({ ...newMarket, conditionDescription: e.target.value })}
                        placeholder="e.g., Bitcoin price reaches $100,000"
                      />
                    </div>

                    {/* Conditional Rules */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Conditional Rules</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addRule}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Rule
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {newMarket.rules?.map((rule, index) => (
                          <div key={index} className="p-4 border rounded-lg space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label>Condition</Label>
                                <Input
                                  value={rule.condition}
                                  onChange={(e) => updateRule(index, 'condition', e.target.value)}
                                  placeholder="e.g., BTC_PRICE, ETH_PRICE"
                                />
                              </div>
                              <div>
                                <Label>Operator</Label>
                                <Select 
                                  value={rule.operator} 
                                  onValueChange={(value) => updateRule(index, 'operator', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="equals">Equals</SelectItem>
                                    <SelectItem value="greater_than">Greater Than</SelectItem>
                                    <SelectItem value="less_than">Less Than</SelectItem>
                                    <SelectItem value="between">Between</SelectItem>
                                    <SelectItem value="contains">Contains</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Value</Label>
                                <Input
                                  type="number"
                                  value={rule.value}
                                  onChange={(e) => updateRule(index, 'value', parseFloat(e.target.value) || 0)}
                                  placeholder="Threshold value"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input
                                value={rule.description}
                                onChange={(e) => updateRule(index, 'description', e.target.value)}
                                placeholder="Human-readable description of this condition"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={rule.isActive}
                                  onChange={(e) => updateRule(index, 'isActive', e.target.checked)}
                                />
                                <Label className="text-sm">Active</Label>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRule(index)}
                                disabled={newMarket.rules && newMarket.rules.length <= 1}
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
                          value={newMarket.minBet || 25}
                          onChange={(e) => setNewMarket({ ...newMarket, minBet: parseFloat(e.target.value) || 25 })}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxBet">Maximum Bet</Label>
                        <Input
                          id="maxBet"
                          type="number"
                          value={newMarket.maxBet || 50000}
                          onChange={(e) => setNewMarket({ ...newMarket, maxBet: parseFloat(e.target.value) || 50000 })}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="feePercentage">Fee Percentage</Label>
                        <Input
                          id="feePercentage"
                          type="number"
                          value={newMarket.feePercentage || 3.0}
                          onChange={(e) => setNewMarket({ ...newMarket, feePercentage: parseFloat(e.target.value) || 3.0 })}
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
          { id: 'conditions', label: 'Conditions', icon: <Target className="h-4 w-4" /> },
          { id: 'outcomes', label: 'Outcomes', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <PieChart className="h-4 w-4" /> }
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
          {/* Condition Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Condition Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Primary Condition</h4>
                  <p className="text-sm text-muted-foreground mb-3">{currentMarket.conditionDescription}</p>
                  
                  {currentMarket.rules.map((rule) => {
                    const status = getConditionStatus(rule);
                    return (
                      <div key={rule.id} className={`flex items-center gap-3 p-3 rounded-lg ${status.bgColor}`}>
                        {status.icon}
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{rule.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Current: {currentMarket.currentData?.[rule.condition.toLowerCase()] || 'N/A'} | 
                            Required: {rule.operator} {rule.value}
                          </div>
                        </div>
                        <Badge variant="secondary" className={status.color}>
                          {status.isMet ? 'MET' : 'NOT MET'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Market Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Current Market Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-500">
                    {formatCurrency(currentMarket.currentData?.btc_price || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">BTC Price</div>
                  <div className={`text-xs ${(currentMarket.currentData?.btc_change_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(currentMarket.currentData?.btc_change_24h || 0) >= 0 ? '+' : ''}{currentMarket.currentData?.btc_change_24h || 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-500">
                    {formatCurrency(currentMarket.currentData?.eth_price || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">ETH Price</div>
                  <div className={`text-xs ${(currentMarket.currentData?.eth_change_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(currentMarket.currentData?.eth_change_24h || 0) >= 0 ? '+' : ''}{currentMarket.currentData?.eth_change_24h || 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-500">
                    {currentMarket.participants}
                  </div>
                  <div className="text-xs text-muted-foreground">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-500">
                    {formatCurrency(currentMarket.totalVolume)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Volume</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'conditions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conditional Logic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentMarket.rules.map((rule, index) => {
                const status = getConditionStatus(rule);
                return (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {status.icon}
                        <div>
                          <h4 className="font-semibold">Rule {index + 1}</h4>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={status.color}>
                        {status.isMet ? 'CONDITION MET' : 'CONDITION NOT MET'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Condition:</span>
                        <div className="font-semibold">{rule.condition}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Operator:</span>
                        <div className="font-semibold">{rule.operator.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold:</span>
                        <div className="font-semibold">{rule.value}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-secondary/20 rounded">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Current Value: </span>
                        <span className="font-semibold">
                          {currentMarket.currentData?.[rule.condition.toLowerCase()] || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'outcomes' && (
        <div className="space-y-6">
          {/* Outcomes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <p className="text-sm text-muted-foreground mb-3">{outcome.description}</p>
                  
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

      {/* Bet Confirmation Dialog */}
      <Dialog open={showBetDialog} onOpenChange={setShowBetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Conditional Bet</DialogTitle>
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

export default ConditionalMarket;
