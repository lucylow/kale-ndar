# KALE-ndar Backend

A comprehensive backend service for the KALE-ndar prediction market platform built on Stellar blockchain with Soroban smart contracts.

## Features

- **Stellar Blockchain Integration**: Full RPC integration with Stellar network
- **KALE Token Management**: Complete token operations including transfers, minting, burning
- **Market Creation**: Create and manage prediction markets on Stellar DEX
- **Fee Collection**: Automated fee collection and distribution system
- **Soroban Smart Contracts**: Integration with Rust-based smart contracts
- **TypeScript**: Fully typed backend with comprehensive error handling
- **RESTful API**: Clean API endpoints with validation and documentation

## Architecture

### Services

1. **StellarRpcService**: Handles all Stellar network interactions
2. **KaleTokenService**: Manages KALE token operations
3. **MarketCreationService**: Handles market creation and trading
4. **FeeCollectionService**: Manages fee collection and distribution

### Smart Contracts

- **KALE Integration Contract**: Main contract for staking, market creation, and fee collection
- **Market Factory Contract**: Creates and manages prediction markets
- **Reflector Oracle Contract**: Provides price feeds for market resolution

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Environment Configuration

### Required Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Stellar Network
HORIZON_URL=https://horizon-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Contract Addresses
KALE_TOKEN_CONTRACT_ID=your-kale-token-contract-id
KALE_INTEGRATION_CONTRACT_ID=your-kale-integration-contract-id
FEE_COLLECTOR_ADDRESS=your-fee-collector-address

# KALE Token
KALE_ISSUER_ADDRESS=your-kale-issuer-address
KALE_TOTAL_SUPPLY=1000000000
KALE_DECIMALS=7
```

## API Endpoints

### KALE Token Operations

- `GET /api/kale/info` - Get KALE token information
- `GET /api/kale/balance/:address` - Get KALE balance for address
- `POST /api/kale/transfer` - Transfer KALE tokens
- `POST /api/kale/mint` - Mint KALE tokens (admin)
- `POST /api/kale/burn` - Burn KALE tokens
- `POST /api/kale/offers/sell` - Create sell offer (KALE for XLM)
- `POST /api/kale/offers/buy` - Create buy offer (XLM for KALE)
- `GET /api/kale/orderbook` - Get KALE/XLM order book
- `GET /api/kale/price` - Get current KALE price

### Market Creation

- `POST /api/markets/create` - Create new prediction market
- `GET /api/markets/:marketId` - Get market information
- `GET /api/markets/user/:userAddress` - Get user's markets
- `POST /api/markets/offers/create` - Create market offer
- `POST /api/markets/offers/cancel` - Cancel market offer
- `POST /api/markets/offers/kale-xlm` - Create KALE/XLM trading offers
- `GET /api/markets/stats/kale` - Get KALE trading statistics

### Fee Collection

- `POST /api/fees/collect` - Collect platform fees (admin)
- `GET /api/fees/info` - Get current fee information
- `POST /api/fees/update-rate` - Update fee rate (admin)
- `POST /api/fees/update-collector` - Update fee collector (admin)
- `POST /api/fees/calculate` - Calculate fees for transaction
- `POST /api/fees/distribute` - Distribute fees to stakeholders
- `GET /api/fees/stats` - Get fee statistics
- `GET /api/fees/history` - Get fee collection history

### Blockchain Operations

- `GET /api/blockchain/status` - Get blockchain status
- `GET /api/blockchain/contracts` - Get contract details
- `GET /api/blockchain/transaction/:hash` - Get transaction status
- `GET /api/blockchain/events` - Get recent blockchain events
- `GET /api/blockchain/stats` - Get network statistics

### Health & Monitoring

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check
- `GET /api/health/ready` - Readiness check
- `GET /api/health/live` - Liveness check

## Smart Contract Integration

### KALE Integration Contract

The main contract handles:

- **Staking**: Stake KALE tokens for rewards
- **Market Creation**: Create prediction markets with fees
- **Fee Collection**: Collect and distribute platform fees
- **Reward Distribution**: Distribute staking rewards

### Contract Methods

```rust
// Staking
pub fn stake(env: Env, staker: Address, amount: i128)
pub fn unstake(env: Env, staker: Address, amount: i128)
pub fn claim_rewards(env: Env, staker: Address) -> i128

// Market Creation
pub fn create_market(env: Env, creator: Address, ...) -> BytesN<32>
pub fn get_market_info(env: Env, market_id: BytesN<32>) -> MarketInfo

// Fee Collection
pub fn collect_fees(env: Env, admin: Address) -> i128
pub fn get_fee_info(env: Env) -> FeeInfo
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── api/
│   └── server.ts              # Main server file
├── routes/
│   ├── blockchain.routes.ts   # Blockchain operations
│   ├── kale-token.routes.ts   # KALE token operations
│   ├── market-creation.routes.ts # Market creation
│   ├── fee-collection.routes.ts # Fee collection
│   ├── health.routes.ts        # Health checks
│   └── users.routes.ts        # User management
├── services/
│   ├── stellar-rpc.service.ts # Stellar RPC service
│   ├── kale-token.service.ts   # KALE token service
│   ├── market-creation.service.ts # Market creation service
│   └── fee-collection.service.ts # Fee collection service
└── utils/
    └── logger.ts              # Winston logger configuration
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t kale-ndar-backend .

# Run container
docker run -p 3000:3000 --env-file .env kale-ndar-backend
```

### Production Considerations

1. **Environment Variables**: Set all required environment variables
2. **Database**: Set up PostgreSQL database
3. **Redis**: Configure Redis for caching
4. **Monitoring**: Set up logging and monitoring
5. **Security**: Configure CORS, rate limiting, and security headers
6. **SSL**: Use HTTPS in production

## Security

- **Input Validation**: All inputs are validated using Joi schemas
- **Rate Limiting**: API endpoints are rate limited
- **CORS**: Cross-origin requests are properly configured
- **Helmet**: Security headers are set
- **Error Handling**: Sensitive information is not exposed in errors

## Monitoring

- **Health Checks**: Comprehensive health check endpoints
- **Logging**: Structured logging with Winston
- **Metrics**: Performance and error metrics
- **Alerts**: Configurable alerts for critical issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Enhanced market resolution mechanisms
- [ ] Advanced fee distribution strategies
- [ ] Real-time WebSocket updates
- [ ] Advanced analytics and reporting
- [ ] Multi-chain support
- [ ] Mobile API optimization