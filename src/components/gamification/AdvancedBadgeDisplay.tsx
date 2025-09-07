import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Zap, 
  Crown, 
  Shield, 
  Target,
  Users,
  Calendar,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdvancedBadgeProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: {
    level: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
    color: string;
    glowEffect: boolean;
    animationType: 'none' | 'pulse' | 'rotate' | 'float' | 'sparkle';
    dropRate: number;
  };
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  unlockConditions: Array<{
    type: string;
    operator: string;
    value: any;
    description: string;
  }>;
  rewards: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  isSecret: boolean;
  isTimeLimited: boolean;
  expiresAt?: number;
  metadata: {
    difficulty: number;
    estimatedTimeToEarn: number;
    popularity: number;
    tags: string[];
  };
  progress?: number;
  maxProgress?: number;
  isEarned?: boolean;
  earnedAt?: number;
}

const rarityIcons = {
  common: Star,
  uncommon: Star,
  rare: Trophy,
  epic: Crown,
  legendary: Crown,
  mythic: Zap,
};

const rarityColors = {
  common: 'text-gray-500',
  uncommon: 'text-green-500',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-orange-500',
  mythic: 'text-red-500',
};

const animationClasses = {
  none: '',
  pulse: 'animate-pulse',
  rotate: 'animate-spin',
  float: 'animate-bounce',
  sparkle: 'animate-pulse',
};

export const AdvancedBadgeCard: React.FC<AdvancedBadgeProps> = ({
  id,
  name,
  description,
  icon,
  rarity,
  category,
  unlockConditions,
  rewards,
  isSecret,
  isTimeLimited,
  expiresAt,
  metadata,
  progress = 0,
  maxProgress = 100,
  isEarned = false,
  earnedAt,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isRevealed, setIsRevealed] = useState(!isSecret || isEarned);

  const RarityIcon = rarityIcons[rarity.level];
  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;
  const timeRemaining = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-500';
    if (difficulty <= 6) return 'text-yellow-500';
    if (difficulty <= 8) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'xp': return '⭐';
      case 'kale': return '🌿';
      case 'badge': return '🏆';
      case 'title': return '👑';
      case 'access': return '🔓';
      case 'discount': return '💰';
      default: return '🎁';
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      rarity.glowEffect ? 'shadow-lg' : ''
    } ${isEarned ? 'ring-2 ring-yellow-400' : ''}`}>
      {/* Rarity Glow Effect */}
      {rarity.glowEffect && (
        <div 
          className="absolute inset-0 opacity-20 blur-sm"
          style={{ 
            background: `linear-gradient(45deg, ${rarity.color}, transparent)`,
            animation: rarity.animationType === 'pulse' ? 'pulse 2s infinite' : 'none'
          }}
        />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`text-3xl ${animationClasses[rarity.animationType]}`}>
              {isRevealed ? icon : '❓'}
            </div>
            <div>
              <CardTitle className="text-lg font-bold flex items-center space-x-2">
                <span className={rarityColors[rarity.level]}>
                  {isRevealed ? name : 'Secret Badge'}
                </span>
                <RarityIcon className={`w-5 h-5 ${rarityColors[rarity.level]}`} />
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{category.name}</span>
                <span>•</span>
                <span className="capitalize">{rarity.level}</span>
                <span>•</span>
                <span>{metadata.popularity}% earned</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isSecret && !isEarned && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRevealed(!isRevealed)}
              >
                {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {isRevealed && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}

        {/* Progress Bar */}
        {!isEarned && isRevealed && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}/{maxProgress}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Earned Status */}
        {isEarned && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-700">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">Earned!</span>
              {earnedAt && (
                <span className="text-sm">
                  {new Date(earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Time Limited Badge */}
        {isTimeLimited && timeRemaining > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-700">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {daysRemaining} days remaining
              </span>
            </div>
          </div>
        )}

        {/* Detailed Information */}
        {showDetails && isRevealed && (
          <div className="space-y-4 pt-4 border-t">
            {/* Difficulty and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 text-sm">
                  <Target className="w-4 h-4" />
                  <span>Difficulty:</span>
                  <span className={`font-medium ${getDifficultyColor(metadata.difficulty)}`}>
                    {metadata.difficulty}/10
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Est. Time:</span>
                  <span className="font-medium">
                    {metadata.estimatedTimeToEarn}h
                  </span>
                </div>
              </div>
            </div>

            {/* Unlock Conditions */}
            <div>
              <h4 className="font-medium text-sm mb-2">Unlock Conditions:</h4>
              <ul className="space-y-1">
                {unlockConditions.map((condition, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span>{condition.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rewards */}
            <div>
              <h4 className="font-medium text-sm mb-2">Rewards:</h4>
              <div className="flex flex-wrap gap-2">
                {rewards.map((reward, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <span className="mr-1">{getRewardIcon(reward.type)}</span>
                    {reward.description}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-medium text-sm mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-1">
                {metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const BadgeCollection: React.FC<{
  badges: AdvancedBadgeProps[];
  title?: string;
  showEarnedOnly?: boolean;
}> = ({ badges, title = "Badge Collection", showEarnedOnly = false }) => {
  const filteredBadges = showEarnedOnly 
    ? badges.filter(badge => badge.isEarned)
    : badges;

  const earnedCount = badges.filter(badge => badge.isEarned).length;
  const totalCount = badges.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="text-sm text-gray-500">
          {earnedCount}/{totalCount} badges earned
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => (
          <AdvancedBadgeCard key={badge.id} {...badge} />
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            {showEarnedOnly ? 'No badges earned yet' : 'No badges available'}
          </h3>
          <p className="text-gray-400">
            {showEarnedOnly 
              ? 'Start making predictions to earn your first badge!'
              : 'Check back later for new badges.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export const BadgeNotification: React.FC<{
  badge: AdvancedBadgeProps;
  onClose: () => void;
}> = ({ badge, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-2 border-yellow-400 shadow-lg animate-slide-in">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="text-4xl animate-bounce">
              {badge.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-yellow-600">
                Badge Earned!
              </h3>
              <p className="text-sm text-gray-600">
                You've earned the <strong>{badge.name}</strong> badge!
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {badge.rarity.level}
                </Badge>
                <span className="text-xs text-gray-500">
                  {badge.category.name}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
