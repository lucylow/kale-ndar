export interface UserProfile {
  id: string;
  address: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  joinDate: string;
  lastActive: string;
  level: number;
  xp: number;
  badges: Badge[];
  stats: UserStats;
  preferences: UserPreferences;
  achievements: Achievement[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

export interface UserStats {
  totalBets: number;
  totalWinnings: number;
  winRate: number;
  streak: number;
  longestStreak: number;
  favoriteCategory: string;
  totalVolume: number;
  rank: number;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    marketUpdates: boolean;
    priceAlerts: boolean;
    achievements: boolean;
  };
  privacy: {
    showStats: boolean;
    showBets: boolean;
    showProfile: boolean;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'bet_won' | 'bet_lost' | 'market_settled' | 'price_alert' | 'achievement' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export const mockUserProfiles: UserProfile[] = [
  {
    id: "user1",
    address: "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
    username: "stellar_trader",
    displayName: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Crypto enthusiast and prediction market expert. Love analyzing market trends and making strategic bets.",
    joinDate: "2024-01-15T10:30:00Z",
    lastActive: "2024-02-20T18:00:00Z",
    level: 12,
    xp: 2450,
    badges: [
      {
        id: "badge1",
        name: "First Bet",
        description: "Placed your first prediction",
        icon: "🎯",
        rarity: "common",
        earnedAt: "2024-01-15T11:00:00Z"
      },
      {
        id: "badge2",
        name: "Win Streak",
        description: "Won 5 bets in a row",
        icon: "🔥",
        rarity: "rare",
        earnedAt: "2024-02-10T15:30:00Z"
      },
      {
        id: "badge3",
        name: "Crypto Expert",
        description: "Won 20 cryptocurrency predictions",
        icon: "₿",
        rarity: "epic",
        earnedAt: "2024-02-18T09:15:00Z"
      }
    ],
    stats: {
      totalBets: 45,
      totalWinnings: 12500,
      winRate: 68.9,
      streak: 3,
      longestStreak: 8,
      favoriteCategory: "Cryptocurrency",
      totalVolume: 25000,
      rank: 15
    },
    preferences: {
      theme: "dark",
      notifications: {
        email: true,
        push: true,
        marketUpdates: true,
        priceAlerts: false,
        achievements: true
      },
      privacy: {
        showStats: true,
        showBets: true,
        showProfile: true
      }
    },
    achievements: [
      {
        id: "ach1",
        name: "Prediction Master",
        description: "Win 50 predictions",
        icon: "🏆",
        progress: 45,
        maxProgress: 50,
        unlocked: false,
        rarity: "legendary"
      },
      {
        id: "ach2",
        name: "Volume Trader",
        description: "Trade $100,000 total volume",
        icon: "💰",
        progress: 25000,
        maxProgress: 100000,
        unlocked: false,
        rarity: "epic"
      },
      {
        id: "ach3",
        name: "Streak Master",
        description: "Achieve a 10-win streak",
        icon: "⚡",
        progress: 8,
        maxProgress: 10,
        unlocked: false,
        rarity: "rare"
      }
    ]
  },
  {
    id: "user2",
    address: "GDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
    username: "kale_farmer",
    displayName: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "DeFi farmer and KALE token enthusiast. Focused on sustainable yield strategies and long-term predictions.",
    joinDate: "2024-02-20T14:15:00Z",
    lastActive: "2024-02-20T17:45:00Z",
    level: 8,
    xp: 1680,
    badges: [
      {
        id: "badge4",
        name: "KALE Farmer",
        description: "Staked 1000+ KALE tokens",
        icon: "🌱",
        rarity: "rare",
        earnedAt: "2024-02-20T15:00:00Z"
      },
      {
        id: "badge5",
        name: "Early Adopter",
        description: "Joined in the first month",
        icon: "🚀",
        rarity: "epic",
        earnedAt: "2024-02-20T14:15:00Z"
      }
    ],
    stats: {
      totalBets: 28,
      totalWinnings: 8500,
      winRate: 75.0,
      streak: 5,
      longestStreak: 5,
      favoriteCategory: "Stellar Ecosystem",
      totalVolume: 15000,
      rank: 8
    },
    preferences: {
      theme: "dark",
      notifications: {
        email: false,
        push: true,
        marketUpdates: true,
        priceAlerts: true,
        achievements: true
      },
      privacy: {
        showStats: true,
        showBets: false,
        showProfile: true
      }
    },
    achievements: [
      {
        id: "ach4",
        name: "KALE Expert",
        description: "Win 10 KALE-related predictions",
        icon: "🌿",
        progress: 7,
        maxProgress: 10,
        unlocked: false,
        rarity: "rare"
      },
      {
        id: "ach5",
        name: "Consistent Winner",
        description: "Maintain 70%+ win rate for 20 bets",
        icon: "🎯",
        progress: 15,
        maxProgress: 20,
        unlocked: false,
        rarity: "epic"
      }
    ]
  },
  {
    id: "user3",
    address: "GHIJ1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
    username: "prediction_pro",
    displayName: "Michael Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Professional trader and prediction market analyst. Specializing in economic and political forecasts.",
    joinDate: "2024-01-05T09:00:00Z",
    lastActive: "2024-02-20T19:30:00Z",
    level: 18,
    xp: 4200,
    badges: [
      {
        id: "badge6",
        name: "Prediction Pro",
        description: "Win 100 predictions",
        icon: "🎖️",
        rarity: "legendary",
        earnedAt: "2024-02-15T12:00:00Z"
      },
      {
        id: "badge7",
        name: "Economic Sage",
        description: "Win 25 economics predictions",
        icon: "📈",
        rarity: "epic",
        earnedAt: "2024-02-10T16:45:00Z"
      },
      {
        id: "badge8",
        name: "Top Trader",
        description: "Rank in top 10 traders",
        icon: "👑",
        rarity: "legendary",
        earnedAt: "2024-02-18T14:20:00Z"
      }
    ],
    stats: {
      totalBets: 125,
      totalWinnings: 45000,
      winRate: 76.8,
      streak: 12,
      longestStreak: 15,
      favoriteCategory: "Economics",
      totalVolume: 120000,
      rank: 3
    },
    preferences: {
      theme: "dark",
      notifications: {
        email: true,
        push: true,
        marketUpdates: true,
        priceAlerts: true,
        achievements: true
      },
      privacy: {
        showStats: true,
        showBets: true,
        showProfile: true
      }
    },
    achievements: [
      {
        id: "ach6",
        name: "Legendary Trader",
        description: "Win 200 predictions",
        icon: "🏆",
        progress: 125,
        maxProgress: 200,
        unlocked: false,
        rarity: "legendary"
      },
      {
        id: "ach7",
        name: "Millionaire",
        description: "Win $100,000 total",
        icon: "💎",
        progress: 45000,
        maxProgress: 100000,
        unlocked: false,
        rarity: "legendary"
      }
    ]
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "notif1",
    userId: "user1",
    type: "bet_won",
    title: "Congratulations! You won!",
    message: "Your bet on 'Bitcoin price exceed $50,000' has won! You earned 225 KALE tokens.",
    read: false,
    createdAt: "2024-02-20T15:30:00Z",
    data: {
      marketId: "mkt2",
      betAmount: 150,
      payout: 225
    }
  },
  {
    id: "notif2",
    userId: "user1",
    type: "market_settled",
    title: "Market Settled",
    message: "The market 'Will Ethereum 2.0 reach 1M validators?' has been settled. Check your results!",
    read: true,
    createdAt: "2024-02-19T10:15:00Z",
    data: {
      marketId: "mkt6",
      winningOption: "opt2"
    }
  },
  {
    id: "notif3",
    userId: "user1",
    type: "achievement",
    title: "Achievement Unlocked!",
    message: "You've earned the 'Crypto Expert' badge for winning 20 cryptocurrency predictions!",
    read: false,
    createdAt: "2024-02-18T09:15:00Z",
    data: {
      badgeId: "badge3",
      badgeName: "Crypto Expert"
    }
  },
  {
    id: "notif4",
    userId: "user2",
    type: "price_alert",
    title: "Price Alert",
    message: "KALE token has reached $0.85! This is 15% above your alert threshold.",
    read: false,
    createdAt: "2024-02-20T16:45:00Z",
    data: {
      token: "KALE",
      currentPrice: 0.85,
      threshold: 0.75
    }
  },
  {
    id: "notif5",
    userId: "user2",
    type: "bet_won",
    title: "Great prediction!",
    message: "Your bet on 'KALE token reach $1.00' is looking strong with current price at $0.85.",
    read: true,
    createdAt: "2024-02-20T14:20:00Z",
    data: {
      marketId: "mkt4",
      currentPrice: 0.85,
      targetPrice: 1.00
    }
  },
  {
    id: "notif6",
    userId: "user3",
    type: "system",
    title: "Welcome to KALE-ndar Pro!",
    message: "You've been upgraded to Pro status! Enjoy advanced analytics and priority support.",
    read: true,
    createdAt: "2024-02-18T14:20:00Z",
    data: {
      upgradeType: "pro",
      features: ["advanced_analytics", "priority_support"]
    }
  }
];

// Helper functions
export const getUserProfile = (userId: string): UserProfile | undefined => {
  return mockUserProfiles.find(profile => profile.id === userId);
};

export const getUserNotifications = (userId: string): Notification[] => {
  return mockNotifications.filter(notification => notification.userId === userId);
};

export const getUnreadNotifications = (userId: string): Notification[] => {
  return getUserNotifications(userId).filter(notification => !notification.read);
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notification = mockNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): void => {
  const newNotification: Notification = {
    ...notification,
    id: `notif${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  mockNotifications.unshift(newNotification);
};

export const getUserLeaderboard = (limit: number = 10): UserProfile[] => {
  return mockUserProfiles
    .sort((a, b) => b.stats.rank - a.stats.rank)
    .slice(0, limit);
};

export const getTopTraders = (limit: number = 5): UserProfile[] => {
  return mockUserProfiles
    .sort((a, b) => b.stats.totalWinnings - a.stats.totalWinnings)
    .slice(0, limit);
};

export const getRecentAchievements = (userId: string): Achievement[] => {
  const profile = getUserProfile(userId);
  if (!profile) return [];
  
  return profile.achievements
    .filter(achievement => achievement.unlocked)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 5);
};
