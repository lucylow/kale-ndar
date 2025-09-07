import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import { markets } from './routes/markets.js';
import { bets } from './routes/bets.js';
import { teams } from './routes/teams.js';
import { leaders } from './routes/leaderboard.js';
import { reflectorRouter } from './oracle/reflectorWebhook.js';

const app = express();
app.use(bodyParser.json());

app.get('/', (_req,res)=>res.send('KALE-ndar API 🥬'));

app.use('/markets', markets);
app.use('/bets', bets);
app.use('/teams', teams);
app.use('/leaderboard', leaders);
app.use('/reflector', reflectorRouter);

app.use((err:any,_req:any,res:any,_next:any)=>{
  console.error(err);
  res.status(400).json({error: err.message || 'unknown error'});
});

const port = parseInt(process.env.PORT || '8080',10);
app.listen(port, ()=>console.log(`Server listening on :${port}`));
