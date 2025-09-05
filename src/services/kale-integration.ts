// Mock implementation of KALE integration service
// This prevents TypeScript errors while maintaining the expected API

export interface StakeInfo {
  amount: number;
  stake_time: number;
  last_reward_time: number;
  accumulated_rewards: number;
  apy: number;
}

export interface KaleStats {
  total_staked: number;
  total_stakers: number;
  average_apy: number;
  total_rewards_distributed: number;
}

export interface FarmingPosition {
  pool_id: string;
  user_address: string;
  staked_amount: number;
  rewards_earned: number;
  last_harvest: number;
  apy: number;
  lock_duration: number;
}

export interface FarmingPool {
  id: string;
  name: string;
  token_pair: string;
  total_locked: number;
  current_apy: number;
  rewards_token: string;
  lock_duration: number;
  min_stake: number;
}

// Mock KALE Integration Service
export class KaleIntegrationService {
  private static instance: KaleIntegrationService | null = null;

  static getInstance(): KaleIntegrationService {
    if (!KaleIntegrationService.instance) {
      KaleIntegrationService.instance = new KaleIntegrationService();
    }
    return KaleIntegrationService.instance;
  }

  private constructor() {}

  async getUserStakeInfo(userAddress: string): Promise<StakeInfo> {
    // Mock implementation
    return {
      amount: 1000,
      stake_time: Date.now() - 86400000, // 1 day ago
      last_reward_time: Date.now() - 3600000, // 1 hour ago
      accumulated_rewards: 25.5,
      apy: 12.5
    };
  }

  // Alias for backward compatibility
  async getStakeInfo(userAddress: string): Promise<StakeInfo> {
    return this.getUserStakeInfo(userAddress);
  }

  async getKaleBalance(userAddress: string): Promise<number> {
    // Mock implementation
    return 1234.56;
  }

  async getStakingStats(): Promise<KaleStats> {
    return this.getKaleStats();
  }

  async getKaleStats(): Promise<KaleStats> {
    // Mock implementation
    return {
      total_staked: 5000000,
      total_stakers: 1247,
      average_apy: 15.2,
      total_rewards_distributed: 125000
    };
  }

  async plant(userAddress: string, amount: number, ...additionalArgs: any[]): Promise<string> {
    // Mock implementation - alias for staking
    console.log(`Mock planting ${amount} KALE for ${userAddress}`);
    return this.stakeKale(userAddress, amount);
  }

  async work(userAddress: string, ...additionalArgs: any[]): Promise<string> {
    // Mock implementation - compound/reinvest rewards
    console.log(`Mock working (compounding) for ${userAddress}`);
    return 'mock_work_tx_hash';
  }

  async harvest(userAddress: string, ...additionalArgs: any[]): Promise<string> {
    // Mock implementation - alias for harvest rewards
    console.log(`Mock harvesting rewards for ${userAddress}`);
    return this.harvestRewards(userAddress);
  }

  async stakeKale(userAddress: string, amount: number): Promise<string> {
    // Mock implementation
    console.log(`Mock staking ${amount} KALE for ${userAddress}`);
    return 'mock_stake_tx_hash';
  }

  async unstakeKale(userAddress: string, amount: number): Promise<string> {
    // Mock implementation
    console.log(`Mock unstaking ${amount} KALE for ${userAddress}`);
    return 'mock_unstake_tx_hash';
  }

  async harvestRewards(userAddress: string): Promise<string> {
    // Mock implementation
    console.log(`Mock harvesting rewards for ${userAddress}`);
    return 'mock_harvest_tx_hash';
  }

  async getUserFarmingPositions(userAddress: string): Promise<FarmingPosition[]> {
    // Mock implementation
    return [
      {
        pool_id: 'KALE-XLM',
        user_address: userAddress,
        staked_amount: 1000,
        rewards_earned: 25.5,
        last_harvest: Date.now() - 86400000,
        apy: 15.2,
        lock_duration: 30
      }
    ];
  }

  async getFarmingPools(): Promise<FarmingPool[]> {
    // Mock implementation
    return [
      {
        id: 'KALE-XLM',
        name: 'KALE-XLM Pool',
        token_pair: 'KALE/XLM',
        total_locked: 2500000,
        current_apy: 15.2,
        rewards_token: 'KALE',
        lock_duration: 30,
        min_stake: 100
      },
      {
        id: 'KALE-USDC',
        name: 'KALE-USDC Pool',
        token_pair: 'KALE/USDC',
        total_locked: 1800000,
        current_apy: 18.7,
        rewards_token: 'KALE',
        lock_duration: 60,
        min_stake: 50
      }
    ];
  }

  async joinFarmingPool(userAddress: string, poolId: string, amount: number): Promise<string> {
    // Mock implementation
    console.log(`Mock joining farming pool ${poolId} with ${amount} tokens for ${userAddress}`);
    return 'mock_join_pool_tx_hash';
  }

  async leaveFarmingPool(userAddress: string, poolId: string): Promise<string> {
    // Mock implementation
    console.log(`Mock leaving farming pool ${poolId} for ${userAddress}`);
    return 'mock_leave_pool_tx_hash';
  }
}

// Export the singleton instance
export const kaleIntegrationService = KaleIntegrationService.getInstance();