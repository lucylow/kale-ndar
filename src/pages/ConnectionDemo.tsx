import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ConnectionTest from '@/components/ConnectionTest';
import { useConnection } from '@/hooks/useConnection';
import { apiService } from '@/services/api';
import { config } from '@/lib/config';
import { 
  Wifi, 
  WifiOff, 
  Server, 
  Database, 
  Globe, 
  Settings,
  Code,
  BookOpen
} from 'lucide-react';

export const ConnectionDemo = () => {
  const { isConnected, isConnecting, error, reconnect } = useConnection();
  const [activeTab, setActiveTab] = useState('status');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          Frontend-Backend Connection Demo
        </h1>
        <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
          This page demonstrates the connection between the KALE-ndar frontend and backend components.
          Test the API endpoints and monitor connection status in real-time.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Test
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Connection Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Connection Status
                </CardTitle>
                <CardDescription>
                  Real-time connection status between frontend and backend
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Backend URL</span>
                  <span className="text-sm text-muted-foreground">{config.api.baseUrl}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">WebSocket URL</span>
                  <span className="text-sm text-muted-foreground">{config.api.websocketUrl}</span>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">
                      <strong>Error:</strong> {error}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={reconnect} 
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? "Connecting..." : "Reconnect"}
                </Button>
              </CardContent>
            </Card>

            {/* System Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  Configuration and environment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Environment</span>
                    <Badge variant="outline">{config.app.environment}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">App Version</span>
                    <span className="text-sm text-muted-foreground">{config.app.version}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Timeout</span>
                    <span className="text-sm text-muted-foreground">{config.api.timeout}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Retry Attempts</span>
                    <span className="text-sm text-muted-foreground">{config.api.retryAttempts}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Check Interval</span>
                    <span className="text-sm text-muted-foreground">{config.connection.checkInterval}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test" className="mt-6">
          <ConnectionTest />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Configuration Details
              </CardTitle>
              <CardDescription>
                Current configuration settings for the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* API Configuration */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">API Configuration</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{JSON.stringify({
  baseUrl: config.api.baseUrl,
  websocketUrl: config.api.websocketUrl,
  timeout: config.api.timeout,
  retryAttempts: config.api.retryAttempts,
}, null, 2)}
                    </pre>
                  </div>
                </div>

                <Separator />

                {/* Connection Configuration */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Connection Configuration</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{JSON.stringify({
  checkInterval: config.connection.checkInterval,
  reconnectAttempts: config.connection.reconnectAttempts,
  reconnectDelay: config.connection.reconnectDelay,
}, null, 2)}
                    </pre>
                  </div>
                </div>

                <Separator />

                {/* Feature Flags */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Feature Flags</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{JSON.stringify(config.features, null, 2)}
                    </pre>
                  </div>
                </div>

                <Separator />

                {/* Stellar Configuration */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Stellar/Soroban Configuration</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{JSON.stringify({
  rpcUrl: config.soroban.rpcUrl,
  networkPassphrase: config.soroban.networkPassphrase,
  factoryContractId: config.soroban.factoryContractId || 'Not set',
  kaleTokenId: config.soroban.kaleTokenId || 'Not set',
  reflectorContractId: config.soroban.reflectorContractId || 'Not set',
}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Documentation
              </CardTitle>
              <CardDescription>
                Links and information about the connection setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Quick Start</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    To start both frontend and backend services:
                  </p>
                  <div className="bg-blue-100 p-3 rounded">
                    <code className="text-sm">npm run dev:full</code>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Available Endpoints</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• <strong>Health Check:</strong> GET {config.api.baseUrl}/health</li>
                    <li>• <strong>Markets API:</strong> GET {config.api.baseUrl}/api/markets</li>
                    <li>• <strong>Users API:</strong> GET {config.api.baseUrl}/api/users</li>
                    <li>• <strong>Blockchain API:</strong> GET {config.api.baseUrl}/api/blockchain</li>
                    <li>• <strong>WebSocket:</strong> {config.api.websocketUrl}/ws</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Troubleshooting</h4>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Ensure backend is running on port 3000</li>
                    <li>• Check CORS configuration in backend</li>
                    <li>• Verify network connectivity</li>
                    <li>• Review browser console for errors</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Files</h4>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• <strong>Connection Service:</strong> src/services/connection.ts</li>
                    <li>• <strong>API Service:</strong> src/services/api.ts</li>
                    <li>• <strong>Connection Hook:</strong> src/hooks/useConnection.ts</li>
                    <li>• <strong>Status Component:</strong> src/components/ui/connection-status.tsx</li>
                    <li>• <strong>Configuration:</strong> src/lib/config.ts</li>
                    <li>• <strong>Setup Guide:</strong> CONNECTION-SETUP.md</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectionDemo;
