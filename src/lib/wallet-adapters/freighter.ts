import { WalletAdapter, WalletConnection } from './types';

// Extend Window interface for Freighter
declare global {
  interface Window {
    freighterApi: any;
    freighter: any;
  }
}

export class FreighterAdapter implements WalletAdapter {
  name = 'Freighter';
  icon = '🦋';

  isAvailable(): boolean {
    const available = !!(window.freighterApi || window.freighter);
    console.log('Freighter detection:', {
      freighterApi: !!window.freighterApi,
      freighter: !!window.freighter,
      available
    });
    return available;
  }

  async connect(): Promise<WalletConnection> {
    if (!this.isAvailable()) {
      throw new Error('Freighter wallet is not installed. Please install Freighter from freighter.app and refresh the page.');
    }

    const api = window.freighterApi || window.freighter;
    
    try {
      // Check if Freighter is available and request permission
      try {
        const isAllowed = await api.isAllowed();
        if (!isAllowed) {
          await api.setAllowed();
        }
      } catch (permError) {
        console.log('Permission check failed, trying direct connection...');
      }

      const addressResponse = await api.getAddress();
      const publicKey = typeof addressResponse === 'string' ? addressResponse : addressResponse.address;

      return {
        publicKey,
        signTransaction: async (transactionXdr: string) => {
          const result = await api.signTransaction(transactionXdr, {
            networkPassphrase: 'Test SDF Network ; September 2015', // Default testnet
          });
          return typeof result === 'string' ? result : result.signedTxXdr;
        }
      };
    } catch (error) {
      throw new Error(`Failed to connect to Freighter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    // Freighter doesn't have a disconnect method, just clear local state
    return Promise.resolve();
  }

  async signTransaction(transactionXdr: string, networkPassphrase: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Freighter wallet is not available');
    }

    const api = window.freighterApi || window.freighter;
    const result = await api.signTransaction(transactionXdr, {
      networkPassphrase,
    });
    return typeof result === 'string' ? result : result.signedTxXdr;
  }

  async getPublicKey(): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Freighter wallet is not available');
    }

    const api = window.freighterApi || window.freighter;
    const addressResponse = await api.getAddress();
    return typeof addressResponse === 'string' ? addressResponse : addressResponse.address;
  }

  async isConnected(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const api = window.freighterApi || window.freighter;
      return await api.isConnected();
    } catch (error) {
      return false;
    }
  }
}
