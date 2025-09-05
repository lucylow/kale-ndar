import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Loader2, TrendingUp, RefreshCw, Zap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Constants
const KALE_ASSET_CODE = 'KALE';
const KALE_ASSET_ISSUER = 'GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE';
const REFLECTOR_CONTRACT_ID = 'CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M';

interface PortfolioPosition {
  assetCode: string;
  assetIssuer?: string;
  amount: number;
  targetWeight: number;
  price?: string;
  value?: number;
}

interface RebalanceAction {
  assetCode: string;
  assetIssuer?: string;
  currentAmount: number;
  price: number;
  adjustment: number;
  action: 'buy' | 'sell' | 'hold';
}

interface UserWalletInfo {
  publicKey: string;
  balance: number;
  stakeInfo?: {
    totalStaked: number;
    activeStakes: number;
    pendingRewards: number;
    apy: number;
  };
}

// Helper: Format large fixed decimal prices
function formatPrice(priceStr: string, decimals = 14): string {
  if (!priceStr) return '-';
  const num = BigInt(priceStr);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const fraction = num % divisor;
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fractionStr ? `${whole}.${fractionStr}` : whole.toString();
}

export const YieldOptimizer: React.FC = () => {
  const [userWallet, setUserWallet] = useState<UserWalletInfo | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([
    { assetCode: KALE_ASSET_CODE, assetIssuer: KALE_ASSET_ISSUER, amount: 1000, targetWeight: 0.7, price: '', value: 0 },
    { assetCode: 'USDC', assetIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', amount: 500, targetWeight: 0.3, price: '', value: 0 },
  ]);
  const [isFarming, setIsFarming] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [lastRebalanceActions, setLastRebalanceActions] = useState<RebalanceAction[]>([]);

  // Logging helper
  const log = useCallback((msg: string) => {
    setLogMessages((msgs) => [...msgs.slice(-20), `${new Date().toLocaleTimeString()}: ${msg}`]);
  }, []);

  // Load user wallet information
  useEffect(() => {
    async function fetchUserWallet() {
      try {
        const { data, error } = await supabase.functions.invoke('user-wallet/profile');
        if (error) throw error;
        
        setUserWallet(data);
        log(`Loaded wallet: ${data.publicKey}`);
      } catch (err: any) {
        log(`Error loading wallet: ${err.message}`);
        toast.error('Failed to load wallet information');
      }
    }
    fetchUserWallet();
  }, [log]);

  // Fetch Reflector prices for all portfolio assets
  const fetchPrices = useCallback(async () => {
    if (!userWallet || portfolio.length === 0) return;

    setIsLoadingPrices(true);
    try {
      const updatedPortfolio = await Promise.all(
        portfolio.map(async (pos) => {
          const assetId = pos.assetIssuer ? `${pos.assetCode}:${pos.assetIssuer}` : pos.assetCode;
          
          const { data, error } = await supabase.functions.invoke('reflector-price', {
            body: {},
            headers: {},
          });

          if (error) throw error;

          const url = new URL('/', window.location.origin);
          url.searchParams.set('contract', REFLECTOR_CONTRACT_ID);
          url.searchParams.set('asset', assetId);

          const response = await fetch(`https://kkehvvfmcjsqitxkkmts.supabase.co/functions/v1/reflector-price?contract=${REFLECTOR_CONTRACT_ID}&asset=${assetId}`, {
            headers: {
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWh2dmZtY2pzcWl0eGtrbXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjQyMTEsImV4cCI6MjA3MjM0MDIxMX0.69fEHRmdVFg8FJ6oBvgD1glnJe5u1ds1jy8SAOLyx8Q`,
            },
          });

          if (!response.ok) throw new Error(`Error fetching price for ${assetId}: ${response.status}`);
          
          const priceData = await response.json();
          const formattedPrice = priceData.formattedPrice || formatPrice(priceData.price);
          const value = Number(formattedPrice) * pos.amount;
          
          return { ...pos, price: formattedPrice, value };
        })
      );
      
      setPortfolio(updatedPortfolio);
      log('Updated portfolio prices from Reflector oracle');
    } catch (err: any) {
      log(`Price fetch error: ${err.message}`);
      toast.error('Failed to fetch latest prices');
    } finally {
      setIsLoadingPrices(false);
    }
  }, [userWallet, portfolio.length, log]);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Calculate total portfolio value
  const totalValue = portfolio.reduce((sum, pos) => sum + (pos.value || 0), 0);

  // Trigger portfolio rebalance
  const rebalancePortfolio = async () => {
    if (!userWallet) {
      toast.error('No wallet connected');
      return;
    }
    
    setIsRebalancing(true);
    log('Starting portfolio rebalance...');
    
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-rebalance', {
        body: { portfolio },
      });

      if (error) throw error;

      setLastRebalanceActions(data.actions);
      log(`Rebalance completed. Total value: $${data.totalValue.toFixed(2)}`);
      toast.success('Portfolio rebalanced successfully');
    } catch (err: any) {
      log(`Rebalance error: ${err.message}`);
      toast.error('Failed to rebalance portfolio');
    } finally {
      setIsRebalancing(false);
    }
  };

  // Trigger KALE farming cycle
  const triggerFarming = async () => {
    setIsFarming(true);
    log('Starting KALE farming cycle...');
    
    try {
      const { data, error } = await supabase.functions.invoke('kale-farm-cycle');
      
      if (error) throw error;

      log(`Farm cycle completed! Rewards: ${data.totalRewards.toFixed(2)} KALE`);
      toast.success(`Farming completed! Earned ${data.totalRewards.toFixed(2)} KALE`);
    } catch (err: any) {
      log(`Farming error: ${err.message}`);
      toast.error('Failed to complete farming cycle');
    } finally {
      setIsFarming(false);
    }
  };

  // Render portfolio table
  const renderPortfolio = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-medium">Asset</th>
            <th className="text-right p-2 font-medium">Amount</th>
            <th className="text-right p-2 font-medium">Price (USD)</th>
            <th className="text-right p-2 font-medium">Value (USD)</th>
            <th className="text-right p-2 font-medium">Target Weight</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.map((pos, index) => (
            <tr key={`${pos.assetCode}:${pos.assetIssuer || 'native'}`} className="border-b border-border/50">
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{pos.assetCode}</Badge>
                </div>
              </td>
              <td className="text-right p-2 font-mono">{pos.amount.toLocaleString()}</td>
              <td className="text-right p-2 font-mono">{pos.price || '-'}</td>
              <td className="text-right p-2 font-mono">${(pos.value || 0).toFixed(2)}</td>
              <td className="text-right p-2">
                <Badge variant="secondary">{(pos.targetWeight * 100).toFixed(1)}%</Badge>
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-primary/20 font-bold">
            <td colSpan={3} className="p-2">Total Portfolio Value</td>
            <td className="text-right p-2 font-mono">${totalValue.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // Render rebalance actions
  const renderRebalanceActions = () => {
    if (lastRebalanceActions.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Last Rebalance Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lastRebalanceActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="font-medium">{action.assetCode}</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={action.action === 'buy' ? 'default' : action.action === 'sell' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {action.action}
                  </Badge>
                  {action.action !== 'hold' && (
                    <span className="font-mono text-xs">
                      {Math.abs(action.adjustment).toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Automated Multi-Asset Yield Optimizer</h1>
        <p className="text-muted-foreground">
          Leveraging KALE farming and Reflector oracle price feeds for optimal DeFi yields
        </p>
      </div>

      {/* Wallet Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Wallet Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userWallet ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Public Key</p>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1">
                  {userWallet.publicKey}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">KALE Balance</p>
                <p className="text-2xl font-bold">{userWallet.balance.toFixed(2)}</p>
              </div>
              {userWallet.stakeInfo && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Staked</p>
                    <p className="text-2xl font-bold">{userWallet.stakeInfo.totalStaked.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current APY</p>
                    <p className="text-2xl font-bold text-green-600">{userWallet.stakeInfo.apy.toFixed(1)}%</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading wallet information...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Portfolio
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchPrices}
              disabled={isLoadingPrices}
            >
              {isLoadingPrices ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Prices
            </Button>
          </div>
          <CardDescription>
            Real-time portfolio tracking with Reflector oracle price feeds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderPortfolio()}
          <Separator className="my-4" />
          <div className="flex gap-2">
            <Button 
              onClick={rebalancePortfolio} 
              disabled={!userWallet || isRebalancing}
              className="flex items-center gap-2"
            >
              {isRebalancing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {isRebalancing ? 'Rebalancing...' : 'Rebalance Portfolio'}
            </Button>
          </div>
          {renderRebalanceActions()}
        </CardContent>
      </Card>

      {/* KALE Farming */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            KALE Farming Automation
          </CardTitle>
          <CardDescription>
            Automated plant, work, and harvest cycles for optimal KALE rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userWallet?.stakeInfo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Stakes</p>
                  <p className="text-xl font-bold">{userWallet.stakeInfo.activeStakes}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Rewards</p>
                  <p className="text-xl font-bold text-green-600">
                    {userWallet.stakeInfo.pendingRewards.toFixed(2)} KALE
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <Progress value={75} className="mt-1" />
                </div>
              </div>
            )}
            <Button 
              onClick={triggerFarming} 
              disabled={isFarming || !userWallet}
              className="flex items-center gap-2"
              size="lg"
            >
              {isFarming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isFarming ? 'Running Farm Cycle...' : 'Run Farming Cycle (plant, work, harvest)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Real-time system activity and transaction logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
              {logMessages.length > 0 ? logMessages.join('\n') : 'No activity yet...'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};