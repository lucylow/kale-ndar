import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { 
  Users, 
  Plus, 
  Trophy, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Vote,
  Target,
  Zap,
  Crown,
  Star,
  Activity
} from 'lucide-react';

interface TeamVault {
  id: string;
  name: string;
  description: string;
  creator: string;
  members: TeamMember[];
  totalDeposits: string;
  totalBets: string;
  totalPayouts: string;
  createdAt: number;
  isActive: boolean;
  teamType: 'friends' | 'public' | 'competitive';
  minDeposit: string;
  maxMembers: number;
  bettingStrategy: 'consensus' | 'majority' | 'individual';
}

interface TeamMember {
  address: string;
  nickname: string;
  depositAmount: string;
  joinedAt: number;
  isActive: boolean;
  votingPower: string;
  betCount: number;
  totalWinnings: string;
}

interface TeamBet {
  id: string;
  teamId: string;
  marketId: string;
  outcome: string;
  amount: string;
  placedBy: string;
  approvedBy: string[];
  rejectedBy: string[];
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  createdAt: number;
  executedAt?: number;
  transactionHash?: string;
  payoutAmount?: string;
  isWinner?: boolean;
}

const TeamCollaboration: React.FC = () => {
  const { toast } = useToast();
  const { wallet } = useWallet();
  const [teams, setTeams] = useState<TeamVault[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamVault | null>(null);
  const [teamBets, setTeamBets] = useState<TeamBet[]>([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [isProposingBet, setIsProposingBet] = useState(false);

  // Team creation form
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    teamType: 'friends' as const,
    minDeposit: '100',
    maxMembers: 10,
    bettingStrategy: 'majority' as const,
  });

  // Join team form
  const [joinForm, setJoinForm] = useState({
    teamId: '',
    nickname: '',
    depositAmount: '500',
  });

  // Bet proposal form
  const [betForm, setBetForm] = useState({
    marketId: '',
    outcome: '',
    amount: '1000',
    description: '',
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockTeams: TeamVault[] = [
      {
        id: 'team-1',
        name: 'Crypto Bulls Squad',
        description: 'We predict BTC will moon!',
        creator: 'GABC123...',
        members: [
          {
            address: 'GABC123...',
            nickname: 'BullTrader',
            depositAmount: '5000',
            joinedAt: Date.now() - 86400000,
            isActive: true,
            votingPower: '50',
            betCount: 5,
            totalWinnings: '1200',
          },
          {
            address: 'GDEF456...',
            nickname: 'CryptoKing',
            depositAmount: '3000',
            joinedAt: Date.now() - 43200000,
            isActive: true,
            votingPower: '30',
            betCount: 3,
            totalWinnings: '800',
          },
        ],
        totalDeposits: '8000',
        totalBets: '5000',
        totalPayouts: '2000',
        createdAt: Date.now() - 86400000,
        isActive: true,
        teamType: 'competitive',
        minDeposit: '100',
        maxMembers: 5,
        bettingStrategy: 'majority',
      },
    ];

    const mockBets: TeamBet[] = [
      {
        id: 'bet-1',
        teamId: 'team-1',
        marketId: 'market-1',
        outcome: 'above',
        amount: '1000',
        placedBy: 'GABC123...',
        approvedBy: ['GABC123...', 'GDEF456...'],
        rejectedBy: [],
        status: 'executed',
        createdAt: Date.now() - 3600000,
        executedAt: Date.now() - 3000000,
        transactionHash: 'tx123...',
        payoutAmount: '1500',
        isWinner: true,
      },
      {
        id: 'bet-2',
        teamId: 'team-1',
        marketId: 'market-2',
        outcome: 'below',
        amount: '2000',
        placedBy: 'GDEF456...',
        approvedBy: ['GDEF456...'],
        rejectedBy: ['GABC123...'],
        status: 'pending',
        createdAt: Date.now() - 1800000,
      },
    ];

    setTeams(mockTeams);
    setTeamBets(mockBets);
  }, []);

  const handleCreateTeam = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a team",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newTeam: TeamVault = {
        id: `team-${Date.now()}`,
        name: teamForm.name,
        description: teamForm.description,
        creator: wallet.publicKey!,
        members: [{
          address: wallet.publicKey!,
          nickname: 'Creator',
          depositAmount: '0',
          joinedAt: Date.now(),
          isActive: true,
          votingPower: '100',
          betCount: 0,
          totalWinnings: '0',
        }],
        totalDeposits: '0',
        totalBets: '0',
        totalPayouts: '0',
        createdAt: Date.now(),
        isActive: true,
        teamType: teamForm.teamType,
        minDeposit: teamForm.minDeposit,
        maxMembers: teamForm.maxMembers,
        bettingStrategy: teamForm.bettingStrategy,
      };

      setTeams(prev => [newTeam, ...prev]);
      setIsCreatingTeam(false);
      setTeamForm({
        name: '',
        description: '',
        teamType: 'friends',
        minDeposit: '100',
        maxMembers: 10,
        bettingStrategy: 'majority',
      });

      toast({
        title: "Team Created! 🎉",
        description: `Your team "${teamForm.name}" has been created successfully`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleJoinTeam = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join a team",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const team = teams.find(t => t.id === joinForm.teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      const newMember: TeamMember = {
        address: wallet.publicKey!,
        nickname: joinForm.nickname,
        depositAmount: joinForm.depositAmount,
        joinedAt: Date.now(),
        isActive: true,
        votingPower: (parseInt(joinForm.depositAmount) / 100).toString(),
        betCount: 0,
        totalWinnings: '0',
      };

      setTeams(prev => prev.map(team => 
        team.id === joinForm.teamId 
          ? { ...team, members: [...team.members, newMember] }
          : team
      ));

      setIsJoiningTeam(false);
      setJoinForm({ teamId: '', nickname: '', depositAmount: '500' });

      toast({
        title: "Joined Team! 🎉",
        description: `You've successfully joined "${team.name}"`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Join Failed",
        description: "Failed to join team. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleVoteOnBet = async (betId: string, vote: 'approve' | 'reject') => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to vote",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTeamBets(prev => prev.map(bet => {
        if (bet.id === betId) {
          const updatedBet = { ...bet };
          if (vote === 'approve') {
            updatedBet.approvedBy = [...bet.approvedBy, wallet.publicKey!];
          } else {
            updatedBet.rejectedBy = [...bet.rejectedBy, wallet.publicKey!];
          }
          
          // Check if bet should be executed
          if (updatedBet.approvedBy.length > updatedBet.rejectedBy.length) {
            updatedBet.status = 'executed';
            updatedBet.executedAt = Date.now();
          }
          
          return updatedBet;
        }
        return bet;
      }));

      toast({
        title: "Vote Recorded! ✅",
        description: `Your ${vote} vote has been recorded`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const getTeamStats = (team: TeamVault) => {
    const executedBets = teamBets.filter(bet => bet.teamId === team.id && bet.status === 'executed');
    const winningBets = executedBets.filter(bet => bet.isWinner);
    const winRate = executedBets.length > 0 ? (winningBets.length / executedBets.length) * 100 : 0;
    
    return {
      totalBets: executedBets.length,
      winRate,
      totalPayouts: team.totalPayouts,
      averageBetSize: executedBets.length > 0 
        ? (parseInt(team.totalBets) / executedBets.length).toFixed(0)
        : '0',
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-white/10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-4 text-gradient">Team Collaboration</h1>
            <p className="text-muted-foreground text-xl">
              Create teams, pool resources, and make collaborative predictions with proof-of-teamwork
            </p>
          </div>
          <div className="w-20 h-20 bg-accent-teal/20 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-accent-teal" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Crypto Bulls Squad"
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">Description</Label>
                <Textarea
                  id="teamDescription"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your team's strategy..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamType">Team Type</Label>
                  <Select
                    value={teamForm.teamType}
                    onValueChange={(value: any) => setTeamForm(prev => ({ ...prev, teamType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="competitive">Competitive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxMembers">Max Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    value={teamForm.maxMembers}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    min="2"
                    max="20"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bettingStrategy">Betting Strategy</Label>
                <Select
                  value={teamForm.bettingStrategy}
                  onValueChange={(value: any) => setTeamForm(prev => ({ ...prev, bettingStrategy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consensus">Consensus (80% agreement)</SelectItem>
                    <SelectItem value="majority">Majority Vote</SelectItem>
                    <SelectItem value="individual">Individual Decisions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreatingTeam(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Create Team
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isJoiningTeam} onOpenChange={setIsJoiningTeam}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Join Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Join Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="selectTeam">Select Team</Label>
                <Select
                  value={joinForm.teamId}
                  onValueChange={(value) => setJoinForm(prev => ({ ...prev, teamId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.members.length}/{team.maxMembers})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={joinForm.nickname}
                  onChange={(e) => setJoinForm(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="Your team nickname"
                />
              </div>
              <div>
                <Label htmlFor="depositAmount">Deposit Amount (KALE)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  value={joinForm.depositAmount}
                  onChange={(e) => setJoinForm(prev => ({ ...prev, depositAmount: e.target.value }))}
                  placeholder="500"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsJoiningTeam(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleJoinTeam} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Join Team
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const stats = getTeamStats(team);
          return (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    {team.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {team.teamType}
                  </Badge>
                </div>
                <CardDescription>{team.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Members</p>
                    <p className="font-semibold">{team.members.length}/{team.maxMembers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Deposits</p>
                    <p className="font-semibold">{parseInt(team.totalDeposits).toLocaleString()} KALE</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className="font-semibold text-green-600">{stats.winRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Bets</p>
                    <p className="font-semibold">{stats.totalBets}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Strategy</span>
                    <Badge variant="outline" className="text-xs">
                      {team.bettingStrategy}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Min Deposit</span>
                    <span className="font-medium">{team.minDeposit} KALE</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedTeam(team)}
                  className="w-full"
                  variant="outline"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {selectedTeam.name}
              </DialogTitle>
              <CardDescription>{selectedTeam.description}</CardDescription>
            </DialogHeader>

            <Tabs defaultValue="members" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="bets">Team Bets</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                <div className="space-y-3">
                  {selectedTeam.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {member.nickname[0]}
                        </div>
                        <div>
                          <p className="font-medium">{member.nickname}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.address.slice(0, 8)}...{member.address.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{member.depositAmount} KALE</p>
                        <Badge variant="outline" className="text-xs">
                          {member.votingPower}% voting power
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="bets" className="space-y-4">
                <div className="space-y-3">
                  {teamBets.filter(bet => bet.teamId === selectedTeam.id).map((bet) => (
                    <div key={bet.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Market Bet</span>
                        </div>
                        <Badge 
                          variant={bet.status === 'executed' ? 'default' : bet.status === 'pending' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {bet.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Outcome</p>
                          <p className="font-medium">{bet.outcome}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium">{bet.amount} KALE</p>
                        </div>
                      </div>

                      {bet.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleVoteOnBet(bet.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVoteOnBet(bet.id, 'reject')}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {bet.status === 'executed' && bet.isWinner && (
                        <div className="mt-3 p-2 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            🎉 Winner! Payout: {bet.payoutAmount} KALE
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-lg font-bold text-green-600">{getTeamStats(selectedTeam).winRate.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Total Bets</p>
                      <p className="text-lg font-bold">{getTeamStats(selectedTeam).totalBets}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Total Payouts</p>
                      <p className="text-lg font-bold">{parseInt(selectedTeam.totalPayouts).toLocaleString()} KALE</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Avg Bet Size</p>
                      <p className="text-lg font-bold">{getTeamStats(selectedTeam).averageBetSize} KALE</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamCollaboration;
