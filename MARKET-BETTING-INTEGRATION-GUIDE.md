# Market Creation and Betting Integration Guide

## 🎯 Overview

This guide provides comprehensive instructions for integrating the functional "Create Market" and "Place Bet" buttons into your KALE-ndar application. The implementation includes both frontend components and backend API endpoints.

## 🚀 What's Been Implemented

### **Frontend Components**

#### 1. **MarketCreationModal** (`src/components/MarketCreationModal.tsx`)
- **Complete market creation form** with validation
- **Category selection** with visual icons and colors
- **Date picker** for market end date
- **Dynamic options** (add/remove betting options)
- **Oracle type selection** (Reflector, Manual, External API)
- **Market parameters** (initial liquidity, platform fee)
- **Real-time preview** of the market being created
- **Form validation** with error handling
- **API integration** for market creation

#### 2. **BettingModal** (`src/components/BettingModal.tsx`)
- **Betting interface** with YES/NO options
- **Amount input** with quick amount buttons
- **Real-time payout calculation** based on current odds
- **Bet summary** showing potential profit/loss
- **Balance checking** and validation
- **Market state display** with current odds and percentages
- **API integration** for placing bets

#### 3. **EnhancedMarketCard** (`src/components/EnhancedMarketCard.tsx`)
- **Comprehensive market display** with all relevant information
- **Visual progress bars** for each betting option
- **Market statistics** (total pool, bets, participants, time remaining)
- **Status indicators** (active, ended, settled)
- **Category badges** with icons and colors
- **Expandable details** for more information
- **Integrated betting modal** trigger

#### 4. **MarketService** (`src/services/marketService.ts`)
- **Complete API service** for market and betting operations
- **TypeScript interfaces** for type safety
- **Error handling** and logging
- **Pagination support** for large datasets
- **Comprehensive CRUD operations**

### **Backend API Endpoints**

#### 1. **Markets API** (`backend/src/routes/markets.ts`)
- `POST /api/markets` - Create new market
- `GET /api/markets` - Get all markets with filtering
- `GET /api/markets/:id` - Get single market
- `PUT /api/markets/:id` - Update market
- `POST /api/markets/:id/resolve` - Resolve market
- `GET /api/markets/:id/stats` - Get market statistics

#### 2. **Bets API** (`backend/src/routes/bets.ts`)
- `POST /api/bets` - Place a bet
- `GET /api/bets/user/:userAddress` - Get user's bets
- `GET /api/bets/:id` - Get bet details
- `DELETE /api/bets/:id` - Cancel bet
- `GET /api/bets/stats/:userAddress` - Get betting statistics

## 🔧 Integration Steps

### **Step 1: Update Your Prediction Markets Page**

Replace your existing market cards with the new enhanced components:

```tsx
// In your PredictionMarkets.tsx or similar component
import { MarketCreationModal } from '@/components/MarketCreationModal';
import { EnhancedMarketCard } from '@/components/EnhancedMarketCard';
import { marketService } from '@/services/marketService';

const PredictionMarkets = () => {
  const [markets, setMarkets] = useState([]);
  const [userBalance, setUserBalance] = useState(0);

  // Load markets on component mount
  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      const result = await marketService.getMarkets();
      setMarkets(result.data);
    } catch (error) {
      console.error('Failed to load markets:', error);
    }
  };

  const handleMarketCreated = (newMarket) => {
    setMarkets(prev => [newMarket, ...prev]);
    // Show success notification
  };

  const handleBetPlaced = (newBet) => {
    // Refresh markets to show updated odds
    loadMarkets();
    // Show success notification
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Market button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Prediction Markets</h1>
        <MarketCreationModal onMarketCreated={handleMarketCreated} />
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <EnhancedMarketCard
            key={market.id}
            market={market}
            userBalance={userBalance}
            onBetPlaced={handleBetPlaced}
          />
        ))}
      </div>
    </div>
  );
};
```

### **Step 2: Update Your Navigation/Header**

Replace the existing "Create Market" button with the new modal:

```tsx
// In your Navigation.tsx or Header component
import { MarketCreationModal } from '@/components/MarketCreationModal';

const Navigation = () => {
  return (
    <nav className="flex items-center space-x-4">
      {/* Other navigation items */}
      
      <MarketCreationModal 
        onMarketCreated={(market) => {
          // Handle market creation success
          console.log('Market created:', market);
        }}
      />
    </nav>
  );
};
```

### **Step 3: Add Wallet Integration**

Update your wallet context to provide balance information:

```tsx
// In your WalletContext.tsx
import { marketService } from '@/services/marketService';

const WalletContext = () => {
  const [balance, setBalance] = useState(0);

  // Add method to get KALE balance
  const getKaleBalance = async () => {
    try {
      // Call your KALE token service to get balance
      const balance = await kaleService.getBalance(userAddress);
      setBalance(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  return (
    <WalletContext.Provider value={{
      balance,
      getKaleBalance,
      // ... other wallet methods
    }}>
      {children}
    </WalletContext.Provider>
  );
};
```

### **Step 4: Add Error Handling and Notifications**

Create a notification system for user feedback:

```tsx
// Create a notification context or use a library like react-hot-toast
import toast from 'react-hot-toast';

const handleMarketCreated = (market) => {
  toast.success(`Market "${market.title}" created successfully!`);
  // Refresh markets list
};

const handleBetPlaced = (bet) => {
  toast.success(`Bet placed! Potential payout: ${bet.estimatedPayout} KALE`);
  // Refresh markets to show updated odds
};
```

## 🎨 Customization Options

### **Market Categories**

Add or modify market categories in `MarketCreationModal.tsx`:

```tsx
const MARKET_CATEGORIES = [
  { id: 'crypto', name: 'Cryptocurrency', icon: '₿', color: 'bg-orange-100 text-orange-800' },
  { id: 'stocks', name: 'Stocks', icon: '📈', color: 'bg-green-100 text-green-800' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-blue-100 text-blue-800' },
  // Add your custom categories here
  { id: 'custom', name: 'Custom Category', icon: '🎯', color: 'bg-purple-100 text-purple-800' },
];
```

### **Betting Limits**

Modify betting limits in `BettingModal.tsx`:

```tsx
const quickAmounts = [10, 25, 50, 100, 250, 500]; // Customize these amounts
const minBetAmount = 1; // Minimum bet amount
const maxBetAmount = userBalance; // Maximum bet amount
```

### **Market Parameters**

Adjust default market parameters in `MarketCreationModal.tsx`:

```tsx
const defaultFormData = {
  initialLiquidity: 100, // Default initial liquidity
  fee: 2.5, // Default platform fee percentage
  oracleType: 'reflector', // Default oracle type
};
```

## 🔒 Security Considerations

### **Input Validation**

The backend includes comprehensive validation:

- **Market title**: Minimum 10 characters
- **Description**: Minimum 20 characters
- **End date**: Must be in the future
- **Options**: Minimum 2 options required
- **Liquidity**: Minimum 10 KALE
- **Fee**: Between 0% and 10%

### **User Authentication**

Ensure user authentication is properly implemented:

```tsx
// In your API calls, include user authentication
const response = await fetch(`${this.baseUrl}/api/markets`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`, // Add authentication
  },
  body: JSON.stringify(marketData),
});
```

### **Balance Verification**

Always verify user balance before placing bets:

```tsx
// In BettingModal.tsx
if (formData.amount > userBalance) {
  setErrors({ amount: 'Insufficient balance' });
  return;
}
```

## 📊 Testing

### **Frontend Testing**

Test the components with different scenarios:

```tsx
// Test market creation
const testMarketData = {
  title: 'Will Bitcoin reach $100,000 by end of 2024?',
  description: 'This market predicts whether Bitcoin will reach $100,000 by December 31, 2024.',
  category: 'crypto',
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  options: ['Yes', 'No'],
  initialLiquidity: 1000,
  fee: 2.5,
  oracleType: 'reflector',
};

// Test betting
const testBetData = {
  marketId: 'test-market-id',
  optionId: 'option_0',
  amount: 50,
  betType: 'yes',
  userAddress: 'test-user-address',
};
```

### **Backend Testing**

Test API endpoints with tools like Postman or curl:

```bash
# Create market
curl -X POST http://localhost:3000/api/markets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Market",
    "description": "This is a test market",
    "category": "crypto",
    "endDate": "2024-12-31T23:59:59Z",
    "options": ["Yes", "No"],
    "initialLiquidity": 100,
    "fee": 2.5,
    "oracleType": "reflector"
  }'

# Place bet
curl -X POST http://localhost:3000/api/bets \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": "market-id",
    "optionId": "option_0",
    "amount": 50,
    "betType": "yes",
    "userAddress": "user-address"
  }'
```

## 🚀 Deployment

### **Environment Variables**

Ensure these environment variables are set:

```env
# Backend
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=production

# Frontend
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### **Database Integration**

Replace the mock data storage with a real database:

```typescript
// In backend/src/routes/markets.ts and bets.ts
// Replace the in-memory arrays with database calls
import { db } from '../config/database';

// Example with PostgreSQL
const createMarket = async (marketData) => {
  const result = await db.query(
    'INSERT INTO markets (id, title, description, category, end_date, status, options, total_liquidity, creator, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
    [marketData.id, marketData.title, marketData.description, marketData.category, marketData.endDate, marketData.status, JSON.stringify(marketData.options), marketData.totalLiquidity, marketData.creator, marketData.createdAt]
  );
  return result.rows[0];
};
```

## 🎯 Success Metrics

Track these metrics to measure success:

- **Market Creation Rate**: Number of markets created per day
- **Betting Volume**: Total KALE volume in bets
- **User Engagement**: Number of active bettors
- **Market Resolution**: Percentage of markets resolved on time
- **User Satisfaction**: Feedback on market creation and betting experience

## 🔮 Future Enhancements

### **Advanced Features**
- **Market Templates**: Pre-defined market types
- **Automated Resolution**: Integration with external data sources
- **Market Analytics**: Detailed statistics and charts
- **Social Features**: Comments and discussions on markets
- **Mobile Optimization**: Responsive design improvements

### **Integration Opportunities**
- **KALE Token**: Direct integration with KALE farming rewards
- **Reflector Oracle**: Real-time price feeds for crypto markets
- **Stellar DEX**: Integration with Stellar's decentralized exchange
- **NFT Receipts**: Convert winning bets to tradeable NFTs

This comprehensive integration will transform your KALE-ndar platform into a fully functional prediction market with engaging user experiences and robust backend infrastructure!
