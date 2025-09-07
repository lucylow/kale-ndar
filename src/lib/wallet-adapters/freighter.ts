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
<<<<<<< Updated upstream
    // Add more comprehensive detection for Freighter
    console.log('🔍 Checking Freighter availability...');
    
    // Check multiple possible API locations
    const hasFreighterApi = !!(window as any).freighterApi;
    const hasFreighter = !!(window as any).freighter;
    const hasIsAllowed = typeof (window as any).freighterApi?.isAllowed === 'function';
    
    // Check if Freighter extension script is present
    const hasFreighterScript = document.querySelector('script[src*="freighter"]') !== null;
    
    const available = hasFreighterApi || hasFreighter;
    
    console.log('🦋 Freighter detection results:', {
      freighterApi: hasFreighterApi,
      freighter: hasFreighter,
      isAllowed: hasIsAllowed,
      script: hasFreighterScript,
      available,
      userAgent: navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Firefox'),
      windowKeys: Object.keys(window).filter(key => key.toLowerCase().includes('freighter'))
    });
    
    return available;
=======
    try {
      // Check multiple possible Freighter API locations
      const freighterApi = window.freighterApi;
      const freighter = window.freighter;
      
      const available = !!(freighterApi || freighter);
      
      console.log('Freighter detection:', {
        freighterApi: !!freighterApi,
        freighter: !!freighter,
        available,
        userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'
      });
      
      return available;
    } catch (error) {
      console.error('Error checking Freighter availability:', error);
      return false;
    }
>>>>>>> Stashed changes
  }

  async connect(): Promise<WalletConnection> {
    if (!this.isAvailable()) {
      throw new Error('Freighter wallet is not installed. Please install Freighter from freighter.app and refresh the page.');
    }

    const api = window.freighterApi || window.freighter;
    
    try {
      console.log('Attempting Freighter connection...');
      
      // Check if Freighter is available and request permission
      try {
        const isAllowed = await api.isAllowed();
        console.log('Freighter permission check:', isAllowed);
        
        if (!isAllowed) {
          console.log('Requesting Freighter permission...');
          await api.setAllowed();
        }
      } catch (permError) {
        console.log('Permission check failed, trying direct connection...', permError);
      }

<<<<<<< Updated upstream
      // Get network passphrase from config
      const networkPassphrase = this.getNetworkPassphrase();
      console.log('Using network:', networkPassphrase);

=======
      // Get the public key/address
      console.log('Getting Freighter address...');
>>>>>>> Stashed changes
      const addressResponse = await api.getAddress();
      console.log('Freighter address response:', addressResponse);
      
      const publicKey = typeof addressResponse === 'string' ? addressResponse : addressResponse.address;
      
      if (!publicKey) {
        throw new Error('No public key returned from Freighter');
      }

      console.log('Freighter connected successfully:', publicKey);

      console.log(`✅ Freighter connected successfully!`);
      console.log(`📍 Address: ${publicKey}`);
      console.log(`🌐 Network: ${networkPassphrase.includes('Test') ? 'Testnet' : 'Mainnet'}`);

      return {
        publicKey,
        signTransaction: async (transactionXdr: string) => {
          console.log('Signing transaction with Freighter...');
          const result = await api.signTransaction(transactionXdr, {
            networkPassphrase,
          });
          console.log('Freighter signing result:', result);
          return typeof result === 'string' ? result : result.signedTxXdr;
        }
      };
    } catch (error) {
      console.error('Freighter connection error:', error);
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
