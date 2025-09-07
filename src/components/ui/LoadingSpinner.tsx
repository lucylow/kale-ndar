import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  message,
  progress,
  showProgress = false,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className="relative">
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
        {showProgress && progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      {message && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {message}
        </p>
      )}
      {showProgress && progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
