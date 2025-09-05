import { WalletAdapter, WalletConnection } from './types';

// Extend Window interface for Rabet
declare global {
  interface Window {
    rabet: any;
  }
}

export class RabetAdapter implements WalletAdapter {
  name = 'Rabet';
  icon = '🐰';

  isAvailable(): boolean {
    return !!window.rabet;
  }

  async connect(): Promise<WalletConnection> {
    if (!this.isAvailable()) {
      throw new Error('Rabet wallet is not installed. Please install Rabet from rabet.app and refresh the page.');
    }

    const api = window.rabet;
    
    try {
      // Request permission to connect
      const isAllowed = await api.isAllowed();
      if (!isAllowed) {
        await api.setAllowed();
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
      throw new Error(`Failed to connect to Rabet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    // Rabet doesn't have a disconnect method, just clear local state
    return Promise.resolve();
  }

  async signTransaction(transactionXdr: string, networkPassphrase: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Rabet wallet is not available');
    }

    const api = window.rabet;
    const result = await api.signTransaction(transactionXdr, {
      networkPassphrase,
    });
    return typeof result === 'string' ? result : result.signedTxXdr;
  }

  async getPublicKey(): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Rabet wallet is not available');
    }

    const api = window.rabet;
    const addressResponse = await api.getAddress();
    return typeof addressResponse === 'string' ? addressResponse : addressResponse.address;
  }

  async isConnected(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const api = window.rabet;
      return await api.isConnected();
    } catch (error) {
      return false;
    }
  }
}
