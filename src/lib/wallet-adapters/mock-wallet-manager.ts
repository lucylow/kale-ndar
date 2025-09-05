import { WalletManager } from './wallet-manager';
import { mockWallets } from '@/data/mockWalletData';

export class MockWalletManager extends WalletManager {
  constructor() {
    super();
  }

  getAllWallets() {
    return mockWallets;
  }

  getAvailableWallets() {
    return mockWallets.filter(wallet => wallet.isAvailable);
  }

  async connectWallet(walletType: string) {
    const wallet = mockWallets.find(w => w.adapter.name.toLowerCase() === walletType.toLowerCase());
    if (!wallet) {
      throw new Error(`Wallet adapter for ${walletType} not found`);
    }

    if (!wallet.isAvailable) {
      throw new Error(`${wallet.name} wallet is not available`);
    }

    try {
      this.currentConnection = await wallet.adapter.connect();
      this.currentWallet = walletType.toLowerCase() as any;
      return this.currentConnection;
    } catch (error) {
      this.currentConnection = null;
      this.currentWallet = null;
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.currentConnection = null;
    this.currentWallet = null;
  }

  getCurrentWallet(): string | null {
    return this.currentWallet;
  }

  getCurrentConnection(): any {
    return this.currentConnection;
  }

  async autoConnect() {
    const availableWallets = this.getAvailableWallets();
    
    for (const wallet of availableWallets) {
      try {
        await this.connectWallet(wallet.adapter.name.toLowerCase());
        return true;
      } catch (error) {
        console.log(`Failed to auto-connect to ${wallet.name}:`, error);
        continue;
      }
    }
    
    return false;
  }
}

// Mock wallet manager instance for development
export const mockWalletManager = new MockWalletManager();
