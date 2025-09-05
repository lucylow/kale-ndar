import { config } from '@/lib/config';
import { apiService } from './api';

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  lastCheck: Date | null;
  error: string | null;
  retryCount: number;
}

class ConnectionService {
  private status: ConnectionStatus = {
    isConnected: false,
    isConnecting: false,
    lastCheck: null,
    error: null,
    retryCount: 0,
  };

  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: ConnectionStatus) => void)[] = [];

  constructor() {
    // Only start health check if backend health check is enabled
    if (config.features.enableBackendHealthCheck) {
      this.startHealthCheck();
    } else {
      // Set as connected when using mock data
      this.status.isConnected = true;
      this.status.error = null;
    }
  }

  // Get current connection status
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  // Subscribe to connection status changes
  subscribe(listener: (status: ConnectionStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of status change
  private notifyListeners() {
    const currentStatus = this.getStatus();
    this.listeners.forEach(listener => listener(currentStatus));
  }

  // Check backend health
  async checkConnection(): Promise<boolean> {
    if (this.status.isConnecting) {
      return this.status.isConnected;
    }

    this.status.isConnecting = true;
    this.status.lastCheck = new Date();
    this.notifyListeners();

    try {
      const health = await apiService.getHealth();
      
      if (health.status === 'healthy') {
        this.status.isConnected = true;
        this.status.error = null;
        this.status.retryCount = 0;
      } else {
        throw new Error('Backend health check failed');
      }
    } catch (error) {
      this.status.isConnected = false;
      this.status.error = error instanceof Error ? error.message : 'Unknown error';
      this.status.retryCount++;
      
      console.error('Backend connection failed:', error);
    } finally {
      this.status.isConnecting = false;
      this.notifyListeners();
    }

    return this.status.isConnected;
  }

  // Start periodic health checks
  private startHealthCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      await this.checkConnection();
    }, config.connection.checkInterval);

    // Initial check
    this.checkConnection();
  }

  // Stop health checks
  stopHealthCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Force reconnect
  async reconnect(): Promise<boolean> {
    this.stopHealthCheck();
    const success = await this.checkConnection();
    this.startHealthCheck();
    return success;
  }

  // Cleanup
  destroy() {
    this.stopHealthCheck();
    this.listeners = [];
  }
}

// Create singleton instance
export const connectionService = new ConnectionService();

// Export for use in components
export default connectionService;
