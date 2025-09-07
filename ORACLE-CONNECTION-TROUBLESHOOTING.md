# 🔧 Oracle Connection Troubleshooting Guide

## Overview

This guide helps resolve the "Connection Error: Failed to connect to real-time data feed" issues you're experiencing with the Reflector Oracle demonstration.

## 🚨 Common Connection Errors

### 1. **WebSocket Connection Failed**
```
Connection Error: Failed to connect to real-time data feed
```

**Causes:**
- WebSocket server not running
- Network connectivity issues
- CORS configuration problems
- Firewall blocking WebSocket connections

**Solutions:**
- ✅ **Automatic Fallback**: The hybrid client automatically falls back to HTTP mode
- ✅ **Manual Switch**: Use the "HTTP" button in advanced controls
- ✅ **Check Server**: Ensure backend server is running on port 3000

### 2. **HTTP Connection Failed**
```
HTTP 500: Internal Server Error
```

**Causes:**
- Backend server not started
- Oracle service not initialized
- Database connection issues
- Missing environment variables

**Solutions:**
- ✅ **Start Backend**: Run `npm run dev` in backend directory
- ✅ **Check Logs**: Review server logs for specific errors
- ✅ **Environment**: Verify all required environment variables

### 3. **Mixed Connection Issues**
```
Connection Error: Unknown error
```

**Causes:**
- Network instability
- Server overload
- Concurrent connection limits
- Resource exhaustion

**Solutions:**
- ✅ **Retry Logic**: Automatic reconnection attempts
- ✅ **Mode Switching**: Manual WebSocket/HTTP switching
- ✅ **Error Handling**: Graceful degradation

## 🛠️ Step-by-Step Resolution

### Step 1: Verify Backend Server
```bash
# Check if server is running
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45
}
```

### Step 2: Test Oracle API Endpoints
```bash
# Test latest prices endpoint
curl http://localhost:3000/api/oracle-demo/latest-prices

# Test metrics endpoint
curl http://localhost:3000/api/oracle-demo/metrics

# Test nodes endpoint
curl http://localhost:3000/api/oracle-demo/nodes
```

### Step 3: Check WebSocket Connection
```javascript
// Test WebSocket connection in browser console
const ws = new WebSocket('ws://localhost:3000/ws/oracle');
ws.onopen = () => console.log('WebSocket connected');
ws.onerror = (error) => console.error('WebSocket error:', error);
```

### Step 4: Verify Frontend Configuration
```typescript
// Check if hybrid client is properly initialized
const client = getHybridOracleClient();
console.log('Connection status:', client.getConnectionStatus());
```

## 🔄 Automatic Fallback System

### How It Works
1. **Primary**: Attempts WebSocket connection
2. **Fallback**: Switches to HTTP polling if WebSocket fails
3. **Retry**: Attempts WebSocket reconnection periodically
4. **Recovery**: Switches back to WebSocket when available

### Connection Modes

#### WebSocket Mode (Preferred)
- **Advantages**: Real-time updates, low latency, efficient
- **Disadvantages**: Requires persistent connection, firewall issues
- **Use Case**: Production environments, stable networks

#### HTTP Mode (Fallback)
- **Advantages**: Works through firewalls, simple setup
- **Disadvantages**: Higher latency, polling overhead
- **Use Case**: Development, restricted networks

## 🎯 Manual Troubleshooting

### 1. **Clear Browser Cache**
```bash
# Clear browser cache and cookies
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### 2. **Check Network Connectivity**
```bash
# Test basic connectivity
ping localhost

# Test HTTP connectivity
curl -I http://localhost:3000/health

# Test WebSocket connectivity
wscat -c ws://localhost:3000/ws/oracle
```

### 3. **Verify Environment Variables**
```bash
# Check required environment variables
echo $PORT
echo $FRONTEND_URL
echo $NODE_ENV
```

### 4. **Restart Services**
```bash
# Stop all services
pkill -f "node.*server"
pkill -f "npm.*dev"

# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm run dev
```

## 🔍 Debugging Tools

### Browser Developer Tools
1. **Network Tab**: Check for failed requests
2. **Console Tab**: Look for JavaScript errors
3. **WebSocket Tab**: Monitor WebSocket connections
4. **Application Tab**: Check local storage and cookies

### Server Logs
```bash
# Monitor server logs
tail -f backend/logs/server.log

# Check for specific errors
grep -i "error\|failed\|exception" backend/logs/server.log
```

### Connection Status Indicators
- 🟢 **Green**: Connected successfully
- 🔴 **Red**: Connection failed
- 🟡 **Yellow**: Reconnecting/fallback mode
- ⚪ **Gray**: Disconnected

## 🚀 Quick Fixes

### Fix 1: Force HTTP Mode
```typescript
// In browser console
const client = getHybridOracleClient();
client.switchToHttp();
```

### Fix 2: Restart Oracle Service
```typescript
// In browser console
const client = getHybridOracleClient();
client.disconnect();
setTimeout(() => client.connect(), 1000);
```

### Fix 3: Clear Subscriptions
```typescript
// In browser console
const client = getHybridOracleClient();
client.unsubscribeFromAssets(['all']);
client.subscribeToAssets(['KALE:GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE']);
```

## 📊 Connection Status Dashboard

### Real-Time Monitoring
- **Connection Mode**: WebSocket/HTTP/Offline
- **Reconnect Attempts**: Number of retry attempts
- **Subscribed Assets**: Active subscriptions
- **Last Update**: Timestamp of last successful update
- **Error Count**: Number of connection errors

### Performance Metrics
- **Update Frequency**: Updates per minute
- **Latency**: Average response time
- **Success Rate**: Percentage of successful connections
- **Uptime**: Service availability

## 🎛️ Advanced Controls

### Manual Mode Switching
1. Click "Show Advanced" button
2. Use "WebSocket" or "HTTP" buttons
3. Monitor connection status changes
4. Check error messages in console

### Debug Information
```typescript
// Get detailed connection info
const status = client.getConnectionStatus();
console.log('Connection details:', status);

// Get latest prices
const prices = client.getLatestPrices();
console.log('Latest prices:', prices);

// Get oracle metrics
const metrics = client.getMetrics();
console.log('Oracle metrics:', metrics);
```

## 🔧 Configuration Options

### WebSocket Configuration
```typescript
const wsClient = new WebSocketOracleClient('ws://localhost:3000/ws/oracle');
wsClient.setReconnectAttempts(5);
wsClient.setReconnectInterval(5000);
```

### HTTP Configuration
```typescript
const httpClient = new HttpOracleClient('http://localhost:3000/api/oracle-demo');
httpClient.setUpdateInterval(3000); // 3 seconds
```

### Hybrid Configuration
```typescript
const hybridClient = new HybridOracleClient(
  'ws://localhost:3000/ws/oracle',
  'http://localhost:3000/api/oracle-demo'
);
hybridClient.setPreferredMode('websocket');
hybridClient.setFallbackDelay(5000);
```

## 🎉 Success Indicators

### When Everything Works
- ✅ Green connection status indicator
- ✅ Real-time price updates every 5 seconds
- ✅ Oracle metrics updating
- ✅ Node status showing active
- ✅ Charts rendering smoothly
- ✅ No error messages in console

### Performance Benchmarks
- **Connection Time**: < 2 seconds
- **Update Latency**: < 100ms
- **Success Rate**: > 99%
- **Memory Usage**: < 50MB
- **CPU Usage**: < 5%

## 📞 Support & Escalation

### Self-Service Options
1. **Check this guide** for common solutions
2. **Use browser dev tools** for debugging
3. **Try different connection modes**
4. **Restart services** if needed

### When to Escalate
- Multiple connection modes failing
- Consistent error patterns
- Performance degradation
- Data inconsistency issues

### Information to Provide
- Browser and version
- Operating system
- Network configuration
- Error messages and timestamps
- Steps already attempted

This comprehensive troubleshooting guide should resolve most connection issues with the Reflector Oracle demonstration system.
