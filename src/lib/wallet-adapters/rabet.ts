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
    try {
      const rabet = window.rabet;
      const available = !!rabet;
      
      console.log('Rabet detection:', {
        rabet: !!rabet,
        available,
        userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'
      });
      
      return available;
    } catch (error) {
      console.error('Error checking Rabet availability:', error);
      return false;
    }
  }

  async connect(): Promise<WalletConnection> {
    if (!this.isAvailable()) {
      throw new Error('Rabet wallet is not installed. Please install Rabet from rabet.app and refresh the page.');
    }

    const api = window.rabet;
    
    try {
      console.log('Attempting Rabet connection...');
      
      // Request permission to connect
      try {
        const isAllowed = await api.isAllowed();
        console.log('Rabet permission check:', isAllowed);
        
        if (!isAllowed) {
          console.log('Requesting Rabet permission...');
          await api.setAllowed();
        }
      } catch (permError) {
        console.log('Permission check failed, trying direct connection...', permError);
      }

      // Get the public key/address
      console.log('Getting Rabet address...');
      const addressResponse = await api.getAddress();
      console.log('Rabet address response:', addressResponse);
      
      const publicKey = typeof addressResponse === 'string' ? addressResponse : addressResponse.address;
      
      if (!publicKey) {
        throw new Error('No public key returned from Rabet');
      }

      console.log('Rabet connected successfully:', publicKey);

      return {
        publicKey,
        signTransaction: async (transactionXdr: string) => {
          console.log('Signing transaction with Rabet...');
          const result = await api.signTransaction(transactionXdr, {
            networkPassphrase: 'Test SDF Network ; September 2015', // Default testnet
          });
          console.log('Rabet signing result:', result);
          return typeof result === 'string' ? result : result.signedTxXdr;
        }
      };
    } catch (error) {
      console.error('Rabet connection error:', error);
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
