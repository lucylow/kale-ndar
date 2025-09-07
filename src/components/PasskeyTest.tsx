import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Key,
  Zap,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const PasskeyTest: React.FC = () => {
  const { wallet, user, userStats, currentWalletType, connectWallet, disconnectWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testPasskeyConnection = async () => {
    try {
      setIsConnecting(true);
      addTestResult('Starting passkey connection test...');
      
      await connectWallet('passkey');
      
      addTestResult('✅ Passkey wallet connected successfully');
      addTestResult(`✅ Wallet type: ${currentWalletType}`);
      addTestResult(`✅ Public key: ${wallet.publicKey?.slice(0, 10)}...`);
      
      if (user) {
        addTestResult(`✅ User profile loaded: ${user.username || 'Anonymous'}`);
        addTestResult(`✅ User stats: ${userStats?.total_bets || 0} bets, ${userStats?.win_rate?.toFixed(1) || 0}% win rate`);
      }
      
    } catch (error) {
      addTestResult(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const testTransactionSigning = async () => {
    if (!wallet.isConnected) {
      addTestResult('❌ Wallet not connected for transaction test');
      return;
    }

    try {
      addTestResult('Testing transaction signing...');
      const mockTransaction = 'mock-transaction-xdr-string';
      const signedTx = await wallet.signTransaction(mockTransaction);
      
      if (signedTx && signedTx.includes('passkey')) {
        addTestResult('✅ Transaction signed successfully with passkey');
      } else {
        addTestResult('⚠️ Transaction signed but signature format unexpected');
      }
    } catch (error) {
      addTestResult(`❌ Transaction signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testDisconnection = async () => {
    try {
      addTestResult('Testing wallet disconnection...');
      await disconnectWallet();
      addTestResult('✅ Wallet disconnected successfully');
    } catch (error) {
      addTestResult(`❌ Disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const isPasskeyConnected = wallet.isConnected && currentWalletType === 'passkey';

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Passkey Wallet Test Suite
          </CardTitle>
          <CardDescription>
            Test the passkey wallet integration with mock data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-accent-teal/10 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              {isPasskeyConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                {isPasskeyConnected ? 'Passkey Connected' : 'Not Connected'}
              </span>
            </div>
            {isPasskeyConnected && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                <Zap className="h-3 w-3 mr-1" />
                +15% Bonus
              </Badge>
            )}
          </div>

          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={testPasskeyConnection}
              disabled={isConnecting || isPasskeyConnected}
              className="gap-2"
              variant="default"
            >
              <Key className="h-4 w-4" />
              Test Connection
            </Button>
            
            <Button 
              onClick={testTransactionSigning}
              disabled={!isPasskeyConnected}
              className="gap-2"
              variant="outline"
            >
              <Shield className="h-4 w-4" />
              Test Signing
            </Button>
            
            <Button 
              onClick={testDisconnection}
              disabled={!isPasskeyConnected}
              className="gap-2"
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4" />
              Test Disconnect
            </Button>
          </div>

          {/* User Stats Display */}
          {isPasskeyConnected && userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg border border-blue-500/20">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{userStats.total_bets}</div>
                <div className="text-xs text-muted-foreground">Total Bets</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-accent-gold">{userStats.win_rate?.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">{userStats.total_winnings?.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">KALE Earned</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-500">+15%</div>
                <div className="text-xs text-muted-foreground">Security Bonus</div>
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Test Results</h4>
              <Button 
                onClick={clearResults}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
            
            <div className="max-h-60 overflow-y-auto bg-background/50 rounded-lg border border-white/10 p-3 space-y-1">
              {testResults.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No test results yet. Click "Test Connection" to start.
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`text-xs font-mono ${
                      result.includes('✅') ? 'text-green-500' : 
                      result.includes('❌') ? 'text-red-500' : 
                      result.includes('⚠️') ? 'text-yellow-500' : 
                      'text-muted-foreground'
                    }`}
                  >
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasskeyTest;
