import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  Users, 
  Crown,
  Star,
  ThumbsUp,
  Copy,
  UserPlus
} from 'lucide-react';
import { Market } from '@/types/market';

interface SocialBet {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  marketId: string;
  outcome: boolean;
  amount: number;
  odds: number;
  reasoning?: string;
  confidence: number;
  likes: number;
  comments: number;
  shares: number;
  isPublic: boolean;
  timestamp: number;
  isVerified?: boolean;
  streak?: number;
  followers?: number;
}

interface SocialBettingProps {
  market: Market;
  onPlaceSocialBet: (bet: Omit<SocialBet, 'id' | 'timestamp'>) => void;
  onLikeBet: (betId: string) => void;
  onCommentBet: (betId: string, comment: string) => void;
  onFollowUser: (userId: string) => void;
  onCopyBet: (betId: string) => void;
}

const SocialBetting: React.FC<SocialBettingProps> = ({
  market,
  onPlaceSocialBet,
  onLikeBet,
  onCommentBet,
  onFollowUser,
  onCopyBet,
}) => {
  const [showBetForm, setShowBetForm] = useState(false);
  const [betForm, setBetForm] = useState({
    outcome: true,
    amount: 100,
    reasoning: '',
    confidence: 50,
    isPublic: true,
  });
  const [commentForm, setCommentForm] = useState<{ [betId: string]: string }>({});

  // Mock social bets data
  const [socialBets, setSocialBets] = useState<SocialBet[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'CryptoOracle',
      userAvatar: '/avatars/crypto-oracle.jpg',
      marketId: market.id,
      outcome: true,
      amount: 500,
      odds: 2.1,
      reasoning: 'Strong technical indicators suggest upward momentum. Historical data shows 78% accuracy in similar market conditions.',
      confidence: 85,
      likes: 23,
      comments: 5,
      shares: 3,
      isPublic: true,
      timestamp: Date.now() - 3600000,
      isVerified: true,
      streak: 12,
      followers: 1250,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'MarketAnalyst',
      marketId: market.id,
      outcome: false,
      amount: 300,
      odds: 1.8,
      reasoning: 'Market sentiment is bearish. Expecting a correction based on recent volatility patterns.',
      confidence: 72,
      likes: 15,
      comments: 2,
      shares: 1,
      isPublic: true,
      timestamp: Date.now() - 7200000,
      streak: 8,
      followers: 890,
    },
  ]);

  const handlePlaceBet = () => {
    const newBet: Omit<SocialBet, 'id' | 'timestamp'> = {
      userId: 'current-user',
      userName: 'You',
      marketId: market.id,
      ...betForm,
      likes: 0,
      comments: 0,
      shares: 0,
    };

    onPlaceSocialBet(newBet);
    setShowBetForm(false);
    setBetForm({
      outcome: true,
      amount: 100,
      reasoning: '',
      confidence: 50,
      isPublic: true,
    });
  };

  const handleLike = (betId: string) => {
    setSocialBets(prev => prev.map(bet => 
      bet.id === betId ? { ...bet, likes: bet.likes + 1 } : bet
    ));
    onLikeBet(betId);
  };

  const handleComment = (betId: string) => {
    const comment = commentForm[betId];
    if (comment.trim()) {
      setSocialBets(prev => prev.map(bet => 
        bet.id === betId ? { ...bet, comments: bet.comments + 1 } : bet
      ));
      onCommentBet(betId, comment);
      setCommentForm(prev => ({ ...prev, [betId]: '' }));
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Social Betting Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Social Predictions</h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {socialBets.length} predictions
          </Badge>
        </div>
        <Button 
          onClick={() => setShowBetForm(!showBetForm)}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Share Prediction
        </Button>
      </div>

      {/* Betting Form */}
      {showBetForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Share Your Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="outcome">Prediction</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={betForm.outcome ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBetForm(prev => ({ ...prev, outcome: true }))}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    FOR
                  </Button>
                  <Button
                    variant={!betForm.outcome ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBetForm(prev => ({ ...prev, outcome: false }))}
                  >
                    AGAINST
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="amount">Amount (KALE)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={betForm.amount}
                  onChange={(e) => setBetForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reasoning">Reasoning (Optional)</Label>
              <Textarea
                id="reasoning"
                placeholder="Share your analysis and reasoning..."
                value={betForm.reasoning}
                onChange={(e) => setBetForm(prev => ({ ...prev, reasoning: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="confidence">Confidence Level</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="confidence"
                    type="range"
                    min="1"
                    max="100"
                    value={betForm.confidence}
                    onChange={(e) => setBetForm(prev => ({ ...prev, confidence: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className={`font-semibold ${getConfidenceColor(betForm.confidence)}`}>
                    {betForm.confidence}%
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={betForm.isPublic}
                  onCheckedChange={(checked) => setBetForm(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">Make prediction public</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handlePlaceBet} className="flex-1">
                Share Prediction
              </Button>
              <Button variant="outline" onClick={() => setShowBetForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Bets Feed */}
      <div className="space-y-4">
        {socialBets.map((bet) => (
          <Card key={bet.id} className="border-white/10 hover:border-primary/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={bet.userAvatar} />
                  <AvatarFallback>
                    {bet.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{bet.userName}</span>
                    {bet.isVerified && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {bet.streak} streak
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(bet.timestamp)}
                    </span>
                  </div>

                  {/* Bet Details */}
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      bet.outcome ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <TrendingUp className={`h-3 w-3 ${bet.outcome ? '' : 'rotate-180'}`} />
                      <span className="text-sm font-medium">
                        {bet.outcome ? 'FOR' : 'AGAINST'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{bet.amount} KALE</span>
                    <span className="text-sm text-muted-foreground">{bet.odds}x odds</span>
                    <span className={`text-sm font-medium ${getConfidenceColor(bet.confidence)}`}>
                      {bet.confidence}% confidence
                    </span>
                  </div>

                  {/* Reasoning */}
                  {bet.reasoning && (
                    <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                      {bet.reasoning}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(bet.id)}
                      className="gap-1"
                    >
                      <Heart className="h-4 w-4" />
                      {bet.likes}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCopyBet(bet.id)}
                      className="gap-1"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Bet
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFollowUser(bet.userId)}
                      className="gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </Button>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      {bet.comments} comments
                    </div>
                  </div>

                  {/* Comment Form */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentForm[bet.id] || ''}
                      onChange={(e) => setCommentForm(prev => ({ 
                        ...prev, 
                        [bet.id]: e.target.value 
                      }))}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(bet.id)}
                      disabled={!commentForm[bet.id]?.trim()}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SocialBetting;
