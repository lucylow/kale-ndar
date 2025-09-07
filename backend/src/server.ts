import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { WebSocketOracleService } from './services/websocket-oracle.service';
import { LiveOracleUpdatesService } from './services/live-oracle-updates.service';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3000;
const server = createServer(app);

// Initialize Socket.IO for WebSocket support
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Initialize oracle services
const oracleService = new LiveOracleUpdatesService();
const wsOracleService = new WebSocketOracleService(server, oracleService);

// Start oracle services
oracleService.startLiveUpdates(5000); // 5 second intervals
wsOracleService.start();

logger.info('Oracle services started');

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  oracleService.stopLiveUpdates();
  wsOracleService.stop();
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  oracleService.stopLiveUpdates();
  wsOracleService.stop();
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Oracle demo API: http://localhost:${PORT}/api/oracle-demo`);
  logger.info(`WebSocket oracle: ws://localhost:${PORT}/ws/oracle`);
});

export { server, oracleService, wsOracleService };
