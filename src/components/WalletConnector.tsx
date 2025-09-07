import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, LogOut, User, TrendingUp, DollarSign, ChevronDown, CheckCircle, AlertCircle, Shield, Zap } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { WalletType } from '@/lib/wallet-adapters/types';
import { useNavigate } from 'react-router-dom';
import WalletInstallGuide from './WalletInstallGuide';
import SimpleWalletConnector from './SimpleWalletConnector';
import PasskeyWalletConnector from './PasskeyWalletConnector';

const WalletConnector: React.FC = () => {
  const { wallet, user, userStats, availableWallets, currentWalletType, connectWallet, disconnectWallet, isLoading } = useWallet();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  // Fallback to simple wallet connector if there are issues
  const hasError = availableWallets.length === 0 && !isLoading;
  if (hasError) {
    return <SimpleWalletConnector />;
  }

  const handleConnect = async (walletType?: WalletType) => {
    try {
      setIsConnecting(true);
      
      // Show connecting toast
      toast({
        title: "Connecting...",
        description: "Please approve the connection in your wallet",
        duration: 3000,
      });
      
      await connectWallet(walletType);
      const walletName = walletType ? availableWallets.find(w => w.adapter.name.toLowerCase() === walletType)?.name || 'wallet' : 'wallet';
      
      toast({
        title: "Wallet Connected! 🎉",
        description: `Your ${walletName} has been connected successfully. Redirecting to dashboard...`,
        duration: 2000,
      });
      
      // Small delay for better UX
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect wallet. Please try again.',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully.",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
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
        {/* Wallet Status Indicator */}
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-xs text-green-500 font-medium hidden sm:inline">
            Connected
          </span>
        </div>

        {/* User Stats */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent-teal/10 rounded-lg border border-white/10">
          {userStats ? (
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
          ) : (
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-card rounded-lg border border-white/10">
          <div className="p-1 bg-primary/20 rounded">
            <User className="h-3 w-3 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {user?.username || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {formatAddress(wallet.publicKey)}
            </span>
          </div>
        </div>

        {/* Wallet Type Badge */}
        {currentWalletType && (
          <Badge 
            variant="secondary" 
            className={`hidden md:flex text-xs ${
              currentWalletType === 'passkey' 
                ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' 
                : ''
            }`}
          >
            {currentWalletType === 'passkey' && <Shield className="h-3 w-3 mr-1" />}
            {currentWalletType.charAt(0).toUpperCase() + currentWalletType.slice(1)}
          </Badge>
        )}

        {/* Disconnect Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDisconnect}
          className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-32" />
      </div>
    );
  }

  // If only one wallet is available, show simple connect button
  if (availableWallets.length === 1) {
    return (
      <Button 
        onClick={() => handleConnect(availableWallets[0].adapter.name.toLowerCase() as WalletType)} 
        disabled={isConnecting || isLoading}
        className="gap-2 hover:scale-105 transition-transform"
        variant="hero"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
            Connecting...
          </>
        ) : (
          `Connect ${availableWallets[0].name}`
        )}
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
            className="gap-2 hover:scale-105 transition-transform"
            variant="hero"
          >
            <Wallet className="h-4 w-4" />
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                Connecting...
              </>
            ) : (
              'Connect Wallet'
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-xl border-white/10">
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2 px-2">Available Wallets</div>
            {availableWallets.map((wallet) => (
              <DropdownMenuItem
                key={wallet.name}
                onClick={() => handleConnect(wallet.adapter.name.toLowerCase() as WalletType)}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-accent/20 transition-colors"
              >
                <span className="text-xl">{wallet.icon}</span>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{wallet.name}</span>
                    {wallet.name === 'Passkey' && (
                      <Badge variant="secondary" className="bg-accent-gold/20 text-accent-gold border-accent-gold/30 text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        +15%
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{wallet.description}</span>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If no wallets are available, show install guide
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="gap-2 hover:scale-105 transition-transform"
          variant="hero"
        >
          <AlertCircle className="h-4 w-4" />
          Install Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Install a Stellar Wallet</DialogTitle>
        </DialogHeader>
        <WalletInstallGuide />
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnector;