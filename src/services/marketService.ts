import { v4 as uuid } from 'uuid';
import { db, Market } from '../db.js';

export function createMarket(input: Omit<Market,'id'|'resolvedOutcome'>): Market {
  if (input.outcomes.length < 2) throw new Error('Need >=2 outcomes');
  if (input.endTime <= input.startTime) throw new Error('endTime must be after startTime');
  const market: Market = { id: uuid(), ...input };
  db.markets.set(market.id, market);
  return market;
}

export function resolveMarket(marketId: string, outcome: string) {
  const m = db.markets.get(marketId);
  if (!m) throw new Error('market not found');
  if (!m.outcomes.includes(outcome)) throw new Error('invalid outcome');
  m.resolvedOutcome = outcome;
  db.markets.set(marketId, m);
}
