import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowRight,
  Play,
  Plus,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';

const ButtonFunctionalityTest: React.FC = () => {
  const { toast } = useToast();
  const { wallet, connectWallet, disconnectWallet, isLoading } = useWallet();
  const navigate = useNavigate();
  const [testLoading, setTestLoading] = useState(false);

  const testToast = () => {
    toast({
      title: "Toast Test",
      description: "This toast is working correctly!",
      duration: 3000,
    });
  };

  const testSuccessToast = () => {
    toast({
      title: "Success! 🎉",
      description: "This is a success toast message",
      duration: 3000,
    });
  };

  const testErrorToast = () => {
    toast({
      title: "Error",
      description: "This is an error toast message",
      variant: "destructive",
      duration: 5000,
    });
  };

  const testAsyncOperation = async () => {
    setTestLoading(true);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Async Operation Complete",
        description: "The async operation finished successfully!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Async Operation Failed",
        description: "Something went wrong with the async operation",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setTestLoading(false);
    }
  };

  const testWalletConnection = async () => {
    try {
      if (wallet.isConnected) {
        await disconnectWallet();
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
          duration: 2000,
        });
      } else {
        await connectWallet();
        toast({
          title: "Wallet Connected! 🎉",
          description: "Your wallet has been connected successfully",
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: "Wallet Operation Failed",
        description: error instanceof Error ? error.message : "Failed to perform wallet operation",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const testNavigation = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Button Functionality Test</h1>
        <p className="text-muted-foreground">
          Test all button functionality to ensure everything is working correctly
        </p>
      </div>

      {/* Toast Tests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Toast System Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={testToast} variant="default">
            <CheckCircle className="h-4 w-4 mr-2" />
            Test Toast
          </Button>
          <Button onClick={testSuccessToast} variant="success">
            <CheckCircle className="h-4 w-4 mr-2" />
            Success Toast
          </Button>
          <Button onClick={testErrorToast} variant="destructive">
            <XCircle className="h-4 w-4 mr-2" />
            Error Toast
          </Button>
        </div>
      </div>

      {/* Wallet Tests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Wallet Connection Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={testWalletConnection}
            disabled={isLoading}
            variant={wallet.isConnected ? "destructive" : "default"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : wallet.isConnected ? (
              <XCircle className="h-4 w-4 mr-2" />
            ) : (
              <Wallet className="h-4 w-4 mr-2" />
            )}
            {wallet.isConnected ? "Disconnect Wallet" : "Connect Wallet"}
          </Button>
          <Button onClick={testNavigation} variant="hero">
            <ArrowRight className="h-4 w-4 mr-2" />
            Navigate to Dashboard
          </Button>
        </div>
      </div>

      {/* Async Operation Tests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Async Operation Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={testAsyncOperation}
            disabled={testLoading}
            variant="outline"
          >
            {testLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {testLoading ? "Processing..." : "Test Async Operation"}
          </Button>
          <EnhancedButton
            onAsyncClick={testAsyncOperation}
            successText="Async operation completed!"
            errorText="Async operation failed!"
            variant="gradient"
          >
            <Zap className="h-4 w-4 mr-2" />
            Enhanced Async Button
          </EnhancedButton>
        </div>
      </div>

      {/* Button Variant Tests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Button Variant Tests</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="default" onClick={testToast}>
            Default
          </Button>
          <Button variant="hero" onClick={testToast}>
            Hero
          </Button>
          <Button variant="outline" onClick={testToast}>
            Outline
          </Button>
          <Button variant="ghost" onClick={testToast}>
            Ghost
          </Button>
          <Button variant="success" onClick={testSuccessToast}>
            Success
          </Button>
          <Button variant="warning" onClick={testToast}>
            Warning
          </Button>
          <Button variant="danger" onClick={testErrorToast}>
            Danger
          </Button>
          <Button variant="gradient" onClick={testToast}>
            Gradient
          </Button>
        </div>
      </div>

      {/* Market Creation Button Tests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Market Creation Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="default" size="lg" onClick={testToast}>
            <Plus className="h-4 w-4 mr-2" />
            Create Market
          </Button>
          <Button variant="hero" size="lg" onClick={testToast}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Place Bet
          </Button>
          <Button variant="outline" size="lg" onClick={testToast}>
            <Target className="h-4 w-4 mr-2" />
            Resolve Market
          </Button>
        </div>
      </div>

      {/* Status Display */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Wallet Status</h3>
            <p className="text-sm text-muted-foreground">
              Connected: {wallet.isConnected ? "Yes" : "No"}
            </p>
            <p className="text-sm text-muted-foreground">
              Public Key: {wallet.publicKey ? `${wallet.publicKey.slice(0, 8)}...` : "None"}
            </p>
            <p className="text-sm text-muted-foreground">
              Loading: {isLoading ? "Yes" : "No"}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Toast System</h3>
            <p className="text-sm text-muted-foreground">
              Status: Working
            </p>
            <p className="text-sm text-muted-foreground">
              Duration: 5 seconds
            </p>
            <p className="text-sm text-muted-foreground">
              Limit: 5 toasts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonFunctionalityTest;
