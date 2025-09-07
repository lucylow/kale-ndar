import express from 'express';
import crypto from 'crypto';

export const reflectorRouter = express.Router();

// Simple verification middleware
function verifySignature(req: express.Request) {
  const secret = process.env.REFLECTOR_WEBHOOK_SECRET || 'changeme';
  const sig = req.header('x-reflector-signature') || '';
  const h = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(h));
}

reflectorRouter.post('/webhook', (req, res) => {
  try {
    // if (!verifySignature(req)) return res.status(401).send('bad sig');
    const payload = req.body;
    console.log('Reflector update:', JSON.stringify(payload,null,2));
    // Decide to auto-create or resolve markets here...
    res.send('ok');
  } catch (e:any) {
    res.status(500).send(e.message);
  }
});
