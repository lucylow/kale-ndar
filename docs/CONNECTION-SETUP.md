# KALE-ndar Frontend-Backend Connection Setup

This guide explains how the frontend and backend components are linked together in the KALE-ndar application.

## Overview

The application consists of:
- **Frontend**: React + Vite application (port 5173)
- **Backend**: Node.js + Express API server (port 3000)

## Connection Architecture

### 1. API Service (`src/services/api.ts`)
- Handles all HTTP requests to the backend
- Includes error handling and retry logic
- Supports WebSocket connections for real-time updates

### 2. Connection Service (`src/services/connection.ts`)
- Monitors backend health and connection status
- Provides automatic reconnection logic
- Manages connection state across the application

### 3. Connection Hook (`src/hooks/useConnection.ts`)
- React hook for accessing connection status
- Provides real-time updates to components
- Handles connection state management

### 4. Connection Status Component (`src/components/ui/connection-status.tsx`)
- Visual indicator of backend connection status
- Supports multiple display variants (badge, button, icon)
- Includes reconnection functionality

## Configuration

### Frontend Configuration (`src/lib/config.ts`)
```typescript
api: {
  baseUrl: 'http://localhost:3000',
  websocketUrl: 'ws://localhost:3000',
  timeout: 10000,
  retryAttempts: 3,
},
connection: {
  checkInterval: 30000,
  reconnectAttempts: 5,
  reconnectDelay: 1000,
},
```

### Backend Configuration
The backend is configured to accept connections from the frontend:
- CORS enabled for `http://localhost:5173`
- Health check endpoint at `/health`
- WebSocket support at `/ws`

## Development Setup

### 1. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. Start Both Services
```bash
# Start frontend and backend simultaneously
npm run dev:full
```

### 3. Individual Services
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## Environment Variables

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_ENABLE_MOCK_DATA=true
```

### Backend (.env)
```bash
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

## Usage in Components

### Basic Connection Status
```tsx
import { useConnection } from '@/hooks/useConnection';
import ConnectionStatus from '@/components/ui/connection-status';

function MyComponent() {
  const { isConnected, isConnecting, error, reconnect } = useConnection();

  return (
    <div>
      <ConnectionStatus variant="badge" />
      {!isConnected && (
        <button onClick={reconnect}>Reconnect</button>
      )}
    </div>
  );
}
```

### API Calls with Connection Awareness
```tsx
import { apiService } from '@/services/api';
import { useConnection } from '@/hooks/useConnection';

function MarketList() {
  const { isConnected } = useConnection();
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    if (isConnected) {
      apiService.getMarkets()
        .then(data => setMarkets(data.markets))
        .catch(error => console.error('Failed to fetch markets:', error));
    }
  }, [isConnected]);

  if (!isConnected) {
    return <div>Connecting to backend...</div>;
  }

  return <div>{/* Market list */}</div>;
}
```

## Connection States

1. **Connected**: Backend is reachable and responding
2. **Connecting**: Attempting to establish connection
3. **Disconnected**: Backend is unreachable
4. **Error**: Connection failed with specific error

## Error Handling

The connection service includes comprehensive error handling:
- Network timeouts
- CORS errors
- Server errors
- Connection failures

Errors are logged and displayed to users with retry options.

## WebSocket Support

For real-time features, the application supports WebSocket connections:
```tsx
const ws = apiService.createWebSocketConnection();
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for frontend URL
   - Check that both services are running on correct ports

2. **Connection Timeouts**
   - Verify backend is running and accessible
   - Check network connectivity
   - Review timeout settings in config

3. **Port Conflicts**
   - Frontend: 5173 (Vite default)
   - Backend: 3000 (Express default)
   - Ensure no other services are using these ports

### Debug Mode

Enable debug logging by setting:
```bash
VITE_DEBUG_MODE=true
```

This will log all API requests and connection attempts to the console.

## Production Deployment

For production, update the configuration:
- Set appropriate API URLs
- Disable mock data
- Configure proper CORS origins
- Set up SSL/TLS for secure connections

## Monitoring

The connection service provides monitoring capabilities:
- Connection uptime tracking
- Error rate monitoring
- Response time metrics
- Automatic health checks

This setup ensures reliable communication between frontend and backend components while providing a good user experience with visual feedback and automatic recovery.
