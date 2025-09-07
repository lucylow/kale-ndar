import express from 'express';
import { z } from 'zod';
import { placeBet } from '../services/bettingService.js';
import { db } from '../db.js';
import { mintReceiptNFT } from '../services/nftService.js';

export const bets = express.Router();

bets.get('/', (_req,res)=>{
  res.json([...db.bets.values()]);
});

bets.post('/', async (req, res) => {
  const schema = z.object({
    marketId: z.string(),
    user: z.string(),
    outcome: z.string(),
    amount: z.number().positive()
  });
  const data = schema.parse(req.body);
  const b = placeBet(data);
  b.receiptTokenId = await mintReceiptNFT(b.id, b.user, { marketId: b.marketId, outcome: b.outcome, amount: b.amount });
  db.bets.set(b.id, b);
  res.status(201).json(b);
});
