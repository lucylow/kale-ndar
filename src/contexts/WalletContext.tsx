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
      console.log('Initializing wallet manager...');
      
      try {
        // Force real wallets if configured
        const useRealWallets = config.wallet.forceRealWallets !== false;
        
        if (useRealWallets) {
          // Check for available real wallets
          const realWallets = walletManager.getAvailableWallets();
          console.log(`Found ${realWallets.length} real Stellar wallets available`);
          
          if (realWallets.length === 0) {
            console.log('No real wallets detected, will require wallet installation');
            setAvailableWallets(walletManager.getAllWallets()); // Show all wallets for installation guide
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
                
                // Load user data
                await loadUserData(connection.publicKey);
              }
            }
          }
        } else {
          // Fallback to mock wallets for development
          console.log('Using mock wallet manager for development');
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
        console.error('Error initializing wallets:', error);
      } finally {
        setIsLoading(false);
        console.log('Wallet initialization completed');
      }
    };

    // Wait for the page to load before initializing
    if (typeof window !== 'undefined') {
      setTimeout(initializeWallets, 100);
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
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // Reset wallet state on error
      setWallet({
        isConnected: false,
        publicKey: null,
        signTransaction: async () => { throw new Error('Wallet not connected'); }
      });
      setCurrentWalletType(null);
      throw error;
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