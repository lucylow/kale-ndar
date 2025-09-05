import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { blockchainService } from '@/services/blockchain';
import { KaleStakeInfo, KaleWorkResult, KaleHarvestResult } from '@/types/market';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Coins, 
  Clock, 
  Zap, 
  Wheat, 
  Sprout, 
  Workflow,
  Activity,
  Target,
  Award,
  Users
} from 'lucide-react';

const KaleStaking: React.FC = () => {
  const { wallet } = useWallet();
  const [stakeInfo, setStakeInfo] = useState<KaleStakeInfo | null>(null);
  const [stakingStats, setStakingStats] = useState<any>(null);
  const [kaleBalance, setKaleBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [workNonce, setWorkNonce] = useState<string>('');
  const [workEntropy, setWorkEntropy] = useState<string>('');
  const [workResult, setWorkResult] = useState<KaleWorkResult | null>(null);
  const [harvestResult, setHarvestResult] = useState<KaleHarvestResult | null>(null);

  useEffect(() => {
    if (wallet.isConnected && wallet.publicKey) {
      loadStakeData();
    }
  }, [wallet.isConnected, wallet.publicKey]);

  const loadStakeData = async () => {
    if (!wallet.publicKey) return;

    try {
      setIsLoading(true);
      const [stakeInfoData, statsData, balanceData] = await Promise.all([
        blockchainService.getStakeInfo(wallet.publicKey),
        blockchainService.getStakingStats(),
        blockchainService.getKaleBalance(wallet.publicKey),
      ]);

      setStakeInfo(stakeInfoData);
      setStakingStats(statsData);
      setKaleBalance(balanceData);
    } catch (error) {
      console.error('Error loading stake data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlant = async () => {
    if (!wallet.isConnected || !wallet.publicKey || !stakeAmount) return;

    try {
      setIsLoading(true);
      const amount = parseFloat(stakeAmount);
      
      if (amount > kaleBalance) {
        alert('Insufficient KALE balance');
        return;
      }

      const result = await blockchainService.plantKale(
        wallet.publicKey,
        amount,
        wallet.signTransaction
      );

      if (result.success) {
        alert(`Successfully planted ${amount} KALE tokens!`);
        setStakeAmount('');
        await loadStakeData();
      } else {
        alert(`Failed to plant: ${result.message}`);
      }
    } catch (error) {
      console.error('Error planting KALE:', error);
      alert('Error planting KALE tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWork = async () => {
    if (!wallet.isConnected || !wallet.publicKey || !workNonce || !workEntropy) return;

    try {
      setIsLoading(true);
      const nonce = parseInt(workNonce);
      const entropy = workEntropy;

      const result = await blockchainService.workKale(
        wallet.publicKey,
        'stake_1', // Mock stake ID
        nonce,
        entropy,
        wallet.signTransaction
      );

      setWorkResult(result);
      alert(`Work completed! Hash: ${result.hash.substring(0, 8)}...`);
      setWorkNonce('');
      setWorkEntropy('');
    } catch (error) {
      console.error('Error performing work:', error);
      alert('Error performing work');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHarvest = async () => {
    if (!wallet.isConnected || !wallet.publicKey) return;

    try {
      setIsLoading(true);
      const result = await blockchainService.harvestKale(
        wallet.publicKey,
        'stake_1', // Mock stake ID
        wallet.signTransaction
      );

      setHarvestResult(result);
      alert(`Harvested ${result.claimedAmount} KALE rewards!`);
      await loadStakeData();
    } catch (error) {
      console.error('Error harvesting:', error);
      alert('Error harvesting rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatDuration = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-12">
        <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Connect Wallet to Stake KALE</h3>
        <p className="text-muted-foreground">Start earning rewards through proof-of-teamwork</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">KALE Staking</h2>
        <p className="text-muted-foreground">
          Stake KALE tokens and earn rewards through proof-of-teamwork
        </p>
      </div>

      {/* Stats Overview */}
      {stakingStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Staked</p>
                  <p className="text-lg font-bold">{stakingStats.totalStaked.toLocaleString()} KALE</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Stakers</p>
                  <p className="text-lg font-bold">{stakingStats.totalStakers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Average APY</p>
                  <p className="text-lg font-bold">{stakingStats.averageAPY.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Rewards Distributed</p>
                  <p className="text-lg font-bold">{stakingStats.totalRewardsDistributed.toLocaleString()} KALE</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Your KALE Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {kaleBalance.toLocaleString()} KALE
          </div>
        </CardContent>
      </Card>

      {/* Plant (Stake) Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sprout className="h-5 w-5" />
            <span>Plant KALE Tokens</span>
          </CardTitle>
          <CardDescription>
            Stake your KALE tokens to start earning rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Amount to stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              onClick={handlePlant} 
              disabled={isLoading || !stakeAmount}
              className="flex items-center space-x-2"
            >
              {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Sprout className="h-4 w-4" />}
              <span>Plant</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Workflow className="h-5 w-5" />
            <span>Proof-of-Teamwork</span>
          </CardTitle>
          <CardDescription>
            Perform computational work to earn additional rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Nonce"
              value={workNonce}
              onChange={(e) => setWorkNonce(e.target.value)}
              disabled={isLoading}
            />
            <Input
              placeholder="Entropy (32 bytes)"
              value={workEntropy}
              onChange={(e) => setWorkEntropy(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleWork} 
            disabled={isLoading || !workNonce || !workEntropy}
            className="w-full flex items-center space-x-2"
          >
            {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            <span>Perform Work</span>
          </Button>
          
          {workResult && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Hash:</span>
                <code className="text-xs">{workResult.hash}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Difficulty:</span>
                <span>{workResult.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Reward:</span>
                <span>{workResult.reward.toFixed(2)} KALE</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Harvest Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wheat className="h-5 w-5" />
            <span>Harvest Rewards</span>
          </CardTitle>
          <CardDescription>
            Claim your accumulated staking rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleHarvest} 
            disabled={isLoading}
            className="w-full flex items-center space-x-2"
          >
            {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Wheat className="h-4 w-4" />}
            <span>Harvest Rewards</span>
          </Button>
          
          {harvestResult && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Claimed:</span>
                <span className="text-primary font-bold">{harvestResult.claimedAmount.toFixed(2)} KALE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Rewards:</span>
                <span>{harvestResult.totalRewards.toFixed(2)} KALE</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Stake Info */}
      {stakeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Your Stake Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staked Amount</p>
                <p className="text-lg font-bold">{stakeInfo.amount.toLocaleString()} KALE</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current APY</p>
                <p className="text-lg font-bold text-primary">{stakeInfo.apy.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stake Time</p>
                <p className="text-sm">{formatTime(stakeInfo.stakeTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stake Duration</p>
                <p className="text-sm">{formatDuration(stakeInfo.stakeTime)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Accumulated Rewards</span>
                <span className="text-primary font-bold">{stakeInfo.accumulatedRewards.toFixed(2)} KALE</span>
              </div>
              <Progress value={(stakeInfo.accumulatedRewards / 100) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KaleStaking;
