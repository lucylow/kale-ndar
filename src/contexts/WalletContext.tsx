import React, { createContext, useContext, useEffect, useState } from 'react';
import { Wallet, User } from '@/types/market';
import { config } from '@/lib/config';
import { apiService } from '@/services/api';
import { getMockUserByAddress, getMockUserStats } from '@/data/mockData';
import freighterApi from '@stellar/freighter-api';

// Extend Window interface for Freighter
declare global {
  interface Window {
    freighterApi: any;
  }
}

interface WalletContextType {
  wallet: Wallet;
  user: User | null;
  userStats: any;
  connectWallet: () => Promise<void>;
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

  // Check if wallet was previously connected and load user data
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      console.log('Starting wallet connection check...');
      
      try {
        // Wait for Freighter to be available
        let retries = 0;
        const maxRetries = 5;
        
        while (retries < maxRetries) {
          if (window.freighterApi || (window as any).freighter) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 200));
          retries++;
        }
        
        const api = window.freighterApi || (window as any).freighter;
        
        // Check if Freighter is available
        if (!api) {
          console.log('Freighter not available after waiting');
          return;
        }
        
        const connected = await api.isConnected();
        console.log('Freighter connected:', connected);
        
        if (connected) {
          const addressResponse = await api.getAddress();
          const publicKey = typeof addressResponse === 'string' ? addressResponse : addressResponse.address;
          console.log('Got wallet address:', publicKey);
          
          setWallet({
            isConnected: true,
            publicKey,
            signTransaction: async (transactionXdr: string) => {
              const result = await api.signTransaction(transactionXdr, {
                networkPassphrase: config.soroban.networkPassphrase,
              });
              return typeof result === 'string' ? result : result.signedTxXdr;
            }
          });
          
          // Load user data
          await loadUserData(publicKey);
        } else {
          console.log('Wallet not connected');
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setIsLoading(false);
        console.log('Wallet check completed, isLoading set to false');
      }
    };

    // Wait for the page to load before checking connection
    if (typeof window !== 'undefined') {
      setTimeout(checkConnection, 100); // Small delay to ensure Freighter is loaded
    }
  }, []);

  const loadUserData = async (address: string) => {
    try {
      setIsLoading(true);
      
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
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    console.log('connectWallet called');
    
    try {
      setIsLoading(true);
      
      // Wait for Freighter to be available with retry logic
      let retries = 0;
      const maxRetries = 10;
      
      while (retries < maxRetries) {
        if (window.freighterApi || (window as any).freighter) {
          break;
        }
        
        console.log(`Waiting for Freighter... attempt ${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }
      
      // Use the global freighter object if freighterApi isn't available
      const api = window.freighterApi || (window as any).freighter;
      
      if (!api) {
        throw new Error('Freighter wallet is not installed. Please install Freighter from freighter.app and refresh the page.');
      }
      
      console.log('Freighter detected, checking if available...');
      
      // Check if Freighter is available and request permission
      try {
        const isAllowed = await api.isAllowed();
        console.log('Freighter isAllowed:', isAllowed);
        
        if (!isAllowed) {
          console.log('Requesting permission...');
          await api.setAllowed();
        }
      } catch (permError) {
        console.log('Permission check failed, trying direct connection...');
      }
      
      console.log('Getting address...');
      const addressResponse = await api.getAddress();
      console.log('Address response:', addressResponse);
      
      const publicKey = typeof addressResponse === 'string' ? addressResponse : addressResponse.address;
      console.log('Public key:', publicKey);
      
      setWallet({
        isConnected: true,
        publicKey,
        signTransaction: async (transactionXdr: string) => {
          const result = await api.signTransaction(transactionXdr, {
            networkPassphrase: config.soroban.networkPassphrase,
          });
          return typeof result === 'string' ? result : result.signedTxXdr;
        }
      });
      
      console.log('Wallet connected successfully');
      
      // Load user data after connecting
      await loadUserData(publicKey);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
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