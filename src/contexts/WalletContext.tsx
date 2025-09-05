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
        // Use mock data in development mode
        const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
        const manager = isDevelopment ? mockWalletManager : walletManager;
        
        // Get available wallets
        const wallets = manager.getAllWallets();
        setAvailableWallets(wallets);
        
        // Try to auto-connect to any available wallet
        const connected = await manager.autoConnect();
        
        if (connected) {
          const connection = manager.getCurrentConnection();
          const walletType = manager.getCurrentWallet();
          
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
      
      // Use mock data in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        // Use new mock data
        const mockUser = getMockUserByAddressNew(address);
        const mockStats = getMockUserStatsByAddress(address);
        
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
      } else {
      // Try to load user profile from API
      try {
        const userProfile = await apiService.getUserProfile(address);
        setUser(userProfile);
      } catch (error) {
        // Fallback to mock data
        const mockUser = getMockUserByAddress(address);
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
        // Fallback to mock data
        const mockStats = getMockUserStats(address);
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
      
      // Use mock data in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      const manager = isDevelopment ? mockWalletManager : walletManager;
      
      // If no wallet type specified, try to connect to the first available wallet
      if (!walletType) {
        const availableWallets = manager.getAvailableWallets();
        if (availableWallets.length === 0) {
          throw new Error('No Stellar wallets are available. Please install a Stellar wallet like Freighter, Lobstr, Rabet, or Albedo.');
        }
        walletType = availableWallets[0].adapter.name.toLowerCase() as WalletType;
      }
      
      console.log(`Connecting to ${walletType} wallet...`);
      
      const connection = await manager.connectWallet(walletType);
      
      setCurrentWalletType(walletType);
      setWallet({
        isConnected: true,
        publicKey: connection.publicKey,
        signTransaction: connection.signTransaction
      });
      
      console.log('Wallet connected successfully');
      
      // Load user data after connecting
      await loadUserData(connection.publicKey);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to connect wallet');
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