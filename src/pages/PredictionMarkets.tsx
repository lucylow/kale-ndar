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

const PredictionMarkets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('endDate');

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

  const formatTimeUntilEnd = (endDate: string): string => {
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

  const MarketCard = ({ market }: { market: PredictionMarket }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant={market.status === 'open' ? 'default' : 'secondary'}>
            {market.category}
          </Badge>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatTimeUntilEnd(market.endDate)}</span>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight">{market.title}</CardTitle>
        <CardDescription className="text-sm">{market.description}</CardDescription>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
          <Users className="w-4 h-4" />
          <span>by {formatAddress(market.creator)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {market.options.map((option) => (
              <div key={option.id} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">Odds: {option.odds}x</div>
                <div className="text-xs text-gray-500 mt-1">
                  {option.totalBets} bets • ${option.totalAmount.toLocaleString()}
                </div>
                {market.status === 'settled' && option.result && (
                  <Badge variant={option.result === 'won' ? 'default' : 'destructive'} className="mt-2">
                    {option.result === 'won' ? 'Won' : 'Lost'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-gray-600">
              Total Pool: <span className="font-semibold">${market.totalPool.toLocaleString()}</span>
            </div>
            <Button size="sm" variant="outline">
              {market.status === 'open' ? 'Place Bet' : 'View Results'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
            <p className="text-indigo-100 text-lg">
              Bet on real-world events and earn rewards for accurate predictions
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Markets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMarkets}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Markets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openMarkets}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Settled Markets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.settledMarkets}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pool</p>
                <p className="text-2xl font-bold text-gray-900">${(stats.totalPool / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBets.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search markets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryStats.map((cat) => (
                  <SelectItem key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="endDate">End Date</SelectItem>
                <SelectItem value="totalPool">Total Pool</SelectItem>
                <SelectItem value="totalBets">Total Bets</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
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
    </div>
  );
};

export default PredictionMarkets;
