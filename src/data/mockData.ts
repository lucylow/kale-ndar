import { Market, User, Bet, MarketCondition, OracleAsset } from '@/types/market';

// Mock Oracle Assets
export const mockOracleAssets: OracleAsset[] = [
  { type: 'stellar', code: 'KALE', contractId: 'contract_kale_123' },
  { type: 'other', code: 'BTC' },
  { type: 'other', code: 'ETH' },
  { type: 'other', code: 'SOL' },
  { type: 'other', code: 'ADA' },
  { type: 'other', code: 'DOT' },
  { type: 'other', code: 'LINK' },
  { type: 'other', code: 'UNI' },
  { type: 'other', code: 'AVAX' },
  { type: 'other', code: 'MATIC' },
];

// Mock Markets
export const mockMarkets: Market[] = [
  {
    id: 'market_btc_100k',
    description: 'Will Bitcoin reach $100,000 by December 31, 2024?',
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    oracleAsset: { type: 'other', code: 'BTC' },
    targetPrice: 100000,
    condition: MarketCondition.ABOVE,
    resolveTime: new Date('2024-12-31T23:59:59Z'),
    totalFor: 2500000,
    totalAgainst: 1200000,
    resolved: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    currentPrice: 85000,
    oracleConfidence: 0.95,
  },
  {
    id: 'market_eth_5k',
    description: 'Will Ethereum reach $5,000 before Q2 2024 ends?',
    creator: '0x876543210fedcba9876543210fedcba98765432',
    oracleAsset: { type: 'other', code: 'ETH' },
    targetPrice: 5000,
    condition: MarketCondition.ABOVE,
    resolveTime: new Date('2024-06-30T23:59:59Z'),
    totalFor: 1800000,
    totalAgainst: 2200000,
    resolved: false,
    createdAt: new Date('2024-01-10T14:30:00Z'),
    currentPrice: 3200,
    oracleConfidence: 0.88,
  },
  {
    id: 'market_kale_1',
    description: 'Will KALE token reach $1.00 by March 31, 2024?',
    creator: '0xabcdef1234567890abcdef1234567890abcdef12',
    oracleAsset: { type: 'stellar', code: 'KALE', contractId: 'contract_kale_123' },
    targetPrice: 100,
    condition: MarketCondition.ABOVE,
    resolveTime: new Date('2024-03-31T23:59:59Z'),
    totalFor: 800000,
    totalAgainst: 400000,
    resolved: false,
    createdAt: new Date('2024-01-05T09:15:00Z'),
    currentPrice: 75,
    oracleConfidence: 0.92,
  },
  {
    id: 'market_sol_200',
    description: 'Will Solana drop below $200 by February 15, 2024?',
    creator: '0xfedcba0987654321fedcba0987654321fedcba09',
    oracleAsset: { type: 'other', code: 'SOL' },
    targetPrice: 200,
    condition: MarketCondition.BELOW,
    resolveTime: new Date('2024-02-15T23:59:59Z'),
    totalFor: 600000,
    totalAgainst: 900000,
    resolved: false,
    createdAt: new Date('2024-01-12T16:45:00Z'),
    currentPrice: 180,
    oracleConfidence: 0.87,
  },
  {
    id: 'market_ada_2',
    description: 'Will Cardano exceed $2.00 by April 30, 2024?',
    creator: '0x9876543210abcdef9876543210abcdef98765432',
    oracleAsset: { type: 'other', code: 'ADA' },
    targetPrice: 200,
    condition: MarketCondition.ABOVE,
    resolveTime: new Date('2024-04-30T23:59:59Z'),
    totalFor: 1200000,
    totalAgainst: 800000,
    resolved: false,
    createdAt: new Date('2024-01-08T11:20:00Z'),
    currentPrice: 150,
    oracleConfidence: 0.85,
  },
  {
    id: 'market_dot_15',
    description: 'Will Polkadot stay above $15.00 throughout Q1 2024?',
    creator: '0xabcdef9876543210abcdef9876543210abcdef98',
    oracleAsset: { type: 'other', code: 'DOT' },
    targetPrice: 1500,
    condition: MarketCondition.ABOVE,
    resolveTime: new Date('2024-03-31T23:59:59Z'),
    totalFor: 700000,
    totalAgainst: 1100000,
    resolved: false,
    createdAt: new Date('2024-01-03T13:10:00Z'),
    currentPrice: 1200,
    oracleConfidence: 0.89,
  },
  {
    id: 'market_link_25',
    description: 'Will Chainlink reach $25.00 by May 31, 2024?',
    creator: '0x1234567890fedcba1234567890fedcba12345678',
    oracleAsset: { type: 'other', code: 'LINK' },
    targetPrice: 2500,
    condition: MarketCondition.ABOVE,
    resolveTime: new Date('2024-05-31T23:59:59Z'),
    totalFor: 950000,
    totalAgainst: 650000,
    resolved: false,
    createdAt: new Date('2024-01-20T08:30:00Z'),
    currentPrice: 1800,
    oracleConfidence: 0.91,
  },
  {
    id: 'market_uni_15',
    description: 'Will Uniswap fall below $15.00 by March 15, 2024?',
    creator: '0xfedcba0987654321fedcba0987654321fedcba09',
    oracleAsset: { type: 'other', code: 'UNI' },
    targetPrice: 1500,
    condition: MarketCondition.BELOW,
    resolveTime: new Date('2024-03-15T23:59:59Z'),
    totalFor: 450000,
    totalAgainst: 750000,
    resolved: false,
    createdAt: new Date('2024-01-18T15:45:00Z'),
    currentPrice: 1200,
    oracleConfidence: 0.83,
  },
  {
    id: 'market_avax_50',
    description: 'Will Avalanche reach $50.00 by June 30, 2024?',
    creator: '0x9876543210abcdef9876543210abcdef98765432',
    oracleAsset: { type: 'other', code: 'AVAX' },
    targetPrice: 5000,
    condition: MarketCondition.ABOVE,
    resolveTime: new Date('2024-06-30T23:59:59Z'),
    totalFor: 1600000,
    totalAgainst: 1400000,
    resolved: false,
    createdAt: new Date('2024-01-25T12:00:00Z'),
    currentPrice: 3800,
    oracleConfidence: 0.90,
  },
  {
    id: 'market_matic_3',
    description: 'Will Polygon exceed $3.00 by July 31, 2024?',
    creator: '0xabcdef1234567890abcdef1234567890abcdef12',
    oracleAsset: { type: 'other', code: 'MATIC' },
    targetPrice: 300,
    condition: MarketCondition.ABOVE,
    resolveTime: new Date('2024-07-31T23:59:59Z'),
    totalFor: 1100000,
    totalAgainst: 900000,
    resolved: false,
    createdAt: new Date('2024-01-22T10:15:00Z'),
    currentPrice: 220,
    oracleConfidence: 0.86,
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    address: '0x1234567890abcdef1234567890abcdef12345678',
    username: 'CryptoWhale',
    email: 'whale@crypto.com',
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-25T15:30:00Z',
    total_bets: 45,
    total_winnings: 2500000,
  },
  {
    id: 2,
    address: '0x876543210fedcba9876543210fedcba98765432',
    username: 'PredictionPro',
    email: 'pro@predictions.com',
    created_at: '2024-01-02T00:00:00Z',
    last_login: '2024-01-25T14:20:00Z',
    total_bets: 32,
    total_winnings: 1800000,
  },
  {
    id: 3,
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    username: 'KALEFarmer',
    email: 'farmer@kale.com',
    created_at: '2024-01-03T00:00:00Z',
    last_login: '2024-01-25T16:45:00Z',
    total_bets: 28,
    total_winnings: 1200000,
  },
  {
    id: 4,
    address: '0xfedcba0987654321fedcba0987654321fedcba09',
    username: 'DeFiTrader',
    email: 'trader@defi.com',
    created_at: '2024-01-04T00:00:00Z',
    last_login: '2024-01-25T13:10:00Z',
    total_bets: 19,
    total_winnings: 800000,
  },
  {
    id: 5,
    address: '0x9876543210abcdef9876543210abcdef98765432',
    username: 'BlockchainBet',
    email: 'bet@blockchain.com',
    created_at: '2024-01-05T00:00:00Z',
    last_login: '2024-01-25T17:30:00Z',
    total_bets: 15,
    total_winnings: 600000,
  },
];

// Mock Bets
export const mockBets: Bet[] = [
  {
    marketId: 'market_btc_100k',
    userAddress: '0x1234567890abcdef1234567890abcdef12345678',
    amount: 50000,
    side: true, // FOR
    claimed: false,
    createdAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    marketId: 'market_btc_100k',
    userAddress: '0x876543210fedcba9876543210fedcba98765432',
    amount: 30000,
    side: false, // AGAINST
    claimed: false,
    createdAt: new Date('2024-01-15T11:15:00Z'),
  },
  {
    marketId: 'market_eth_5k',
    userAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: 75000,
    side: true, // FOR
    claimed: false,
    createdAt: new Date('2024-01-10T15:00:00Z'),
  },
  {
    marketId: 'market_kale_1',
    userAddress: '0x1234567890abcdef1234567890abcdef12345678',
    amount: 100000,
    side: true, // FOR
    claimed: false,
    createdAt: new Date('2024-01-05T10:00:00Z'),
  },
  {
    marketId: 'market_sol_200',
    userAddress: '0xfedcba0987654321fedcba0987654321fedcba09',
    amount: 25000,
    side: false, // AGAINST
    claimed: false,
    createdAt: new Date('2024-01-12T17:00:00Z'),
  },
];

// Mock User Statistics
export const mockUserStats = {
  '0x1234567890abcdef1234567890abcdef12345678': {
    total_bets: 45,
    total_bet_amount: 2500000,
    claimed_bets: 38,
    pending_claims: 7,
    wins: 32,
    losses: 13,
    win_rate: 71.1,
    recent_activity: [
      { created_at: '2024-01-25T15:30:00Z', amount: 50000, side: true, market_description: 'Will Bitcoin reach $100,000 by December 31, 2024?' },
      { created_at: '2024-01-24T14:20:00Z', amount: 75000, side: false, market_description: 'Will Ethereum reach $5,000 before Q2 2024 ends?' },
      { created_at: '2024-01-23T11:15:00Z', amount: 30000, side: true, market_description: 'Will KALE token reach $1.00 by March 31, 2024?' },
    ],
  },
  '0x876543210fedcba9876543210fedcba98765432': {
    total_bets: 32,
    total_bet_amount: 1800000,
    claimed_bets: 28,
    pending_claims: 4,
    wins: 22,
    losses: 10,
    win_rate: 68.8,
    recent_activity: [
      { created_at: '2024-01-25T14:20:00Z', amount: 30000, side: false, market_description: 'Will Bitcoin reach $100,000 by December 31, 2024?' },
      { created_at: '2024-01-24T13:10:00Z', amount: 45000, side: true, market_description: 'Will Solana drop below $200 by February 15, 2024?' },
      { created_at: '2024-01-23T10:45:00Z', amount: 60000, side: true, market_description: 'Will Cardano exceed $2.00 by April 30, 2024?' },
    ],
  },
  '0xabcdef1234567890abcdef1234567890abcdef12': {
    total_bets: 28,
    total_bet_amount: 1200000,
    claimed_bets: 24,
    pending_claims: 4,
    wins: 18,
    losses: 10,
    win_rate: 64.3,
    recent_activity: [
      { created_at: '2024-01-25T16:45:00Z', amount: 75000, side: true, market_description: 'Will Ethereum reach $5,000 before Q2 2024 ends?' },
      { created_at: '2024-01-24T15:30:00Z', amount: 40000, side: false, market_description: 'Will Uniswap fall below $15.00 by March 15, 2024?' },
      { created_at: '2024-01-23T12:20:00Z', amount: 55000, side: true, market_description: 'Will Chainlink reach $25.00 by May 31, 2024?' },
    ],
  },
};

// Mock Leaderboard
export const mockLeaderboard = [
  {
    rank: 1,
    address: '0x1234567890abcdef1234567890abcdef12345678',
    username: 'CryptoWhale',
    total_bets: 45,
    total_winnings: 2500000,
    wins: 32,
    losses: 13,
    win_rate: 71.1,
  },
  {
    rank: 2,
    address: '0x876543210fedcba9876543210fedcba98765432',
    username: 'PredictionPro',
    total_bets: 32,
    total_winnings: 1800000,
    wins: 22,
    losses: 10,
    win_rate: 68.8,
  },
  {
    rank: 3,
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    username: 'KALEFarmer',
    total_bets: 28,
    total_winnings: 1200000,
    wins: 18,
    losses: 10,
    win_rate: 64.3,
  },
  {
    rank: 4,
    address: '0xfedcba0987654321fedcba0987654321fedcba09',
    username: 'DeFiTrader',
    total_bets: 19,
    total_winnings: 800000,
    wins: 12,
    losses: 7,
    win_rate: 63.2,
  },
  {
    rank: 5,
    address: '0x9876543210abcdef9876543210abcdef98765432',
    username: 'BlockchainBet',
    total_bets: 15,
    total_winnings: 600000,
    wins: 9,
    losses: 6,
    win_rate: 60.0,
  },
];

// Mock Blockchain Data
export const mockBlockchainData = {
  status: {
    status: 'connected',
    network: 'testnet',
    latest_ledger: 12345678,
    latest_ledger_close_time: '2024-01-25T18:00:00Z',
    rpc_url: 'https://soroban-testnet.stellar.org',
  },
  contracts: {
    factory: { deployed: true, contract_id: 'contract_factory_123' },
    kale_token: { deployed: true, contract_id: 'contract_kale_456' },
    reflector: { deployed: true, contract_id: 'contract_reflector_789' },
  },
  networkStats: {
    network: 'testnet',
    latest_ledger: 12345678,
    recent_transactions: 1250,
    markets: { total: 10, active: 8 },
    bets: { total: 156 },
    updated_at: '2024-01-25T18:00:00Z',
  },
};

// Mock Price Data
export const mockPriceData = {
  BTC: { price: 85000, timestamp: '2024-01-25T18:00:00Z', decimals: 2 },
  ETH: { price: 3200, timestamp: '2024-01-25T18:00:00Z', decimals: 2 },
  KALE: { price: 75, timestamp: '2024-01-25T18:00:00Z', decimals: 7 },
  SOL: { price: 180, timestamp: '2024-01-25T18:00:00Z', decimals: 2 },
  ADA: { price: 150, timestamp: '2024-01-25T18:00:00Z', decimals: 2 },
  DOT: { price: 1200, timestamp: '2024-01-25T18:00:00Z', decimals: 2 },
  LINK: { price: 1800, timestamp: '2024-01-25T18:00:00Z', decimals: 2 },
  UNI: { price: 1200, timestamp: '2024-01-25T18:00:00Z', decimals: 2 },
  AVAX: { price: 3800, timestamp: '2024-01-25T18:00:00Z', decimals: 2 },
  MATIC: { price: 220, timestamp: '2024-01-25T18:00:00Z', decimals: 2 },
};

// Mock KALE Token Balances
export const mockKaleBalances = {
  '0x1234567890abcdef1234567890abcdef12345678': '2500000',
  '0x876543210fedcba9876543210fedcba98765432': '1800000',
  '0xabcdef1234567890abcdef1234567890abcdef12': '1200000',
  '0xfedcba0987654321fedcba0987654321fedcba09': '800000',
  '0x9876543210abcdef9876543210abcdef98765432': '600000',
};

// Helper function to get mock data by address
export const getMockUserByAddress = (address: string): User | undefined => {
  return mockUsers.find(user => user.address.toLowerCase() === address.toLowerCase());
};

export const getMockUserStats = (address: string) => {
  return mockUserStats[address.toLowerCase() as keyof typeof mockUserStats];
};

export const getMockKaleBalance = (address: string): string => {
  return mockKaleBalances[address.toLowerCase() as keyof typeof mockKaleBalances] || '0';
};

export const getMockPrice = (asset: string) => {
  return mockPriceData[asset as keyof typeof mockPriceData];
};

// Helper function to simulate market updates
export const updateMockMarket = (marketId: string, updates: Partial<Market>) => {
  const marketIndex = mockMarkets.findIndex(m => m.id === marketId);
  if (marketIndex !== -1) {
    mockMarkets[marketIndex] = { ...mockMarkets[marketIndex], ...updates };
  }
};

// Helper function to add mock bet
export const addMockBet = (bet: Bet) => {
  mockBets.push(bet);
  // Update market totals
  const market = mockMarkets.find(m => m.id === bet.marketId);
  if (market) {
    if (bet.side) {
      market.totalFor += bet.amount;
    } else {
      market.totalAgainst += bet.amount;
    }
  }
};
