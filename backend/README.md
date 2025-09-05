# KALE-ndar Backend

A comprehensive backend service for the KALE-ndar prediction market platform, built with Node.js, Express, PostgreSQL, and integrated with the Stellar blockchain.

## 🚀 Features

- **RESTful API** - Complete API for markets, users, and blockchain interactions
- **Real-time Events** - WebSocket support for live market updates
- **Blockchain Integration** - Direct integration with Stellar Soroban contracts
- **Event Listener** - Automated blockchain event monitoring
- **Database Management** - PostgreSQL with automatic schema initialization
- **Security** - Rate limiting, CORS, input validation, and security headers
- **Logging** - Structured logging with Winston
- **Docker Support** - Complete containerization with Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- Redis (optional, for caching)
- Docker & Docker Compose (for containerized deployment)

## 🛠️ Installation

### Local Development

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

4. **Set up PostgreSQL**
   ```bash
   # Create database
   createdb kalendar
   
   # Or using Docker
   docker run --name postgres -e POSTGRES_DB=kalendar -e POSTGRES_USER=user -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:15-alpine
   ```

5. **Start the services**
   ```bash
   # Start API server
   npm run dev
   
   # Start event listener (in another terminal)
   npm run event-listener
   ```

### Docker Deployment

1. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your production configuration
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Check service status**
   ```bash
   docker-compose ps
   docker-compose logs -f api
   ```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://api.kale-ndar.com`

### Authentication
Most endpoints require authentication via wallet signature. Include the user's wallet address in the request headers:
```
X-User-Address: <wallet-address>
```

### Endpoints

#### Markets

- `GET /api/markets` - Get all markets with pagination
- `GET /api/markets/:id` - Get specific market details
- `POST /api/markets` - Create new market
- `POST /api/markets/:id/bet` - Place bet on market
- `POST /api/markets/:id/resolve` - Resolve market
- `GET /api/markets/:id/bets/:user` - Get user's bets for market

#### Users

- `GET /api/users/:address` - Get user profile
- `POST /api/users/:address` - Create/update user profile
- `GET /api/users/:address/stats` - Get user statistics
- `GET /api/users/:address/bets` - Get user's betting history
- `GET /api/users/leaderboard` - Get leaderboard

#### Blockchain

- `GET /api/blockchain/status` - Get blockchain connection status
- `GET /api/blockchain/contracts` - Get contract deployment status
- `GET /api/blockchain/transaction/:hash` - Get transaction status
- `GET /api/blockchain/markets/:contractId` - Get market from blockchain
- `GET /api/blockchain/oracle/price/:asset` - Get oracle price
- `GET /api/blockchain/token/balance/:address` - Get KALE token balance
- `GET /api/blockchain/events` - Get recent blockchain events
- `GET /api/blockchain/stats` - Get network statistics

#### Health

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with database
- `GET /health/database` - Database health check
- `GET /health/websocket` - WebSocket health check

### WebSocket Events

Connect to `ws://localhost:3000/ws` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'market_created':
      console.log('New market:', data.data);
      break;
    case 'market_resolved':
      console.log('Market resolved:', data.data);
      break;
    case 'bet_placed':
      console.log('Bet placed:', data.data);
      break;
    case 'winnings_claimed':
      console.log('Winnings claimed:', data.data);
      break;
  }
};

// Subscribe to specific market updates
ws.send(JSON.stringify({
  type: 'subscribe_market',
  payload: { marketId: 'market_123' }
}));
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | API server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `kalendar` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `SOROBAN_RPC_URL` | Stellar RPC URL | `https://soroban-testnet.stellar.org` |
| `FACTORY_CONTRACT_ID` | Market factory contract ID | - |
| `KALE_TOKEN_CONTRACT_ID` | KALE token contract ID | - |
| `REFLECTOR_CONTRACT_ID` | Reflector oracle contract ID | - |

### Database Schema

The application automatically creates the following tables:

- `markets` - Prediction markets
- `bets` - User bets
- `users` - User profiles
- `market_events` - Blockchain events

## 🚀 Deployment

### Production Setup

1. **Set up environment**
   ```bash
   export NODE_ENV=production
   export DB_HOST=your-db-host
   export SOROBAN_RPC_URL=https://soroban-mainnet.stellar.org
   # ... other environment variables
   ```

2. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set up reverse proxy (Nginx)**
   ```bash
   # Configure nginx.conf for your domain
   docker-compose up -d nginx
   ```

### Monitoring

- **Health checks**: `GET /health/detailed`
- **Logs**: `docker-compose logs -f api`
- **Database**: Connect to PostgreSQL and run queries
- **Metrics**: Implement Prometheus metrics (optional)

## 🔒 Security

- Rate limiting on all API endpoints
- CORS configuration
- Input validation with Joi
- Security headers with Helmet
- SQL injection protection
- XSS protection

## 📊 Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all levels)
- `logs/error.log` (errors only)

Log levels: `error`, `warn`, `info`, `http`, `debug`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 📝 Scripts

```bash
# Development
npm run dev              # Start API server in development
npm run event-listener   # Start event listener

# Production
npm start               # Start API server in production
npm run build           # Build for production

# Database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with test data

# Deployment
npm run deploy          # Deploy contracts to blockchain
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check the API docs
- **Issues**: Create an issue on GitHub
- **Discord**: Join our community Discord

---

Built with ❤️ by the KALE-ndar team
