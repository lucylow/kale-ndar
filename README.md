# Kale-ndar 

A comprehensive prediction market platform built on Stellar blockchain with Soroban smart contracts, featuring KALE token integration and Reflector oracle services.

## 🌟 Features

- **Prediction Markets**: Create and participate in prediction markets for real-world events
- **KALE Integration**: Stake KALE tokens for rewards and use them for betting
- **Oracle Services**: Reliable price feeds and event data via Reflector oracle
- **RESTful API**: Complete backend API for frontend integration
- **Smart Contracts**: Fully implemented Soroban smart contracts

## 🏗️ Architecture

```
Kale-ndar Backend
├── Smart Contracts (Rust/Soroban)
│   ├── Prediction Market Contract
│   ├── KALE Integration Contract
│   ├── Reflector Oracle Contract
│   └── Shared Types Library
├── Backend API (Python/Flask)
│   ├── Markets API
│   ├── Staking API
│   ├── Oracle API
│   └── Database Models
├── Scripts & Utilities
│   ├── Deployment Scripts
│   ├── Setup Scripts
│   └── Development Tools
└── Documentation
    ├── API Documentation
    ├── Smart Contract Docs
    └── Deployment Guide
```

## 🚀 Quick Start

### Prerequisites

- Rust 1.70+
- Python 3.8+
- Soroban CLI
- Git

### Setup

1. **Clone and setup the environment:**
   ```bash
   git clone <repository-url>
   cd kale-ndar-backend
   ./scripts/setup.sh
   ```

2. **Deploy smart contracts:**
   ```bash
   ./scripts/deploy-contracts.sh
   ```

3. **Start the development server:**
   ```bash
   ./scripts/start-dev.sh
   ```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
kale-ndar-backend/
├── contracts/                 # Smart contracts
│   ├── shared-types/         # Common data structures
│   ├── prediction-market/    # Main prediction market logic
│   ├── kale-integration/     # KALE staking and rewards
│   └── reflector-oracle/     # Oracle price feeds
├── kale-ndar-api/           # Flask backend API
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   └── main.py          # Flask application
│   └── venv/                # Python virtual environment
├── scripts/                 # Deployment and utility scripts
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🔧 Smart Contracts

### Prediction Market Contract
- Create prediction markets for real-world events
- Place bets on market outcomes
- Resolve markets based on oracle data
- Claim winnings from successful predictions

### KALE Integration Contract
- Stake KALE tokens for rewards
- Unstake tokens with accumulated rewards
- Claim staking rewards
- Calculate APY based on total staked amount

### Reflector Oracle Contract
- Submit price feeds for various assets
- Retrieve latest price data
- Submit event outcome data
- Manage oracle node permissions

## 🌐 API Endpoints

### Markets API
- `GET /api/markets` - List all markets
- `POST /api/markets` - Create new market
- `GET /api/markets/{id}` - Get market details
- `POST /api/bets` - Place a bet
- `GET /api/users/{address}/bets` - Get user's bets

### Staking API
- `GET /api/staking/stakes/{address}` - Get stake info
- `POST /api/staking/stakes` - Create/update stake
- `POST /api/staking/stakes/{address}/claim` - Claim rewards
- `GET /api/staking/stats` - Get staking statistics

### Oracle API
- `GET /api/oracle/prices` - Get all price feeds
- `GET /api/oracle/prices/{asset}` - Get asset price
- `POST /api/oracle/prices` - Update price feed
- `GET /api/oracle/health` - Get oracle health status

## 🔐 Security Features

- **Access Control**: Role-based permissions for contract functions
- **Input Validation**: Comprehensive validation of all inputs
- **Error Handling**: Proper error codes and messages
- **Rate Limiting**: Protection against spam and abuse
- **Audit Trail**: Complete logging of all transactions

## 🧪 Testing

Run smart contract tests:
```bash
./scripts/test-contracts.sh
```

Run API tests:
```bash
cd kale-ndar-api
source venv/bin/activate
python -m pytest tests/
```

## 🚀 Deployment

### Testnet Deployment
```bash
NETWORK=testnet ./scripts/deploy-contracts.sh
```

### Mainnet Deployment
```bash
NETWORK=mainnet ./scripts/deploy-contracts.sh
```

Contract addresses will be saved to `deployed-contracts.json`

## 📊 Monitoring

The backend includes comprehensive monitoring and health checks:

- **Oracle Health**: Monitor price feed freshness and confidence
- **Market Statistics**: Track total markets, bets, and volume
- **Staking Metrics**: Monitor total staked amount and APY
- **API Performance**: Request logging and error tracking

## 🔧 Configuration

Environment variables in `.env`:

```bash
# Network Configuration
NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443

# Contract Addresses
PREDICTION_MARKET_CONTRACT=<contract-id>
KALE_INTEGRATION_CONTRACT=<contract-id>
REFLECTOR_ORACLE_CONTRACT=<contract-id>

# API Configuration
API_HOST=0.0.0.0
API_PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation

## 🔮 Roadmap

- [ ] Advanced market types (multi-outcome, conditional)
- [ ] Liquidity mining programs
- [ ] Cross-chain oracle integration
- [ ] Mobile SDK
- [ ] Advanced analytics dashboard
- [ ] Governance token integration

## 📈 Performance

The backend is designed for high performance:
- **Smart Contracts**: Optimized for minimal gas usage
- **API**: Efficient database queries with pagination
- **Caching**: Redis integration for frequently accessed data
- **Scaling**: Horizontal scaling support with load balancers

---

Built with ❤️ for the Stellar ecosystem

