export interface Transaction {
  id: string;
  userId: string;
  type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'bet_refunded' | 'stake' | 'unstake' | 'harvest' | 'transfer_in' | 'transfer_out' | 'market_created' | 'reward_earned';
  amount: number;
  token: 'KALE' | 'XLM' | 'USDC' | 'XRF';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description: string;
  marketId?: string;
  marketTitle?: string;
  transactionHash?: string;
  fees?: number;
  metadata?: any;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'bet_placed' | 'market_created' | 'achievement_earned' | 'profile_updated' | 'wallet_connected' | 'wallet_disconnected';
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface MarketActivity {
  id: string;
  marketId: string;
  userId: string;
  action: 'created' | 'bet_placed' | 'bet_updated' | 'bet_cancelled' | 'settled' | 'disputed';
  description: string;
  timestamp: string;
  amount?: number;
  metadata?: any;
}

export const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    userId: "user1",
    type: "bet_placed",
    amount: 200,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-20T15:30:00Z",
    description: "Placed bet on 'Bitcoin price exceed $50,000'",
    marketId: "mkt2",
    marketTitle: "Will Bitcoin price exceed $50,000 on Jan 1, 2026?",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    fees: 0.5
  },
  {
    id: "tx2",
    userId: "user1",
    type: "bet_won",
    amount: 360,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-20T16:00:00Z",
    description: "Won bet on 'Bitcoin price exceed $50,000'",
    marketId: "mkt2",
    marketTitle: "Will Bitcoin price exceed $50,000 on Jan 1, 2026?",
    transactionHash: "0x2345678901bcdef1234567890abcdef1234567890abcdef1234567890abcdef1",
    fees: 0
  },
  {
    id: "tx3",
    userId: "user1",
    type: "stake",
    amount: 1000,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-18T10:15:00Z",
    description: "Staked KALE tokens for farming",
    transactionHash: "0x3456789012cdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    fees: 1.0
  },
  {
    id: "tx4",
    userId: "user1",
    type: "harvest",
    amount: 45.25,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-19T14:30:00Z",
    description: "Harvested farming rewards",
    transactionHash: "0x4567890123def1234567890abcdef1234567890abcdef1234567890abcdef123",
    fees: 0.2
  },
  {
    id: "tx5",
    userId: "user1",
    type: "bet_placed",
    amount: 150,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-17T11:45:00Z",
    description: "Placed bet on 'Federal Reserve raise interest rates'",
    marketId: "mkt1",
    marketTitle: "Will the Federal Reserve raise interest rates in Dec 2025?",
    transactionHash: "0x5678901234ef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    fees: 0.4
  },
  {
    id: "tx6",
    userId: "user2",
    type: "bet_placed",
    amount: 300,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-20T14:20:00Z",
    description: "Placed bet on 'KALE token reach $1.00'",
    marketId: "mkt4",
    marketTitle: "Will KALE token reach $1.00 by March 2025?",
    transactionHash: "0x6789012345f1234567890abcdef1234567890abcdef1234567890abcdef12345",
    fees: 0.6
  },
  {
    id: "tx7",
    userId: "user2",
    type: "stake",
    amount: 2000,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-20T15:00:00Z",
    description: "Staked KALE tokens for farming",
    transactionHash: "0x78901234561234567890abcdef1234567890abcdef1234567890abcdef123456",
    fees: 2.0
  },
  {
    id: "tx8",
    userId: "user2",
    type: "reward_earned",
    amount: 78.50,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-20T16:30:00Z",
    description: "Earned staking rewards",
    transactionHash: "0x8901234567234567890abcdef1234567890abcdef1234567890abcdef1234567",
    fees: 0
  },
  {
    id: "tx9",
    userId: "user3",
    type: "market_created",
    amount: 0,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-15T12:30:00Z",
    description: "Created market 'Will quantum computers break RSA encryption?'",
    marketId: "mkt15",
    marketTitle: "Will quantum computers break RSA encryption by 2030?",
    transactionHash: "0x901234567834567890abcdef1234567890abcdef1234567890abcdef12345678",
    fees: 5.0
  },
  {
    id: "tx10",
    userId: "user3",
    type: "bet_placed",
    amount: 500,
    token: "KALE",
    status: "completed",
    timestamp: "2024-02-19T09:15:00Z",
    description: "Placed bet on 'US recession in 2025'",
    marketId: "mkt8",
    marketTitle: "Will the US have a recession in 2025?",
    transactionHash: "0x01234567894567890abcdef1234567890abcdef1234567890abcdef123456789",
    fees: 1.0
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "log1",
    userId: "user1",
    type: "login",
    description: "Logged in successfully",
    timestamp: "2024-02-20T18:00:00Z",
    metadata: {
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  },
  {
    id: "log2",
    userId: "user1",
    type: "bet_placed",
    description: "Placed bet on Bitcoin price prediction",
    timestamp: "2024-02-20T15:30:00Z",
    metadata: {
      marketId: "mkt2",
      amount: 200,
      token: "KALE"
    }
  },
  {
    id: "log3",
    userId: "user1",
    type: "achievement_earned",
    description: "Earned 'Crypto Expert' badge",
    timestamp: "2024-02-18T09:15:00Z",
    metadata: {
      badgeId: "badge3",
      badgeName: "Crypto Expert"
    }
  },
  {
    id: "log4",
    userId: "user1",
    type: "profile_updated",
    description: "Updated profile information",
    timestamp: "2024-02-17T16:45:00Z",
    metadata: {
      fields: ["bio", "preferences"]
    }
  },
  {
    id: "log5",
    userId: "user2",
    type: "wallet_connected",
    description: "Connected Lobstr wallet",
    timestamp: "2024-02-20T14:15:00Z",
    metadata: {
      walletType: "Lobstr",
      address: "GDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890"
    }
  },
  {
    id: "log6",
    userId: "user2",
    type: "bet_placed",
    description: "Placed bet on KALE token prediction",
    timestamp: "2024-02-20T14:20:00Z",
    metadata: {
      marketId: "mkt4",
      amount: 300,
      token: "KALE"
    }
  },
  {
    id: "log7",
    userId: "user3",
    type: "market_created",
    description: "Created new prediction market",
    timestamp: "2024-02-15T12:30:00Z",
    metadata: {
      marketId: "mkt15",
      marketTitle: "Will quantum computers break RSA encryption by 2030?"
    }
  },
  {
    id: "log8",
    userId: "user3",
    type: "bet_placed",
    description: "Placed large bet on economic prediction",
    timestamp: "2024-02-19T09:15:00Z",
    metadata: {
      marketId: "mkt8",
      amount: 500,
      token: "KALE"
    }
  }
];

export const mockMarketActivities: MarketActivity[] = [
  {
    id: "ma1",
    marketId: "mkt2",
    userId: "user1",
    action: "bet_placed",
    description: "Alex Chen placed a bet of 200 KALE on 'Yes'",
    timestamp: "2024-02-20T15:30:00Z",
    amount: 200,
    metadata: {
      option: "Yes",
      odds: 1.5
    }
  },
  {
    id: "ma2",
    marketId: "mkt2",
    userId: "user3",
    action: "bet_placed",
    description: "Michael Rodriguez placed a bet of 500 KALE on 'Yes'",
    timestamp: "2024-02-20T16:15:00Z",
    amount: 500,
    metadata: {
      option: "Yes",
      odds: 1.5
    }
  },
  {
    id: "ma3",
    marketId: "mkt4",
    userId: "user2",
    action: "bet_placed",
    description: "Sarah Johnson placed a bet of 300 KALE on 'Yes'",
    timestamp: "2024-02-20T14:20:00Z",
    amount: 300,
    metadata: {
      option: "Yes",
      odds: 2.3
    }
  },
  {
    id: "ma4",
    marketId: "mkt15",
    userId: "user3",
    action: "created",
    description: "Michael Rodriguez created the market",
    timestamp: "2024-02-15T12:30:00Z",
    metadata: {
      initialPool: 0,
      category: "Technology"
    }
  },
  {
    id: "ma5",
    marketId: "mkt6",
    userId: "system",
    action: "settled",
    description: "Market settled with 'No' as the winning option",
    timestamp: "2024-02-19T10:15:00Z",
    metadata: {
      winningOption: "opt2",
      totalPayout: 19200
    }
  }
];

// Helper functions
export const getUserTransactions = (userId: string, limit?: number): Transaction[] => {
  const transactions = mockTransactions
    .filter(tx => tx.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return limit ? transactions.slice(0, limit) : transactions;
};

export const getUserActivityLogs = (userId: string, limit?: number): ActivityLog[] => {
  const logs = mockActivityLogs
    .filter(log => log.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return limit ? logs.slice(0, limit) : logs;
};

export const getMarketActivities = (marketId: string, limit?: number): MarketActivity[] => {
  const activities = mockMarketActivities
    .filter(activity => activity.marketId === marketId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return limit ? activities.slice(0, limit) : activities;
};

export const getTransactionById = (transactionId: string): Transaction | undefined => {
  return mockTransactions.find(tx => tx.id === transactionId);
};

export const getTransactionsByType = (type: Transaction['type'], limit?: number): Transaction[] => {
  const transactions = mockTransactions
    .filter(tx => tx.type === type)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return limit ? transactions.slice(0, limit) : transactions;
};

export const getTotalVolume = (userId: string, token?: string): number => {
  const transactions = mockTransactions.filter(tx => 
    tx.userId === userId && 
    tx.status === 'completed' &&
    (!token || tx.token === token)
  );
  
  return transactions.reduce((total, tx) => total + tx.amount, 0);
};

export const getRecentActivity = (userId: string, hours: number = 24): ActivityLog[] => {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return mockActivityLogs
    .filter(log => 
      log.userId === userId && 
      new Date(log.timestamp) >= cutoffTime
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>): void => {
  const newTransaction: Transaction = {
    ...transaction,
    id: `tx${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  mockTransactions.unshift(newTransaction);
};

export const addActivityLog = (activity: Omit<ActivityLog, 'id' | 'timestamp'>): void => {
  const newActivity: ActivityLog = {
    ...activity,
    id: `log${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  mockActivityLogs.unshift(newActivity);
};
