import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Vote, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  UserPlus,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  address: string;
  deposit: number;
  vote?: 'approve' | 'reject' | null;
}

interface TeamBet {
  id: string;
  marketId: string;
  marketDescription: string;
  amount: number;
  outcome: 'above' | 'below';
  proposer: string;
  votes: { [memberId: string]: 'approve' | 'reject' };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const TeamBettingDemo = () => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState<'create' | 'join' | 'bet' | 'vote' | 'execute'>('create');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [minDeposit, setMinDeposit] = useState(1000);
  const [maxMembers, setMaxMembers] = useState(5);
  const [betAmount, setBetAmount] = useState(5000);
  const [betOutcome, setBetOutcome] = useState<'above' | 'below'>('above');
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Alex Chen', address: 'GABC...1234', deposit: 5000 },
    { id: '2', name: 'Sarah Kim', address: 'GDEF...5678', deposit: 3000 },
    { id: '3', name: 'Mike Johnson', address: 'GHIJ...9012', deposit: 2000 },
  ]);
  
  const [pendingBets, setPendingBets] = useState<TeamBet[]>([
    {
      id: 'bet1',
      marketId: 'market_btc_100k',
      marketDescription: 'Will Bitcoin reach $100,000 by December 31, 2024?',
      amount: 10000,
      outcome: 'above',
      proposer: 'Alex Chen',
      votes: { '1': 'approve', '2': null, '3': null },
      status: 'pending',
      createdAt: new Date(),
    },
  ]);

  const totalDeposits = teamMembers.reduce((sum, member) => sum + member.deposit, 0);
  const votingProgress = pendingBets.length > 0 
    ? Object.values(pendingBets[0].votes).filter(vote => vote !== null).length / teamMembers.length * 100
    : 0;

  const createTeam = () => {
    toast({
      title: "Team Created! 🎉",
      description: `"${teamName}" team vault created with ${teamMembers.length} members`,
      duration: 3000,
    });
    setActiveStep('join');
  };

  const joinTeam = () => {
    const newMember: TeamMember = {
      id: '4',
      name: 'Demo User',
      address: 'GDEM...0000',
      deposit: minDeposit,
    };
    setTeamMembers([...teamMembers, newMember]);
    toast({
      title: "Joined Team! 👥",
      description: `Successfully joined "${teamName}" with ${minDeposit} KALE deposit`,
      duration: 3000,
    });
    setActiveStep('bet');
  };

  const proposeBet = () => {
    const newBet: TeamBet = {
      id: `bet${Date.now()}`,
      marketId: 'market_btc_100k',
      marketDescription: 'Will Bitcoin reach $100,000 by December 31, 2024?',
      amount: betAmount,
      outcome: betOutcome,
      proposer: 'Demo User',
      votes: { '4': null },
      status: 'pending',
      createdAt: new Date(),
    };
    setPendingBets([...pendingBets, newBet]);
    toast({
      title: "Bet Proposed! 📊",
      description: `Proposed ${betAmount} KALE bet on BTC ${betOutcome} $100k`,
      duration: 3000,
    });
    setActiveStep('vote');
  };

  const voteOnBet = (betId: string, vote: 'approve' | 'reject') => {
    setPendingBets(bets => 
      bets.map(bet => 
        bet.id === betId 
          ? { 
              ...bet, 
              votes: { ...bet.votes, '4': vote },
              status: Object.values({ ...bet.votes, '4': vote }).filter(v => v !== null).length >= Math.ceil(teamMembers.length / 2)
                ? 'approved' 
                : 'pending'
            }
          : bet
      )
    );
    
    toast({
      title: vote === 'approve' ? "Vote Cast! ✅" : "Vote Cast! ❌",
      description: `You voted ${vote} on the team bet`,
      duration: 3000,
    });
    
    if (vote === 'approve') {
      setTimeout(() => setActiveStep('execute'), 2000);
    }
  };

  const executeBet = () => {
    toast({
      title: "Bet Executed! 🚀",
      description: "Team bet has been placed on the market successfully",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Team Betting Demo - "Proof-of-Teamwork" Betting Vaults
          </CardTitle>
          <CardDescription>
            Experience collaborative betting where friends pool KALE tokens and vote on bets together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Demo Mode
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {teamMembers.length} Members
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${(totalDeposits / 1000).toFixed(0)}K Pool
            </Badge>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-4">
            {['create', 'join', 'bet', 'vote', 'execute'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeStep === step 
                    ? 'bg-blue-500 text-white' 
                    : ['create', 'join', 'bet', 'vote', 'execute'].indexOf(activeStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  activeStep === step ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {index < 4 && <div className="w-8 h-0.5 bg-gray-200 ml-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Create Team */}
      {activeStep === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Step 1: Create Team Vault
            </CardTitle>
            <CardDescription>
              Set up a collaborative betting team with your friends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Crypto Bulls Squad"
                />
              </div>
              <div>
                <Label htmlFor="minDeposit">Minimum Deposit (KALE)</Label>
                <Input
                  id="minDeposit"
                  type="number"
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Team Description</Label>
              <Textarea
                id="description"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="We predict BTC will moon! Join us for collaborative betting..."
              />
            </div>
            
            <div>
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <Input
                id="maxMembers"
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
              />
            </div>
            
            <Button onClick={createTeam} className="w-full">
              Create Team Vault
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Join Team */}
      {activeStep === 'join' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Step 2: Join Team
            </CardTitle>
            <CardDescription>
              Join the team with your KALE deposit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Team: "{teamName}"</h4>
              <p className="text-sm text-gray-600 mb-3">{teamDescription}</p>
              <div className="flex items-center gap-4 text-sm">
                <span>Min Deposit: {minDeposit} KALE</span>
                <span>Max Members: {maxMembers}</span>
                <span>Current: {teamMembers.length}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="deposit">Your Deposit (KALE)</Label>
              <Input
                id="deposit"
                type="number"
                value={minDeposit}
                onChange={(e) => setMinDeposit(Number(e.target.value))}
              />
            </div>
            
            <Button onClick={joinTeam} className="w-full">
              Join Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Propose Bet */}
      {activeStep === 'bet' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Step 3: Propose Team Bet
            </CardTitle>
            <CardDescription>
              Propose a bet for the team to vote on
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Available Market</h4>
              <p className="text-sm">Will Bitcoin reach $100,000 by December 31, 2024?</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Current Price: $85,000</span>
                <span>Target: $100,000</span>
                <span>Resolves: Dec 31, 2024</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="betAmount">Bet Amount (KALE)</Label>
                <Input
                  id="betAmount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="betOutcome">Prediction</Label>
                <div className="flex gap-2">
                  <Button
                    variant={betOutcome === 'above' ? 'default' : 'outline'}
                    onClick={() => setBetOutcome('above')}
                    className="flex-1"
                  >
                    Above $100k
                  </Button>
                  <Button
                    variant={betOutcome === 'below' ? 'default' : 'outline'}
                    onClick={() => setBetOutcome('below')}
                    className="flex-1"
                  >
                    Below $100k
                  </Button>
                </div>
              </div>
            </div>
            
            <Button onClick={proposeBet} className="w-full">
              Propose Team Bet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Vote on Bet */}
      {activeStep === 'vote' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Step 4: Vote on Team Bet
            </CardTitle>
            <CardDescription>
              Team members vote on the proposed bet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingBets.map((bet) => (
              <div key={bet.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{bet.marketDescription}</h4>
                    <p className="text-sm text-gray-600">
                      Proposed by {bet.proposer} • {bet.amount} KALE • {bet.outcome} $100k
                    </p>
                  </div>
                  <Badge variant={bet.status === 'approved' ? 'default' : 'secondary'}>
                    {bet.status}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Voting Progress</span>
                    <span>{Math.round(votingProgress)}%</span>
                  </div>
                  <Progress value={votingProgress} className="h-2" />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => voteOnBet(bet.id, 'approve')}
                    className="flex-1"
                    variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => voteOnBet(bet.id, 'reject')}
                    className="flex-1"
                    variant="outline"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Execute Bet */}
      {activeStep === 'execute' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Step 5: Execute Approved Bet
            </CardTitle>
            <CardDescription>
              The team bet has been approved and is ready to execute
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ Bet Approved!</h4>
              <p className="text-sm text-green-700">
                The team has voted to approve the bet. Ready to execute on the market.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h5 className="font-semibold mb-2">Bet Details</h5>
                <div className="space-y-1 text-sm">
                  <div>Market: Bitcoin $100k by Dec 2024</div>
                  <div>Amount: {pendingBets[0]?.amount} KALE</div>
                  <div>Outcome: {pendingBets[0]?.outcome}</div>
                  <div>Team Pool: {totalDeposits} KALE</div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h5 className="font-semibold mb-2">Team Members</h5>
                <div className="space-y-1 text-sm">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex justify-between">
                      <span>{member.name}</span>
                      <span>{member.deposit} KALE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Button onClick={executeBet} className="w-full">
              Execute Team Bet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Team Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${(totalDeposits / 1000).toFixed(0)}K</div>
              <div className="text-sm text-gray-600">Total Pool</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{pendingBets.length}</div>
              <div className="text-sm text-gray-600">Pending Bets</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamBettingDemo;
