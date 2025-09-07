# 🏆 KALE-ndar Hackathon API Documentation

## 🚀 **Complete API Reference for First-Place Features**

This documentation covers all the hackathon-winning endpoints that make KALE-ndar stand out from the competition.

---

## 📋 **API Overview**

**Base URL:** `http://localhost:3000/api`

**Authentication:** All endpoints requiring user actions use `userSecret` for transaction signing.

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "count": 5
}
```

---

## 🎯 **1. Team Betting / Social Layer**

### Create Team Vault
```http
POST /api/teams/create
```

**Request Body:**
```json
{
  "name": "Crypto Bulls Squad",
  "description": "We predict BTC will moon!",
  "teamType": "competitive",
  "minDeposit": "1000",
  "maxMembers": 5,
  "bettingStrategy": "majority",
  "creatorSecret": "S..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "team-uuid",
    "name": "Crypto Bulls Squad",
    "creator": "GABC123...",
    "members": [...],
    "totalDeposits": "0",
    "contractAddress": "CVAULT123...",
    "teamType": "competitive",
    "bettingStrategy": "majority"
  }
}
```

### Join Team Vault
```http
POST /api/teams/join
```

**Request Body:**
```json
{
  "teamId": "team-uuid",
  "nickname": "BullTrader",
  "depositAmount": "5000",
  "userSecret": "S..."
}
```

### Propose Team Bet
```http
POST /api/teams/propose-bet
```

**Request Body:**
```json
{
  "teamId": "team-uuid",
  "marketId": "market-uuid",
  "outcome": "above",
  "amount": "10000",
  "requesterSecret": "S..."
}
```

### Vote on Team Bet
```http
POST /api/teams/vote-bet
```

**Request Body:**
```json
{
  "betId": "bet-uuid",
  "vote": "approve",
  "voterSecret": "S..."
}
```

### Get Team Leaderboard
```http
GET /api/teams/leaderboard
```

---

## 🎨 **2. NFT Prediction Receipts**

### Mint Bet Receipt
```http
POST /api/nft-receipts/mint
```

**Request Body:**
```json
{
  "betId": "bet-uuid",
  "marketId": "market-uuid",
  "outcome": "above",
  "amount": "5000",
  "odds": "2.5",
  "ownerSecret": "S..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "receipt-uuid",
    "tokenId": "nft-token-id",
    "betId": "bet-uuid",
    "owner": "GABC123...",
    "outcome": "above",
    "amount": "5000",
    "odds": "2.5",
    "metadata": {
      "name": "KALE-ndar Receipt #abc12345",
      "description": "Prediction receipt for BTC Price Prediction",
      "image": "https://kale-ndar.com/api/receipt-image/...",
      "attributes": [
        {"trait_type": "Market", "value": "BTC Price Prediction"},
        {"trait_type": "Outcome", "value": "Above"},
        {"trait_type": "Amount", "value": "5000 KALE"},
        {"trait_type": "Rarity", "value": "Rare"}
      ]
    }
  }
}
```

### List Receipt for Sale
```http
POST /api/nft-receipts/list
```

**Request Body:**
```json
{
  "receiptId": "receipt-uuid",
  "askPrice": "6000",
  "sellerSecret": "S..."
}
```

### Place Bid on Receipt
```http
POST /api/nft-receipts/bid
```

**Request Body:**
```json
{
  "receiptId": "receipt-uuid",
  "bidPrice": "5500",
  "buyerSecret": "S..."
}
```

### Execute Receipt Trade
```http
POST /api/nft-receipts/trade
```

**Request Body:**
```json
{
  "receiptId": "receipt-uuid",
  "price": "5750",
  "sellerSecret": "S...",
  "buyerSecret": "S..."
}
```

### Get NFT Metadata
```http
GET /api/nft-receipts/metadata/:tokenId
```

---

## 🤖 **3. Dynamic Markets**

### Create Market Template
```http
POST /api/dynamic-markets/templates
```

**Request Body:**
```json
{
  "name": "BTC Daily Price Target",
  "description": "Will BTC reach new daily high?",
  "assetSymbol": "BTC",
  "condition": "above",
  "thresholdType": "percentage",
  "thresholdValue": "5",
  "timeframe": "daily",
  "creatorSecret": "S..."
}
```

### Get Market Templates
```http
GET /api/dynamic-markets/templates
```

### Generate Market from Template
```http
POST /api/dynamic-markets/generate
```

**Request Body:**
```json
{
  "templateId": "template-uuid",
  "triggerData": {
    "price": "65000",
    "prevPrice": "62000"
  }
}
```

### Get Auto-Generated Markets
```http
GET /api/dynamic-markets/auto-generated
```

---

## 🏆 **4. Gamification & Reputation**

### Get User Profile
```http
GET /api/gamification/profile/:userAddress
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "GABC123...",
    "nickname": "CryptoTrader",
    "level": 15,
    "experience": 2500,
    "reputation": 150,
    "badges": [
      {
        "id": "high_roller",
        "name": "High Roller",
        "description": "Bet over 100,000 KALE total",
        "icon": "💰",
        "rarity": "rare",
        "earnedAt": 1703123456789
      }
    ],
    "achievements": [...],
    "stats": {
      "totalBets": 50,
      "winRate": 68.5,
      "longestWinStreak": 8,
      "totalVolume": "250000"
    }
  }
}
```

### Get Leaderboards
```http
GET /api/gamification/leaderboard/overall
GET /api/gamification/leaderboard/accuracy
GET /api/gamification/leaderboard/volume
GET /api/gamification/leaderboard/streak
```

**Query Parameters:**
- `period`: `all-time`, `weekly`, `monthly`
- `limit`: Number of entries (default: 100)

### Get User Badges
```http
GET /api/gamification/badges/:userAddress
```

### Get User Achievements
```http
GET /api/gamification/achievements/:userAddress
```

### Get User Ranking
```http
GET /api/gamification/ranking/:userAddress?category=overall
```

### Update User Stats
```http
POST /api/gamification/update-bet-stats
POST /api/gamification/update-market-stats
```

---

## 💰 **5. Composable DeFi Hooks**

### Deposit into DeFi Protocol
```http
POST /api/defi-hooks/deposit
```

**Request Body:**
```json
{
  "betId": "bet-uuid",
  "marketId": "market-uuid",
  "amount": "50000",
  "protocolId": "stellar_amm_1",
  "duration": 168,
  "userSecret": "S..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "position-uuid",
    "userId": "GABC123...",
    "amount": "50000",
    "protocol": "amm",
    "apy": "8.5",
    "startTime": 1703123456789,
    "endTime": 1703728256789,
    "transactionHash": "tx-hash"
  }
}
```

### Auto-Deposit with Strategy
```http
POST /api/defi-hooks/auto-deposit
```

**Request Body:**
```json
{
  "betId": "bet-uuid",
  "marketId": "market-uuid",
  "unusedAmount": "100000",
  "strategyId": "balanced",
  "userSecret": "S..."
}
```

### Withdraw from DeFi
```http
POST /api/defi-hooks/withdraw
```

**Request Body:**
```json
{
  "positionId": "position-uuid",
  "userSecret": "S..."
}
```

### Get Available Protocols
```http
GET /api/defi-hooks/protocols
```

### Get Yield Strategies
```http
GET /api/defi-hooks/strategies
```

### Get DeFi Statistics
```http
GET /api/defi-hooks/stats
```

---

## 🌐 **6. Oracle Integration**

### Create Price Feed Subscription
```http
POST /api/oracle/subscriptions/price-feed
```

**Request Body:**
```json
{
  "marketId": "market-uuid",
  "baseAsset": "BTC",
  "quoteAsset": "USD",
  "threshold": 100,
  "heartbeat": 60
}
```

### Create Event Data Subscription
```http
POST /api/oracle/subscriptions/event-data
```

**Request Body:**
```json
{
  "marketId": "market-uuid",
  "eventType": "ethereum_gas_fees",
  "threshold": 50
}
```

### Handle Oracle Webhook
```http
POST /api/oracle/webhook
```

**Request Body:**
```json
{
  "subscriptionId": "sub-uuid",
  "eventType": "price_update",
  "timestamp": 1703123456789,
  "data": {
    "price": "65000",
    "prevPrice": "62000",
    "change24h": "4.8"
  }
}
```

### Get Current Price
```http
GET /api/oracle/price/:baseAsset/:quoteAsset
```

### Get Oracle Data for Market
```http
GET /api/oracle/market/:marketId/data
```

---

## 📱 **7. Micro-Betting**

### Process SMS Bet
```http
POST /api/micro-betting/sms-bet
```

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "message": "YES BTC 0.10",
  "marketId": "btc-market-uuid"
}
```

### Get SMS Bet History
```http
GET /api/micro-betting/history/:phoneNumber
```

---

## 🌱 **8. Impact / ESG Markets**

### Create ESG Market
```http
POST /api/markets/create
```

**Request Body:**
```json
{
  "creator": "GABC123...",
  "description": "Will renewable energy exceed 40% of US grid by 2026?",
  "assetSymbol": "RENEWABLE",
  "targetPrice": "40",
  "condition": "above",
  "resolveTime": 1735689600000,
  "marketFee": "100",
  "creatorSecret": "S..."
}
```

---

## 🏛️ **9. Governance**

### Create Governance Proposal
```http
POST /api/governance/proposals
```

**Request Body:**
```json
{
  "title": "Increase market creation fee to 2%",
  "description": "Proposal to increase fees for sustainability",
  "proposerSecret": "S..."
}
```

### Vote on Proposal
```http
POST /api/governance/vote
```

**Request Body:**
```json
{
  "proposalId": "prop-uuid",
  "vote": "yes",
  "voterSecret": "S..."
}
```

### Execute Proposal
```http
POST /api/governance/execute
```

**Request Body:**
```json
{
  "proposalId": "prop-uuid",
  "executorSecret": "S..."
}
```

---

## ✨ **10. Enhanced UX Features**

### Quick Market Creation
```http
POST /api/markets/quick-create
```

**Request Body:**
```json
{
  "template": "btc_price_target",
  "timeframe": "24h",
  "creatorSecret": "S..."
}
```

### Live Odds Updates
```http
GET /api/betting/market/:id/odds/live
```
*Returns WebSocket connection with real-time odds*

### Mobile-Optimized Endpoints
```http
GET /api/mobile/markets
GET /api/mobile/bets
GET /api/mobile/profile
```

---

## 🔧 **Core Services (Enhanced)**

### Place Bet (with NFT receipt)
```http
POST /api/betting/place
```

**Request Body:**
```json
{
  "marketId": "market-uuid",
  "userId": "GABC123...",
  "outcome": "above",
  "amount": "5000",
  "userSecret": "S..."
}
```

### Resolve Market (with auto-payouts)
```http
POST /api/resolution/resolve
```

**Request Body:**
```json
{
  "marketId": "market-uuid",
  "winningOutcome": "above",
  "resolutionType": "oracle",
  "resolverSecret": "S..."
}
```

---

## 🚀 **Demo Endpoints for Judges**

### Health Check
```http
GET /api/health
```

### API Overview
```http
GET /api
```

### Get All Endpoints
```http
GET /api/docs
```

---

## 📊 **Response Examples**

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "count": 5
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation error",
  "details": "User address is required",
  "code": 400
}
```

---

## 🎯 **Quick Test Commands**

```bash
# Test team creation
curl -X POST http://localhost:3000/api/teams/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Team","description":"Hackathon demo","creatorSecret":"S..."}'

# Test NFT minting
curl -X POST http://localhost:3000/api/nft-receipts/mint \
  -H "Content-Type: application/json" \
  -d '{"betId":"bet-123","marketId":"market-123","outcome":"above","amount":"1000","odds":"2.5","ownerSecret":"S..."}'

# Test gamification
curl http://localhost:3000/api/gamification/leaderboard/overall

# Test DeFi hooks
curl -X POST http://localhost:3000/api/defi-hooks/deposit \
  -H "Content-Type: application/json" \
  -d '{"betId":"bet-123","marketId":"market-123","amount":"5000","protocolId":"stellar_amm_1","duration":168,"userSecret":"S..."}'
```

---

## 🏆 **Why This API Wins Hackathons**

1. **🎯 Comprehensive**: 10 unique feature sets
2. **🔧 Technical**: Soroban + Reflector + DeFi integration
3. **💡 Innovative**: Team betting + NFT receipts + auto-markets
4. **🌍 Real-world**: ESG markets + SMS betting + cross-chain
5. **⚡ Demo-ready**: Smooth UX + real-time updates
6. **🚀 Scalable**: Modular architecture + comprehensive coverage
7. **💎 Polish**: Gamification + governance + mobile optimization

**This API represents the future of decentralized prediction markets!** 🚀
