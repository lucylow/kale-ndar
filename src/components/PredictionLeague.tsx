import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Crown, 
  Star, 
  Users, 
  Calendar, 
  Target,
  TrendingUp,
  Award,
  Medal,
  Zap,
  Clock
} from 'lucide-react';

interface LeagueParticipant {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  streak: number;
  rank: number;
  isVerified?: boolean;
  isCurrentUser?: boolean;
}

interface PredictionLeague {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  isJoined: boolean;
  participants: LeagueParticipant[];
  rules: string[];
  rewards: {
    first: number;
    second: number;
    third: number;
    participation: number;
  };
}

interface PredictionLeagueProps {
  league: PredictionLeague;
  onJoinLeague: (leagueId: string) => void;
  onLeaveLeague: (leagueId: string) => void;
  onViewLeaderboard: (leagueId: string) => void;
}

const PredictionLeague: React.FC<PredictionLeagueProps> = ({
  league,
  onJoinLeague,
  onLeaveLeague,
  onViewLeaderboard,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  const topParticipants = league.participants.slice(0, 3);

  return (
    <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-primary hover:-translate-y-1 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{league.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {league.description}
              </p>
            </div>
          </div>
          <Badge 
            variant={league.isActive ? "default" : "secondary"}
            className={league.isActive ? "bg-green-500/10 text-green-500" : ""}
          >
            {league.isActive ? 'Active' : 'Ended'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* League Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">{league.prizePool}</div>
            <div className="text-xs text-muted-foreground">KALE Prize Pool</div>
          </div>
          <div className="text-center p-3 bg-accent-teal/10 rounded-lg">
            <div className="text-2xl font-bold text-accent-teal">{league.currentParticipants}</div>
            <div className="text-xs text-muted-foreground">Participants</div>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {formatTimeRemaining(league.endDate)}
          </span>
        </div>

        {/* Top Participants */}
        {topParticipants.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Leaderboard
            </h4>
            <div className="space-y-2">
              {topParticipants.map((participant) => (
                <div 
                  key={participant.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    participant.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getRankIcon(participant.rank)}
                    <span className={`text-sm font-medium ${getRankColor(participant.rank)}`}>
                      #{participant.rank}
                    </span>
                  </div>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="text-xs">
                      {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{participant.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {participant.accuracy}% accuracy • {participant.streak} streak
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{participant.score}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Participation</span>
            <span className="font-medium">
              {league.currentParticipants}/{league.maxParticipants}
            </span>
          </div>
          <Progress 
            value={(league.currentParticipants / league.maxParticipants) * 100} 
            className="h-2"
          />
        </div>

        {/* Rewards Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" />
            Rewards
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <div className="text-sm font-semibold text-yellow-500">1st</div>
              <div className="text-xs text-muted-foreground">{league.rewards.first} KALE</div>
            </div>
            <div className="p-2 bg-gray-400/10 rounded-lg">
              <div className="text-sm font-semibold text-gray-400">2nd</div>
              <div className="text-xs text-muted-foreground">{league.rewards.second} KALE</div>
            </div>
            <div className="p-2 bg-amber-600/10 rounded-lg">
              <div className="text-sm font-semibold text-amber-600">3rd</div>
              <div className="text-xs text-muted-foreground">{league.rewards.third} KALE</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {league.isJoined ? (
            <Button 
              variant="outline" 
              onClick={() => onLeaveLeague(league.id)}
              className="flex-1"
            >
              Leave League
            </Button>
          ) : (
            <Button 
              onClick={() => onJoinLeague(league.id)}
              className="flex-1"
              disabled={!league.isActive || league.currentParticipants >= league.maxParticipants}
            >
              Join League ({league.entryFee} KALE)
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onViewLeaderboard(league.id)}
            className="flex-1"
          >
            View Leaderboard
          </Button>
        </div>

        {/* Details Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>

        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <h4 className="text-sm font-semibold mb-2">Rules</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {league.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-3 w-3 mt-1 text-primary" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Schedule</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Start: {league.startDate.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  End: {league.endDate.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionLeague;
