import React, { createContext, useContext, useEffect, useState } from 'react';
import { Wallet, User } from '@/types/market';
import { config } from '@/lib/config';
import { apiService } from '@/services/api';
import { getMockUserByAddress, getMockUserStats } from '@/data/mockData';
import { getMockUserByAddress as getMockUserByAddressNew, getMockUserStatsByAddress } from '@/data/mockWalletData';
import { walletManager, WalletManager } from '@/lib/wallet-adapters/wallet-manager';
import { mockWalletManager } from '@/lib/wallet-adapters/mock-wallet-manager';
import { WalletType } from '@/lib/wallet-adapters/types';

interface WalletContextType {
  wallet: Wallet;
  user: User | null;
  userStats: any;
  availableWallets: any[];
  currentWalletType: WalletType | null;
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  updateUserProfile: (data: { username?: string; email?: string }) => Promise<void>;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet>({
    isConnected: false,
    publicKey: null,
    signTransaction: async () => { throw new Error('Wallet not connected'); }
  });
  
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [currentWalletType, setCurrentWalletType] = useState<WalletType | null>(null);

  // Initialize available wallets and check for existing connections
  useEffect(() => {
    const initializeWallets = async () => {
      setIsLoading(true);
      console.log('🔍 Initializing wallet manager...');
      
      try {
        // Force real wallets if configured
        const useRealWallets = config.wallet.forceRealWallets !== false;
        
        if (useRealWallets) {
          // Add delay to ensure browser extensions are loaded
          console.log('⏳ Waiting for browser extensions to load...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          
          // Debug: Check what's available on window
          console.log('🪟 Window objects check:', {
            freighterApi: !!(window as any).freighterApi,
            freighter: !!(window as any).freighter,
            isAllowed: typeof (window as any).freighterApi?.isAllowed,
            getAllExtensions: Object.keys(window).filter(key => key.toLowerCase().includes('freighter') || key.toLowerCase().includes('stellar'))
          });
          
          // Check for available real wallets
          const realWallets = walletManager.getAvailableWallets();
          console.log(`📍 Found ${realWallets.length} real Stellar wallets available:`, realWallets.map(w => w.name));
          
          if (realWallets.length === 0) {
            console.log('❌ No real wallets detected, will show installation guide');
            // Also check for all wallets to show installation options
            const allWallets = walletManager.getAllWallets();
            console.log('📋 All possible wallets:', allWallets.map(w => ({ name: w.name, available: w.isAvailable })));
            setAvailableWallets(allWallets);
          } else {
            setAvailableWallets(realWallets);
            
            // Try to auto-connect to any available real wallet
            const connected = await walletManager.autoConnect();
            
            if (connected) {
              const connection = walletManager.getCurrentConnection();
              const walletType = walletManager.getCurrentWallet();
              
              if (connection && walletType) {
                setCurrentWalletType(walletType as WalletType);
                setWallet({
                  isConnected: true,
                  publicKey: connection.publicKey,
                  signTransaction: connection.signTransaction
                });
                
                console.log('✅ Auto-connected to wallet:', walletType);
                
                // Load user data
                await loadUserData(connection.publicKey);
              }
            }
          }
        } else {
          // Fallback to mock wallets for development
          console.log('🎭 Using mock wallet manager for development');
          const wallets = mockWalletManager.getAllWallets();
          setAvailableWallets(wallets);
          
          // Try to auto-connect to mock wallet
          const connected = await mockWalletManager.autoConnect();
          
          if (connected) {
            const connection = mockWalletManager.getCurrentConnection();
            const walletType = mockWalletManager.getCurrentWallet();
            
            if (connection && walletType) {
              setCurrentWalletType(walletType as WalletType);
              setWallet({
                isConnected: true,
                publicKey: connection.publicKey,
                signTransaction: connection.signTransaction
              });
              
              // Load user data
              await loadUserData(connection.publicKey);
            }
          }
        }
      } catch (error) {
        console.error('💥 Error initializing wallets:', error);
      } finally {
        setIsLoading(false);
        console.log('✨ Wallet initialization completed');
      }
    };

    // Wait for the page to load before initializing
    if (typeof window !== 'undefined') {
      // Use a longer delay to ensure all extensions are loaded
      setTimeout(initializeWallets, 500);
    }
  }, []);

  const loadUserData = async (address: string) => {
    try {
      setIsLoading(true);
      
      // For real wallets, try to load from API first, fallback to mock data
      try {
        const userProfile = await apiService.getUserProfile(address);
        setUser(userProfile);
      } catch (error) {
        console.log('API unavailable, using mock data for user profile');
        // Fallback to mock data
        const mockUser = getMockUserByAddressNew(address) || getMockUserByAddress(address);
        if (mockUser) {
          setUser(mockUser);
        } else {
          // Create a new user profile
          setUser({
            id: 0,
            address,
            username: null,
            email: null,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            total_bets: 0,
            total_winnings: 0,
          });
        }
      }
      
      // Try to load user stats from API
      try {
        const stats = await apiService.getUserStats(address);
        setUserStats(stats);
      } catch (error) {
        console.log('API unavailable, using mock data for user stats');
        // Fallback to mock data
        const mockStats = getMockUserStatsByAddress(address) || getMockUserStats(address);
        if (mockStats) {
          setUserStats(mockStats);
        } else {
          // Create default stats
          setUserStats({
            total_bets: 0,
            total_bet_amount: 0,
            claimed_bets: 0,
            pending_claims: 0,
            wins: 0,
            losses: 0,
            win_rate: 0,
            recent_activity: [],
          });
        }
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (walletType?: WalletType) => {
    console.log('connectWallet called with wallet type:', walletType);
    
    try {
      setIsLoading(true);
      
      // Always try to use real wallets first when forceRealWallets is enabled
      const useRealWallets = config.wallet.forceRealWallets !== false;
      
<<<<<<< Updated upstream
      if (useRealWallets) {
        const availableRealWallets = walletManager.getAvailableWallets();
        
        if (availableRealWallets.length === 0) {
          throw new Error(
            `No Stellar wallets detected. Please install a Stellar wallet:\n\n` +
            `• Freighter (freighter.app) - Recommended\n` +
            `• Lobstr (lobstr.co)\n` +
            `• Rabet (rabet.io)\n` +
            `• Albedo (albedo.link)\n\n` +
            `After installation, refresh the page and try connecting again.`
          );
=======
      console.log('Wallet manager status:', {
        hasRealWallets,
        realWalletsCount: realWallets.length,
        managerType: hasRealWallets ? 'real' : 'mock'
      });
      
      // If no wallet type specified, try to connect to the first available wallet
      if (!walletType) {
        const availableWallets = manager.getAvailableWallets();
        console.log('Available wallets:', availableWallets.map(w => w.name));
        
        if (availableWallets.length === 0) {
          throw new Error('No Stellar wallets are available. Please install a Stellar wallet like Freighter, Lobstr, Rabet, or Albedo.');
>>>>>>> Stashed changes
        }
        
        // If no wallet type specified, use the first available real wallet
        if (!walletType) {
          walletType = availableRealWallets[0].adapter.name.toLowerCase() as WalletType;
        }
        
        // Check if the requested wallet is available
        const requestedWallet = availableRealWallets.find(
          w => w.adapter.name.toLowerCase() === walletType
        );
        
        if (!requestedWallet) {
          throw new Error(
            `${walletType} wallet is not installed or available. ` +
            `Available wallets: ${availableRealWallets.map(w => w.name).join(', ')}`
          );
        }
        
        console.log(`Connecting to ${walletType} wallet...`);
        
        const connection = await walletManager.connectWallet(walletType);
        
        if (!connection) {
          throw new Error('Failed to establish wallet connection');
        }
        
        setCurrentWalletType(walletType);
        setWallet({
          isConnected: true,
          publicKey: connection.publicKey,
          signTransaction: connection.signTransaction
        });
        
        console.log('Real Stellar wallet connected successfully:', connection.publicKey);
        console.log('Network: Testnet (for testing) - switch to Mainnet in production');
        
        // Load user data after connecting
        await loadUserData(connection.publicKey);
        
      } else {
        // Fall back to mock wallets for development
        console.log('Using mock wallet for development');
        
        if (!walletType) {
          const availableWallets = mockWalletManager.getAvailableWallets();
          if (availableWallets.length === 0) {
            throw new Error('No mock wallets available');
          }
          walletType = availableWallets[0].adapter.name.toLowerCase() as WalletType;
        }
        
        const connection = await mockWalletManager.connectWallet(walletType);
        
        if (!connection) {
          throw new Error('Failed to establish mock wallet connection');
        }
        
        setCurrentWalletType(walletType);
        setWallet({
          isConnected: true,
          publicKey: connection.publicKey,
          signTransaction: connection.signTransaction
        });
        
        console.log('Mock wallet connected:', connection.publicKey);
        
        // Load user data after connecting
        await loadUserData(connection.publicKey);
      }
      
<<<<<<< Updated upstream
=======
      console.log(`Connecting to ${walletType} wallet...`);
      
      // Add timeout to connection attempt
      const connectionPromise = manager.connectWallet(walletType);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
      );
      
      const connection = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (!connection) {
        throw new Error('Failed to establish wallet connection');
      }
      
      setCurrentWalletType(walletType);
      setWallet({
        isConnected: true,
        publicKey: connection.publicKey,
        signTransaction: connection.signTransaction
      });
      
      console.log('Wallet connected successfully:', connection.publicKey);
      
      // Load user data after connecting
      await loadUserData(connection.publicKey);
      
>>>>>>> Stashed changes
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to connect wallet';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Connection timeout. Please try again.';
        } else if (error.message.includes('not installed')) {
          errorMessage = 'Wallet not installed. Please install the wallet extension.';
        } else if (error.message.includes('not available')) {
          errorMessage = 'Wallet not available. Please check if the wallet is unlocked.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please approve the connection in your wallet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Reset wallet state on error
      setWallet({
        isConnected: false,
        publicKey: null,
        signTransaction: async () => { throw new Error('Wallet not connected'); }
      });
      setCurrentWalletType(null);
<<<<<<< Updated upstream
      throw error;
=======
      throw new Error(errorMessage);
>>>>>>> Stashed changes
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    await walletManager.disconnectWallet();
    setCurrentWalletType(null);
    setWallet({
      isConnected: false,
      publicKey: null,
      signTransaction: async () => { throw new Error('Wallet not connected'); }
    });
    setUser(null);
    setUserStats(null);
  };

  const updateUserProfile = async (data: { username?: string; email?: string }) => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setIsLoading(true);
      
      try {
        const result = await apiService.updateUserProfile(wallet.publicKey, data);
        setUser(result.user);
      } catch (error) {
        // Fallback: update local user data
        if (user) {
          const updatedUser = { ...user, ...data };
          setUser(updatedUser);
        }
      }
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!wallet.publicKey) return;
    await loadUserData(wallet.publicKey);
  };

  return (
    <WalletContext.Provider value={{ 
      wallet, 
      user, 
      userStats,
      availableWallets,
      currentWalletType,
      connectWallet, 
      disconnectWallet, 
      updateUserProfile,
      refreshUserData,
      isLoading 
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};