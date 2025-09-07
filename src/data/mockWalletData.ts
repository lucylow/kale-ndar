import { WalletInfo } from '@/lib/wallet-adapters/types';

// Mock wallet data for testing
export const mockWallets: WalletInfo[] = [
  {
    name: 'Freighter',
    icon: '🦋',
    description: 'Official Stellar Development Foundation wallet',
    isAvailable: true,
    adapter: {
      name: 'Freighter',
      icon: '🦋',
      isAvailable: () => true,
      connect: async () => ({
        publicKey: 'GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
        signTransaction: async (transactionXdr: string) => {
          console.log('Mock signing transaction:', transactionXdr);
          return 'mock-signed-transaction-xdr';
        }
      }),
      disconnect: async () => {},
      signTransaction: async (transactionXdr: string, networkPassphrase: string) => {
        console.log('Mock signing transaction:', transactionXdr, networkPassphrase);
        return 'mock-signed-transaction-xdr';
      },
      getPublicKey: async () => 'GABC1234567890ABCDEF1234567890ABCDEF1234567890',
      isConnected: async () => true
    }
  },
  {
    name: 'Lobstr',
    icon: '🦞',
    description: 'User-friendly mobile and web wallet',
    isAvailable: true,
    adapter: {
      name: 'Lobstr',
      icon: '🦞',
      isAvailable: () => true,
      connect: async () => ({
        publicKey: 'GDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
        signTransaction: async (transactionXdr: string) => {
          console.log('Mock Lobstr signing transaction:', transactionXdr);
          return 'mock-lobstr-signed-transaction-xdr';
        }
      }),
      disconnect: async () => {},
      signTransaction: async (transactionXdr: string, networkPassphrase: string) => {
        console.log('Mock Lobstr signing transaction:', transactionXdr, networkPassphrase);
        return 'mock-lobstr-signed-transaction-xdr';
      },
      getPublicKey: async () => 'GDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
      isConnected: async () => true
    }
  },
  {
    name: 'Rabet',
    icon: '🐰',
    description: 'Open-source Stellar wallet with advanced features',
    isAvailable: true,
    adapter: {
      name: 'Rabet',
      icon: '🐰',
      isAvailable: () => true,
      connect: async () => ({
        publicKey: 'GRABET1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
        signTransaction: async (transactionXdr: string) => {
          console.log('Mock Rabet signing transaction:', transactionXdr);
          return 'mock-rabet-signed-transaction-xdr';
        }
      }),
      disconnect: async () => {},
      signTransaction: async (transactionXdr: string, networkPassphrase: string) => {
        console.log('Mock Rabet signing transaction:', transactionXdr, networkPassphrase);
        return 'mock-rabet-signed-transaction-xdr';
      },
      getPublicKey: async () => 'GRABET1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
      isConnected: async () => true
    }
  },
  {
    name: 'Albedo',
    icon: '🌅',
    description: 'Web-based wallet for Stellar transactions',
    isAvailable: false,
    adapter: {
      name: 'Albedo',
      icon: '🌅',
      isAvailable: () => false,
      connect: async () => {
        throw new Error('Albedo wallet is not installed');
      },
      disconnect: async () => {},
      signTransaction: async () => {
        throw new Error('Albedo wallet is not available');
      },
      getPublicKey: async () => {
        throw new Error('Albedo wallet is not available');
      },
      isConnected: async () => false
    }
  },
  {
    name: 'Passkey',
    icon: '🔐',
    description: 'Secure biometric authentication with WebAuthn',
    isAvailable: true,
    adapter: {
      name: 'Passkey',
      icon: '🔐',
      isAvailable: () => true,
      connect: async () => ({
        publicKey: 'GPASS1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
        signTransaction: async (transactionXdr: string) => {
          console.log('Mock Passkey signing transaction:', transactionXdr);
          return 'mock-passkey-signed-transaction-xdr';
        }
      }),
      disconnect: async () => {},
      signTransaction: async (transactionXdr: string, networkPassphrase: string) => {
        console.log('Mock Passkey signing transaction:', transactionXdr, networkPassphrase);
        return 'mock-passkey-signed-transaction-xdr';
      },
      getPublicKey: async () => 'GPASS1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
      isConnected: async () => true
    }
  }
];

// Mock user data for testing
export const mockUsers = [
  {
    id: 1,
    address: 'GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    username: 'stellar_trader',
    email: 'trader@example.com',
    created_at: '2024-01-15T10:30:00Z',
    last_login: '2024-09-05T18:00:00Z',
    total_bets: 25,
    total_winnings: 1500.50
  },
  {
    id: 2,
    address: 'GDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    username: 'kale_farmer',
    email: 'farmer@example.com',
    created_at: '2024-02-20T14:15:00Z',
    last_login: '2024-09-05T17:45:00Z',
    total_bets: 42,
    total_winnings: 3200.75
  },
  {
    id: 3,
    address: 'GPASS1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    username: 'passkey_pro',
    email: 'pro@passkey.example.com',
    created_at: '2024-03-10T09:20:00Z',
    last_login: '2024-09-05T19:30:00Z',
    total_bets: 67,
    total_winnings: 4850.25,
    wallet_type: 'passkey',
    biometric_enabled: true,
    security_level: 'high'
  }
];

// Mock user stats
export const mockUserStats = [
  {
    address: 'GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    total_bets: 25,
    total_bet_amount: 5000,
    claimed_bets: 20,
    pending_claims: 5,
    wins: 15,
    losses: 10,
    win_rate: 60,
    recent_activity: [
      {
        id: 1,
        type: 'bet_placed',
        amount: 100,
        market: 'KALE Price Prediction',
        timestamp: '2024-09-05T17:30:00Z',
        status: 'pending'
      },
      {
        id: 2,
        type: 'bet_won',
        amount: 150,
        market: 'Weather Forecast',
        timestamp: '2024-09-05T16:45:00Z',
        status: 'completed'
      },
      {
        id: 3,
        type: 'bet_placed',
        amount: 75,
        market: 'Sports Outcome',
        timestamp: '2024-09-05T15:20:00Z',
        status: 'pending'
      }
    ]
  },
  {
    address: 'GDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    total_bets: 42,
    total_bet_amount: 8400,
    claimed_bets: 35,
    pending_claims: 7,
    wins: 28,
    losses: 14,
    win_rate: 66.7,
    recent_activity: [
      {
        id: 4,
        type: 'bet_won',
        amount: 200,
        market: 'KALE Staking Rewards',
        timestamp: '2024-09-05T18:00:00Z',
        status: 'completed'
      },
      {
        id: 5,
        type: 'bet_placed',
        amount: 120,
        market: 'Market Volatility',
        timestamp: '2024-09-05T17:15:00Z',
        status: 'pending'
      },
      {
        id: 6,
        type: 'bet_lost',
        amount: 80,
        market: 'Price Movement',
        timestamp: '2024-09-05T16:30:00Z',
        status: 'completed'
      }
    ]
  },
  {
    address: 'GPASS1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    total_bets: 67,
    total_bet_amount: 13400,
    claimed_bets: 58,
    pending_claims: 9,
    wins: 45,
    losses: 22,
    win_rate: 67.2,
    recent_activity: [
      {
        id: 7,
        type: 'bet_won',
        amount: 300,
        market: 'Passkey Adoption Rate',
        timestamp: '2024-09-05T19:30:00Z',
        status: 'completed'
      },
      {
        id: 8,
        type: 'bet_placed',
        amount: 150,
        market: 'Biometric Security Trends',
        timestamp: '2024-09-05T18:45:00Z',
        status: 'pending'
      },
      {
        id: 9,
        type: 'bet_won',
        amount: 225,
        market: 'WebAuthn Integration',
        timestamp: '2024-09-05T17:20:00Z',
        status: 'completed'
      }
    ]
  }
];

// Mock KALE balance data
export const mockKaleBalances = [
  {
    address: 'GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    balance: 2500.75
  },
  {
    address: 'GDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    balance: 4200.50
  },
  {
    address: 'GPASS1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    balance: 6750.25
  }
];

// Mock staking data
export const mockStakeInfo = [
  {
    address: 'GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    staked_amount: 1000,
    staking_start: '2024-08-15T10:00:00Z',
    staking_duration: 30,
    rewards_earned: 45.25,
    next_harvest: '2024-09-15T10:00:00Z'
  },
  {
    address: 'GDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    staked_amount: 2000,
    staking_start: '2024-08-20T14:30:00Z',
    staking_duration: 60,
    rewards_earned: 78.50,
    next_harvest: '2024-10-20T14:30:00Z'
  },
  {
    address: 'GPASS1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    staked_amount: 3500,
    staking_start: '2024-08-25T11:15:00Z',
    staking_duration: 90,
    rewards_earned: 125.75,
    next_harvest: '2024-11-25T11:15:00Z',
    security_bonus: 0.15 // Passkey users get 15% bonus rewards
  }
];

// Helper functions to get mock data by address
export const getMockUserByAddress = (address: string) => {
  return mockUsers.find(user => user.address === address) || null;
};

export const getMockUserStatsByAddress = (address: string) => {
  return mockUserStats.find(stats => stats.address === address) || null;
};

export const getMockKaleBalanceByAddress = (address: string) => {
  return mockKaleBalances.find(balance => balance.address === address)?.balance || 0;
};

export const getMockStakeInfoByAddress = (address: string) => {
  return mockStakeInfo.find(stake => stake.address === address) || null;
};
