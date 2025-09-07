import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const FreighterDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkFreighterStatus = async () => {
    setIsChecking(true);
    
    try {
      // Wait a bit for extensions to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const windowObj = window as any;
      
      const info: any = {
        // Basic checks
        hasFreighterApi: !!windowObj.freighterApi,
        hasFreighter: !!windowObj.freighter,
        
        // Function checks
        hasIsAllowed: typeof windowObj.freighterApi?.isAllowed === 'function',
        hasGetAddress: typeof windowObj.freighterApi?.getAddress === 'function',
        hasSignTransaction: typeof windowObj.freighterApi?.signTransaction === 'function',
        
        // Extension detection
        hasFreighterScript: !!document.querySelector('script[src*="freighter"]'),
        
        // Browser info
        userAgent: navigator.userAgent,
        isChrome: navigator.userAgent.includes('Chrome'),
        isFirefox: navigator.userAgent.includes('Firefox'),
        
        // Window keys that might be related
        windowKeys: Object.keys(window).filter(key => 
          key.toLowerCase().includes('freighter') || 
          key.toLowerCase().includes('stellar')
        ),
        
        // All window keys (for debugging)
        allWindowKeys: Object.keys(window).slice(0, 50), // First 50 to avoid overflow
        
        timestamp: new Date().toISOString()
      };
      
      // Try to test actual Freighter functionality
      if (windowObj.freighterApi) {
        try {
          const isAllowed = await windowObj.freighterApi.isAllowed();
          info.isAllowed = isAllowed;
          info.apiWorking = true;
        } catch (error) {
          info.apiError = error.message;
          info.apiWorking = false;
        }
      }
      
      setDebugInfo(info);
    } catch (error) {
      console.error('Debug check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkFreighterStatus();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🦋 Freighter Wallet Debugger
        </CardTitle>
        <CardDescription>
          Diagnose Freighter wallet connection issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkFreighterStatus} 
          disabled={isChecking}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Check Freighter Status'}
        </Button>
        
        {debugInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">API Detection</h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(debugInfo.hasFreighterApi)}
                  <span className="text-sm">window.freighterApi</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(debugInfo.hasFreighter)}
                  <span className="text-sm">window.freighter</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(debugInfo.hasIsAllowed)}
                  <span className="text-sm">isAllowed() function</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(debugInfo.hasGetAddress)}
                  <span className="text-sm">getAddress() function</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Browser Info</h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(debugInfo.isChrome || debugInfo.isFirefox)}
                  <span className="text-sm">Compatible Browser</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(debugInfo.hasFreighterScript)}
                  <span className="text-sm">Extension Script</span>
                </div>
                {debugInfo.apiWorking !== undefined && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(debugInfo.apiWorking)}
                    <span className="text-sm">API Functional</span>
                  </div>
                )}
              </div>
            </div>
            
            {debugInfo.isAllowed !== undefined && (
              <div>
                <Badge variant={debugInfo.isAllowed ? "default" : "secondary"}>
                  {debugInfo.isAllowed ? "Permission Granted" : "Permission Required"}
                </Badge>
              </div>
            )}
            
            {debugInfo.apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-semibold text-sm">API Error</span>
                </div>
                <p className="text-sm text-red-600 mt-1">{debugInfo.apiError}</p>
              </div>
            )}
            
            {debugInfo.windowKeys.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm mb-2">Related Window Objects</h5>
                <div className="flex flex-wrap gap-1">
                  {debugInfo.windowKeys.map((key: string) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold">Raw Debug Data</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreighterDebugger;