import { v4 as uuid } from 'uuid';
import { db, Bet } from '../db.js';

export function placeBet(input: Omit<Bet,'id'|'createdAt'|'settled'|'payout'|'receiptTokenId'>) {
  const bet: Bet = {
    id: uuid(),
    createdAt: Date.now(),
    settled: false,
    payout: undefined,
    receiptTokenId: undefined,
    ...input
  };
  db.bets.set(bet.id, bet);
  return bet;
}
