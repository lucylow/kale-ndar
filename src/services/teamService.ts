import { v4 as uuid } from 'uuid';
import { db, TeamVault } from '../db.js';

export function createTeamVault(name: string, marketId: string, outcome: string, creator: string) {
  const tv: TeamVault = { id: uuid(), name, members:[creator], marketId, outcome, balance: 0 };
  db.teams.set(tv.id, tv);
  return tv;
}

export function joinTeam(teamId: string, user: string) {
  const t = db.teams.get(teamId);
  if (!t) throw new Error('team not found');
  if (!t.members.includes(user)) t.members.push(user);
  db.teams.set(teamId, t);
  return t;
}

export function teamDeposit(teamId: string, amount: number) {
  const t = db.teams.get(teamId);
  if (!t) throw new Error('team not found');
  t.balance += amount;
  db.teams.set(teamId, t);
  return t;
}
