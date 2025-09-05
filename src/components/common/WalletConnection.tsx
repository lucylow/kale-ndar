import React, { useState } from 'react';
import { Wallet, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';

const WalletConnection = () => {
  const { 
    wallet, 
    connectWallet, 
    disconnectWallet, 
    isLoading 
  } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
    toast.success('Wallet disconnected');
  };

  const copyAddress = () => {
    if (wallet.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!wallet.isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden md:block">{formatAddress(wallet.publicKey!)}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connected to Stellar</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">{formatAddress(wallet.publicKey!)}</span>
                <button onClick={copyAddress} className="p-1 hover:bg-gray-100 rounded">
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Balance: Loading...
              </p>
            </div>
          </div>
          
          <div className="p-4">
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
