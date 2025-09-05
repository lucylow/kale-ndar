import { useState, useEffect } from 'react';
import { connectionService, ConnectionStatus } from '@/services/connection';

export const useConnection = () => {
  const [status, setStatus] = useState<ConnectionStatus>(connectionService.getStatus());

  useEffect(() => {
    const unsubscribe = connectionService.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  const checkConnection = () => connectionService.checkConnection();
  const reconnect = () => connectionService.reconnect();

  return {
    ...status,
    checkConnection,
    reconnect,
  };
};

export default useConnection;
