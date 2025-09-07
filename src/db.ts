export type Market = {
  id: string;
  name: string;
  description: string;
  outcomes: string[];
  startTime: number;
  endTime: number;
  resolvedOutcome?: string;
  createdBy: string;
};

export type Bet = {
  id: string;
  marketId: string;
  user: string; // wallet
  outcome: string;
  amount: number; // KALE smallest unit
  createdAt: number;
  settled: boolean;
  payout?: number;
  receiptTokenId?: string;
};

export type TeamVault = {
  id: string;
  name: string;
  members: string[];
  marketId: string;
  outcome: string;
  balance: number;
};

export const db = {
  markets: new Map<string, Market>(),
  bets: new Map<string, Bet>(),
  teams: new Map<string, TeamVault>()
};
