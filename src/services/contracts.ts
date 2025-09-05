// Mock implementation for contract service
export interface ContractConfig {
  rpcUrl: string;
  networkPassphrase: string;
  factoryContractId: string;
  kaleTokenId: string;
}

export class StellarContractService {
  private config: ContractConfig;

  constructor(config: ContractConfig) {
    this.config = config;
  }

  async createMarket(params: any) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      hash: 'mock_create_' + Date.now(),
      success: true,
    };
  }

  async placeBet(marketId: string, side: boolean, amount: number) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      hash: 'mock_bet_' + Date.now(),
      success: true,
    };
  }

  async resolveMarket(marketId: string) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      hash: 'mock_resolve_' + Date.now(),
      success: true,
    };
  }

  async claimWinnings(marketId: string, userAddress: string) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      hash: 'mock_claim_' + Date.now(),
      success: true,
    };
  }
}

export const stellarContractService = new StellarContractService({
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  factoryContractId: '',
  kaleTokenId: '',
});