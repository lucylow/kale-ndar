export interface MarketOption {
  id: string;
  label: string;
  odds: number;
  totalBets: number;
  totalAmount: number;
  result?: 'won' | 'lost';
}

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'settled' | 'cancelled';
  endDate: string;
  options: MarketOption[];
  totalPool: number;
  winningOption?: string;
  creator: string;
  createdAt: string;
  imageUrl?: string;
}

export interface UserBet {
  marketId: string;
  optionId: string;
  betAmount: number;
  potentialPayout: number;
  actualPayout?: number;
  status: 'open' | 'settled';
  won?: boolean;
  placedAt: string;
}

export interface UserBetData {
  userId: string;
  bets: UserBet[];
}

export const predictionMarkets: PredictionMarket[] = [
  {
    id: "mkt1",
    title: "Will the Federal Reserve raise interest rates in Dec 2025?",
    description: "Prediction on whether the US Federal Reserve will increase the interest rate at the December 2025 FOMC meeting.",
    category: "Economics",
    status: "open",
    endDate: "2025-12-15T16:00:00Z",
    creator: "0x1234...5678",
    createdAt: "2024-01-15T10:00:00Z",
    options: [
      {
        id: "opt1",
        label: "Yes",
        odds: 1.8,
        totalBets: 1200,
        totalAmount: 24000
      },
      {
        id: "opt2",
        label: "No",
        odds: 2.0,
        totalBets: 800,
        totalAmount: 16000
      }
    ],
    totalPool: 40000
  },
  {
    id: "mkt2",
    title: "Will Bitcoin price exceed $50,000 on Jan 1, 2026?",
    description: "Prediction on whether Bitcoin's price will be above $50,000 USD exactly at midnight UTC on January 1st, 2026.",
    category: "Cryptocurrency",
    status: "settled",
    endDate: "2026-01-01T00:00:00Z",
    creator: "0x8765...4321",
    createdAt: "2024-01-10T14:30:00Z",
    options: [
      {
        id: "opt1",
        label: "Yes",
        odds: 1.5,
        totalBets: 1500,
        totalAmount: 30000,
        result: "won"
      },
      {
        id: "opt2",
        label: "No",
        odds: 2.5,
        totalBets: 700,
        totalAmount: 14000,
        result: "lost"
      }
    ],
    totalPool: 44000,
    winningOption: "opt1"
  },
  {
    id: "mkt3",
    title: "Will the 2026 FIFA World Cup winner be a South American country?",
    description: "Prediction on whether the FIFA World Cup 2026 will be won by Argentina, Brazil, Uruguay, or any other South American country.",
    category: "Sports",
    status: "open",
    endDate: "2026-07-20T19:00:00Z",
    creator: "0xabcd...efgh",
    createdAt: "2024-01-05T09:15:00Z",
    options: [
      {
        id: "opt1",
        label: "Yes",
        odds: 2.1,
        totalBets: 400,
        totalAmount: 8400
      },
      {
        id: "opt2",
        label: "No",
        odds: 1.7,
        totalBets: 1100,
        totalAmount: 18700
      }
    ],
    totalPool: 27100
  },
  {
    id: "mkt4",
    title: "Will KALE token reach $1.00 by March 2025?",
    description: "Prediction on whether the KALE token will reach or exceed $1.00 USD by March 31st, 2025.",
    category: "Stellar Ecosystem",
    status: "open",
    endDate: "2025-03-31T23:59:59Z",
    creator: "0xdef0...1234",
    createdAt: "2024-01-20T08:45:00Z",
    options: [
      {
        id: "opt1",
        label: "Yes",
        odds: 2.3,
        totalBets: 600,
        totalAmount: 13800
      },
      {
        id: "opt2",
        label: "No",
        odds: 1.6,
        totalBets: 900,
        totalAmount: 14400
      }
    ],
    totalPool: 28200
  },
  {
    id: "mkt5",
    title: "Will Stellar network process over 1M transactions per day in 2025?",
    description: "Prediction on whether the Stellar network will process more than 1 million transactions in a single day during 2025.",
    category: "Stellar Ecosystem",
    status: "open",
    endDate: "2025-12-31T23:59:59Z",
    creator: "0x5678...9abc",
    createdAt: "2024-01-25T12:30:00Z",
    options: [
      {
        id: "opt1",
        label: "Yes",
        odds: 1.9,
        totalBets: 800,
        totalAmount: 15200
      },
      {
        id: "opt2",
        label: "No",
        odds: 1.8,
        totalBets: 750,
        totalAmount: 13500
      }
    ],
    totalPool: 28700
  },
  {
    id: "mkt6",
    title: "Will Ethereum 2.0 reach 1M validators by end of 2025?",
    description: "Prediction on whether Ethereum's proof-of-stake network will have 1 million or more active validators by December 31st, 2025.",
    category: "Cryptocurrency",
    status: "settled",
    endDate: "2025-12-31T23:59:59Z",
    creator: "0x9abc...def0",
    createdAt: "2024-01-12T16:20:00Z",
    options: [
      {
        id: "opt1",
        label: "Yes",
        odds: 2.2,
        totalBets: 500,
        totalAmount: 11000,
        result: "lost"
      },
      {
        id: "opt2",
        label: "No",
        odds: 1.6,
        totalBets: 1200,
        totalAmount: 19200,
        result: "won"
      }
    ],
    totalPool: 30200,
    winningOption: "opt2"
  }
];

export const userBets: UserBetData[] = [
  {
    userId: "user123",
    bets: [
      {
        marketId: "mkt1",
        optionId: "opt1",
        betAmount: 200,
        potentialPayout: 360,
        status: "open",
        placedAt: "2024-01-16T10:30:00Z"
      },
      {
        marketId: "mkt2",
        optionId: "opt1",
        betAmount: 150,
        potentialPayout: 225,
        actualPayout: 225,
        status: "settled",
        won: true,
        placedAt: "2024-01-11T15:45:00Z"
      },
      {
        marketId: "mkt4",
        optionId: "opt1",
        betAmount: 100,
        potentialPayout: 230,
        status: "open",
        placedAt: "2024-01-21T09:15:00Z"
      }
    ]
  },
  {
    userId: "user456",
    bets: [
      {
        marketId: "mkt3",
        optionId: "opt2",
        betAmount: 300,
        potentialPayout: 510,
        status: "open",
        placedAt: "2024-01-06T11:20:00Z"
      },
      {
        marketId: "mkt5",
        optionId: "opt1",
        betAmount: 250,
        potentialPayout: 475,
        status: "open",
        placedAt: "2024-01-26T13:45:00Z"
      }
    ]
  },
  {
    userId: "user789",
    bets: [
      {
        marketId: "mkt2",
        optionId: "opt2",
        betAmount: 100,
        potentialPayout: 170,
        actualPayout: 0,
        status: "settled",
        won: false,
        placedAt: "2024-01-11T16:30:00Z"
      },
      {
        marketId: "mkt6",
        optionId: "opt1",
        betAmount: 200,
        potentialPayout: 340,
        actualPayout: 0,
        status: "settled",
        won: false,
        placedAt: "2024-01-13T17:15:00Z"
      }
    ]
  }
];

// Helper functions
export const getMarketsByCategory = (category: string): PredictionMarket[] => {
  return predictionMarkets.filter(market => market.category === category);
};

export const getOpenMarkets = (): PredictionMarket[] => {
  return predictionMarkets.filter(market => market.status === 'open');
};

export const getSettledMarkets = (): PredictionMarket[] => {
  return predictionMarkets.filter(market => market.status === 'settled');
};

export const getUserBets = (userId: string): UserBet[] => {
  const userBetData = userBets.find(user => user.userId === userId);
  return userBetData ? userBetData.bets : [];
};

export const getMarketById = (marketId: string): PredictionMarket | undefined => {
  return predictionMarkets.find(market => market.id === marketId);
};

export const getMarketStats = () => {
  const totalMarkets = predictionMarkets.length;
  const openMarkets = getOpenMarkets().length;
  const settledMarkets = getSettledMarkets().length;
  const totalPool = predictionMarkets.reduce((sum, market) => sum + market.totalPool, 0);
  const totalBets = predictionMarkets.reduce((sum, market) => 
    sum + market.options.reduce((optSum, option) => optSum + option.totalBets, 0), 0
  );

  return {
    totalMarkets,
    openMarkets,
    settledMarkets,
    totalPool,
    totalBets
  };
};

export const getCategoryStats = () => {
  const categories = [...new Set(predictionMarkets.map(market => market.category))];
  return categories.map(category => ({
    category,
    count: getMarketsByCategory(category).length,
    totalPool: getMarketsByCategory(category).reduce((sum, market) => sum + market.totalPool, 0)
  }));
};
