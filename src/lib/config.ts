// Configuration for KALE-ndar application
export const config = {
  // Stellar/Soroban configuration
  soroban: {
    rpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
    networkPassphrase: import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    factoryContractId: import.meta.env.VITE_FACTORY_CONTRACT_ID || '',
    kaleTokenId: import.meta.env.VITE_KALE_TOKEN_ID || '',
    reflectorContractId: import.meta.env.VITE_REFLECTOR_CONTRACT_ID || '',
  },
  
  // Application configuration
  app: {
    name: 'KALE-ndar',
    description: 'Decentralized Prediction Markets on Stellar',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },
  
  // Feature flags
  features: {
    enableWalletConnection: true,
    enableMarketCreation: true,
    enableStaking: true,
    enableMockData: true, // Always use mock data since backend isn't deployed
    enableBackendHealthCheck: false, // Disable backend health checks
  },
  
  // API endpoints
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    websocketUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
  },
  
  // Wallet configuration
  wallet: {
    supportedWallets: ['freighter'],
    defaultWallet: 'freighter',
  },
  
  // Market configuration
  markets: {
    minBetAmount: 1,
    maxBetAmount: 1000000,
    marketCreationFee: 100,
    resolutionTimeBuffer: 3600000, // 1 hour in milliseconds
  },

  // Connection status
  connection: {
    checkInterval: 30000, // 30 seconds
    reconnectAttempts: 5,
    reconnectDelay: 1000, // 1 second
  },
};

export default config;
