import React, { useState, useEffect } from 'react';
import { Shield, Coins, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import defiService, { Protocol, YieldStrategy, PortfolioPosition, DeFiStats } from '@/services/defiService';
import ProtocolCard from '@/components/defi/ProtocolCard';
import StrategyCard from '@/components/defi/StrategyCard';
import PortfolioCard from '@/components/defi/PortfolioCard';
import DeFiStats from '@/components/defi/DeFiStats';

const DeFiPage = () => {
  const { toast } = useToast();
  const { wallet } = useWallet();
  
  // State management
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [yieldStrategies, setYieldStrategies] = useState<YieldStrategy[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [defiStats, setDefiStats] = useState<DeFiStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadDeFiData();
  }, []);

  const loadDeFiData = async () => {
    try {
      setIsLoading(true);
      const [protocolsData, strategiesData, portfolioData, statsData] = await Promise.all([
        defiService.getProtocols(),
        defiService.getYieldStrategies(),
        defiService.getPortfolio(wallet?.publicKey),
        defiService.getStats()
      ]);

      setProtocols(protocolsData);
      setYieldStrategies(strategiesData);
      setPortfolio(portfolioData);
      setDefiStats(statsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load DeFi data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Protocol exploration handler
  const handleExploreProtocol = async (protocolId: string) => {
    try {
      const result = await defiService.exploreProtocol(protocolId, wallet?.publicKey);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        if (result.connectionUrl) {
          window.open(result.connectionUrl, '_blank');
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  };

  // Strategy start handler
  const handleStartStrategy = async (strategyId: string, amount: number) => {
    try {
      const result = await defiService.startStrategy(strategyId, amount, wallet?.publicKey || '');
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Refresh portfolio data
        const updatedPortfolio = await defiService.getPortfolio(wallet?.publicKey);
        setPortfolio(updatedPortfolio);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  };

  // Portfolio withdrawal handler
  const handleWithdrawPosition = async (positionId: string) => {
    try {
      const result = await defiService.withdrawPosition(positionId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Refresh portfolio data
        const updatedPortfolio = await defiService.getPortfolio(wallet?.publicKey);
        setPortfolio(updatedPortfolio);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  };

  // View protocol analytics
  const handleViewAnalytics = async (protocolId: string) => {
    try {
      const analytics = await defiService.getProtocolAnalytics(protocolId);
      toast({
        title: "Analytics Loaded",
        description: `Analytics data for ${protocols.find(p => p.id === protocolId)?.name} loaded successfully`,
      });
      // Here you could open a modal or navigate to analytics page
      console.log('Analytics data:', analytics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-white/10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-4 text-gradient">DeFi Protocols</h1>
            <p className="text-muted-foreground text-xl">
              Build sophisticated lending, borrowing, and yield farming strategies
            </p>
          </div>
          <div className="w-20 h-20 bg-accent-purple/20 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-accent-purple" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {defiStats && <DeFiStats stats={defiStats} isLoading={isLoading} />}

      <Tabs defaultValue="protocols" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="strategies">Yield Strategies</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-6">
          {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {protocols.map((protocol) => (
                <ProtocolCard
                  key={protocol.id}
                  protocol={protocol}
                  onExplore={handleExploreProtocol}
                  onViewAnalytics={handleViewAnalytics}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {yieldStrategies.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onStartStrategy={handleStartStrategy}
                  userBalance={1000} // Mock balance - in real app, get from wallet
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your DeFi Portfolio</CardTitle>
              <CardDescription>
                Track your positions across different protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
              <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : portfolio.length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Positions</h3>
                  <p className="text-gray-600 mb-4">
                    Start by exploring protocols or yield strategies above
                  </p>
                  <Button onClick={() => window.location.href = '#protocols'}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Explore Protocols
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.map((position) => (
                    <PortfolioCard
                      key={position.id}
                      position={position}
                      onWithdraw={handleWithdrawPosition}
                    />
                  ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeFiPage;
