import React from 'react';
import { cn } from '@/lib/utils';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface NotificationBadgeProps {
  count?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  variant = 'default',
  size = 'md',
  className,
  children
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-primary text-primary-foreground';
      case 'warning':
        return 'bg-accent-gold text-background';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-accent-teal text-background';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-1.5 py-0.5 min-w-[1.25rem]';
      case 'lg':
        return 'text-sm px-2.5 py-1 min-w-[1.75rem]';
      default:
        return 'text-xs px-2 py-1 min-w-[1.5rem]';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-3 w-3" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  return (
    <div className="relative inline-block">
      {children}
      {count > 0 && (
        <span
          className={cn(
            'absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full font-medium',
            getVariantStyles(),
            getSizeStyles(),
            'animate-scale-in',
            className
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
      {count === 0 && variant !== 'default' && (
        <span
          className={cn(
            'absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full',
            getVariantStyles(),
            'h-2 w-2 animate-pulse'
          )}
        >
          {getIcon()}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;
