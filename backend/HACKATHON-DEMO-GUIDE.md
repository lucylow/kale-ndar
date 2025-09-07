# 🏆 KALE-ndar Hackathon Demo Guide

## 🚀 **First-Place Hackathon Features**

This guide showcases the **10 high-impact features** that will make KALE-ndar a standout hackathon winner:

---

## 1. 🎯 **Social Layer / Team Betting** 
**"Proof-of-Teamwork" Betting Vaults**

### Demo Flow:
```bash
# 1. Create a team vault
POST /api/teams/create
{
  "name": "Crypto Bulls Squad",
  "description": "We predict BTC will moon!",
  "teamType": "competitive",
  "minDeposit": "1000",
  "maxMembers": 5,
  "bettingStrategy": "majority",
  "creatorSecret": "S..."
}

# 2. Join the team
POST /api/teams/join
{
  "teamId": "team-uuid",
  "nickname": "BullTrader",
  "depositAmount": "5000",
  "userSecret": "S..."
}

# 3. Propose a team bet
POST /api/teams/propose-bet
{
  "teamId": "team-uuid",
  "marketId": "market-uuid",
  "outcome": "above",
  "amount": "10000",
  "requesterSecret": "S..."
}

# 4. Vote on the bet
POST /api/teams/vote-bet
{
  "betId": "bet-uuid",
  "vote": "approve",
  "voterSecret": "S..."
}
```

### **Why Judges Love This:**
- ✅ **Collaborative betting** - friends pool KALE together
- ✅ **Democratic decision-making** - voting on bets
- ✅ **Social engagement** - team leaderboards
- ✅ **Unique to KALE-ndar** - not found in Polymarket

---

## 2. 🎨 **NFT Prediction Receipts**
**Tradable Bet Tokens on Stellar DEX**

### Demo Flow:
```bash
# 1. Mint NFT receipt after placing bet
POST /api/nft-receipts/mint
{
  "betId": "bet-uuid",
  "marketId": "market-uuid",
  "outcome": "above",
  "amount": "5000",
  "odds": "2.5",
  "ownerSecret": "S..."
}

# 2. List receipt for sale
POST /api/nft-receipts/list
{
  "receiptId": "receipt-uuid",
  "askPrice": "6000",
  "sellerSecret": "S..."
}

# 3. Place bid on receipt
POST /api/nft-receipts/bid
{
  "receiptId": "receipt-uuid",
  "bidPrice": "5500",
  "buyerSecret": "S..."
}

# 4. Execute trade
POST /api/nft-receipts/trade
{
  "receiptId": "receipt-uuid",
  "price": "5750",
  "sellerSecret": "S...",
  "buyerSecret": "S..."
}
```

### **Why Judges Love This:**
- ✅ **Secondary markets** - sell bet exposure before resolution
- ✅ **DeFi composability** - NFTs tradeable on Stellar DEX
- ✅ **Hedging mechanism** - exit positions early
- ✅ **Real utility** - not just collectibles

---

## 3. 🤖 **Dynamic Markets via Reflector**
**Auto-Generated Prediction Markets**

### Demo Flow:
```bash
# 1. Create market template
POST /api/dynamic-markets/templates
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

# 2. Auto-generate market when BTC moves 5%
# (Triggered by Reflector oracle webhook)
POST /api/oracle/webhook
{
  "subscriptionId": "sub-uuid",
  "eventType": "threshold_breach",
  "data": {
    "price": "65000",
    "prevPrice": "62000",
    "change": "4.8%"
  }
}

# 3. Market automatically created:
# "Will BTC exceed $65,000 by tomorrow?"
```

### **Why Judges Love This:**
- ✅ **Automation** - markets create themselves
- ✅ **Oracle integration** - real-time price feeds
- ✅ **No manual setup** - fully automated
- ✅ **Scalable** - infinite markets possible

---

## 4. 🏆 **Gamification & Reputation**
**Leaderboards, Badges, and Achievement System**

### Demo Flow:
```bash
# 1. Get user profile with badges
GET /api/gamification/profile/GABC123...
# Returns: level, badges, achievements, stats

# 2. Get leaderboards
GET /api/gamification/leaderboard/accuracy
GET /api/gamification/leaderboard/volume
GET /api/gamification/leaderboard/streak

# 3. Update stats after bet
POST /api/gamification/update-bet-stats
{
  "userAddress": "GABC123...",
  "betAmount": "10000",
  "isWinner": true,
  "payoutAmount": "25000"
}

# 4. Check earned badges
GET /api/gamification/badges/GABC123...
# Returns: ["First Bet", "High Roller", "Hot Streak"]
```

### **Why Judges Love This:**
- ✅ **User retention** - engagement mechanics
- ✅ **Social competition** - leaderboards
- ✅ **Achievement system** - badges and levels
- ✅ **Data-driven** - accuracy tracking

---

## 5. 💰 **Composable DeFi Hooks**
**Capital Efficiency - Money Works While You Wait**

### Demo Flow:
```bash
# 1. Deposit unused bet funds into DeFi
POST /api/defi-hooks/deposit
{
  "betId": "bet-uuid",
  "marketId": "market-uuid",
  "amount": "50000",
  "protocolId": "stellar_amm_1",
  "duration": 168, // 1 week
  "userSecret": "S..."
}

# 2. Auto-deposit with yield strategy
POST /api/defi-hooks/auto-deposit
{
  "betId": "bet-uuid",
  "marketId": "market-uuid",
  "unusedAmount": "100000",
  "strategyId": "balanced",
  "userSecret": "S..."
}

# 3. Withdraw with rewards
POST /api/defi-hooks/withdraw
{
  "positionId": "position-uuid",
  "userSecret": "S..."
}
# Returns: { amount: "50000", rewards: "500", transactionHash: "..." }
```

### **Why Judges Love This:**
- ✅ **Capital efficiency** - buzzword judges love
- ✅ **Yield farming** - money works while waiting
- ✅ **DeFi integration** - AMMs, lending, staking
- ✅ **Risk management** - multiple strategies

---

## 6. 🌐 **Cross-Chain Prediction Feeds**
**Multi-Chain Event Data via Reflector**

### Demo Flow:
```bash
# 1. Create cross-chain event subscription
POST /api/oracle/subscriptions/event-data
{
  "marketId": "market-uuid",
  "eventType": "ethereum_gas_fees",
  "threshold": 50
}

# 2. Create Solana TPS market
POST /api/markets/create
{
  "description": "Will Solana TPS exceed 1000 today?",
  "assetSymbol": "SOL",
  "targetPrice": "1000",
  "condition": "above",
  "resolveTime": 1735689600000,
  "creatorSecret": "S..."
}

# 3. Oracle webhook triggers resolution
POST /api/oracle/webhook
{
  "eventType": "event_data",
  "data": {
    "chain": "solana",
    "metric": "tps",
    "value": 1200,
    "threshold": 1000
  }
}
```

### **Why Judges Love This:**
- ✅ **Multi-chain** - not just Stellar
- ✅ **Real-world data** - gas fees, TPS, etc.
- ✅ **Expanded scope** - more market types
- ✅ **Stellar as hub** - cross-chain predictions

---

## 7. 📱 **Micro-Betting via SMS/WhatsApp**
**Accessibility + Low-Cost Transactions**

### Demo Flow:
```bash
# 1. User texts: "YES BTC 0.10" to +1-xxx-xxx-xxxx
# 2. System processes:
POST /api/micro-betting/sms-bet
{
  "phoneNumber": "+1234567890",
  "message": "YES BTC 0.10",
  "marketId": "btc-market-uuid"
}

# 3. Auto-deducts 0.10 KALE from user balance
# 4. Places bet on BTC market
# 5. Sends confirmation SMS
```

### **Why Judges Love This:**
- ✅ **Accessibility** - no app needed
- ✅ **Real-world adoption** - SMS betting
- ✅ **Stellar advantage** - low transaction costs
- ✅ **Mass market appeal** - simple interface

---

## 8. 🌱 **Impact / ESG Prediction Markets**
**Non-Financial Event Markets**

### Demo Flow:
```bash
# 1. Create ESG market
POST /api/markets/create
{
  "description": "Will renewable energy exceed 40% of US grid by 2026?",
  "assetSymbol": "RENEWABLE",
  "targetPrice": "40",
  "condition": "above",
  "resolveTime": 1735689600000,
  "creatorSecret": "S..."
}

# 2. Create climate market
POST /api/markets/create
{
  "description": "Will global CO2 emissions decrease by 5% in 2024?",
  "assetSymbol": "CO2",
  "targetPrice": "5",
  "condition": "above",
  "resolveTime": 1735689600000,
  "creatorSecret": "S..."
}
```

### **Why Judges Love This:**
- ✅ **Social good** - ESG focus
- ✅ **Institutional appeal** - broader market
- ✅ **Non-financial** - real-world impact
- ✅ **Trending topic** - sustainability

---

## 9. 🏛️ **Treasury & Community Governance**
**DAO Voting with KALE Tokens**

### Demo Flow:
```bash
# 1. Create governance proposal
POST /api/governance/proposals
{
  "title": "Increase market creation fee to 2%",
  "description": "Proposal to increase fees for sustainability",
  "proposerSecret": "S..."
}

# 2. Vote on proposal
POST /api/governance/vote
{
  "proposalId": "prop-uuid",
  "vote": "yes",
  "voterSecret": "S..."
}

# 3. Execute if passed
POST /api/governance/execute
{
  "proposalId": "prop-uuid",
  "executorSecret": "S..."
}
```

### **Why Judges Love This:**
- ✅ **Decentralization** - community governance
- ✅ **Token utility** - KALE for voting
- ✅ **Web3 ethos** - DAO structure
- ✅ **Sustainability** - community-driven

---

## 10. ✨ **Hackathon-Friendly UX Polish**
**One-Click Everything + Real-Time Charts**

### Demo Flow:
```bash
# 1. One-click market creation
POST /api/markets/quick-create
{
  "template": "btc_price_target",
  "timeframe": "24h",
  "creatorSecret": "S..."
}

# 2. Real-time odds updates
GET /api/betting/market/:id/odds/live
# Returns: WebSocket connection with live odds

# 3. Mobile-optimized endpoints
GET /api/mobile/markets
GET /api/mobile/bets
GET /api/mobile/profile
```

### **Why Judges Love This:**
- ✅ **Demo-ready** - smooth presentation
- ✅ **Mobile-first** - responsive design
- ✅ **Real-time** - live data updates
- ✅ **User-friendly** - one-click actions

---

## 🎯 **Demo Script for Judges**

### **Opening (30 seconds):**
*"KALE-ndar is the first prediction market platform with proof-of-teamwork betting, NFT receipts, and automated market generation. Let me show you 3 features that make us unique..."*

### **Feature 1: Team Betting (60 seconds):**
1. Create team vault: "Crypto Bulls Squad"
2. Join with 3 friends
3. Propose team bet on BTC
4. Show voting mechanism
5. Execute bet when majority approves

### **Feature 2: NFT Receipts (60 seconds):**
1. Place individual bet
2. Mint NFT receipt automatically
3. List receipt for sale
4. Show secondary market trading
5. Demonstrate hedging capability

### **Feature 3: Dynamic Markets (60 seconds):**
1. Show Reflector oracle integration
2. Create market template for BTC
3. Demonstrate auto-generation when price moves
4. Show real-time market creation
5. Highlight automation benefits

### **Closing (30 seconds):**
*"KALE-ndar combines social betting, DeFi composability, and oracle automation to create the most advanced prediction market platform on Stellar. We're not just competing with Polymarket - we're building the future of decentralized prediction markets."*

---

## 🚀 **Quick Start Commands**

```bash
# Start the enhanced backend
cd backend
npm install
npm run dev

# Test team betting
curl -X POST http://localhost:3000/api/teams/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Team","description":"Hackathon demo","creatorSecret":"S..."}'

# Test NFT receipts
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

## 🏆 **Why This Wins Hackathons**

1. **🎯 Originality**: Team betting + NFT receipts = unique combo
2. **🔧 Technical Depth**: Soroban contracts + Reflector oracles + DeFi
3. **💡 Innovation**: Automated market generation + cross-chain data
4. **🌍 Real Impact**: ESG markets + accessibility features
5. **⚡ Demo-Ready**: Smooth UX + real-time updates
6. **🚀 Scalable**: Modular architecture + comprehensive APIs
7. **💎 Polish**: Gamification + governance + mobile optimization

**KALE-ndar isn't just a prediction market - it's the future of decentralized social betting with DeFi composability!** 🚀

