// Configuration for KALE-ndar application
export const config = {
  // Stellar/Soroban configuration
  soroban: {
    rpcUrl: (typeof process !== 'undefined' && process.env?.VITE_SOROBAN_RPC_URL) || 'https://soroban-testnet.stellar.org',
    networkPassphrase: (typeof process !== 'undefined' && process.env?.VITE_NETWORK_PASSPHRASE) || 'Test SDF Network ; September 2015',
    factoryContractId: (typeof process !== 'undefined' && process.env?.VITE_FACTORY_CONTRACT_ID) || '',
    
    // KALE Protocol Contract Addresses
    kaleContractId: (typeof process !== 'undefined' && process.env?.VITE_KALE_CONTRACT_ID) || 'CDBG4XY2T5RRPH7HKGZIWMR2MFPLC6RJ453ITXQGNQXG6LNVL4375MRJ', // Testnet
    kaleTokenId: (typeof process !== 'undefined' && process.env?.VITE_KALE_TOKEN_ID) || 'CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA', // Mainnet
    
    // Reflector Oracle Contract Addresses
    reflectorContractId: (typeof process !== 'undefined' && process.env?.VITE_REFLECTOR_CONTRACT_ID) || 'CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN', // External CEX/DEX
    reflectorStellarId: 'CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M', // Stellar Assets
    reflectorForexId: 'CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC', // Forex Rates
    
    // Reflector Subscription Contract
    reflectorSubscriptionId: (typeof process !== 'undefined' && process.env?.VITE_REFLECTOR_SUBSCRIPTION_ID) || '',
    
    // Reflector DAO Contract
    reflectorDaoId: (typeof process !== 'undefined' && process.env?.VITE_REFLECTOR_DAO_ID) || '',
  },
  
  // Application configuration
  app: {
    name: 'KALE-ndar',
    description: 'Decentralized Prediction Markets on Stellar',
    version: '1.0.0',
    environment: (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development',
  },
  
  // Feature flags
  features: {
    enableWalletConnection: true,
    enableMarketCreation: true,
    enableStaking: true,
    enableMockData: false, // Use real backend API
    enableBackendHealthCheck: true, // Enable backend health checks
  },
  
  // API endpoints
  api: {
    baseUrl: (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) || 'http://localhost:3000',
    websocketUrl: (typeof process !== 'undefined' && process.env?.VITE_WS_URL) || 'ws://localhost:3000',
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
