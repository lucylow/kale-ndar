import { WalletAdapter, WalletConnection } from './types';

// Extend Window interface for Albedo
declare global {
  interface Window {
    albedo: any;
  }
}

export class AlbedoAdapter implements WalletAdapter {
  name = 'Albedo';
  icon = '🌅';

  isAvailable(): boolean {
    return !!window.albedo;
  }

  async connect(): Promise<WalletConnection> {
    if (!this.isAvailable()) {
      throw new Error('Albedo wallet is not installed. Please install Albedo from albedo.link and refresh the page.');
    }

    const api = window.albedo;
    
    try {
      // Albedo uses a different API pattern
      const publicKey = await api.publicKey({
        network: 'testnet', // Default to testnet
      });

      return {
        publicKey,
        signTransaction: async (transactionXdr: string) => {
          const result = await api.tx({
            xdr: transactionXdr,
            network: 'testnet',
          });
          return result.xdr;
        }
      };
    } catch (error) {
      throw new Error(`Failed to connect to Albedo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    // Albedo doesn't have a disconnect method, just clear local state
    return Promise.resolve();
  }

  async signTransaction(transactionXdr: string, networkPassphrase: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Albedo wallet is not available');
    }

    const api = window.albedo;
    const result = await api.tx({
      xdr: transactionXdr,
      network: networkPassphrase.includes('Test') ? 'testnet' : 'public',
    });
    return result.xdr;
  }

  async getPublicKey(): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Albedo wallet is not available');
    }

    const api = window.albedo;
    return await api.publicKey({
      network: 'testnet',
    });
  }

  async isConnected(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const api = window.albedo;
      // Albedo doesn't have a direct isConnected method, try to get public key
      await api.publicKey({ network: 'testnet' });
      return true;
    } catch (error) {
      return false;
    }
  }
}
