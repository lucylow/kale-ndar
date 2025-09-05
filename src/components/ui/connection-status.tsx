import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  variant?: 'icon' | 'badge' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  variant = 'icon',
  size = 'md',
  className,
  showText = true
}) => {
  // Mock connection status - in real app, this would come from context
  const isConnected = true;
  const isLoading = false;
  const hasError = false;

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-sm';
      default: return 'text-xs';
    }
  };

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {isLoading ? (
          <Loader2 className={cn(getIconSize(), 'animate-spin text-muted-foreground')} />
        ) : isConnected ? (
          <CheckCircle className={cn(getIconSize(), 'text-green-500')} />
        ) : hasError ? (
          <AlertCircle className={cn(getIconSize(), 'text-red-500')} />
        ) : (
          <WifiOff className={cn(getIconSize(), 'text-muted-foreground')} />
        )}
        {showText && (
          <span className={cn(getTextSize(), 'text-muted-foreground')}>
            {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <Badge 
        variant={isConnected ? 'default' : 'destructive'}
        className={cn('gap-1', className)}
      >
        {isLoading ? (
          <Loader2 className={cn(getIconSize(), 'animate-spin')} />
        ) : isConnected ? (
          <CheckCircle className={getIconSize()} />
        ) : (
          <WifiOff className={getIconSize()} />
        )}
        {showText && (
          <span className={getTextSize()}>
            {isLoading ? 'Connecting' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        )}
      </Badge>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        className={cn('gap-2', className)}
        disabled
      >
        {isLoading ? (
          <Loader2 className={cn(getIconSize(), 'animate-spin')} />
        ) : isConnected ? (
          <Wifi className={cn(getIconSize(), 'text-green-500')} />
        ) : (
          <WifiOff className={cn(getIconSize(), 'text-red-500')} />
        )}
        {showText && (
          <span className={getTextSize()}>
            {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        )}
      </Button>
    );
  }

  return null;
};

export default ConnectionStatus;