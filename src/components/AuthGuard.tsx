import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { wallet, isLoading } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    // Add a small delay to prevent immediate redirects during wallet initialization
    const timer = setTimeout(() => {
      if (!isLoading && !wallet.isConnected) {
        navigate(redirectTo);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [wallet.isConnected, isLoading, navigate, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!wallet.isConnected) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
