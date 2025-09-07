import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  loadingId: string | null;
  progress?: number;
  message?: string;
}

export interface LoadingOptions {
  message?: string;
  progress?: number;
  timeout?: number;
  showProgress?: boolean;
}

export const useLoadingState = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingId: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback((options: LoadingOptions = {}) => {
    const loadingId = `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setLoadingState({
      isLoading: true,
      loadingId,
      message: options.message,
      progress: options.progress,
    });

    // Set timeout if specified
    if (options.timeout) {
      timeoutRef.current = setTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          loadingId: null,
        }));
      }, options.timeout);
    }

    return loadingId;
  }, []);

  const updateLoading = useCallback((options: LoadingOptions) => {
    setLoadingState(prev => ({
      ...prev,
      message: options.message,
      progress: options.progress,
    }));
  }, []);

  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setLoadingState({
      isLoading: false,
      loadingId: null,
    });
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadingState,
    startLoading,
    updateLoading,
    stopLoading,
  };
};

export default useLoadingState;
