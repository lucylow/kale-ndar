export interface Market {
  id: string;
  description: string;
  creator: string;
  oracleAsset: OracleAsset;
  targetPrice: number;
  condition: MarketCondition;
  resolveTime: Date;
  totalFor: number;
  totalAgainst: number;
  resolved: boolean;
  outcome?: boolean;
  createdAt: Date;
  currentPrice?: number; // Current price from oracle
  oracleConfidence?: number; // Oracle confidence level
}

export interface OracleAsset {
  type: 'stellar' | 'other';
  code: string;
  contractId?: string;
}

export enum MarketCondition {
  ABOVE = 0,
  BELOW = 1
}

export interface Bet {
  marketId: string;
  userAddress: string;
  amount: number;
  side: boolean; // true for FOR, false for AGAINST
  claimed: boolean;
  createdAt: Date;
}

export interface User {
  id: number;
  address: string;
  username: string | null;
  email: string | null;
  created_at: string;
  last_login: string;
  total_bets: number;
  total_winnings: number;
}

export interface MarketCreationParams {
  description: string;
  oracleAsset: OracleAsset;
  targetPrice: number;
  condition: MarketCondition;
  resolveTime: Date;
}

export interface PlaceBetParams {
  amount: number;
  side: boolean; // true for FOR, false for AGAINST
}

export interface Wallet {
  isConnected: boolean;
  publicKey: string | null;
  signTransaction: (transactionXdr: string) => Promise<string>;
}

export interface TransactionResult {
  hash: string;
  status: 'success' | 'error';
  message?: string;
}

// KALE-specific types
export interface KaleStakeInfo {
  staker: string;
  amount: number;
  stakeTime: number;
  lastRewardTime: number;
  accumulatedRewards: number;
  apy: number;
}

export interface KaleWorkResult {
  hash: string;
  nonce: number;
  difficulty: number;
  reward: number;
}

export interface KaleHarvestResult {
  claimedAmount: number;
  totalRewards: number;
  newStakeAmount: number;
}

// Oracle types
export interface PriceData {
  price: number;
  timestamp: number;
  confidence: number;
  source: string;
  decimals: number;
}

export interface OracleSubscription {
  id: string;
  base: { asset: string; source: string };
  quote: { asset: string; source: string };
  threshold: number;
  heartbeat: number;
  webhook: string;
  balance: string;
}

// Market resolution types
export interface MarketResolution {
  marketId: string;
  resolved: boolean;
  outcome: boolean;
  price: number;
  timestamp: number;
  oracleSource: string;
}