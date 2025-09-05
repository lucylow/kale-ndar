import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConnection } from '@/hooks/useConnection';
import { apiService } from '@/services/api';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const ConnectionTest = () => {
  const { isConnected, isConnecting, error, reconnect } = useConnection();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    health: boolean;
    markets: boolean;
    blockchain: boolean;
  }>({
    health: false,
    markets: false,
    blockchain: false,
  });

  const runHealthTest = async () => {
    setLoading(true);
    try {
      const health = await apiService.getHealth();
      setHealthData(health);
      setTestResults(prev => ({ ...prev, health: true }));
    } catch (error) {
      console.error('Health test failed:', error);
      setTestResults(prev => ({ ...prev, health: false }));
    } finally {
      setLoading(false);
    }
  };

  const runMarketsTest = async () => {
    setLoading(true);
    try {
      const markets = await apiService.getMarkets({ limit: 1 });
      setTestResults(prev => ({ ...prev, markets: true }));
    } catch (error) {
      console.error('Markets test failed:', error);
      setTestResults(prev => ({ ...prev, markets: false }));
    } finally {
      setLoading(false);
    }
  };

  const runBlockchainTest = async () => {
    setLoading(true);
    try {
      const status = await apiService.getBlockchainStatus();
      setTestResults(prev => ({ ...prev, blockchain: true }));
    } catch (error) {
      console.error('Blockchain test failed:', error);
      setTestResults(prev => ({ ...prev, blockchain: false }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    await Promise.all([
      runHealthTest(),
      runMarketsTest(),
      runBlockchainTest(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) {
      runHealthTest();
    }
  }, [isConnected]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Backend Connection Test
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test the connection between frontend and backend components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isConnected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="font-medium">
              {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={reconnect}
            disabled={isConnecting}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconnect
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Health Check</span>
            <Badge variant={testResults.health ? "default" : "secondary"}>
              {testResults.health ? "Pass" : "Fail"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Markets API</span>
            <Badge variant={testResults.markets ? "default" : "secondary"}>
              {testResults.markets ? "Pass" : "Fail"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Blockchain API</span>
            <Badge variant={testResults.blockchain ? "default" : "secondary"}>
              {testResults.blockchain ? "Pass" : "Fail"}
            </Badge>
          </div>
        </div>

        {/* Health Data */}
        {healthData && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">
              <strong>Backend Status:</strong> {healthData.status}
            </p>
            <p className="text-green-700 text-sm">
              <strong>Timestamp:</strong> {new Date(healthData.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={!isConnected || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run All Tests"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={runHealthTest}
            disabled={!isConnected || loading}
          >
            Health Only
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground">
          <p>• Make sure the backend server is running on port 3000</p>
          <p>• Check that CORS is properly configured</p>
          <p>• Verify network connectivity between frontend and backend</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionTest;
