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
  console.log('🔄 WalletProvider rendering...');
  
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

  // Simplified initialization - no complex async logic
  useEffect(() => {
    console.log('🔍 Initializing wallet manager...');
    // Just set some mock wallets without complex initialization
    setAvailableWallets([{ name: 'Mock Wallet', type: 'mock' }]);
    console.log('✨ Wallet initialization completed');
  }, []);

  const loadUserData = async (address: string) => {
    try {
      console.log('👤 Loading user data for:', address);
      setIsLoading(true);
      
      // Create simple mock user data
      setUser({
        id: 0,
        address,
        username: 'Demo User',
        email: null,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        total_bets: 5,
        total_winnings: 1250,
      });

      setUserStats({
        total_bets: 5,
        total_bet_amount: 500,
        claimed_bets: 3,
        pending_claims: 2,
        wins: 3,
        losses: 2,
        win_rate: 60,
        total_winnings: 1250,
        recent_activity: [],
      });
      
      console.log('✅ User data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (walletType?: WalletType) => {
    console.log('🔌 connectWallet called with wallet type:', walletType);
    
    try {
      setIsLoading(true);
      console.log('⏳ Setting loading to true');
      
      // Simple mock connection
      const mockConnection = {
        publicKey: 'GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
        signTransaction: async (tx: any) => tx
      };
      
      console.log('🔗 Setting wallet state...');
      setCurrentWalletType('mock' as WalletType);
      setWallet({
        isConnected: true,
        publicKey: mockConnection.publicKey,
        signTransaction: mockConnection.signTransaction
      });
      
      console.log('✅ Mock wallet connected:', mockConnection.publicKey);
      
      // Load user data after connecting
      console.log('👤 Loading user data...');
      await loadUserData(mockConnection.publicKey);
      
      console.log('🎉 Mock wallet connected successfully');
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      
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