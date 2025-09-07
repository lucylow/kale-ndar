import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Download,
  Info
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { walletManager } from '@/lib/wallet-adapters/wallet-manager';
import { mockWalletManager } from '@/lib/wallet-adapters/mock-wallet-manager';
import { toast } from 'sonner';

interface WalletTestResult {
  name: string;
  type: 'real' | 'mock';
  isAvailable: boolean;
  connectionTest: 'pending' | 'success' | 'failed';
  error?: string;
  publicKey?: string;
}

const WalletConnectionTester: React.FC = () => {
  const { connectWallet, disconnectWallet, wallet, isLoading } = useWallet();
  const [testResults, setTestResults] = useState<WalletTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const testWalletConnection = async (walletName: string, walletType: 'real' | 'mock') => {
    try {
      const manager = walletType === 'real' ? walletManager : mockWalletManager;
      const wallets = manager.getAllWallets();
      const walletInfo = wallets.find(w => w.name === walletName);
      
      if (!walletInfo) {
        throw new Error('Wallet not found');
      }

      // Test connection
      const connection = await walletInfo.adapter.connect();
      
      return {
        name: walletName,
        type: walletType,
        isAvailable: walletInfo.isAvailable,
        connectionTest: 'success' as const,
        publicKey: connection.publicKey
      };
    } catch (error) {
      return {
        name: walletName,
        type: walletType,
        isAvailable: false,
        connectionTest: 'failed' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);

    try {
      // Test real wallets
      const realWallets = walletManager.getAllWallets();
      const realResults = await Promise.all(
        realWallets.map(wallet => testWalletConnection(wallet.name, 'real'))
      );

      // Test mock wallets
      const mockWallets = mockWalletManager.getAllWallets();
      const mockResults = await Promise.all(
        mockWallets.map(wallet => testWalletConnection(wallet.name, 'mock'))
      );

      setTestResults([...realResults, ...mockResults]);
      
      const successCount = [...realResults, ...mockResults].filter(r => r.connectionTest === 'success').length;
      toast.success(`Wallet tests completed: ${successCount} successful connections`);
    } catch (error) {
      toast.error('Failed to run wallet tests');
      console.error('Wallet test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const connectToWallet = async (walletName: string) => {
    try {
      const walletType = walletName.toLowerCase() as any;
      await connectWallet(walletType);
      toast.success(`Connected to ${walletName}`);
    } catch (error) {
      toast.error(`Failed to connect to ${walletName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = (result: WalletTestResult) => {
    if (result.connectionTest === 'pending') {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    } else if (result.connectionTest === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (result: WalletTestResult) => {
    if (result.connectionTest === 'success') {
      return <Badge variant="default" className="bg-green-500">Connected</Badge>;
    } else if (result.connectionTest === 'failed') {
      return <Badge variant="destructive">Failed</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection Tester
          </CardTitle>
          <CardDescription>
            Test wallet connections for Freighter, Rabet, and other Stellar wallets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={runAllTests}
              disabled={isTesting}
              variant="default"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing...' : 'Test All Wallets'}
            </Button>
            
            {wallet.isConnected && (
              <Button
                onClick={disconnectWallet}
                variant="outline"
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Disconnect Current Wallet
              </Button>
            )}
          </div>

          {/* Current Connection Status */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Current Connection</div>
                <div className="text-sm text-muted-foreground">
                  {wallet.isConnected ? wallet.publicKey : 'No wallet connected'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {wallet.isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {wallet.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result)}
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {result.name}
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      {result.error && (
                        <div className="text-sm text-red-500">{result.error}</div>
                      )}
                      {result.publicKey && (
                        <div className="text-sm text-muted-foreground font-mono">
                          {result.publicKey.slice(0, 8)}...{result.publicKey.slice(-8)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result)}
                    
                    {result.connectionTest === 'success' && (
                      <Button
                        onClick={() => connectToWallet(result.name)}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Install Stellar Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-2xl">🦋</span>
                <div className="flex-1">
                  <div className="font-medium">Freighter</div>
                  <div className="text-sm text-muted-foreground">
                    Official Stellar Development Foundation wallet
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://freighter.app', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Install
                </Button>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-2xl">🐰</span>
                <div className="flex-1">
                  <div className="font-medium">Rabet</div>
                  <div className="text-sm text-muted-foreground">
                    Open-source Stellar wallet with advanced features
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://rabet.app', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Install
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-2xl">🦞</span>
                <div className="flex-1">
                  <div className="font-medium">Lobstr</div>
                  <div className="text-sm text-muted-foreground">
                    User-friendly mobile and web wallet
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://lobstr.co', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Install
                </Button>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-2xl">🌅</span>
                <div className="flex-1">
                  <div className="font-medium">Albedo</div>
                  <div className="text-sm text-muted-foreground">
                    Web-based wallet for Stellar transactions
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://albedo.link', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Install
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Troubleshooting Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="font-medium text-blue-900 dark:text-blue-100">
                Wallet Not Detected
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                • Make sure the wallet extension is installed and enabled
                • Refresh the page after installing the wallet
                • Check if the wallet is unlocked
                • Try using a different browser
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="font-medium text-yellow-900 dark:text-yellow-100">
                Connection Failed
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                • Ensure the wallet is unlocked and ready
                • Check if the wallet is connected to the correct network
                • Try disconnecting and reconnecting the wallet
                • Clear browser cache and cookies
              </div>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="font-medium text-green-900 dark:text-green-100">
                Mock Wallets Available
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                • Mock wallets are available for testing without installation
                • Use Freighter (Mock) or Rabet (Mock) for development
                • Perfect for testing the application functionality
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnectionTester;
