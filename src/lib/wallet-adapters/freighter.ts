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
    try {
      // Check for Freighter API with better detection
      const api = (window as any).freighterApi || (window as any).freighter;
      
      console.log('🦋 Freighter detection check:', {
        freighterApi: !!(window as any).freighterApi,
        freighter: !!(window as any).freighter,
        api: !!api,
        getAddress: typeof api?.getAddress === 'function',
        signTransaction: typeof api?.signTransaction === 'function'
      });
      
      // More reliable check - ensure the API has the required methods
      return !!api && typeof api.getAddress === 'function' && typeof api.signTransaction === 'function';
    } catch (error) {
      console.error('Error checking Freighter availability:', error);
      return false;
    }
  }

  async connect(): Promise<WalletConnection> {
    const api = (window as any).freighterApi || (window as any).freighter;
    
    if (!api || typeof api.getAddress !== 'function') {
      throw new Error('Freighter wallet is not installed or not properly loaded. Please install Freighter from freighter.app and refresh the page.');
    }

    try {
      console.log('🦋 Attempting Freighter connection...');
      
      // Try to check and request permission (optional, some versions may not have this)
      try {
        if (typeof api.isAllowed === 'function') {
          const isAllowed = await api.isAllowed();
          console.log('Freighter permission check:', isAllowed);
          
          if (!isAllowed && typeof api.setAllowed === 'function') {
            console.log('Requesting Freighter permission...');
            await api.setAllowed();
          }
        } else {
          console.log('Freighter isAllowed method not available, proceeding with direct connection');
        }
      } catch (permError) {
        console.log('Permission check failed, continuing with connection...', permError);
      }

      // Get the public key/address
      console.log('Getting Freighter address...');
      const addressResponse = await api.getAddress();
      console.log('Freighter address response:', addressResponse);
      
      const publicKey = typeof addressResponse === 'string' ? addressResponse : addressResponse?.address;
      
      if (!publicKey) {
        throw new Error('No public key returned from Freighter. Please make sure Freighter is unlocked and has an account selected.');
      }

      console.log(`✅ Freighter connected successfully! Address: ${publicKey}`);

      return {
        publicKey,
        signTransaction: async (transactionXdr: string) => {
          console.log('🔏 Signing transaction with Freighter...');
          const networkPassphrase = this.getNetworkPassphrase();
          const result = await api.signTransaction(transactionXdr, {
            networkPassphrase,
          });
          console.log('Freighter signing result:', result);
          return typeof result === 'string' ? result : result.signedTxXdr;
        }
      };
    } catch (error) {
      console.error('❌ Freighter connection error:', error);
      if (error instanceof Error) {
        if (error.message.includes('User declined')) {
          throw new Error('Connection cancelled. Please approve the connection request in Freighter.');
        } else if (error.message.includes('locked')) {
          throw new Error('Freighter wallet is locked. Please unlock your wallet and try again.');
        }
      }
      throw new Error(`Failed to connect to Freighter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getNetworkPassphrase(): string {
    // Import config dynamically to avoid circular imports
    const isTestnet = typeof window !== 'undefined' && 
                     (window.location.hostname === 'localhost' || 
                      window.location.hostname.includes('preview'));
    
    return isTestnet 
      ? 'Test SDF Network ; September 2015'  // Testnet
      : 'Public Global Stellar Network ; September 2015'; // Mainnet
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
      networkPassphrase: networkPassphrase || this.getNetworkPassphrase(),
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
