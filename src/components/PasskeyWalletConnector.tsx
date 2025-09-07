import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Fingerprint, 
  CheckCircle, 
  AlertCircle,
  Key,
  Zap,
  Lock
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import PasskeyWallet from './PasskeyWallet';

const PasskeyWalletConnector: React.FC = () => {
  const { wallet, currentWalletType, connectWallet, isLoading } = useWallet();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet('passkey');
      setIsOpen(false);
      
      toast({
        title: "Passkey Connected! 🔐",
        description: "Your biometric authentication is now active. Enjoy enhanced security and bonus rewards!",
        duration: 3000,
      });
      
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect passkey wallet',
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // If already connected with passkey, show status
  if (wallet.isConnected && currentWalletType === 'passkey') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg border border-blue-500/20">
          <Shield className="h-4 w-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              Passkey Active
            </span>
            <span className="text-xs text-muted-foreground">
              Biometric Security
            </span>
          </div>
        </div>
        <Badge variant="secondary" className="bg-accent-gold/20 text-accent-gold border-accent-gold/30">
          <Zap className="h-3 w-3 mr-1" />
          +15% Bonus
        </Badge>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="gap-2 hover:scale-105 transition-transform bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          variant="default"
          disabled={isLoading}
        >
          <Shield className="h-4 w-4" />
          Connect Passkey
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30 text-xs">
            <Zap className="h-3 w-3 mr-1" />
            +15%
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Passkey Wallet Connection
          </DialogTitle>
        </DialogHeader>
        <PasskeyWallet 
          onConnect={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PasskeyWalletConnector;
