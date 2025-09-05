import { WalletAdapter, WalletInfo, WalletType } from './types';
import { FreighterAdapter } from './freighter';
import { LobstrAdapter } from './lobstr';
import { RabetAdapter } from './rabet';
import { AlbedoAdapter } from './albedo';

export class WalletManager {
  private adapters: Map<WalletType, WalletAdapter> = new Map();
  private currentWallet: WalletType | null = null;
  private currentConnection: any = null;

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters() {
    this.adapters.set('freighter', new FreighterAdapter());
    this.adapters.set('lobstr', new LobstrAdapter());
    this.adapters.set('rabet', new RabetAdapter());
    this.adapters.set('albedo', new AlbedoAdapter());
  }

  getAvailableWallets(): WalletInfo[] {
    const wallets: WalletInfo[] = [];
    
    for (const [type, adapter] of this.adapters) {
      wallets.push({
        name: adapter.name,
        icon: adapter.icon,
        description: this.getWalletDescription(type),
        isAvailable: adapter.isAvailable(),
        adapter,
      });
    }

    return wallets.filter(wallet => wallet.isAvailable);
  }

  getAllWallets(): WalletInfo[] {
    const wallets: WalletInfo[] = [];
    
    for (const [type, adapter] of this.adapters) {
      wallets.push({
        name: adapter.name,
        icon: adapter.icon,
        description: this.getWalletDescription(type),
        isAvailable: adapter.isAvailable(),
        adapter,
      });
    }

    return wallets;
  }

  private getWalletDescription(type: WalletType): string {
    const descriptions = {
      freighter: 'Official Stellar Development Foundation wallet',
      lobstr: 'User-friendly mobile and web wallet',
      rabet: 'Open-source Stellar wallet with advanced features',
      albedo: 'Web-based wallet for Stellar transactions',
      xbull: 'Multi-platform Stellar wallet'
    };
    return descriptions[type] || 'Stellar wallet';
  }

  async connectWallet(walletType: WalletType): Promise<any> {
    const adapter = this.adapters.get(walletType);
    if (!adapter) {
      throw new Error(`Wallet adapter for ${walletType} not found`);
    }

    if (!adapter.isAvailable()) {
      throw new Error(`${adapter.name} wallet is not available`);
    }

    try {
      this.currentConnection = await adapter.connect();
      this.currentWallet = walletType;
      return this.currentConnection;
    } catch (error) {
      this.currentConnection = null;
      this.currentWallet = null;
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    if (this.currentWallet && this.currentConnection) {
      const adapter = this.adapters.get(this.currentWallet);
      if (adapter) {
        await adapter.disconnect();
      }
    }
    this.currentConnection = null;
    this.currentWallet = null;
  }

  getCurrentWallet(): WalletType | null {
    return this.currentWallet;
  }

  getCurrentConnection(): any {
    return this.currentConnection;
  }

  async signTransaction(transactionXdr: string, networkPassphrase: string): Promise<string> {
    if (!this.currentWallet || !this.currentConnection) {
      throw new Error('No wallet connected');
    }

    const adapter = this.adapters.get(this.currentWallet);
    if (!adapter) {
      throw new Error('Current wallet adapter not found');
    }

    return await adapter.signTransaction(transactionXdr, networkPassphrase);
  }

  async getPublicKey(): Promise<string> {
    if (!this.currentWallet || !this.currentConnection) {
      throw new Error('No wallet connected');
    }

    const adapter = this.adapters.get(this.currentWallet);
    if (!adapter) {
      throw new Error('Current wallet adapter not found');
    }

    return await adapter.getPublicKey();
  }

  async isConnected(): Promise<boolean> {
    if (!this.currentWallet) {
      return false;
    }

    const adapter = this.adapters.get(this.currentWallet);
    if (!adapter) {
      return false;
    }

    return await adapter.isConnected();
  }

  // Auto-connect to the first available wallet
  async autoConnect(): Promise<boolean> {
    const availableWallets = this.getAvailableWallets();
    
    for (const wallet of availableWallets) {
      try {
        await this.connectWallet(wallet.adapter.name.toLowerCase() as WalletType);
        return true;
      } catch (error) {
        console.log(`Failed to auto-connect to ${wallet.name}:`, error);
        continue;
      }
    }
    
    return false;
  }
}

// Singleton instance
export const walletManager = new WalletManager();
