import { config } from '@/lib/config';
import { Market, Bet, User, MarketCreationParams, PlaceBetParams } from '@/types/market';
import { 
  mockMarkets, 
  mockUsers, 
  mockBets, 
  mockUserStats, 
  mockLeaderboard, 
  mockBlockchainData,
  mockPriceData,
  mockKaleBalances,
  getMockUserByAddress,
  getMockUserStats,
  getMockKaleBalance,
  getMockPrice,
  addMockBet,
  updateMockMarket
} from '@/data/mockData';

const API_BASE_URL = config.api.baseUrl || 'http://localhost:3000';
const USE_MOCK_DATA = config.features.enableMockData;

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If mock data is enabled, return mock data instead of making API calls
    if (USE_MOCK_DATA) {
      return this.getMockResponse<T>(endpoint, options);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      return response.json();
    } catch (error) {
      // Fallback to mock data if API call fails
      console.warn('API call failed, falling back to mock data:', error);
      return this.getMockResponse<T>(endpoint, options);
    }
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit = {}): T {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getMockData<T>(endpoint, options));
      }, Math.random() * 500 + 100); // Random delay between 100-600ms
    }) as T;
  }

  private getMockData<T>(endpoint: string, options: RequestInit = {}): T {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : {};

    switch (endpoint) {
      case '/health':
        return { status: 'healthy', timestamp: new Date().toISOString() } as T;

      case '/api/markets':
        if (method === 'POST') {
          const newMarket: Market = {
            id: `market_${Date.now()}`,
            description: body.description,
            creator: body.creator || 'mock_creator',
            oracleAsset: body.oracleAsset,
            targetPrice: body.targetPrice,
            condition: body.condition,
            resolveTime: new Date(body.resolveTime),
            totalFor: 0,
            totalAgainst: 0,
            resolved: false,
            createdAt: new Date(),
            currentPrice: body.currentPrice || 0,
            oracleConfidence: 0.9,
          };
          mockMarkets.unshift(newMarket);
          return { message: 'Market created successfully', market: newMarket } as T;
        } else {
          const params = new URLSearchParams(endpoint.split('?')[1] || '');
          const page = parseInt(params.get('page') || '1');
          const limit = parseInt(params.get('limit') || '10');
          const start = (page - 1) * limit;
          const end = start + limit;
          
          return {
            markets: mockMarkets.slice(start, end),
            pagination: {
              page,
              limit,
              total: mockMarkets.length,
              pages: Math.ceil(mockMarkets.length / limit),
            },
          } as T;
        }

      case (endpoint.match(/^\/api\/markets\/[^\/]+$/)?.input):
        const marketId = endpoint.split('/').pop();
        const market = mockMarkets.find(m => m.id === marketId);
        if (!market) throw new ApiError('Market not found', 404);
        
        const marketBets = mockBets.filter(b => b.marketId === marketId);
        return {
          ...market,
          bets: marketBets,
          total_bets: marketBets.length,
        } as T;

      case (endpoint.match(/^\/api\/markets\/[^\/]+\/bet$/)?.input):
        if (method === 'POST') {
          const bet: Bet = {
            marketId: endpoint.split('/')[3],
            userAddress: body.userAddress || 'mock_user',
            amount: body.amount,
            side: body.side,
            claimed: false,
            createdAt: new Date(),
          };
          addMockBet(bet);
          return { message: 'Bet placed successfully', bet } as T;
        }
        break;

      case (endpoint.match(/^\/api\/users\/[^\/]+$/)?.input):
        const userAddress = endpoint.split('/').pop();
        const user = getMockUserByAddress(userAddress!);
        if (!user) throw new ApiError('User not found', 404);
        return user as T;

      case (endpoint.match(/^\/api\/users\/[^\/]+\/stats$/)?.input):
        const statsAddress = endpoint.split('/')[3];
        const stats = getMockUserStats(statsAddress);
        if (!stats) throw new ApiError('User stats not found', 404);
        return stats as T;

      case '/api/users/leaderboard':
        const leaderboardLimit = new URLSearchParams(endpoint.split('?')[1] || '').get('limit') || '10';
        return {
          leaderboard: mockLeaderboard.slice(0, parseInt(leaderboardLimit)),
          updated_at: new Date().toISOString(),
        } as T;

      case '/api/blockchain/status':
        return mockBlockchainData.status as T;

      case '/api/blockchain/contracts':
        return mockBlockchainData.contracts as T;

      case '/api/blockchain/stats':
        return mockBlockchainData.networkStats as T;

      case (endpoint.match(/^\/api\/blockchain\/token\/balance\/[^\/]+$/)?.input):
        const balanceAddress = endpoint.split('/').pop();
        return {
          address: balanceAddress,
          balance: getMockKaleBalance(balanceAddress!),
          token_contract: 'contract_kale_456',
        } as T;

      case (endpoint.match(/^\/api\/blockchain\/oracle\/price\/[^\/]+$/)?.input):
        const asset = endpoint.split('/').pop();
        const price = getMockPrice(asset!);
        if (!price) throw new ApiError('Price data not found', 404);
        return price as T;

      default:
        throw new ApiError('Endpoint not found', 404);
    }

    throw new ApiError('Method not allowed', 405);
  }

  // Health Check
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Markets API
  async getMarkets(params?: {
    page?: number;
    limit?: number;
    resolved?: boolean;
    creator?: string;
  }): Promise<{
    markets: Market[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.resolved !== undefined) searchParams.append('resolved', params.resolved.toString());
    if (params?.creator) searchParams.append('creator', params.creator);

    return this.request(`/api/markets?${searchParams.toString()}`);
  }

  async getMarket(id: string): Promise<Market> {
    return this.request(`/api/markets/${id}`);
  }

  async createMarket(params: MarketCreationParams, userAddress: string): Promise<{
    message: string;
    market: Market;
  }> {
    // Transform frontend params to backend format
    const backendParams = {
      description: params.description,
      asset_symbol: params.oracleAsset.code,
      target_price: params.targetPrice,
      condition: params.condition,
      resolve_time: params.resolveTime.toISOString(),
      kale_token_address: config.soroban.kaleTokenId,
      reflector_contract_address: config.soroban.reflectorContractId,
    };

    return this.request('/api/markets', {
      method: 'POST',
      headers: {
        'X-User-Address': userAddress,
      },
      body: JSON.stringify(backendParams),
    });
  }

  async placeBet(
    marketId: string,
    params: PlaceBetParams,
    userAddress: string
  ): Promise<{
    message: string;
    bet: Bet;
  }> {
    // Transform frontend params to backend format
    const backendParams = {
      market_id: marketId,
      amount: params.amount,
      side: params.side,
    };

    return this.request(`/api/markets/${marketId}/bet`, {
      method: 'POST',
      headers: {
        'X-User-Address': userAddress,
      },
      body: JSON.stringify(backendParams),
    });
  }

  async resolveMarket(marketId: string): Promise<{
    message: string;
    market: { id: string; outcome: boolean; resolved: boolean };
  }> {
    return this.request(`/api/markets/${marketId}/resolve`, {
      method: 'POST',
    });
  }

  async getUserBets(marketId: string, userAddress: string): Promise<{
    bets: Bet[];
    total_bets: number;
  }> {
    return this.request(`/api/markets/${marketId}/bets/${userAddress}`);
  }

  // Users API
  async getUserProfile(address: string): Promise<User> {
    return this.request(`/api/users/${address}`);
  }

  async updateUserProfile(
    address: string,
    data: { username?: string; email?: string }
  ): Promise<{ message: string; user: User }> {
    return this.request(`/api/users/${address}`, {
      method: 'POST',
      headers: {
        'X-User-Address': address,
      },
      body: JSON.stringify(data),
    });
  }

  async getUserStats(address: string): Promise<{
    total_bets: number;
    total_bet_amount: number;
    claimed_bets: number;
    pending_claims: number;
    wins: number;
    losses: number;
    win_rate: number;
    recent_activity: any[];
  }> {
    return this.request(`/api/users/${address}/stats`);
  }

  async getUserBetsHistory(
    address: string,
    params?: { page?: number; limit?: number }
  ): Promise<{
    bets: Bet[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return this.request(`/api/users/${address}/bets?${searchParams.toString()}`);
  }

  async getLeaderboard(limit: number = 10): Promise<{
    leaderboard: Array<{
      rank: number;
      address: string;
      username: string;
      total_bets: number;
      total_winnings: number;
      wins: number;
      losses: number;
      win_rate: number;
    }>;
    updated_at: string;
  }> {
    return this.request(`/api/users/leaderboard?limit=${limit}`);
  }

  // Blockchain API
  async getBlockchainStatus(): Promise<{
    status: string;
    network: string;
    latest_ledger: number;
    latest_ledger_close_time: string;
    rpc_url: string;
  }> {
    return this.request('/api/blockchain/status');
  }

  async getContractStatus(): Promise<{
    contracts: {
      factory: { deployed: boolean; contract_id?: string; error?: string };
      kale_token: { deployed: boolean; contract_id?: string; error?: string };
      reflector: { deployed: boolean; contract_id?: string; error?: string };
    };
    network: string;
  }> {
    return this.request('/api/blockchain/contracts');
  }

  async getTransactionStatus(hash: string): Promise<{
    status: string;
    hash: string;
    ledger: number;
    timestamp: string;
    operations: any[];
  }> {
    return this.request(`/api/blockchain/transaction/${hash}`);
  }

  async getMarketFromBlockchain(contractId: string): Promise<{
    contract_id: string;
    config: any;
    state: any;
    network: string;
  }> {
    return this.request(`/api/blockchain/markets/${contractId}`);
  }

  async getOraclePrice(asset: string): Promise<{
    asset: string;
    price: number;
    timestamp: string;
    decimals: number;
  }> {
    return this.request(`/api/blockchain/oracle/price/${asset}`);
  }

  async getKaleTokenBalance(address: string): Promise<{
    address: string;
    balance: string;
    token_contract: string;
  }> {
    return this.request(`/api/blockchain/token/balance/${address}`);
  }

  async getBlockchainEvents(params?: {
    startLedger?: number;
    endLedger?: number;
    contractId?: string;
    eventType?: string;
  }): Promise<{
    events: any[];
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.startLedger) searchParams.append('startLedger', params.startLedger.toString());
    if (params?.endLedger) searchParams.append('endLedger', params.endLedger.toString());
    if (params?.contractId) searchParams.append('contractId', params.contractId);
    if (params?.eventType) searchParams.append('eventType', params.eventType);

    return this.request(`/api/blockchain/events?${searchParams.toString()}`);
  }

  async getNetworkStats(): Promise<{
    network: string;
    latest_ledger: number;
    recent_transactions: number;
    markets: { total: number; active: number };
    bets: { total: number };
    updated_at: string;
  }> {
    return this.request('/api/blockchain/stats');
  }

  // WebSocket Connection
  createWebSocketConnection(): WebSocket {
    const wsUrl = API_BASE_URL.replace('http', 'ws');
    return new WebSocket(`${wsUrl}/ws`);
  }
}

export const apiService = new ApiService();
export { ApiError };
