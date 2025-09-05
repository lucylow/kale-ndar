import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, LogOut, User, TrendingUp, DollarSign } from 'lucide-react';

const WalletConnector: React.FC = () => {
  const { wallet, user, userStats, connectWallet, disconnectWallet, isLoading } = useWallet();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Your Freighter wallet has been connected successfully.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  if (wallet.isConnected && wallet.publicKey) {
    return (
      <div className="flex items-center gap-3">
        {/* User Stats */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-secondary/50 rounded-lg border border-white/10">
          {userStats && (
            <>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {userStats.win_rate?.toFixed(1) || '0'}% Win Rate
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-accent-gold" />
                <span className="text-sm font-medium text-foreground">
                  {formatAmount(userStats.total_winnings || 0)} KALE
                </span>
              </div>
            </>
          )}
        </div>

        {/* User Info */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
          <User className="h-4 w-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {user?.username || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatAddress(wallet.publicKey)}
            </span>
          </div>
        </div>

        {/* Disconnect Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDisconnect}
          className="gap-2"
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting || isLoading}
      className="gap-2"
      variant="hero"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

export default WalletConnector;