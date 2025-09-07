import React from 'react';
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const LoadingLogo: React.FC<LoadingLogoProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className={cn(
        'relative flex items-center justify-center rounded-xl bg-gradient-primary',
        'animate-pulse-glow',
        sizeClasses[size]
      )}>
        <Leaf className={cn(
          'text-background animate-bounce',
          iconSizes[size]
        )} />
        
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-ping" />
        <div 
          className="absolute inset-0 rounded-xl border-2 border-accent-teal/30 animate-ping" 
          style={{ animationDelay: '0.5s' }}
        />
        <div 
          className="absolute inset-0 rounded-xl border-2 border-accent-gold/30 animate-ping" 
          style={{ animationDelay: '1s' }}
        />
      </div>
      
      <div className="text-center">
        <h3 className="font-display font-bold text-foreground text-lg animate-pulse">
          KALE-ndar
        </h3>
        <p className="text-sm text-muted-foreground animate-fade-in">
          Loading prediction markets...
        </p>
      </div>
    </div>
  );
};

export default LoadingLogo;