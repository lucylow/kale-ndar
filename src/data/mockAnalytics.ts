export interface MarketAnalytics {
  marketId: string;
  totalVolume: number;
  totalBets: number;
  uniqueParticipants: number;
  averageBetSize: number;
  volatility: number;
  liquidity: number;
  trendingScore: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  priceHistory: PricePoint[];
  volumeHistory: VolumePoint[];
  participantGrowth: GrowthPoint[];
}

export interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
}

export interface VolumePoint {
  timestamp: string;
  volume: number;
  betCount: number;
}

export interface GrowthPoint {
  timestamp: string;
  participants: number;
  newParticipants: number;
}

export interface UserAnalytics {
  userId: string;
  totalBets: number;
  totalWinnings: number;
  winRate: number;
  averageBetSize: number;
  favoriteCategories: CategoryStats[];
  bettingPatterns: BettingPattern[];
  performanceMetrics: PerformanceMetrics;
  riskProfile: RiskProfile;
}

export interface CategoryStats {
  category: string;
  betCount: number;
  winRate: number;
  totalWinnings: number;
  averageOdds: number;
}

export interface BettingPattern {
  timeOfDay: string;
  dayOfWeek: string;
  betCount: number;
  winRate: number;
  averageAmount: number;
}

export interface PerformanceMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  winStreak: number;
  lossStreak: number;
  consistency: number;
  riskAdjustedReturn: number;
}

export interface RiskProfile {
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  averageOdds: number;
  maxBetSize: number;
  diversification: number;
  volatility: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalMarkets: number;
  activeMarkets: number;
  totalVolume: number;
  totalBets: number;
  averageBetSize: number;
  userGrowth: GrowthPoint[];
  volumeGrowth: VolumePoint[];
  marketGrowth: GrowthPoint[];
  topCategories: CategoryStats[];
  topMarkets: MarketAnalytics[];
  topUsers: UserAnalytics[];
}

export const mockMarketAnalytics: MarketAnalytics[] = [
  {
    marketId: "mkt2",
    totalVolume: 44000,
    totalBets: 2200,
    uniqueParticipants: 156,
    averageBetSize: 20,
    volatility: 0.15,
    liquidity: 0.85,
    trendingScore: 92,
    sentiment: "bullish",
    priceHistory: [
      { timestamp: "2024-02-15T00:00:00Z", price: 1.5, volume: 5000 },
      { timestamp: "2024-02-16T00:00:00Z", price: 1.6, volume: 7500 },
      { timestamp: "2024-02-17T00:00:00Z", price: 1.4, volume: 6200 },
      { timestamp: "2024-02-18T00:00:00Z", price: 1.7, volume: 8900 },
      { timestamp: "2024-02-19T00:00:00Z", price: 1.5, volume: 11000 },
      { timestamp: "2024-02-20T00:00:00Z", price: 1.5, volume: 4400 }
    ],
    volumeHistory: [
      { timestamp: "2024-02-15T00:00:00Z", volume: 5000, betCount: 250 },
      { timestamp: "2024-02-16T00:00:00Z", volume: 7500, betCount: 375 },
      { timestamp: "2024-02-17T00:00:00Z", volume: 6200, betCount: 310 },
      { timestamp: "2024-02-18T00:00:00Z", volume: 8900, betCount: 445 },
      { timestamp: "2024-02-19T00:00:00Z", volume: 11000, betCount: 550 },
      { timestamp: "2024-02-20T00:00:00Z", volume: 4400, betCount: 220 }
    ],
    participantGrowth: [
      { timestamp: "2024-02-15T00:00:00Z", participants: 45, newParticipants: 12 },
      { timestamp: "2024-02-16T00:00:00Z", participants: 67, newParticipants: 22 },
      { timestamp: "2024-02-17T00:00:00Z", participants: 89, newParticipants: 18 },
      { timestamp: "2024-02-18T00:00:00Z", participants: 112, newParticipants: 23 },
      { timestamp: "2024-02-19T00:00:00Z", participants: 134, newParticipants: 22 },
      { timestamp: "2024-02-20T00:00:00Z", participants: 156, newParticipants: 18 }
    ]
  },
  {
    marketId: "mkt4",
    totalVolume: 28200,
    totalBets: 1500,
    uniqueParticipants: 89,
    averageBetSize: 18.8,
    volatility: 0.22,
    liquidity: 0.72,
    trendingScore: 78,
    sentiment: "bullish",
    priceHistory: [
      { timestamp: "2024-02-15T00:00:00Z", price: 2.3, volume: 3000 },
      { timestamp: "2024-02-16T00:00:00Z", price: 2.1, volume: 4200 },
      { timestamp: "2024-02-17T00:00:00Z", price: 2.5, volume: 3800 },
      { timestamp: "2024-02-18T00:00:00Z", price: 2.2, volume: 5500 },
      { timestamp: "2024-02-19T00:00:00Z", price: 2.4, volume: 6200 },
      { timestamp: "2024-02-20T00:00:00Z", price: 2.3, volume: 3500 }
    ],
    volumeHistory: [
      { timestamp: "2024-02-15T00:00:00Z", volume: 3000, betCount: 150 },
      { timestamp: "2024-02-16T00:00:00Z", volume: 4200, betCount: 210 },
      { timestamp: "2024-02-17T00:00:00Z", volume: 3800, betCount: 190 },
      { timestamp: "2024-02-18T00:00:00Z", volume: 5500, betCount: 275 },
      { timestamp: "2024-02-19T00:00:00Z", volume: 6200, betCount: 310 },
      { timestamp: "2024-02-20T00:00:00Z", volume: 3500, betCount: 175 }
    ],
    participantGrowth: [
      { timestamp: "2024-02-15T00:00:00Z", participants: 25, newParticipants: 8 },
      { timestamp: "2024-02-16T00:00:00Z", participants: 38, newParticipants: 13 },
      { timestamp: "2024-02-17T00:00:00Z", participants: 52, newParticipants: 14 },
      { timestamp: "2024-02-18T00:00:00Z", participants: 67, newParticipants: 15 },
      { timestamp: "2024-02-19T00:00:00Z", participants: 78, newParticipants: 11 },
      { timestamp: "2024-02-20T00:00:00Z", participants: 89, newParticipants: 11 }
    ]
  }
];

export const mockUserAnalytics: UserAnalytics[] = [
  {
    userId: "user1",
    totalBets: 45,
    totalWinnings: 12500,
    winRate: 68.9,
    averageBetSize: 22.2,
    favoriteCategories: [
      { category: "Cryptocurrency", betCount: 20, winRate: 75.0, totalWinnings: 8500, averageOdds: 1.8 },
      { category: "Economics", betCount: 15, winRate: 60.0, totalWinnings: 3000, averageOdds: 2.1 },
      { category: "Technology", betCount: 10, winRate: 70.0, totalWinnings: 1000, averageOdds: 1.9 }
    ],
    bettingPatterns: [
      { timeOfDay: "morning", dayOfWeek: "Monday", betCount: 8, winRate: 75.0, averageAmount: 25 },
      { timeOfDay: "afternoon", dayOfWeek: "Tuesday", betCount: 12, winRate: 66.7, averageAmount: 20 },
      { timeOfDay: "evening", dayOfWeek: "Wednesday", betCount: 15, winRate: 73.3, averageAmount: 18 },
      { timeOfDay: "night", dayOfWeek: "Thursday", betCount: 10, winRate: 60.0, averageAmount: 30 }
    ],
    performanceMetrics: {
      sharpeRatio: 1.2,
      maxDrawdown: 0.15,
      winStreak: 8,
      lossStreak: 3,
      consistency: 0.75,
      riskAdjustedReturn: 0.18
    },
    riskProfile: {
      riskLevel: "moderate",
      averageOdds: 1.9,
      maxBetSize: 500,
      diversification: 0.65,
      volatility: 0.22
    }
  },
  {
    userId: "user2",
    totalBets: 28,
    totalWinnings: 8500,
    winRate: 75.0,
    averageBetSize: 18.5,
    favoriteCategories: [
      { category: "Stellar Ecosystem", betCount: 15, winRate: 80.0, totalWinnings: 6000, averageOdds: 2.2 },
      { category: "Cryptocurrency", betCount: 8, winRate: 62.5, totalWinnings: 2000, averageOdds: 1.7 },
      { category: "Economics", betCount: 5, winRate: 80.0, totalWinnings: 500, averageOdds: 1.5 }
    ],
    bettingPatterns: [
      { timeOfDay: "morning", dayOfWeek: "Monday", betCount: 5, winRate: 80.0, averageAmount: 20 },
      { timeOfDay: "afternoon", dayOfWeek: "Tuesday", betCount: 8, winRate: 75.0, averageAmount: 18 },
      { timeOfDay: "evening", dayOfWeek: "Wednesday", betCount: 10, winRate: 70.0, averageAmount: 16 },
      { timeOfDay: "night", dayOfWeek: "Thursday", betCount: 5, winRate: 80.0, averageAmount: 22 }
    ],
    performanceMetrics: {
      sharpeRatio: 1.8,
      maxDrawdown: 0.08,
      winStreak: 5,
      lossStreak: 2,
      consistency: 0.85,
      riskAdjustedReturn: 0.25
    },
    riskProfile: {
      riskLevel: "conservative",
      averageOdds: 1.8,
      maxBetSize: 300,
      diversification: 0.80,
      volatility: 0.15
    }
  },
  {
    userId: "user3",
    totalBets: 125,
    totalWinnings: 45000,
    winRate: 76.8,
    averageBetSize: 35.2,
    favoriteCategories: [
      { category: "Economics", betCount: 45, winRate: 80.0, totalWinnings: 25000, averageOdds: 1.9 },
      { category: "Technology", betCount: 35, winRate: 74.3, totalWinnings: 15000, averageOdds: 2.1 },
      { category: "Cryptocurrency", betCount: 25, winRate: 72.0, totalWinnings: 8000, averageOdds: 1.8 },
      { category: "Politics", betCount: 20, winRate: 75.0, totalWinnings: 7000, averageOdds: 2.0 }
    ],
    bettingPatterns: [
      { timeOfDay: "morning", dayOfWeek: "Monday", betCount: 20, winRate: 80.0, averageAmount: 40 },
      { timeOfDay: "afternoon", dayOfWeek: "Tuesday", betCount: 25, winRate: 76.0, averageAmount: 35 },
      { timeOfDay: "evening", dayOfWeek: "Wednesday", betCount: 30, winRate: 73.3, averageAmount: 32 },
      { timeOfDay: "night", dayOfWeek: "Thursday", betCount: 20, winRate: 80.0, averageAmount: 38 },
      { timeOfDay: "morning", dayOfWeek: "Friday", betCount: 15, winRate: 80.0, averageAmount: 42 },
      { timeOfDay: "afternoon", dayOfWeek: "Saturday", betCount: 10, winRate: 70.0, averageAmount: 30 },
      { timeOfDay: "evening", dayOfWeek: "Sunday", betCount: 5, winRate: 80.0, averageAmount: 25 }
    ],
    performanceMetrics: {
      sharpeRatio: 2.1,
      maxDrawdown: 0.12,
      winStreak: 15,
      lossStreak: 4,
      consistency: 0.90,
      riskAdjustedReturn: 0.32
    },
    riskProfile: {
      riskLevel: "aggressive",
      averageOdds: 1.95,
      maxBetSize: 1000,
      diversification: 0.70,
      volatility: 0.28
    }
  }
];

export const mockPlatformAnalytics: PlatformAnalytics = {
  totalUsers: 1250,
  activeUsers: 450,
  totalMarkets: 15,
  activeMarkets: 12,
  totalVolume: 450000,
  totalBets: 8500,
  averageBetSize: 52.9,
  userGrowth: [
    { timestamp: "2024-01-01T00:00:00Z", participants: 100, newParticipants: 20 },
    { timestamp: "2024-01-15T00:00:00Z", participants: 250, newParticipants: 30 },
    { timestamp: "2024-02-01T00:00:00Z", participants: 450, newParticipants: 50 },
    { timestamp: "2024-02-15T00:00:00Z", participants: 750, newParticipants: 75 },
    { timestamp: "2024-02-20T00:00:00Z", participants: 1250, newParticipants: 100 }
  ],
  volumeGrowth: [
    { timestamp: "2024-01-01T00:00:00Z", volume: 50000, betCount: 1000 },
    { timestamp: "2024-01-15T00:00:00Z", volume: 125000, betCount: 2500 },
    { timestamp: "2024-02-01T00:00:00Z", volume: 250000, betCount: 5000 },
    { timestamp: "2024-02-15T00:00:00Z", volume: 350000, betCount: 7000 },
    { timestamp: "2024-02-20T00:00:00Z", volume: 450000, betCount: 8500 }
  ],
  marketGrowth: [
    { timestamp: "2024-01-01T00:00:00Z", participants: 3, newParticipants: 1 },
    { timestamp: "2024-01-15T00:00:00Z", participants: 6, newParticipants: 2 },
    { timestamp: "2024-02-01T00:00:00Z", participants: 10, newParticipants: 3 },
    { timestamp: "2024-02-15T00:00:00Z", participants: 13, newParticipants: 2 },
    { timestamp: "2024-02-20T00:00:00Z", participants: 15, newParticipants: 2 }
  ],
  topCategories: [
    { category: "Cryptocurrency", betCount: 2500, winRate: 68.5, totalWinnings: 150000, averageOdds: 1.9 },
    { category: "Economics", betCount: 2000, winRate: 72.3, totalWinnings: 120000, averageOdds: 2.1 },
    { category: "Technology", betCount: 1800, winRate: 65.8, totalWinnings: 95000, averageOdds: 2.0 },
    { category: "Stellar Ecosystem", betCount: 1200, winRate: 75.2, totalWinnings: 60000, averageOdds: 2.2 },
    { category: "Sports", betCount: 1000, winRate: 58.7, totalWinnings: 25000, averageOdds: 1.8 }
  ],
  topMarkets: mockMarketAnalytics.slice(0, 5),
  topUsers: mockUserAnalytics.slice(0, 5)
};

// Helper functions
export const getMarketAnalytics = (marketId: string): MarketAnalytics | undefined => {
  return mockMarketAnalytics.find(analytics => analytics.marketId === marketId);
};

export const getUserAnalytics = (userId: string): UserAnalytics | undefined => {
  return mockUserAnalytics.find(analytics => analytics.userId === userId);
};

export const getTopPerformingMarkets = (limit: number = 5): MarketAnalytics[] => {
  return mockMarketAnalytics
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
};

export const getTopPerformingUsers = (limit: number = 5): UserAnalytics[] => {
  return mockUserAnalytics
    .sort((a, b) => b.totalWinnings - a.totalWinnings)
    .slice(0, limit);
};

export const getCategoryAnalytics = (category: string): CategoryStats | undefined => {
  return mockPlatformAnalytics.topCategories.find(cat => cat.category === category);
};

export const getMarketSentiment = (marketId: string): 'bullish' | 'bearish' | 'neutral' | undefined => {
  const analytics = getMarketAnalytics(marketId);
  return analytics?.sentiment;
};

export const getTrendingMarkets = (limit: number = 3): MarketAnalytics[] => {
  return mockMarketAnalytics
    .filter(market => market.trendingScore > 70)
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
};

export const getRiskProfile = (userId: string): RiskProfile | undefined => {
  const analytics = getUserAnalytics(userId);
  return analytics?.riskProfile;
};

export const getPerformanceMetrics = (userId: string): PerformanceMetrics | undefined => {
  const analytics = getUserAnalytics(userId);
  return analytics?.performanceMetrics;
};

export const getMarketVolatility = (marketId: string): number | undefined => {
  const analytics = getMarketAnalytics(marketId);
  return analytics?.volatility;
};

export const getPlatformGrowth = (): PlatformAnalytics => {
  return mockPlatformAnalytics;
};
