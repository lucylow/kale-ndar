import React, { useState } from 'react';
import { Sprout, TrendingUp, Users, Clock, ArrowUpRight, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const KalePage = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);

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
    setIsStaking(true);
    // Simulate staking process
    setTimeout(() => {
      setIsStaking(false);
      setStakeAmount('');
    }, 2000);
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
                  
                  <Button variant="hero" className="w-full">
                    Harvest Rewards
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
              
              <Button variant="outline" className="w-full border-white/20 hover:bg-accent/20">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Invite Team Members
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KalePage;
