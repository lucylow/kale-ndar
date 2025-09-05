import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, LogOut, User, TrendingUp, DollarSign, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { WalletType } from '@/lib/wallet-adapters/types';
import { useNavigate } from 'react-router-dom';
import WalletInstallGuide from './WalletInstallGuide';

const WalletConnector: React.FC = () => {
  const { wallet, user, userStats, availableWallets, currentWalletType, connectWallet, disconnectWallet, isLoading } = useWallet();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async (walletType?: WalletType) => {
    try {
      setIsConnecting(true);
      await connectWallet(walletType);
      const walletName = walletType ? availableWallets.find(w => w.adapter.name.toLowerCase() === walletType)?.name || 'wallet' : 'wallet';
      toast({
        title: "Wallet Connected",
        description: `Your ${walletName} has been connected successfully.`,
      });
      navigate('/dashboard');
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

  // If only one wallet is available, show simple connect button
  if (availableWallets.length === 1) {
    return (
      <Button 
        onClick={() => handleConnect(availableWallets[0].adapter.name.toLowerCase() as WalletType)} 
        disabled={isConnecting || isLoading}
        className="gap-2"
        variant="hero"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? 'Connecting...' : `Connect ${availableWallets[0].name}`}
      </Button>
    );
  }

  // If multiple wallets are available, show dropdown
  if (availableWallets.length > 1) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            disabled={isConnecting || isLoading}
            className="gap-2"
            variant="hero"
          >
            <Wallet className="h-4 w-4" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {availableWallets.map((wallet) => (
            <DropdownMenuItem
              key={wallet.name}
              onClick={() => handleConnect(wallet.adapter.name.toLowerCase() as WalletType)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-lg">{wallet.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium">{wallet.name}</span>
                <span className="text-xs text-muted-foreground">{wallet.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If no wallets are available, show install guide
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="gap-2"
          variant="hero"
        >
          <Wallet className="h-4 w-4" />
          Install Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Install a Stellar Wallet</DialogTitle>
        </DialogHeader>
        <WalletInstallGuide />
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnector;