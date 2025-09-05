import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WalletConnector from '@/components/WalletConnector';
import SimpleWalletConnector from '@/components/SimpleWalletConnector';
import WalletConnectionTest from '@/components/WalletConnectionTest';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const WalletTest: React.FC = () => {
  const { wallet, availableWallets, currentWalletType, isLoading } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wallet Connection Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the wallet connection functionality
          </p>
        </div>

        {/* Diagnostic Test */}
        <WalletConnectionTest />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Wallet Connector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Main Wallet Connector
              </CardTitle>
              <CardDescription>
                The full-featured wallet connector with multiple wallet support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnector />
            </CardContent>
          </Card>

          {/* Simple Wallet Connector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Simple Wallet Connector
              </CardTitle>
              <CardDescription>
                Fallback wallet connector for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleWalletConnector />
            </CardContent>
          </Card>
        </div>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>
              Current wallet connection information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                ) : wallet.isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {isLoading ? 'Loading...' : wallet.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Wallet Type:</span>
                <span className="text-sm text-gray-600">
                  {currentWalletType || 'None'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Available Wallets:</span>
                <span className="text-sm text-gray-600">
                  {availableWallets.length}
                </span>
              </div>
            </div>

            {wallet.isConnected && wallet.publicKey && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Connected Wallet:</h4>
                <p className="text-sm text-green-700 font-mono">
                  {wallet.publicKey.slice(0, 20)}...{wallet.publicKey.slice(-20)}
                </p>
              </div>
            )}

            {availableWallets.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Available Wallets:</h4>
                <div className="flex flex-wrap gap-2">
                  {availableWallets.map((wallet) => (
                    <div
                      key={wallet.name}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-sm"
                    >
                      <span>{wallet.icon}</span>
                      <span>{wallet.name}</span>
                      {wallet.isAvailable ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Try connecting with the main wallet connector</li>
              <li>If it fails, the simple wallet connector should work as a fallback</li>
              <li>Check the status information below to see connection details</li>
              <li>In development mode, mock wallets should be available</li>
              <li>Look for the "Dev Mode" indicator in the top-right corner</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletTest;
