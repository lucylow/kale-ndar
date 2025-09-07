import { Market, User, Bet, MarketCondition, OracleAsset } from '@/types/market';

// Demo data generator for realistic scenarios
export class DemoDataGenerator {
  private static readonly CRYPTO_ASSETS = [
    { code: 'BTC', name: 'Bitcoin', currentPrice: 85000, volatility: 0.15 },
    { code: 'ETH', name: 'Ethereum', currentPrice: 3200, volatility: 0.18 },
    { code: 'SOL', name: 'Solana', currentPrice: 180, volatility: 0.25 },
    { code: 'ADA', name: 'Cardano', currentPrice: 0.45, volatility: 0.20 },
    { code: 'DOT', name: 'Polkadot', currentPrice: 6.5, volatility: 0.22 },
    { code: 'LINK', name: 'Chainlink', currentPrice: 18, volatility: 0.19 },
    { code: 'UNI', name: 'Uniswap', currentPrice: 12, volatility: 0.23 },
    { code: 'AVAX', name: 'Avalanche', currentPrice: 38, volatility: 0.21 },
    { code: 'MATIC', name: 'Polygon', currentPrice: 0.85, volatility: 0.24 },
    { code: 'KALE', name: 'KALE Token', currentPrice: 0.75, volatility: 0.30 },
  ];

  private static readonly USERNAMES = [
    'CryptoWhale', 'PredictionPro', 'KALEFarmer', 'DeFiTrader', 'BlockchainBet',
    'StellarBull', 'OracleMaster', 'MarketMaker', 'YieldFarmer', 'TokenHunter',
    'PricePredictor', 'VolatilityKing', 'TrendFollower', 'RiskManager', 'ProfitMaximizer'
  ];

  private static readonly MARKET_TEMPLATES = [
    {
      template: 'price_target',
      description: 'Will {asset} reach ${price} by {date}?',
      conditions: ['above', 'below'],
      timeframes: ['1 week', '1 month', '3 months', '6 months', '1 year']
    },
    {
      template: 'price_range',
      description: 'Will {asset} stay between ${low} and ${high} for {duration}?',
      conditions: ['within'],
      timeframes: ['1 week', '1 month', '3 months']
    },
    {
      template: 'market_cap',
      description: 'Will {asset} market cap exceed ${cap}B by {date}?',
      conditions: ['above'],
      timeframes: ['3 months', '6 months', '1 year']
    },
    {
      template: 'volatility',
      description: 'Will {asset} volatility be above {threshold}% for {duration}?',
      conditions: ['above'],
      timeframes: ['1 week', '1 month']
    }
  ];

  static generateMarkets(count: number = 10): Market[] {
    const markets: Market[] = [];
    
    for (let i = 0; i < count; i++) {
      const asset = this.CRYPTO_ASSETS[Math.floor(Math.random() * this.CRYPTO_ASSETS.length)];
      const template = this.MARKET_TEMPLATES[Math.floor(Math.random() * this.MARKET_TEMPLATES.length)];
      const condition = template.conditions[Math.floor(Math.random() * template.conditions.length)];
      const timeframe = template.timeframes[Math.floor(Math.random() * template.timeframes.length)];
      
      let description = '';
      let targetPrice = 0;
      let resolveTime = new Date();
      
      switch (template.template) {
        case 'price_target':
          const priceMultiplier = condition === 'above' ? 1.2 : 0.8;
          targetPrice = Math.round(asset.currentPrice * priceMultiplier);
          description = `Will ${asset.name} reach $${targetPrice.toLocaleString()} by ${this.getFutureDate(timeframe)}?`;
          resolveTime = this.getResolveTime(timeframe);
          break;
          
        case 'price_range':
          const lowPrice = Math.round(asset.currentPrice * 0.9);
          const highPrice = Math.round(asset.currentPrice * 1.1);
          description = `Will ${asset.name} stay between $${lowPrice.toLocaleString()} and $${highPrice.toLocaleString()} for ${timeframe}?`;
          targetPrice = highPrice;
          resolveTime = this.getResolveTime(timeframe);
          break;
          
        case 'market_cap':
          const currentMarketCap = asset.currentPrice * this.getEstimatedSupply(asset.code);
          const targetMarketCap = currentMarketCap * (1.5 + Math.random());
          targetPrice = Math.round(targetMarketCap / this.getEstimatedSupply(asset.code));
          description = `Will ${asset.name} market cap exceed $${(targetMarketCap / 1e9).toFixed(1)}B by ${this.getFutureDate(timeframe)}?`;
          resolveTime = this.getResolveTime(timeframe);
          break;
          
        case 'volatility':
          const threshold = 20 + Math.random() * 30; // 20-50%
          description = `Will ${asset.name} volatility be above ${threshold.toFixed(0)}% for ${timeframe}?`;
          targetPrice = threshold;
          resolveTime = this.getResolveTime(timeframe);
          break;
      }
      
      const totalFor = Math.floor(Math.random() * 2000000) + 500000;
      const totalAgainst = Math.floor(Math.random() * 2000000) + 500000;
      
      const market: Market = {
        id: `market_${asset.code.toLowerCase()}_${Date.now()}_${i}`,
        description,
        creator: this.generateAddress(),
        oracleAsset: { 
          type: asset.code === 'KALE' ? 'stellar' : 'other', 
          code: asset.code,
          contractId: asset.code === 'KALE' ? 'contract_kale_123' : undefined
        },
        targetPrice,
        condition: condition === 'above' ? MarketCondition.ABOVE : 
                  condition === 'below' ? MarketCondition.BELOW : MarketCondition.ABOVE,
        resolveTime,
        totalFor,
        totalAgainst,
        resolved: false,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        currentPrice: asset.currentPrice,
        oracleConfidence: 0.85 + Math.random() * 0.15, // 85-100%
      };
      
      markets.push(market);
    }
    
    return markets;
  }

  static generateUsers(count: number = 15): User[] {
    const users: User[] = [];
    
    for (let i = 0; i < count; i++) {
      const username = this.USERNAMES[i] || `User${i + 1}`;
      const totalBets = Math.floor(Math.random() * 50) + 5;
      const winRate = 45 + Math.random() * 35; // 45-80% win rate
      const totalWinnings = Math.floor(Math.random() * 5000000) + 100000;
      
      const user: User = {
        id: i + 1,
        address: this.generateAddress(),
        username,
        email: `${username.toLowerCase()}@example.com`,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_bets: totalBets,
        total_winnings: totalWinnings,
      };
      
      users.push(user);
    }
    
    return users;
  }

  static generateBets(markets: Market[], users: User[], count: number = 50): Bet[] {
    const bets: Bet[] = [];
    
    for (let i = 0; i < count; i++) {
      const market = markets[Math.floor(Math.random() * markets.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const amount = Math.floor(Math.random() * 100000) + 1000;
      const side = Math.random() > 0.5;
      
      const bet: Bet = {
        marketId: market.id,
        userAddress: user.address,
        amount,
        side,
        claimed: false,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      };
      
      bets.push(bet);
    }
    
    return bets;
  }

  static generateLeaderboard(users: User[]): any[] {
    return users
      .map(user => ({
        rank: 0, // Will be set after sorting
        address: user.address,
        username: user.username,
        total_bets: user.total_bets,
        total_winnings: user.total_winnings,
        wins: Math.floor(user.total_bets * (0.45 + Math.random() * 0.35)),
        losses: user.total_bets - Math.floor(user.total_bets * (0.45 + Math.random() * 0.35)),
        win_rate: 45 + Math.random() * 35,
      }))
      .sort((a, b) => b.total_winnings - a.total_winnings)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }

  static generatePriceData(): Record<string, any> {
    const priceData: Record<string, any> = {};
    
    this.CRYPTO_ASSETS.forEach(asset => {
      const volatility = asset.volatility;
      const priceChange = (Math.random() - 0.5) * 2 * volatility * asset.currentPrice;
      const newPrice = Math.max(0.01, asset.currentPrice + priceChange);
      
      priceData[asset.code] = {
        price: Math.round(newPrice * 100) / 100,
        timestamp: new Date().toISOString(),
        decimals: asset.code === 'KALE' ? 7 : 2,
        change24h: Math.round(priceChange * 100) / 100,
        changePercent24h: Math.round((priceChange / asset.currentPrice) * 10000) / 100,
      };
    });
    
    return priceData;
  }

  static generateKaleBalances(users: User[]): Record<string, string> {
    const balances: Record<string, string> = {};
    
    users.forEach(user => {
      const balance = Math.floor(Math.random() * 10000000) + 100000; // 100K to 10M KALE
      balances[user.address.toLowerCase()] = balance.toString();
    });
    
    return balances;
  }

  private static generateAddress(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let address = 'G';
    for (let i = 0; i < 55; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  private static getFutureDate(timeframe: string): string {
    const now = new Date();
    switch (timeframe) {
      case '1 week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
      case '1 month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
      case '3 months':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString();
      case '6 months':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString();
      case '1 year':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
    }
  }

  private static getResolveTime(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '1 week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '1 month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case '3 months':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      case '6 months':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      case '1 year':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  private static getEstimatedSupply(assetCode: string): number {
    const supplies: Record<string, number> = {
      'BTC': 21000000,
      'ETH': 120000000,
      'SOL': 500000000,
      'ADA': 45000000000,
      'DOT': 1000000000,
      'LINK': 1000000000,
      'UNI': 1000000000,
      'AVAX': 720000000,
      'MATIC': 10000000000,
      'KALE': 1000000000,
    };
    return supplies[assetCode] || 1000000000;
  }

  static generateRealisticScenario(scenario: 'bull_market' | 'bear_market' | 'sideways' | 'volatile'): {
    markets: Market[];
    users: User[];
    bets: Bet[];
    leaderboard: any[];
    priceData: Record<string, any>;
    kaleBalances: Record<string, string>;
  } {
    const users = this.generateUsers(15);
    const markets = this.generateMarkets(10);
    const bets = this.generateBets(markets, users, 50);
    const leaderboard = this.generateLeaderboard(users);
    const priceData = this.generatePriceData();
    const kaleBalances = this.generateKaleBalances(users);

    // Adjust data based on scenario
    switch (scenario) {
      case 'bull_market':
        // Increase positive price movements and optimistic bets
        Object.keys(priceData).forEach(asset => {
          if (priceData[asset].changePercent24h < 0) {
            priceData[asset].changePercent24h = Math.abs(priceData[asset].changePercent24h);
            priceData[asset].change24h = Math.abs(priceData[asset].change24h);
          }
        });
        break;
        
      case 'bear_market':
        // Increase negative price movements and pessimistic bets
        Object.keys(priceData).forEach(asset => {
          if (priceData[asset].changePercent24h > 0) {
            priceData[asset].changePercent24h = -Math.abs(priceData[asset].changePercent24h);
            priceData[asset].change24h = -Math.abs(priceData[asset].change24h);
          }
        });
        break;
        
      case 'volatile':
        // Increase volatility across all assets
        Object.keys(priceData).forEach(asset => {
          priceData[asset].changePercent24h *= 2;
          priceData[asset].change24h *= 2;
        });
        break;
    }

    return {
      markets,
      users,
      bets,
      leaderboard,
      priceData,
      kaleBalances,
    };
  }
}
