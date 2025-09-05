import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const WalletConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Environment Detection',
        test: () => {
          const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
          return { success: true, message: `Development mode: ${isDev}` };
        }
      },
      {
        name: 'Mock Wallet Manager Import',
        test: async () => {
          try {
            const { mockWalletManager } = await import('@/lib/wallet-adapters/mock-wallet-manager');
            const wallets = mockWalletManager.getAllWallets();
            return { success: true, message: `Found ${wallets.length} mock wallets` };
          } catch (error) {
            return { success: false, message: `Import failed: ${error}` };
          }
        }
      },
      {
        name: 'Mock Data Import',
        test: async () => {
          try {
            const { mockWallets } = await import('@/data/mockWalletData');
            return { success: true, message: `Loaded ${mockWallets.length} mock wallet definitions` };
          } catch (error) {
            return { success: false, message: `Import failed: ${error}` };
          }
        }
      },
      {
        name: 'Wallet Context Import',
        test: async () => {
          try {
            const { useWallet } = await import('@/contexts/WalletContext');
            return { success: true, message: 'Wallet context imported successfully' };
          } catch (error) {
            return { success: false, message: `Import failed: ${error}` };
          }
        }
      },
      {
        name: 'UI Components Import',
        test: async () => {
          try {
            const { Button } = await import('@/components/ui/button');
            const { Card } = await import('@/components/ui/card');
            return { success: true, message: 'UI components imported successfully' };
          } catch (error) {
            return { success: false, message: `Import failed: ${error}` };
          }
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          success: result.success,
          message: result.message,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          message: `Test failed: ${error}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection Diagnostic Test
        </CardTitle>
        <CardDescription>
          Run diagnostic tests to identify wallet connection issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runTests} disabled={isRunning} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>

        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <h4 className="font-medium">{result.name}</h4>
                  <p className="text-sm text-gray-600">{result.message}</p>
                </div>
              </div>
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "PASS" : "FAIL"}
              </Badge>
            </div>
          ))}
        </div>

        {testResults.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Summary:</h4>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">
                ✓ Passed: {testResults.filter(r => r.success).length}
              </span>
              <span className="text-red-600">
                ✗ Failed: {testResults.filter(r => !r.success).length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnectionTest;
