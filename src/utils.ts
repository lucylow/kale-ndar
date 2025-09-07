import { db, Bet } from './db.js';

export function getMarketPool(marketId: string) {
  const bets = [...db.bets.values()].filter(b => b.marketId === marketId);
  const total = bets.reduce((s,b)=>s+b.amount,0);
  const byOutcome: Record<string, number> = {};
  for (const b of bets) byOutcome[b.outcome]=(byOutcome[b.outcome]||0)+b.amount;
  return { total, byOutcome };
}

export function settlePayouts(marketId: string, winning: string) {
  const relevant = [...db.bets.values()].filter(b=>b.marketId===marketId);
  const totalPool = relevant.reduce((s,b)=>s+b.amount,0);
  const winPool = relevant.filter(b=>b.outcome===winning).reduce((s,b)=>s+b.amount,0);
  for (const bet of relevant) {
    if (bet.outcome === winning) {
      bet.payout = Math.floor((bet.amount / winPool) * totalPool);
    } else {
      bet.payout = 0;
    }
    bet.settled = true;
    db.bets.set(bet.id, bet);
  }
}

export function leaderboard(limit=10) {
  const scores: Record<string,{won:number, placed:number, roi:number}> = {};
  for (const b of db.bets.values()) {
    const s = scores[b.user] ||= {won:0, placed:0, roi:0};
    s.placed += b.amount;
    s.roi += (b.payout??0) - b.amount;
    if ((b.payout??0) > 0) s.won++;
  }
  return Object.entries(scores)
    .map(([user, s])=>({user, ...s}))
    .sort((a,b)=>b.roi-a.roi)
    .slice(0, limit);
}
