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
      const api = (window as any).rabet;
      
      console.log('🐰 Rabet detection check:', {
        rabet: !!api,
        getAddress: typeof api?.getAddress === 'function',
        signTransaction: typeof api?.signTransaction === 'function'
      });
      
      // Check if Rabet API exists and has required methods
      return !!api && typeof api.getAddress === 'function' && typeof api.signTransaction === 'function';
    } catch (error) {
      console.error('Error checking Rabet availability:', error);
      return false;
    }
  }

  async connect(): Promise<WalletConnection> {
    const api = (window as any).rabet;
    
    if (!api || typeof api.getAddress !== 'function') {
      throw new Error('Rabet wallet is not installed or not properly loaded. Please install Rabet from rabet.io and refresh the page.');
    }

    try {
      console.log('🐰 Attempting Rabet connection...');
      
      // Try to check and request permission (but don't fail if method doesn't exist)
      try {
        if (typeof api.isAllowed === 'function') {
          const isAllowed = await api.isAllowed();
          console.log('Rabet permission check:', isAllowed);
          
          if (!isAllowed && typeof api.setAllowed === 'function') {
            console.log('Requesting Rabet permission...');
            await api.setAllowed();
          }
        } else {
          console.log('Rabet isAllowed method not available, proceeding with direct connection');
        }
      } catch (permError) {
        console.log('Permission check failed, continuing with connection...', permError);
      }

      // Get the public key/address
      console.log('Getting Rabet address...');
      const addressResponse = await api.getAddress();
      console.log('Rabet address response:', addressResponse);
      
      const publicKey = typeof addressResponse === 'string' ? addressResponse : addressResponse?.address;
      
      if (!publicKey) {
        throw new Error('No public key returned from Rabet. Please make sure Rabet is unlocked and has an account selected.');
      }

      console.log(`✅ Rabet connected successfully! Address: ${publicKey}`);

      return {
        publicKey,
        signTransaction: async (transactionXdr: string) => {
          console.log('🔏 Signing transaction with Rabet...');
          const networkPassphrase = 'Test SDF Network ; September 2015'; // Testnet default
          const result = await api.signTransaction(transactionXdr, {
            networkPassphrase,
          });
          console.log('Rabet signing result:', result);
          return typeof result === 'string' ? result : result.signedTxXdr;
        }
      };
    } catch (error) {
      console.error('❌ Rabet connection error:', error);
      if (error instanceof Error) {
        if (error.message.includes('User declined') || error.message.includes('rejected')) {
          throw new Error('Connection cancelled. Please approve the connection request in Rabet.');
        } else if (error.message.includes('locked')) {
          throw new Error('Rabet wallet is locked. Please unlock your wallet and try again.');
        }
      }
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
