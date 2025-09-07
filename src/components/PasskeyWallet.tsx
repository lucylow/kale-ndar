import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Fingerprint, 
  Smartphone, 
  Laptop, 
  CheckCircle, 
  AlertCircle,
  Key,
  Lock,
  Zap
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

interface PasskeyWalletProps {
  onConnect?: () => void;
  onCancel?: () => void;
}

const PasskeyWallet: React.FC<PasskeyWalletProps> = ({ onConnect, onCancel }) => {
  const { connectWallet } = useWallet();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState<'intro' | 'authenticate' | 'success'>('intro');

  const handlePasskeyConnect = async () => {
    try {
      setIsConnecting(true);
      setStep('authenticate');
      
      // Simulate biometric authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await connectWallet('passkey');
      
      setStep('success');
      
      toast({
        title: "Passkey Connected! 🔐",
        description: "Your biometric authentication is now active. Enjoy enhanced security!",
        duration: 3000,
      });
      
      setTimeout(() => {
        onConnect?.();
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : 'Failed to authenticate with passkey',
        variant: "destructive",
        duration: 5000,
      });
      setStep('intro');
    } finally {
      setIsConnecting(false);
    }
  };

  const renderIntro = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Secure with Passkey</h3>
          <p className="text-muted-foreground mt-2">
            Use your device's biometric authentication for secure, passwordless access
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg border border-white/10">
          <Fingerprint className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium text-sm">Biometric Auth</div>
            <div className="text-xs text-muted-foreground">Face ID, Touch ID</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg border border-white/10">
          <Lock className="h-5 w-5 text-accent-teal" />
          <div>
            <div className="font-medium text-sm">Enhanced Security</div>
            <div className="text-xs text-muted-foreground">Phishing resistant</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg border border-white/10">
          <Zap className="h-5 w-5 text-accent-gold" />
          <div>
            <div className="font-medium text-sm">Bonus Rewards</div>
            <div className="text-xs text-muted-foreground">15% staking bonus</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Supported Devices:</h4>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span>Mobile (iOS/Android)</span>
          </div>
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            <span>Desktop (Windows/Mac)</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handlePasskeyConnect}
          disabled={isConnecting}
          className="flex-1 gap-2 hover:scale-105 transition-transform"
          variant="hero"
        >
          <Key className="h-4 w-4" />
          {isConnecting ? 'Authenticating...' : 'Connect with Passkey'}
        </Button>
        {onCancel && (
          <Button 
            onClick={onCancel}
            variant="outline"
            disabled={isConnecting}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );

  const renderAuthenticate = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
        <Fingerprint className="h-10 w-10 text-white" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">Authenticate with Passkey</h3>
        <p className="text-muted-foreground">
          Use your device's biometric authentication to continue
        </p>
      </div>

      <div className="bg-gradient-card rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          <span>Waiting for authentication...</span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        This is a mock authentication. In a real implementation, this would trigger your device's biometric prompt.
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-white" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">Passkey Connected!</h3>
        <p className="text-muted-foreground">
          Your wallet is now secured with biometric authentication
        </p>
      </div>

      <div className="bg-gradient-card rounded-lg border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Security Level</span>
          <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-green-500/30">
            High
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Staking Bonus</span>
          <Badge variant="secondary" className="bg-accent-gold/20 text-accent-gold border-accent-gold/30">
            +15%
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Authentication</span>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-blue-500/30">
            Biometric
          </Badge>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Redirecting to dashboard...
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto bg-background/95 backdrop-blur-xl border-white/10">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Passkey Wallet
        </CardTitle>
        <CardDescription>
          Secure biometric authentication for your Stellar wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'intro' && renderIntro()}
        {step === 'authenticate' && renderAuthenticate()}
        {step === 'success' && renderSuccess()}
      </CardContent>
    </Card>
  );
};

export default PasskeyWallet;
