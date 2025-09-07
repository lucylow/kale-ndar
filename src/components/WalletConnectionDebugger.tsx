import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Copy,
  ExternalLink,
  Wallet,
  Shield,
  Zap
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { walletManager } from '@/lib/wallet-adapters/wallet-manager';
import { mockWalletManager } from '@/lib/wallet-adapters/mock-wallet-manager';
import { toast } from 'sonner';

interface WalletDebugInfo {
  name: string;
  isAvailable: boolean;
  error?: string;
  adapter: any;
}

const WalletConnectionDebugger: React.FC = () => {
  const { wallet, availableWallets, currentWalletType, isLoading } = useWallet();
  const [debugInfo, setDebugInfo] = useState<WalletDebugInfo[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsDebugging(true);
    const info: WalletDebugInfo[] = [];

    try {
      // Check real wallet manager
      const realWallets = walletManager.getAvailableWallets();
      const allRealWallets = walletManager.getAllWallets();

      for (const walletInfo of allRealWallets) {
        try {
          const isAvailable = walletInfo.adapter.isAvailable();
          info.push({
            name: walletInfo.name,
            isAvailable,
            adapter: walletInfo.adapter,
            error: isAvailable ? undefined : 'Wallet not detected'
          });
        } catch (error) {
          info.push({
            name: walletInfo.name,
            isAvailable: false,
            adapter: walletInfo.adapter,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Check mock wallet manager
      const mockWallets = mockWalletManager.getAllWallets();
      for (const walletInfo of mockWallets) {
        try {
          const isAvailable = walletInfo.adapter.isAvailable();
          info.push({
            name: `${walletInfo.name} (Mock)`,
            isAvailable,
            adapter: walletInfo.adapter,
            error: isAvailable ? undefined : 'Mock wallet not available'
          });
        } catch (error) {
          info.push({
            name: `${walletInfo.name} (Mock)`,
            isAvailable: false,
            adapter: walletInfo.adapter,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      setDebugInfo(info);

      // System information
      setSystemInfo({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
        // Check for wallet extensions
        freighterApi: !!(window as any).freighterApi,
        freighter: !!(window as any).freighter,
        rabet: !!(window as any).rabet,
        albedo: !!(window as any).albedo,
        lobstr: !!(window as any).lobstr,
      });

    } catch (error) {
      console.error('Diagnostics failed:', error);
      toast.error('Failed to run diagnostics');
    } finally {
      setIsDebugging(false);
    }
  };

  const copyDebugInfo = () => {
    const debugText = `
Wallet Connection Debug Report
=============================

System Information:
- User Agent: ${systemInfo?.userAgent || 'N/A'}
- Platform: ${systemInfo?.platform || 'N/A'}
- Language: ${systemInfo?.language || 'N/A'}
- Online: ${systemInfo?.onLine ? 'Yes' : 'No'}
- Window Size: ${systemInfo?.windowSize || 'N/A'}
- Timestamp: ${systemInfo?.timestamp || 'N/A'}

Wallet Extensions Detected:
- Freighter API: ${systemInfo?.freighterApi ? 'Yes' : 'No'}
- Freighter: ${systemInfo?.freighter ? 'Yes' : 'No'}
- Rabet: ${systemInfo?.rabet ? 'Yes' : 'No'}
- Albedo: ${systemInfo?.albedo ? 'Yes' : 'No'}
- Lobstr: ${systemInfo?.lobstr ? 'Yes' : 'No'}

Current Wallet Status:
- Connected: ${wallet.isConnected ? 'Yes' : 'No'}
- Public Key: ${wallet.publicKey || 'None'}
- Current Type: ${currentWalletType || 'None'}
- Available Wallets: ${availableWallets.length}
- Loading: ${isLoading ? 'Yes' : 'No'}

Wallet Availability:
${debugInfo.map(w => `- ${w.name}: ${w.isAvailable ? 'Available' : 'Not Available'}${w.error ? ` (${w.error})` : ''}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(debugText);
    toast.success('Debug information copied to clipboard');
  };

  const testWalletConnection = async (walletName: string) => {
    try {
      const walletInfo = debugInfo.find(w => w.name === walletName);
      if (!walletInfo) {
        toast.error('Wallet not found');
        return;
      }

      if (!walletInfo.isAvailable) {
        toast.error(`${walletName} is not available`);
        return;
      }

      toast.info(`Testing connection to ${walletName}...`);
      
      const connection = await walletInfo.adapter.connect();
      toast.success(`${walletName} connection test successful!`);
      
      console.log('Test connection result:', connection);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Connection test failed: ${errorMessage}`);
      console.error('Connection test error:', error);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Wallet Connection Debugger
          </CardTitle>
          <CardDescription>
            Diagnose wallet connection issues and check system compatibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={runDiagnostics}
              disabled={isDebugging}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isDebugging ? 'animate-spin' : ''}`} />
              Run Diagnostics
            </Button>
            
            <Button
              onClick={copyDebugInfo}
              variant="outline"
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Debug Info
            </Button>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{availableWallets.length}</div>
              <div className="text-sm text-muted-foreground">Available Wallets</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">
                {wallet.isConnected ? '1' : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Connected</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-500">
                {currentWalletType ? '1' : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Active Type</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-500">
                {isLoading ? '1' : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Loading</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debugInfo.map((wallet, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    wallet.isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    {wallet.error && (
                      <div className="text-sm text-red-500">{wallet.error}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={wallet.isAvailable ? 'default' : 'destructive'}>
                    {wallet.isAvailable ? 'Available' : 'Not Available'}
                  </Badge>
                  
                  {wallet.isAvailable && (
                    <Button
                      onClick={() => testWalletConnection(wallet.name)}
                      variant="outline"
                      size="sm"
                    >
                      Test Connection
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      {systemInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Platform:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Language:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Online:</span>
                  <span className="text-sm text-muted-foreground">
                    {systemInfo.onLine ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Window Size:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.windowSize}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium mb-2">Wallet Extensions:</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      systemInfo.freighterApi ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">Freighter API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      systemInfo.freighter ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">Freighter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      systemInfo.rabet ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">Rabet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      systemInfo.albedo ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">Albedo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      systemInfo.lobstr ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">Lobstr</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Troubleshooting Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="font-medium text-blue-900 dark:text-blue-100">
                No Wallets Detected
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                • Install a Stellar wallet extension (Freighter, Lobstr, Rabet, or Albedo)
                • Refresh the page after installation
                • Check if extensions are enabled in your browser
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="font-medium text-yellow-900 dark:text-yellow-100">
                Connection Failed
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                • Ensure the wallet is unlocked
                • Check if the wallet is connected to the correct network
                • Try disconnecting and reconnecting the wallet
              </div>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="font-medium text-green-900 dark:text-green-100">
                Mock Wallets Available
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                • Mock wallets are available for testing
                • Use Freighter (Mock) or Passkey (Mock) for development
                • No real wallet installation required
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnectionDebugger;
