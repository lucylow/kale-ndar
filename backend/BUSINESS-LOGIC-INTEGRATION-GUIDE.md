# KALE-ndar Business Logic Integration Guide

This guide demonstrates how the comprehensive business logic layer integrates with the existing KALE-ndar platform and provides step-by-step examples of the complete workflow.

## System Architecture Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                        KALE-ndar Platform                      │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React)     │  Backend (Node.js/TypeScript)          │
│  - Wallet Integration │  - Business Logic Layer                 │
│  - Market UI          │  - API Routes                           │
│  - Betting Interface  │  - Database Models                      │
│  - Oracle Dashboard   │  - Event Handlers                      │
├─────────────────────────────────────────────────────────────────┤
│  Stellar Blockchain   │  Reflector Oracles                     │
│  - Soroban Contracts  │  - Price Feeds                         │
│  - KALE Token         │  - Event Data                          │
│  - Stellar DEX        │  - Webhook System                      │
└─────────────────────────────────────────────────────────────────┘
```

## Complete Workflow Examples

### 1. Market Creation Workflow

```typescript
// 1. User creates a market via frontend
const marketRequest = {
  creator: "GABC123...",
  description: "Will BTC reach $100,000 by end of 2024?",
  assetSymbol: "BTC",
  targetPrice: "100000",
  condition: "above",
  resolveTime: 1735689600000, // Dec 31, 2024
  marketFee: "1000"
};

// 2. Backend validates and creates market
const marketService = new MarketCreationService(stellarRpc, kaleToken, contractId);
const market = await marketService.createMarket(creatorKeypair, marketRequest);

// 3. Oracle subscription is automatically created
const oracleService = new OracleService(oracleConfig);
await oracleService.createPriceFeedSubscription(
  market.id,
  "BTC",
  "USD",
  100, // 1% threshold
  60   // 60 min heartbeat
);

// 4. Market is now live and accepting bets
```

### 2. Betting Workflow

```typescript
// 1. User places a bet
const betRequest = {
  marketId: "market-uuid",
  userId: "GABC123...",
  outcome: "above",
  amount: "5000",
  userSecret: "SABC123..."
};

// 2. Betting service validates and processes
const bettingService = new BettingService(stellarRpc, kaleToken, marketService, contractId);
const bet = await bettingService.placeBet(betRequest);

// 3. Odds are calculated in real-time
const odds = await bettingService.calculateOdds(marketId, "above");
// Returns: "2.15" (decimal odds)

// 4. Market betting info is updated
const bettingInfo = await bettingService.getMarketBettingInfo(marketId);
// Returns: { totalFor: "15000", totalAgainst: "10000", forOdds: "1.67", againstOdds: "2.50" }
```

### 3. Oracle Integration Workflow

```typescript
// 1. Oracle receives price update
const webhookPayload = {
  subscriptionId: "sub-uuid",
  eventType: "price_update",
  timestamp: 1703123456789,
  data: {
    price: "95000",
    prevPrice: "92000",
    change24h: "3.26"
  }
};

// 2. Oracle service processes the update
const oracleService = new OracleService(oracleConfig);
await oracleService.handleWebhook(webhookPayload);

// 3. Event handler checks for resolution triggers
const eventHandler = new OracleEventHandler({
  oracleService,
  resolutionService,
  enableAutoResolution: true
});

// 4. If threshold breached, market resolution is triggered
if (priceChange > threshold) {
  const resolutionResult = await resolutionService.processOracleResolution(marketId);
}
```

### 4. Market Resolution Workflow

```typescript
// 1. Market reaches resolution time or oracle trigger
const resolutionRequest = {
  marketId: "market-uuid",
  winningOutcome: "above",
  resolutionData: { finalPrice: "102000" },
  resolverSecret: "SADMIN123...",
  resolutionType: "oracle"
};

// 2. Resolution service validates and resolves
const resolutionService = new MarketResolutionService(stellarRpc, marketService, bettingService, oracleService, contractId);
const result = await resolutionService.resolveMarket(resolutionRequest);

// 3. Payouts are calculated and distributed
const payouts = await bettingService.calculatePayouts(marketId, "above");
// Returns: Array of payout calculations for each bet

// 4. Bets are settled
const transactions = await bettingService.settleBets(marketId, "above");
// Returns: Array of successful payout transactions
```

## API Integration Examples

### Frontend Integration

```typescript
// Market Creation
const createMarket = async (marketData) => {
  const response = await fetch('/api/markets/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(marketData)
  });
  return response.json();
};

// Place Bet
const placeBet = async (betData) => {
  const response = await fetch('/api/betting/place', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(betData)
  });
  return response.json();
};

// Get Market Odds
const getOdds = async (marketId, outcome) => {
  const response = await fetch(`/api/betting/market/${marketId}/odds?outcome=${outcome}`);
  return response.json();
};

// Get Oracle Data
const getOracleData = async (marketId) => {
  const response = await fetch(`/api/oracle/market/${marketId}/data`);
  return response.json();
};
```

### Webhook Integration

```typescript
// Oracle webhook endpoint
app.post('/api/oracle/webhook', async (req, res) => {
  try {
    const payload = req.body;
    
    // Validate webhook signature
    if (!validateWebhookSignature(payload)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Process oracle data
    await oracleService.handleWebhook(payload);
    
    // Trigger event handler
    await eventHandler.handleWebhook(payload);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Webhook processing failed:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});
```

## Database Schema Integration

### Market Creation with Database

```sql
-- Market is created in database
INSERT INTO markets (
  id, creator, description, asset_symbol, target_price, 
  condition, resolve_time, market_fee, auto_resolve_enabled
) VALUES (
  'market-uuid', 'GABC123...', 'Will BTC reach $100,000?', 
  'BTC', '100000', 'above', 1735689600000, '1000', true
);

-- Oracle subscription is linked
INSERT INTO oracle_subscriptions (
  id, market_id, base_asset, quote_asset, threshold, 
  heartbeat, balance, oracle_type, is_active
) VALUES (
  'sub-uuid', 'market-uuid', 'BTC', 'USD', 100, 
  60, '1000', 'price_feed', true
);
```

### Bet Processing with Database

```sql
-- Bet is recorded
INSERT INTO bets (
  id, market_id, user_id, outcome, amount, 
  placed_at, odds, transaction_hash
) VALUES (
  'bet-uuid', 'market-uuid', 'GABC123...', 'above', 
  '5000', 1703123456789, '2.15', 'tx-hash'
);

-- Market totals are updated
UPDATE markets SET 
  total_for = total_for + '5000'
WHERE id = 'market-uuid';
```

## Error Handling and Resilience

### Comprehensive Error Handling

```typescript
// Service-level error handling
try {
  const result = await bettingService.placeBet(betRequest);
  return { success: true, data: result };
} catch (error) {
  if (error.message.includes('Insufficient balance')) {
    return { success: false, error: 'INSUFFICIENT_BALANCE', code: 400 };
  } else if (error.message.includes('Market closed')) {
    return { success: false, error: 'MARKET_CLOSED', code: 400 };
  } else {
    logger.error('Unexpected betting error:', error);
    return { success: false, error: 'INTERNAL_ERROR', code: 500 };
  }
}

// Oracle error handling with retry
const oracleHandler = new OracleEventHandler({
  oracleService,
  resolutionService,
  enableAutoResolution: true,
  maxRetries: 3,
  retryDelay: 5000
});
```

### Database Transaction Management

```typescript
// Atomic operations with database transactions
await databaseService.transaction(async (transaction) => {
  // Create market
  const market = await Market.create(marketData, { transaction });
  
  // Create oracle subscription
  const subscription = await OracleSubscription.create({
    marketId: market.id,
    ...subscriptionData
  }, { transaction });
  
  // Update market status
  await market.update({ status: 'active' }, { transaction });
});
```

## Performance Optimization

### Caching Strategy

```typescript
// Oracle data caching
class OracleService {
  private priceCache: Map<string, PriceData> = new Map();
  
  async getCurrentPrice(baseAsset: string, quoteAsset: string): Promise<PriceData | null> {
    const cacheKey = `${baseAsset}/${quoteAsset}`;
    
    // Check cache first
    if (this.priceCache.has(cacheKey)) {
      const cached = this.priceCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached;
      }
    }
    
    // Fetch from API and cache
    const priceData = await this.fetchFromReflector(baseAsset, quoteAsset);
    this.priceCache.set(cacheKey, priceData);
    return priceData;
  }
}
```

### Database Optimization

```typescript
// Optimized queries with proper indexing
const getMarketBets = async (marketId: string): Promise<Bet[]> => {
  return await Bet.findAll({
    where: { marketId },
    include: [{
      model: Market,
      attributes: ['description', 'resolveTime']
    }],
    order: [['placedAt', 'DESC']],
    limit: 100
  });
};
```

## Monitoring and Analytics

### Service Metrics

```typescript
// Service performance monitoring
class ServiceMetrics {
  private metrics = {
    marketsCreated: 0,
    betsPlaced: 0,
    marketsResolved: 0,
    oracleUpdates: 0,
    errors: 0
  };
  
  incrementMetric(metric: string) {
    this.metrics[metric]++;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      uptime: process.uptime()
    };
  }
}
```

### Oracle Health Monitoring

```typescript
// Oracle subscription health check
const checkOracleHealth = async () => {
  const subscriptions = await oracleService.getActiveSubscriptions();
  
  for (const subscription of subscriptions) {
    const status = await oracleService.getSubscriptionStatus(subscription.id);
    
    if (!status.isActive || status.balance < '100') {
      logger.warn('Oracle subscription needs attention:', {
        subscriptionId: subscription.id,
        marketId: subscription.marketId,
        balance: status.balance
      });
    }
  }
};
```

## Deployment Checklist

### Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp env.example .env
# Edit .env with your configuration

# 3. Set up database
npm run db:migrate
npm run db:seed

# 4. Build and start
npm run build
npm start
```

### Service Dependencies

```typescript
// Service initialization order
const initializeServices = async () => {
  // 1. Database connection
  await databaseService.initialize();
  
  // 2. Stellar RPC service
  const stellarRpc = new StellarRpcService(stellarConfig);
  
  // 3. KALE token service
  const kaleToken = new KaleTokenService(stellarRpc, kaleConfig);
  
  // 4. Market creation service
  const marketService = new MarketCreationService(stellarRpc, kaleToken, contractId);
  
  // 5. Betting service
  const bettingService = new BettingService(stellarRpc, kaleToken, marketService, contractId);
  
  // 6. Oracle service
  const oracleService = new OracleService(oracleConfig);
  
  // 7. Resolution service
  const resolutionService = new MarketResolutionService(stellarRpc, marketService, bettingService, oracleService, contractId);
  
  // 8. Event handler
  const eventHandler = new OracleEventHandler({
    oracleService,
    resolutionService,
    enableAutoResolution: true
  });
  
  logger.info('All services initialized successfully');
};
```

## Testing Strategy

### Unit Tests

```typescript
// Betting service tests
describe('BettingService', () => {
  it('should place bet successfully', async () => {
    const betRequest = {
      marketId: 'test-market',
      userId: 'test-user',
      outcome: 'above',
      amount: '1000',
      userSecret: 'test-secret'
    };
    
    const result = await bettingService.placeBet(betRequest);
    expect(result.id).toBeDefined();
    expect(result.amount).toBe('1000');
  });
  
  it('should calculate payouts correctly', async () => {
    const payouts = await bettingService.calculatePayouts('market-id', 'above');
    expect(payouts).toBeInstanceOf(Array);
    expect(payouts.every(p => p.isWinner !== undefined)).toBe(true);
  });
});
```

### Integration Tests

```typescript
// End-to-end workflow test
describe('Market Lifecycle', () => {
  it('should complete full market lifecycle', async () => {
    // 1. Create market
    const market = await marketService.createMarket(creatorKeypair, marketRequest);
    
    // 2. Place bets
    const bet1 = await bettingService.placeBet(betRequest1);
    const bet2 = await bettingService.placeBet(betRequest2);
    
    // 3. Resolve market
    const resolution = await resolutionService.resolveMarket(resolutionRequest);
    
    // 4. Verify payouts
    const payouts = await bettingService.calculatePayouts(market.id, 'above');
    expect(payouts.length).toBe(2);
  });
});
```

This comprehensive business logic layer provides a robust foundation for the KALE-ndar prediction market platform, with full integration between market creation, betting, resolution, and oracle services.
