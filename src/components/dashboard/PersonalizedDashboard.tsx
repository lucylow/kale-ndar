import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, TrendingUp, Filter, RotateCcw } from 'lucide-react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useI18n } from '@/contexts/I18nContext';
import { Market } from '@/types/market';
import MarketCard from '../MarketCard';

interface PersonalizedDashboardProps {
  markets: Market[];
  onPlaceBet: (marketId: string, side: boolean, amount: number) => void;
  bettingLoading: string | null;
  formatTimeUntilResolve: (resolveTime: Date) => string;
  calculateOdds: (forAmount: number, againstAmount: number, side: boolean) => number;
  formatAddress: (address: string) => string;
  formatAmount: (amount: number) => string;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  markets,
  onPlaceBet,
  bettingLoading,
  formatTimeUntilResolve,
  calculateOdds,
  formatAddress,
  formatAmount,
}) => {
  const { 
    settings, 
    isMarketFavorite, 
    addFavoriteMarket, 
    removeFavoriteMarket,
    isCategoryFavorite,
    addFavoriteCategory,
    removeFavoriteCategory
  } = usePersonalization();
  const { t } = useI18n();

  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>(markets);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    let filtered = markets;

    if (showFavoritesOnly) {
      filtered = markets.filter(market => 
        isMarketFavorite(market.id) || 
        isCategoryFavorite(market.oracleAsset.code)
      );
    }

    // Sort by favorites first, then by volume
    filtered.sort((a, b) => {
      const aFavorite = isMarketFavorite(a.id);
      const bFavorite = isMarketFavorite(b.id);
      
      if (aFavorite && !bFavorite) return -1;
      if (!aFavorite && bFavorite) return 1;
      
      return (b.totalFor + b.totalAgainst) - (a.totalFor + a.totalAgainst);
    });

    setFilteredMarkets(filtered);
  }, [markets, showFavoritesOnly, settings.favoriteMarkets, settings.favoriteCategories]);

  const toggleMarketFavorite = (marketId: string) => {
    if (isMarketFavorite(marketId)) {
      removeFavoriteMarket(marketId);
    } else {
      addFavoriteMarket(marketId);
    }
  };

  const toggleCategoryFavorite = (category: string) => {
    if (isCategoryFavorite(category)) {
      removeFavoriteCategory(category);
    } else {
      addFavoriteCategory(category);
    }
  };

  const getRecommendedMarkets = () => {
    // Simple recommendation algorithm based on favorite categories
    return markets.filter(market => 
      isCategoryFavorite(market.oracleAsset.code) && 
      !isMarketFavorite(market.id)
    ).slice(0, 3);
  };

  const recommendedMarkets = getRecommendedMarkets();

  return (
    <div className="space-y-6">
      {/* Personalization Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t('dashboard.personalized', 'Your Personalized Dashboard')}
          </h2>
          <p className="text-muted-foreground">
            Markets tailored to your interests and activity
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={showFavoritesOnly ? 'bg-primary/10 text-primary' : ''}
          >
            <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites Only
          </Button>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Favorite Categories */}
      {settings.favoriteCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-primary" />
              Favorite Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {settings.favoriteCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => toggleCategoryFavorite(category)}
                >
                  {category}
                  <button className="ml-1 hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Markets */}
      {recommendedMarkets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-accent-teal" />
              Recommended for You
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on your favorite categories and activity
            </p>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${
              settings.dashboardLayout === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {recommendedMarkets.map((market) => (
                <div key={market.id} className="relative">
                  <MarketCard
                    market={market}
                    onPlaceBet={onPlaceBet}
                    bettingLoading={bettingLoading}
                    formatTimeUntilResolve={formatTimeUntilResolve}
                    calculateOdds={calculateOdds}
                    formatAddress={formatAddress}
                    formatAmount={formatAmount}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 hover:bg-background/80"
                    onClick={() => toggleMarketFavorite(market.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        isMarketFavorite(market.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Markets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {showFavoritesOnly ? 'Your Favorite Markets' : 'All Markets'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredMarkets.length} markets
              </Badge>
              {showFavoritesOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFavoritesOnly(false)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Show All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMarkets.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {showFavoritesOnly 
                  ? "You haven't added any favorite markets yet." 
                  : "No markets available at the moment."}
              </p>
              {showFavoritesOnly && (
                <Button
                  variant="outline"
                  onClick={() => setShowFavoritesOnly(false)}
                  className="mt-4"
                >
                  Browse All Markets
                </Button>
              )}
            </div>
          ) : (
            <div className={`grid gap-4 ${
              settings.dashboardLayout === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : settings.dashboardLayout === 'list'
                ? 'grid-cols-1'
                : 'grid-cols-1 lg:grid-cols-2'
            }`}>
              {filteredMarkets.map((market) => (
                <div key={market.id} className="relative">
                  <MarketCard
                    market={market}
                    onPlaceBet={onPlaceBet}
                    bettingLoading={bettingLoading}
                    formatTimeUntilResolve={formatTimeUntilResolve}
                    calculateOdds={calculateOdds}
                    formatAddress={formatAddress}
                    formatAmount={formatAmount}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 hover:bg-background/80"
                    onClick={() => toggleMarketFavorite(market.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        isMarketFavorite(market.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                  
                  {/* Category favorite toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 text-xs"
                    onClick={() => toggleCategoryFavorite(market.oracleAsset.code)}
                  >
                    <Star 
                      className={`h-3 w-3 ${
                        isCategoryFavorite(market.oracleAsset.code) 
                          ? 'fill-yellow-500 text-yellow-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedDashboard;