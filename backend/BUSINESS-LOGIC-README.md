# KALE-ndar Business Logic Layer

This document provides a comprehensive overview of the business logic layer for the KALE-ndar decentralized prediction market platform.

## Architecture Overview

The business logic layer is structured as a modular system with clear responsibility separation:

```
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Market Creation Service  │  Betting Service                │
│  - Market validation      │  - Bet placement                │
│  - Contract interaction  │  - Payout calculation           │
│  - Fee management         │  - Odds calculation              │
├─────────────────────────────────────────────────────────────┤
│  Market Resolution Service │  Oracle Service                 │
│  - Resolution triggers    │  - Reflector integration        │
│  - Payout distribution   │  - Price feeds                  │
│  - Auto-resolution       │  - Event data                   │
├─────────────────────────────────────────────────────────────┤
│  Database Models          │  Event Handlers                 │
│  - Market schema         │  - Oracle webhooks              │
│  - Bet schema            │  - Resolution triggers          │
│  - Oracle schema         │  - Error handling               │
└─────────────────────────────────────────────────────────────┘
```

## Core Services

### 1. Market Creation Service (`market-creation.service.ts`)

**Responsibilities:**
- Create and validate new prediction markets
- Define market timelines and outcomes
- Register markets on Stellar blockchain
- Manage market creation fees
- Handle market metadata and descriptions

**Key Features:**
- Market validation (description length, price validation, timeline checks)
- KALE token balance verification for fees
- Soroban contract integration for market creation
- Market offer creation for trading pairs
- Market statistics and analytics

**API Endpoints:**
- `POST /api/markets/create` - Create new market
- `GET /api/markets/:id` - Get market information
- `GET /api/markets/user/:userId` - Get user's markets
- `GET /api/markets/stats` - Get market statistics

### 2. Betting Service (`betting.service.ts`)

**Responsibilities:**
- Accept and validate bets on open markets
- Calculate odds and payouts
- Track user betting history
- Handle bet settlement and distribution
- Manage betting statistics

**Key Features:**
- Bet validation (amount, outcome, market status)
- Real-time odds calculation based on betting pools
- Proportional payout distribution
- Bet cancellation (if market allows)
- Comprehensive betting analytics

**API Endpoints:**
- `POST /api/betting/place` - Place a bet
- `GET /api/betting/user/:userId` - Get user's bets
- `GET /api/betting/market/:marketId` - Get market bets
- `GET /api/betting/market/:marketId/odds` - Get current odds
- `POST /api/betting/cancel` - Cancel a bet
- `GET /api/betting/stats/global` - Get global statistics

### 3. Market Resolution Service (`market-resolution.service.ts`)

**Responsibilities:**
- Handle market resolution triggers
- Validate resolution timing and conditions
- Coordinate payout calculations
- Manage auto-resolution systems
- Track resolution history

**Key Features:**
- Multiple resolution types (manual, oracle, timeout)
- Resolution validation and timing checks
- Automatic resolution processing
- Resolution trigger management
- Comprehensive resolution tracking

**API Endpoints:**
- `POST /api/resolution/resolve` - Resolve market manually
- `GET /api/resolution/market/:marketId/info` - Get resolution info
- `POST /api/resolution/setup-trigger` - Setup auto-resolution
- `POST /api/resolution/process-oracle` - Process oracle resolution
- `POST /api/resolution/process-pending` - Process all pending

### 4. Oracle Service (`oracle.service.ts`)

**Responsibilities:**
- Integrate with Reflector oracles
- Manage price feed subscriptions
- Handle real-world event data
- Process oracle webhooks
- Manage XRF token funding

**Key Features:**
- Reflector API integration
- Price feed subscriptions with configurable thresholds
- Event data subscriptions
- Webhook handling and processing
- Subscription management and renewal
- Oracle data caching and cleanup

**API Endpoints:**
- `POST /api/oracle/subscriptions/price-feed` - Create price feed
- `POST /api/oracle/subscriptions/event-data` - Create event subscription
- `POST /api/oracle/webhook` - Handle oracle webhooks
- `GET /api/oracle/price/:base/:quote` - Get current price
- `GET /api/oracle/market/:marketId/data` - Get market oracle data
- `GET /api/oracle/stats` - Get oracle statistics

## Database Models

### Market Model (`market.model.ts`)
```typescript
interface MarketAttributes {
  id: string;
  creator: string;
  description: string;
  assetSymbol: string;
  targetPrice: string;
  condition: 'above' | 'below';
  resolveTime: number;
  createdAt: number;
  resolved: boolean;
  outcome?: boolean;
  totalFor: string;
  totalAgainst: string;
  marketFee: string;
  contractAddress?: string;
  resolutionType?: 'manual' | 'oracle' | 'timeout';
  resolutionData?: any;
  autoResolveEnabled: boolean;
}
```

### Bet Model (`bet.model.ts`)
```typescript
interface BetAttributes {
  id: string;
  marketId: string;
  userId: string;
  outcome: string;
  amount: string;
  placedAt: number;
  settled: boolean;
  payoutAmount?: string;
  transactionHash?: string;
  odds?: string;
  profitLoss?: string;
  isWinner?: boolean;
}
```

### Oracle Models (`oracle.model.ts`)
```typescript
interface OracleSubscriptionAttributes {
  id: string;
  marketId: string;
  reflectorSubscriptionId?: string;
  baseAsset: string;
  quoteAsset: string;
  threshold: number;
  heartbeat: number;
  balance: string;
  isActive: boolean;
  createdAt: number;
  webhookUrl: string;
  oracleType: 'price_feed' | 'event_data';
  eventType?: string;
}
```

## Event Handling

### Oracle Event Handler (`oracle-event-handler.ts`)

**Features:**
- Asynchronous event processing
- Retry logic with exponential backoff
- Event queue management
- Comprehensive error handling
- Event statistics and monitoring

**Event Types:**
- `price_update` - Price data updates
- `threshold_breach` - Threshold condition met
- `heartbeat` - Subscription health check
- `event_data` - Real-world event data

## Integration Points

### Stellar Blockchain Integration
- **Soroban Smart Contracts**: Market creation, bet placement, resolution
- **Stellar SDK**: Transaction building and submission
- **KALE Token**: Native token for fees and payouts
- **Stellar DEX**: Trading pair management

### Reflector Oracle Integration
- **Price Feeds**: Real-time asset prices
- **Event Data**: Real-world event information
- **Webhook System**: Real-time notifications
- **XRF Token**: Subscription funding

## Configuration

### Environment Variables
```bash
# Stellar Configuration
HORIZON_URL=https://horizon-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
KALE_TOKEN_CONTRACT_ID=your_kale_contract_id
KALE_INTEGRATION_CONTRACT_ID=your_integration_contract_id

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kale_ndar
DB_USER=postgres
DB_PASSWORD=password
DB_DIALECT=postgres

# Oracle Configuration
REFLECTOR_API_URL=https://api.reflector.network
REFLECTOR_WEBHOOK_URL=https://your-backend.com
XRF_TOKEN_ADDRESS=your_xrf_token_address
SUBSCRIPTION_BALANCE=1000
REFLECTOR_API_KEY=your_api_key
```

## API Documentation

### Authentication
All API endpoints require proper authentication. User secrets are used for transaction signing.

### Error Handling
All services implement comprehensive error handling with:
- Input validation
- Business logic validation
- Blockchain interaction error handling
- Database error handling
- Oracle service error handling

### Rate Limiting
API endpoints are protected with rate limiting:
- 100 requests per 15 minutes per IP
- Configurable limits for different endpoint types

## Security Considerations

### Input Validation
- All inputs are validated using Joi schemas
- SQL injection prevention through parameterized queries
- XSS protection through input sanitization

### Transaction Security
- Private keys are never stored
- All transactions are signed client-side
- Transaction validation before submission

### Oracle Security
- Webhook signature verification
- Subscription balance monitoring
- Data integrity checks

## Monitoring and Logging

### Logging
- Comprehensive logging using Winston
- Structured logging with context
- Error tracking and alerting
- Performance monitoring

### Metrics
- Service performance metrics
- Database connection monitoring
- Oracle subscription health
- Market and betting statistics

## Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis (for caching)
- Stellar testnet/mainnet access
- Reflector oracle access

### Installation
```bash
cd backend
npm install
npm run build
npm run db:migrate
npm start
```

### Development
```bash
npm run dev
```

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Coverage
```bash
npm run test:coverage
```

## Future Enhancements

### Planned Features
- Advanced betting mechanisms (parlays, futures)
- More oracle integrations
- Cross-chain compatibility
- Advanced analytics and reporting
- Mobile API optimization
- Real-time notifications

### Scalability Considerations
- Database sharding strategies
- Microservices architecture
- Load balancing
- Caching optimization
- Oracle data optimization

## Support

For technical support or questions about the business logic layer:
- Check the API documentation
- Review the service logs
- Consult the database models
- Contact the development team

---

This business logic layer provides a robust foundation for the KALE-ndar prediction market platform, with comprehensive market creation, betting, resolution, and oracle integration capabilities.
