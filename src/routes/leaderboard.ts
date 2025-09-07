import express from 'express';
import { leaderboard } from '../utils.js';

export const leaders = express.Router();

leaders.get('/', (req,res)=>{
  const limit = parseInt((req.query.limit as string) || '10', 10);
  res.json(leaderboard(limit));
});
