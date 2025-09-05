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
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">KALE Farming</h1>
            <p className="text-green-100 text-lg">
              Participate in proof-of-teamwork mining and earn KALE tokens through collaborative farming
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <Sprout className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staked</p>
                <p className="text-2xl font-bold text-gray-900">{farmingStats.totalStaked} KALE</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily Yield</p>
                <p className="text-2xl font-bold text-gray-900">+{farmingStats.dailyYield} KALE</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">APY</p>
                <p className="text-2xl font-bold text-gray-900">{farmingStats.apy}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Size</p>
                <p className="text-2xl font-bold text-gray-900">{farmingStats.teamSize}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
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
              <Card>
                <CardHeader>
                  <CardTitle>Stake KALE Tokens</CardTitle>
                  <CardDescription>
                    Stake your KALE tokens to participate in proof-of-teamwork farming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount to Stake
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <div className="absolute right-3 top-3 text-gray-500">KALE</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available Balance</span>
                      <span className="font-medium">1,234.56 KALE</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Estimated Daily Yield</span>
                      <span className="font-medium text-green-600">+{stakeAmount ? (parseFloat(stakeAmount) * 0.01).toFixed(2) : '0.00'} KALE</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleStake}
                    disabled={!stakeAmount || isStaking}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isStaking ? 'Staking...' : 'Stake KALE'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="harvest" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Harvest Rewards</CardTitle>
                  <CardDescription>
                    Claim your earned KALE tokens from farming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">Available to Harvest</span>
                      <span className="text-green-600 font-bold text-lg">45.78 KALE</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4" />
                      <span>Next harvest available in: {farmingStats.nextHarvest}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Harvest Rewards
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Team Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Your Team</span>
              </CardTitle>
              <CardDescription>
                Collaborate with your team to maximize farming rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{member.contribution}%</p>
                    <p className="text-xs text-gray-500">contribution</p>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
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
