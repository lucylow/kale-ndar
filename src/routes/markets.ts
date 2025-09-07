import express from 'express';
import { z } from 'zod';
import { createMarket, resolveMarket } from '../services/marketService.js';
import { db } from '../db.js';
import { settlePayouts } from '../utils.js';

export const markets = express.Router();

markets.get('/', (_req, res)=>{
  res.json([...db.markets.values()]);
});

markets.post('/', (req, res)=>{
  const schema = z.object({
    name: z.string(),
    description: z.string(),
    outcomes: z.array(z.string()).min(2),
    startTime: z.number(),
    endTime: z.number(),
    createdBy: z.string()
  });
  const data = schema.parse(req.body);
  const m = createMarket(data);
  res.status(201).json(m);
});

markets.post('/:id/resolve', (req, res)=>{
  const schema = z.object({ outcome: z.string() });
  const { outcome } = schema.parse(req.body);
  resolveMarket(req.params.id, outcome);
  settlePayouts(req.params.id, outcome);
  res.json({ok:true});
});
