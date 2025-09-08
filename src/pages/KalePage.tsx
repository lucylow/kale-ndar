import React, { useState } from 'react';
import { Sprout, TrendingUp, Users, Clock, ArrowUpRight, Info, Share2, UserPlus, Loader2, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { blockchainService } from '@/services/blockchain';

const KalePage = () => {
  const { toast } = useToast();
  const { wallet } = useWallet();
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const farmingStats = {
    totalStaked: 1234.56,
    dailyYield: 12.34,
    apy: 15.6,
    teamSize: 8,
    nextHarvest: '2h 15m'
  };

  const teamMembers = [
    { name: 'Alice', contribution: 25, status: 'active' },
    { name: 'Bob', contribution: 20, status: 'active' },
    { name: 'Charlie', contribution: 15, status: 'active' },
    { name: 'Diana', contribution: 10, status: 'away' },
  ];

  const handleStake = async () => {
    if (!wallet.isConnected || !wallet.publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to stake KALE tokens",
        variant: "destructive",
      });
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(stakeAmount) > 1234.56) { // Available balance check
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough KALE tokens to stake this amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsStaking(true);

      // Use the blockchain service to stake KALE
      const result = await blockchainService.stakeKale(
        wallet.publicKey,
        parseFloat(stakeAmount),
        wallet.signTransaction
      );

      toast({
        title: "Staking Successful! 🎉",
        description: `Successfully staked ${stakeAmount} KALE tokens`,
        duration: 5000,
      });

      // Clear the input and update UI
      setStakeAmount('');
      
      // In a real app, you would refresh the farming stats here
      console.log('Stake result:', result);

    } catch (error) {
      console.error('Error staking KALE:', error);
      toast({
        title: "Staking Failed",
        description: error instanceof Error ? error.message : "Failed to stake KALE tokens",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleHarvest = async () => {
    if (!wallet.isConnected || !wallet.publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to harvest rewards",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsHarvesting(true);
      
      // Use the blockchain service to harvest KALE
      const result = await blockchainService.harvestKale(
        wallet.publicKey,
        'stake_1', // Mock stake ID - in production this would be dynamic
        wallet.signTransaction
      );
      
      toast({
        title: "Harvest Successful! 🎉",
        description: `Successfully harvested 45.78 KALE tokens`,
        duration: 5000,
      });
      
      // Update farming stats in a real app
      console.log('Harvest result:', result);
      
    } catch (error) {
      console.error('Error harvesting rewards:', error);
      toast({
        title: "Harvest Failed",
        description: error instanceof Error ? error.message : "Failed to harvest rewards",
        variant: "destructive",
      });
    } finally {
      setIsHarvesting(false);
    }
  };

  const handlePlaceBet = (market: any) => {
    if (!wallet.isConnected || !wallet.publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to place bets",
        variant: "destructive",
      });
      return;
    }

    setSelectedMarket(market);
    setSelectedOption(market.options[0].id); // Default to first option
    setBetAmount('');
    setIsBettingModalOpen(true);
  };

  const handleSubmitBet = async () => {
    if (!wallet.isConnected || !wallet.publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to place bets",
        variant: "destructive",
      });
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(betAmount) > 1234.56) { // Available balance check
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough KALE tokens to place this bet",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPlacingBet(true);

      // Use blockchain service to place bet
      const result = await blockchainService.placeBet(
        selectedMarket.id,
        selectedOption === selectedMarket.options[0].id, // true for first option, false for second
        parseFloat(betAmount),
        wallet.publicKey,
        wallet.signTransaction
      );

      if (result.status === 'success') {
        toast({
          title: "Bet Placed Successfully! 🎯",
          description: `Placed ${betAmount} KALE on "${selectedMarket.options.find((o: any) => o.id === selectedOption)?.label}"`,
          duration: 5000,
        });

        // Close modal and reset state
        setIsBettingModalOpen(false);
        setBetAmount('');
        setSelectedOption('');
        setSelectedMarket(null);
      } else {
        throw new Error(result.message || 'Failed to place bet');
      }

    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Bet Failed",
        description: error instanceof Error ? error.message : "Failed to place bet",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleInviteTeamMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the invitation",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsInviting(true);
      
      // Simulate sending invitation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Invitation Sent! 📧",
        description: `Invitation sent to ${inviteEmail}`,
        duration: 5000,
      });
      
      setInviteEmail('');
      setIsInviteDialogOpen(false);
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Invitation Failed",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Mock prediction markets data
  const mockPredictionMarkets = [
    {
      id: '1',
      title: 'Bitcoin to reach $100,000 by end of 2024?',
      description: 'Predict if Bitcoin will reach $100,000 USD by December 31, 2024',
      category: 'Crypto',
      totalPool: 25000,
      endDate: '2024-12-31',
      status: 'open' as const,
      options: [
        { id: '1a', label: 'Yes', odds: 2.1, totalBets: 150, totalAmount: 15000, result: null },
        { id: '1b', label: 'No', odds: 1.8, totalBets: 120, totalAmount: 10000, result: null }
      ],
      creator: 'GAKM7XQPUF6DKLP4QKJ2L3GQ4C7W3NQDRN6XKHGA'
    },
    {
      id: '2',
      title: 'Next US Presidential Election Winner 2028',
      description: 'Who will win the 2028 US Presidential Election?',
      category: 'Politics',
      totalPool: 45000,
      endDate: '2028-11-07',
      status: 'open' as const,
      options: [
        { id: '2a', label: 'Democratic Candidate', odds: 1.9, totalBets: 200, totalAmount: 25000, result: null },
        { id: '2b', label: 'Republican Candidate', odds: 2.0, totalBets: 180, totalAmount: 20000, result: null }
      ],
      creator: 'GBKJ8MNRQP7DKLP4QKJ2L3GQ4C7W3NQDRN6XKHGB'
    },
    {
      id: '3',
      title: 'Tesla Stock Above $300 by Q2 2024?',
      description: 'Will Tesla (TSLA) stock price be above $300 by June 30, 2024?',
      category: 'Stocks',
      totalPool: 18500,
      endDate: '2024-06-30',
      status: 'open' as const,
      options: [
        { id: '3a', label: 'Yes', odds: 1.7, totalBets: 95, totalAmount: 11000, result: null },
        { id: '3b', label: 'No', odds: 2.3, totalBets: 75, totalAmount: 7500, result: null }
      ],
      creator: 'GCLM9XQPUF6DKLP4QKJ2L3GQ4C7W3NQDRN6XKHGC'
    }
  ];

  const formatTimeUntilEnd = (endDate: string): string => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 30) return `${Math.floor(days / 30)}mo ${days % 30}d`;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-white/10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-4 text-gradient">KALE Farming</h1>
            <p className="text-muted-foreground text-xl">
              Participate in proof-of-teamwork mining and earn KALE tokens through collaborative farming
            </p>
          </div>
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <Sprout className="w-10 h-10 text-primary" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staked</p>
                <p className="text-2xl font-bold text-foreground">{farmingStats.totalStaked} KALE</p>
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
                <p className="text-sm text-muted-foreground">Daily Yield</p>
                <p className="text-2xl font-bold text-foreground">+{farmingStats.dailyYield} KALE</p>
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
                <p className="text-sm text-muted-foreground">APY</p>
                <p className="text-2xl font-bold text-foreground">{farmingStats.apy}%</p>
              </div>
              <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="text-2xl font-bold text-foreground">{farmingStats.teamSize}</p>
              </div>
              <div className="w-12 h-12 bg-accent-gold/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staking Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="stake" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stake">Stake KALE</TabsTrigger>
              <TabsTrigger value="harvest">Harvest</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stake" className="space-y-6">
              <Card className="bg-gradient-card border-white/10 shadow-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Stake KALE Tokens</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Stake your KALE tokens to participate in proof-of-teamwork farming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Amount to Stake
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-background/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                      />
                      <div className="absolute right-3 top-3 text-muted-foreground">KALE</div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/20 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available Balance</span>
                      <span className="font-medium text-foreground">1,234.56 KALE</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Estimated Daily Yield</span>
                      <span className="font-medium text-primary">+{stakeAmount ? (parseFloat(stakeAmount) * 0.01).toFixed(2) : '0.00'} KALE</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleStake}
                    disabled={!stakeAmount || isStaking}
                    variant="hero"
                    className="w-full"
                  >
                    {isStaking ? 'Staking...' : 'Stake KALE'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="harvest" className="space-y-6">
              <Card className="bg-gradient-card border-white/10 shadow-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Harvest Rewards</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Claim your earned KALE tokens from farming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-medium">Available to Harvest</span>
                      <span className="text-primary font-bold text-lg">45.78 KALE</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4" />
                      <span>Next harvest available in: {farmingStats.nextHarvest}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={handleHarvest}
                    disabled={isHarvesting}
                  >
                    {isHarvesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Harvesting...
                      </>
                    ) : (
                      'Harvest Rewards'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Team Section */}
        <div>
          <Card className="bg-gradient-card border-white/10 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Users className="w-5 h-5" />
                <span>Your Team</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Collaborate with your team to maximize farming rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{member.contribution}%</p>
                    <p className="text-xs text-muted-foreground">contribution</p>
                  </div>
                </div>
              ))}
              
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full border-white/20 hover:bg-accent/20">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Team Members
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Invite Team Member
                    </DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your KALE farming team and share rewards.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleInviteTeamMember()}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsInviteDialogOpen(false)}
                        disabled={isInviting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleInviteTeamMember}
                        disabled={isInviting}
                      >
                        {isInviting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 mr-2" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Prediction Markets Section */}
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-gradient">Live Prediction Markets</h2>
              <p className="text-muted-foreground">Stake KALE tokens on real-world events</p>
            </div>
            <div className="w-12 h-12 bg-accent-teal/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-teal" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* KALE-Reflector Ecosystem Diagram */}
            <div className="md:col-span-2 lg:col-span-3 mb-6">
              <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-display font-bold text-foreground mb-2">
                      KALE-Reflector Ecosystem
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Comprehensive integration between prediction markets and oracle infrastructure
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src="/lovable-uploads/7dad9ff9-244a-4702-9864-d8034c250efa.png" 
                      alt="KALE-Reflector Ecosystem Diagram" 
                      className="max-w-full h-auto rounded-lg"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {mockPredictionMarkets.map((market) => (
              <Card key={market.id} className="bg-gradient-card border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300 hover-lift group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                      {market.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeUntilEnd(market.endDate)}</span>
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
                        <div key={option.id} className="text-center p-3 bg-secondary/20 rounded-lg border border-white/10 hover:bg-secondary/30 transition-colors cursor-pointer">
                          <div className="text-lg font-bold text-foreground">{option.label}</div>
                          <div className="text-sm text-muted-foreground">Odds: {option.odds}x</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {option.totalBets} bets • {option.totalAmount.toLocaleString()} KALE
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="text-sm text-muted-foreground">
                        Total Pool: <span className="font-semibold text-foreground">{market.totalPool.toLocaleString()} KALE</span>
                      </div>
                      <Button 
                        variant="hero" 
                        size="sm" 
                        className="group"
                        onClick={() => handlePlaceBet(market)}
                      >
                        Place Bet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button variant="outline" className="border-white/20 hover:bg-accent/20">
              View All Markets
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Betting Modal */}
        <Dialog open={isBettingModalOpen} onOpenChange={setIsBettingModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Place Bet
              </DialogTitle>
              <DialogDescription>
                {selectedMarket && `Place your bet on: ${selectedMarket.title}`}
              </DialogDescription>
            </DialogHeader>
            {selectedMarket && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="option">Select Option</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedMarket.options.map((option: any) => (
                      <Button
                        key={option.id}
                        variant={selectedOption === option.id ? "default" : "outline"}
                        className="h-auto p-3 text-left"
                        onClick={() => setSelectedOption(option.id)}
                      >
                        <div>
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-sm text-muted-foreground">Odds: {option.odds}x</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="betAmount">Bet Amount (KALE)</Label>
                  <Input
                    id="betAmount"
                    type="number"
                    placeholder="Enter bet amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="mt-1"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Available: 1,234.56 KALE
                  </div>
                </div>

                {betAmount && selectedOption && (
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Potential Payout:</span>
                        <span className="font-semibold text-primary">
                          {(parseFloat(betAmount) * selectedMarket.options.find((o: any) => o.id === selectedOption)?.odds || 0).toFixed(2)} KALE
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBettingModalOpen(false)}
                    disabled={isPlacingBet}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitBet}
                    disabled={isPlacingBet || !betAmount || !selectedOption}
                  >
                    {isPlacingBet ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Bet...
                      </>
                    ) : (
                      'Place Bet'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default KalePage;
