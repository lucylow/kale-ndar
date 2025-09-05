const WebSocket = require('ws');
const { logger } = require('./logger');

let wss = null;

const setupWebSocket = (server) => {
  wss = new WebSocket.Server({ 
    server,
    path: '/ws',
    clientTracking: true,
  });

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    logger.info('WebSocket client connected', {
      ip: clientIp,
      userAgent,
      totalClients: wss.clients.size,
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to KALE-ndar WebSocket server',
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleWebSocketMessage(ws, data);
      } catch (error) {
        logger.error('Failed to parse WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });

    // Handle client disconnect
    ws.on('close', (code, reason) => {
      logger.info('WebSocket client disconnected', {
        ip: clientIp,
        code,
        reason: reason.toString(),
        totalClients: wss.clients.size,
      });
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });

    // Set up ping/pong to keep connection alive
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Set up heartbeat to detect stale connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
};

const handleWebSocketMessage = (ws, data) => {
  const { type, payload } = data;

  switch (type) {
    case 'subscribe_market':
      // Subscribe to market updates
      ws.marketSubscriptions = ws.marketSubscriptions || new Set();
      if (payload.marketId) {
        ws.marketSubscriptions.add(payload.marketId);
        ws.send(JSON.stringify({
          type: 'subscribed',
          marketId: payload.marketId,
        }));
      }
      break;

    case 'unsubscribe_market':
      // Unsubscribe from market updates
      if (ws.marketSubscriptions && payload.marketId) {
        ws.marketSubscriptions.delete(payload.marketId);
        ws.send(JSON.stringify({
          type: 'unsubscribed',
          marketId: payload.marketId,
        }));
      }
      break;

    case 'ping':
      // Respond to ping
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    default:
      logger.warn('Unknown WebSocket message type:', type);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Unknown message type',
      }));
  }
};

const broadcastToAll = (message) => {
  if (!wss) return;

  const messageStr = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
};

const broadcastToMarket = (marketId, message) => {
  if (!wss) return;

  const messageStr = JSON.stringify({
    ...message,
    marketId,
  });

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.marketSubscriptions &&
      client.marketSubscriptions.has(marketId)
    ) {
      client.send(messageStr);
    }
  });
};

const getConnectedClientsCount = () => {
  return wss ? wss.clients.size : 0;
};

const sendToClient = (clientId, message) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.id === clientId) {
      client.send(JSON.stringify(message));
    }
  });
};

module.exports = {
  setupWebSocket,
  broadcastToAll,
  broadcastToMarket,
  getConnectedClientsCount,
  sendToClient,
};
