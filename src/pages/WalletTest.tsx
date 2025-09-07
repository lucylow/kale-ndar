import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Bug, 
  TestTube, 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import WalletConnector from '@/components/WalletConnector';
import WalletConnectionDebugger from '@/components/WalletConnectionDebugger';
import WalletConnectionTester from '@/components/WalletConnectionTester';
import { toast } from 'sonner';

const WalletTest: React.FC = () => {
  const { wallet, availableWallets, currentWalletType, isLoading } = useWallet();
  const [activeTab, setActiveTab] = useState('connector');

  const getConnectionStatus = () => {
    if (isLoading) return { status: 'loading', text: 'Loading...', color: 'text-blue-500' };
    if (wallet.isConnected) return { status: 'connected', text: 'Connected', color: 'text-green-500' };
    return { status: 'disconnected', text: 'Disconnected', color: 'text-red-500' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Wallet className="h-8 w-8 text-blue-500" />
          Wallet Connection Test Suite
        </h1>
        <p className="text-muted-foreground">
          Test and debug Stellar wallet connections including Freighter, Rabet, and more
        </p>
      </div>

      {/* Connection Status Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${connectionStatus.color}`}>
                {connectionStatus.status === 'loading' ? (
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                ) : connectionStatus.status === 'connected' ? (
                  <CheckCircle className="h-8 w-8 mx-auto" />
                ) : (
                  <XCircle className="h-8 w-8 mx-auto" />
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {connectionStatus.text}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {availableWallets.length}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Available Wallets
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {currentWalletType ? '1' : '0'}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Active Wallet
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                {wallet.publicKey ? '1' : '0'}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Public Key
              </div>
            </div>
          </div>

          {/* Current Wallet Info */}
          {wallet.isConnected && wallet.publicKey && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Connected Wallet</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {wallet.publicKey}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">
                    {currentWalletType?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connector" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet Connector
          </TabsTrigger>
          <TabsTrigger value="tester" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Connection Tester
          </TabsTrigger>
          <TabsTrigger value="debugger" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debugger
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connector" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Connector
              </CardTitle>
              <CardDescription>
                Connect to your Stellar wallet using the main wallet connector
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <WalletConnector />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tester" className="space-y-6">
          <WalletConnectionTester />
        </TabsContent>

        <TabsContent value="debugger" className="space-y-6">
          <WalletConnectionDebugger />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Wallet Settings
              </CardTitle>
              <CardDescription>
                Configure wallet connection preferences and network settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Network Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Network Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium">Testnet</div>
                    <div className="text-sm text-muted-foreground">
                      Test SDF Network ; September 2015
                    </div>
                    <Badge variant="default" className="mt-2">Active</Badge>
                  </div>
                  <div className="p-4 border rounded-lg opacity-50">
                    <div className="font-medium">Mainnet</div>
                    <div className="text-sm text-muted-foreground">
                      Public Global Stellar Network
                    </div>
                    <Badge variant="outline" className="mt-2">Disabled</Badge>
                  </div>
                </div>
              </div>

              {/* Wallet Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Wallet Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Auto-connect on page load</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically connect to previously used wallet
                      </div>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Show wallet balance</div>
                      <div className="text-sm text-muted-foreground">
                        Display wallet balance in the UI
                      </div>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Enable transaction notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Show notifications for transaction status
                      </div>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Wallet Connections
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Clear Wallet Cache
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Bug className="h-4 w-4 mr-2" />
                    Export Debug Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common wallet operations and troubleshooting steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                if (wallet.isConnected) {
                  toast.info('Wallet is already connected');
                } else {
                  toast.info('Use the Wallet Connector to connect');
                }
              }}
            >
              <Wallet className="h-6 w-6" />
              <span>Connect Wallet</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                if (wallet.isConnected) {
                  toast.info('Wallet is connected and ready');
                } else {
                  toast.error('No wallet connected');
                }
              }}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Check Status</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                setActiveTab('debugger');
                toast.info('Switched to debugger tab');
              }}
            >
              <Bug className="h-6 w-6" />
              <span>Debug Issues</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletTest;