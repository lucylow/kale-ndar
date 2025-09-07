import { logger } from '@/lib/utils';

export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  status: 'active' | 'ended' | 'settled';
  options: Array<{
    id: string;
    name: string;
    odds: number;
    bets: number;
    amount: number;
    percentage: number;
  }>;
  totalLiquidity: number;
  totalBets: number;
  participants: number;
  creator: string;
  createdAt: string;
  fee?: number;
  oracleType?: string;
  resolutionCriteria?: string;
}

export interface Bet {
  id: string;
  marketId: string;
  optionId: string;
  amount: number;
  betType: 'yes' | 'no';
  userAddress: string;
  odds: number;
  estimatedPayout: number;
  potentialProfit: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  createdAt: string;
  metadata: {
    marketTitle: string;
    optionName: string;
    category: string;
  };
  payout?: number;
  profit?: number;
  resolvedAt?: string;
}

export interface CreateMarketData {
  title: string;
  description: string;
  category: string;
  endDate: string;
  options: string[];
  initialLiquidity: number;
  fee: number;
  oracleType: string;
  resolutionCriteria?: string;
}

export interface PlaceBetData {
  marketId: string;
  optionId: string;
  amount: number;
  betType: 'yes' | 'no';
  userAddress: string;
}

class MarketService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Create a new market
   */
  async createMarket(marketData: CreateMarketData): Promise<Market> {
    try {
      const response = await fetch(`${this.baseUrl}/api/markets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create market');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Error creating market:', error);
      throw error;
    }
  }

  /**
   * Get all markets with optional filtering
   */
  async getMarkets(params?: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Market[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = `${this.baseUrl}/api/markets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch markets');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('Error fetching markets:', error);
      throw error;
    }
  }

  /**
   * Get a single market by ID
   */
  async getMarket(marketId: string): Promise<Market> {
    try {
      const response = await fetch(`${this.baseUrl}/api/markets/${marketId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Error fetching market:', error);
      throw error;
    }
  }

  /**
   * Update a market
   */
  async updateMarket(marketId: string, updates: Partial<Market>): Promise<Market> {
    try {
      const response = await fetch(`${this.baseUrl}/api/markets/${marketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update market');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Error updating market:', error);
      throw error;
    }
  }

  /**
   * Resolve a market
   */
  async resolveMarket(marketId: string, winningOption: string, resolutionData?: any): Promise<Market> {
    try {
      const response = await fetch(`${this.baseUrl}/api/markets/${marketId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winningOption,
          resolutionData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resolve market');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Error resolving market:', error);
      throw error;
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats(marketId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/markets/${marketId}/stats`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market stats');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Error fetching market stats:', error);
      throw error;
    }
  }

  /**
   * Place a bet
   */
  async placeBet(betData: PlaceBetData): Promise<Bet> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place bet');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Error placing bet:', error);
      throw error;
    }
  }

  /**
   * Get user's bets
   */
  async getUserBets(userAddress: string, params?: {
    status?: string;
    marketId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Bet[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.marketId) queryParams.append('marketId', params.marketId);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = `${this.baseUrl}/api/bets/user/${userAddress}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user bets');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('Error fetching user bets:', error);
      throw error;
    }
  }

  /**
   * Get bet details
   */
  async getBet(betId: string): Promise<Bet> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bets/${betId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch bet');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Error fetching bet:', error);
      throw error;
    }
  }

  /**
   * Cancel a bet
   */
  async cancelBet(betId: string, userAddress: string): Promise<Bet> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bets/${betId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel bet');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Error cancelling bet:', error);
      throw error;
    }
  }

  /**
   * Get user's betting statistics
   */
  async getUserBettingStats(userAddress: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bets/stats/${userAddress}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch betting stats');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Error fetching betting stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const marketService = new MarketService();
export default marketService;
