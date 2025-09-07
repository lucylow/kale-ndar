import React, { useState } from 'react';
import { TrendingUp, Clock, Users, DollarSign, Filter, Search, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  predictionMarkets, 
  getOpenMarkets, 
  getSettledMarkets, 
  getMarketStats, 
  getCategoryStats,
  PredictionMarket 
} from '@/data/predictionMarketData';
import MarketList from '@/components/MarketList';
import SimpleVirtualList from '@/components/SimpleVirtualList';
import BetModal from '@/components/BetModal';

const PredictionMarkets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('endDate');
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);

  const stats = getMarketStats();
  const categoryStats = getCategoryStats();
  const openMarkets = getOpenMarkets();
  const settledMarkets = getSettledMarkets();

  const filteredMarkets = predictionMarkets.filter(market => {
    const matchesSearch = market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         market.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    switch (sortBy) {
      case 'endDate':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      case 'totalPool':
        return b.totalPool - a.totalPool;
      case 'totalBets':
        return b.options.reduce((sum, opt) => sum + opt.totalBets, 0) - 
               a.options.reduce((sum, opt) => sum + opt.totalBets, 0);
      default:
        return 0;
    }
  });

  const formatTimeUntilEnd = (endDate: string, status: string): string => {
    if (status === 'settled') return 'Settled';
    if (status === 'cancelled') return 'Cancelled';
    
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handlePlaceBet = async (marketId: string, optionId: string, amount: number) => {
    // Simulate bet placement
    console.log(`Placing bet: Market ${marketId}, Option ${optionId}, Amount $${amount}`);
    
    // In a real app, this would call the smart contract
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    alert(`Bet placed successfully!\n\nMarket: ${selectedMarket?.title}\nOption: ${selectedMarket?.options.find(opt => opt.id === optionId)?.label}\nAmount: $${amount}\n\nTransaction would be submitted to the blockchain.`);
  };

  const MarketCard = ({ market }: { market: PredictionMarket }) => (
    <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift group">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {market.category}
            </Badge>
            <Badge 
              variant={market.status === 'open' ? 'default' : market.status === 'settled' ? 'secondary' : 'destructive'}
              className={`text-xs ${
                market.status === 'open' 
                  ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                  : market.status === 'settled'
                  ? 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                  : 'bg-red-500/20 text-red-500 border-red-500/30'
              }`}
            >
              {market.status === 'open' ? 'Open' : market.status === 'settled' ? 'Settled' : 'Cancelled'}
            </Badge>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatTimeUntilEnd(market.endDate, market.status)}</span>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight text-foreground group-hover:text-primary transition-colors">{market.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{market.description}</CardDescription>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <Users className="w-4 h-4" />
          <span>by {formatAddress(market.creator)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {market.options.map((option) => (
              <div 
                key={option.id} 
                className={`text-center p-3 rounded-lg border transition-all ${
                  market.status === 'settled' && option.result === 'won'
                    ? 'bg-green-500/20 border-green-500/30 ring-2 ring-green-500/20'
                    : market.status === 'settled' && option.result === 'lost'
                    ? 'bg-red-500/10 border-red-500/20 opacity-60'
                    : 'bg-secondary/20 border-white/10'
                }`}
              >
                <div className={`text-lg font-bold ${
                  market.status === 'settled' && option.result === 'won' 
                    ? 'text-green-500' 
                    : 'text-foreground'
                }`}>
                  {option.label}
                </div>
                <div className="text-sm text-muted-foreground">Odds: {option.odds}x</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {option.totalBets} bets • ${option.totalAmount.toLocaleString()}
                </div>
                {market.status === 'settled' && option.result && (
                  <Badge 
                    variant={option.result === 'won' ? 'default' : 'destructive'} 
                    className={`mt-2 ${
                      option.result === 'won' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {option.result === 'won' ? '✓ Won' : '✗ Lost'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="text-sm text-muted-foreground">
              Total Pool: <span className="font-semibold text-foreground">${market.totalPool.toLocaleString()}</span>
            </div>
            <Button 
              variant="hero" 
              size="sm" 
              className="group"
              disabled={market.status === 'settled' || market.status === 'cancelled'}
              onClick={() => {
                if (market.status === 'open') {
                  // Open bet modal
                  setSelectedMarket(market);
                  setBetModalOpen(true);
                } else if (market.status === 'settled') {
                  // Handle view results logic
                  const winningOption = market.options.find(opt => opt.result === 'won');
                  alert(`Market Results: ${market.title}\n\nWinning Option: ${winningOption?.label || 'Unknown'}\nTotal Pool: $${market.totalPool.toLocaleString()}\n\nThis would show detailed results and payout information.`);
                }
              }}
            >
              {market.status === 'open' ? 'Place Bet' : market.status === 'settled' ? 'View Results' : 'Cancelled'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pt-20 px-6">
      <div className="container mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-hero rounded-xl p-8 text-foreground shadow-card border border-white/10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-4 text-gradient">Prediction Markets</h1>
            <p className="text-muted-foreground text-xl">
              Bet on real-world events and earn rewards for accurate predictions
            </p>
          </div>
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-fade-in">
        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Markets</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalMarkets}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Markets</p>
                <p className="text-2xl font-bold text-foreground">{stats.openMarkets}</p>
              </div>
              <div className="w-12 h-12 bg-accent-teal/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Settled Markets</p>
                <p className="text-2xl font-bold text-foreground">{stats.settledMarkets}</p>
              </div>
              <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pool</p>
                <p className="text-2xl font-bold text-foreground">${(stats.totalPool / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-12 h-12 bg-accent-gold/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bets</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalBets.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gradient-card border-white/10 shadow-card animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search markets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-white/20"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-background/50 border-white/20">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/20">
                <SelectItem value="all">All Categories</SelectItem>
                {categoryStats.map((cat) => (
                  <SelectItem key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-background/50 border-white/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/20">
                <SelectItem value="endDate">End Date</SelectItem>
                <SelectItem value="totalPool">Total Pool</SelectItem>
                <SelectItem value="totalBets">Total Bets</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="hero" className="group">
              <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Create Market
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Markets Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Markets</TabsTrigger>
          <TabsTrigger value="open">Open Markets</TabsTrigger>
          <TabsTrigger value="settled">Settled Markets</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="open" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settled" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settledMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Bet Modal */}
      {selectedMarket && (
        <BetModal
          isOpen={betModalOpen}
          onClose={() => {
            setBetModalOpen(false);
            setSelectedMarket(null);
          }}
          market={selectedMarket}
          onPlaceBet={handlePlaceBet}
        />
      )}
      </div>
    </div>
  );
};

export default PredictionMarkets;
