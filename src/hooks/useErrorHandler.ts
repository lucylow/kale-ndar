import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null,
  });

  const handleError = useCallback((
    error: Error | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const normalizedError = error instanceof Error 
      ? error 
      : new Error(fallbackMessage);

    if (logError) {
      console.error('Error handled:', {
        error: normalizedError,
        errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }

    setErrorState({
      hasError: true,
      error: normalizedError,
      errorId,
    });

    if (showToast) {
      toast.error(normalizedError.message || fallbackMessage, {
        id: errorId,
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => {
            setErrorState({ hasError: false, error: null, errorId: null });
          },
        },
      });
    }

    return errorId;
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ hasError: false, error: null, errorId: null });
  }, []);

  const retry = useCallback((retryFn: () => void) => {
    clearError();
    retryFn();
  }, [clearError]);

  return {
    errorState,
    handleError,
    clearError,
    retry,
  };
};

export default useErrorHandler;
