import { WalletAdapter, WalletConnection } from './types';

// Extend Window interface for Lobstr
declare global {
  interface Window {
    LobstrApi: any;
    lobstr: any;
  }
}

export class LobstrAdapter implements WalletAdapter {
  name = 'Lobstr';
  icon = '🦞';

  isAvailable(): boolean {
    return !!(window.LobstrApi || window.lobstr);
  }

  async connect(): Promise<WalletConnection> {
    if (!this.isAvailable()) {
      throw new Error('Lobstr wallet is not installed. Please install Lobstr from lobstr.co and refresh the page.');
    }

    const api = window.LobstrApi || window.lobstr;
    
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
      throw new Error(`Failed to connect to Lobstr: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    // Lobstr doesn't have a disconnect method, just clear local state
    return Promise.resolve();
  }

  async signTransaction(transactionXdr: string, networkPassphrase: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Lobstr wallet is not available');
    }

    const api = window.LobstrApi || window.lobstr;
    const result = await api.signTransaction(transactionXdr, {
      networkPassphrase,
    });
    return typeof result === 'string' ? result : result.signedTxXdr;
  }

  async getPublicKey(): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Lobstr wallet is not available');
    }

    const api = window.LobstrApi || window.lobstr;
    const addressResponse = await api.getAddress();
    return typeof addressResponse === 'string' ? addressResponse : addressResponse.address;
  }

  async isConnected(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const api = window.LobstrApi || window.lobstr;
      return await api.isConnected();
    } catch (error) {
      return false;
    }
  }
}
