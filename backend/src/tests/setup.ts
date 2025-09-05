import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config({ path: '.env.test' });

// Set default test environment variables
process.env.NODE_ENV = 'test';
process.env.HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
process.env.NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
process.env.SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
process.env.KALE_TOKEN_CONTRACT_ID = process.env.KALE_TOKEN_CONTRACT_ID || 'test-contract-id';
process.env.KALE_INTEGRATION_CONTRACT_ID = process.env.KALE_INTEGRATION_CONTRACT_ID || 'test-integration-contract-id';
process.env.FEE_COLLECTOR_ADDRESS = process.env.FEE_COLLECTOR_ADDRESS || 'test-fee-collector';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidStellarAddress(): R;
      toBeValidAmount(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidStellarAddress(received: string) {
    const isValid = /^G[A-Z0-9]{55}$/.test(received);
    if (isValid) {
      return {
        message: () => `expected ${received} not to be a valid Stellar address`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Stellar address`,
        pass: false,
      };
    }
  },
  toBeValidAmount(received: string) {
    const isValid = /^\d+(\.\d+)?$/.test(received) && parseFloat(received) >= 0;
    if (isValid) {
      return {
        message: () => `expected ${received} not to be a valid amount`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid amount`,
        pass: false,
      };
    }
  },
});

// Test data factories
export const createTestKeypair = () => {
  const { Keypair } = require('@stellar/stellar-sdk');
  return Keypair.random();
};

export const createTestAddress = () => {
  return createTestKeypair().publicKey();
};

export const createTestMarketRequest = () => ({
  creator: createTestAddress(),
  description: 'Test market description for integration testing',
  assetSymbol: 'BTC',
  targetPrice: '50000',
  condition: 'above' as const,
  resolveTime: Date.now() + 86400000, // 24 hours from now
  marketFee: '100',
});

export const createTestFeeDistribution = () => ({
  platformFee: '100',
  creatorFee: '50',
  totalFee: '150',
});

// Mock implementations for external services
export const mockStellarRpcService = {
  getNetworkStats: jest.fn().mockResolvedValue({
    network: 'testnet',
    latestLedger: 12345,
    recentTransactions: 10,
    updatedAt: new Date().toISOString(),
  }),
  getKaleBalance: jest.fn().mockResolvedValue('1000000'),
  submitTransaction: jest.fn().mockResolvedValue({
    hash: 'mock-transaction-hash',
    ledger: 12345,
    success: true,
  }),
  accountExists: jest.fn().mockResolvedValue(true),
  isValidAddress: jest.fn().mockReturnValue(true),
};

export const mockKaleTokenService = {
  getTokenInfo: jest.fn().mockResolvedValue({
    contractId: 'test-contract-id',
    symbol: 'KALE',
    name: 'KALE Token',
    decimals: 7,
    totalSupply: '1000000000',
    issuer: 'test-issuer-address',
  }),
  getBalance: jest.fn().mockResolvedValue({
    address: 'test-address',
    balance: '1000000',
    formattedBalance: '1.0000000',
    contractId: 'test-contract-id',
  }),
  transfer: jest.fn().mockResolvedValue({
    hash: 'mock-transfer-hash',
    ledger: 12345,
    success: true,
  }),
  getPrice: jest.fn().mockResolvedValue('0.1'),
  getTotalSupply: jest.fn().mockResolvedValue('1000000000'),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
