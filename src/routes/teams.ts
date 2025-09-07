import express from 'express';
import { z } from 'zod';
import { createTeamVault, joinTeam, teamDeposit } from '../services/teamService.js';
import { db } from '../db.js';

export const teams = express.Router();

teams.get('/', (_req,res)=>res.json([...db.teams.values()]));

teams.post('/', (req,res)=>{
  const schema = z.object({name:z.string(), marketId:z.string(), outcome:z.string(), creator:z.string()});
  const t = createTeamVault(...Object.values(schema.parse(req.body)));
  res.status(201).json(t);
});

teams.post('/:id/join', (req,res)=>{
  const schema = z.object({user:z.string()});
  const t = joinTeam(req.params.id, schema.parse(req.body).user);
  res.json(t);
});

teams.post('/:id/deposit', (req,res)=>{
  const schema = z.object({amount:z.number().positive()});
  const t = teamDeposit(req.params.id, schema.parse(req.body).amount);
  res.json(t);
});
