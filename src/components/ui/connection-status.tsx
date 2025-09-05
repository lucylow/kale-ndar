import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useConnection } from '@/hooks/useConnection';

interface ConnectionStatusProps {
  variant?: 'badge' | 'button' | 'icon';
  showText?: boolean;
  className?: string;
}

export const ConnectionStatus = ({ 
  variant = 'badge', 
  showText = true, 
  className = '' 
}: ConnectionStatusProps) => {
  const { isConnected, isConnecting, error, reconnect } = useConnection();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await reconnect();
    } finally {
      setIsReconnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (isConnecting || isReconnecting) {
      return <RefreshCw className="h-3 w-3 animate-spin" />;
    }
    if (isConnected) {
      return <Wifi className="h-3 w-3" />;
    }
    return <WifiOff className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (isConnecting || isReconnecting) {
      return 'Connecting...';
    }
    if (isConnected) {
      return 'Connected';
    }
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isConnecting || isReconnecting) {
      return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    }
    if (isConnected) {
      return 'bg-green-500/20 text-green-600 border-green-500/30';
    }
    return 'bg-red-500/20 text-red-600 border-red-500/30';
  };

  const getTooltipContent = () => {
    if (isConnecting || isReconnecting) {
      return 'Connecting to backend...';
    }
    if (isConnected) {
      return 'Backend is connected and ready';
    }
    return error ? `Connection failed: ${error}` : 'Backend is disconnected';
  };

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center justify-center p-1 rounded-full ${getStatusColor()} ${className}`}>
              {getStatusIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'button') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReconnect}
              disabled={isConnecting || isReconnecting}
              className={`flex items-center gap-2 ${getStatusColor()} hover:opacity-80 ${className}`}
            >
              {getStatusIcon()}
              {showText && <span>{getStatusText()}</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipContent()}</p>
            {!isConnected && <p className="text-xs mt-1">Click to reconnect</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1.5 ${getStatusColor()} ${className}`}
          >
            {getStatusIcon()}
            {showText && <span>{getStatusText()}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
          {!isConnected && (
            <Button
              size="sm"
              onClick={handleReconnect}
              disabled={isConnecting || isReconnecting}
              className="mt-2 w-full"
            >
              Reconnect
            </Button>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatus;
