import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

export enum EventType {
  MARKET_CREATED = 'market_created',
  BET_PLACED = 'bet_placed',
  MARKET_RESOLVED = 'market_resolved',
  PRICE_UPDATE = 'price_update',
  ODDS_CHANGED = 'odds_changed',
  USER_STREAK_UPDATED = 'user_streak_updated',
  LEAGUE_LEADERBOARD_UPDATED = 'league_leaderboard_updated',
  STOP_LOSS_TRIGGERED = 'stop_loss_triggered',
  LIQUIDITY_ADDED = 'liquidity_added',
  SOCIAL_INTERACTION = 'social_interaction',
  AI_PREDICTION = 'ai_prediction',
  COPY_TRADING_EXECUTED = 'copy_trading_executed',
}

export enum NotificationType {
  MARKET_RESOLUTION = 'market_resolution',
  WINNING_BET = 'winning_bet',
  LOSING_BET = 'losing_bet',
  STOP_LOSS_TRIGGERED = 'stop_loss_triggered',
  STREAK_MILESTONE = 'streak_milestone',
  LEAGUE_UPDATE = 'league_update',
  FOLLOWED_USER_BET = 'followed_user_bet',
  AI_INSIGHT = 'ai_insight',
  LIQUIDITY_OPPORTUNITY = 'liquidity_opportunity',
}

export enum MessageType {
  GENERAL = 'general',
  ANALYSIS = 'analysis',
  PREDICTION = 'prediction',
  QUESTION = 'question',
  CELEBRATION = 'celebration',
  WARNING = 'warning',
}

export interface RealtimeEvent {
  id: string;
  eventType: EventType;
  marketId?: string;
  user?: string;
  data: any;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}

export interface WebSocketSubscription {
  id: string;
  user: string;
  subscribedMarkets: string[];
  subscribedEvents: EventType[];
  subscribedUsers: string[];
  isActive: boolean;
  connectionId: string;
  createdAt: number;
  lastActivity: number;
}

export interface PushNotification {
  id: string;
  user: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  data?: any;
  timestamp: number;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChatMessage {
  id: string;
  marketId: string;
  sender: string;
  message: string;
  messageType: MessageType;
  timestamp: number;
  replies: string[];
  likes: number;
  isModerated: boolean;
}

export interface MarketDataStream {
  marketId: string;
  priceUpdates: NodeJS.Timeout;
  oddsUpdates: NodeJS.Timeout;
  volumeUpdates: NodeJS.Timeout;
  isActive: boolean;
  subscribers: Set<string>;
}

export interface RealtimeConfig {
  wsPort: number;
  redisConfig: any;
  maxConnections: number;
  heartbeatInterval: number;
  cleanupInterval: number;
  maxCacheSize: number;
}

export enum RealtimeError {
  MARKET_NOT_FOUND = 'MARKET_NOT_FOUND',
  LIQUIDITY_NOT_FOUND = 'LIQUIDITY_NOT_FOUND',
  LEAGUE_NOT_FOUND = 'LEAGUE_NOT_FOUND',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
}

export class RealtimeEventService extends EventEmitter {
  private config: RealtimeConfig;
  private wsServer: WebSocket.Server;
  private redis: Redis;
  private subscriptions: Map<string, WebSocketSubscription> = new Map();
  private connections: Map<string, WebSocket> = new Map();
  private marketStreams: Map<string, MarketDataStream> = new Map();
  private eventCache: Map<string, RealtimeEvent> = new Map();
  private notifications: Map<string, PushNotification> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private heartbeatInterval: NodeJS.Timeout;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: RealtimeConfig) {
    super();
    this.config = config;
    this.redis = new Redis(config.redisConfig);
    this.setupWebSocketServer();
    this.setupIntervals();
  }

  /**
   * Subscribe user to real-time events
   */
  async subscribeToEvents(
    user: string,
    connectionId: string,
    marketIds: string[] = [],
    eventTypes: EventType[] = [],
    userIds: string[] = []
  ): Promise<WebSocketSubscription> {
    try {
      const subscriptionId = uuidv4();
      const subscription: WebSocketSubscription = {
        id: subscriptionId,
        user,
        subscribedMarkets: marketIds,
        subscribedEvents: eventTypes,
        subscribedUsers: userIds,
        isActive: true,
        connectionId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      this.subscriptions.set(subscriptionId, subscription);

      // Store in Redis for distributed access
      await this.redis.setex(
        `subscription:${subscriptionId}`,
        86400, // 24 hours
        JSON.stringify(subscription)
      );

      logger.info('User subscribed to events:', {
        subscriptionId,
        user,
        marketIds: marketIds.length,
        eventTypes: eventTypes.length,
        userIds: userIds.length,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to subscribe to events:', error);
      throw error;
    }
  }

  /**
   * Emit real-time event
   */
  async emitEvent(
    eventType: EventType,
    data: any,
    marketId?: string,
    user?: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<string> {
    try {
      const eventId = uuidv4();
      const event: RealtimeEvent = {
        id: eventId,
        eventType,
        marketId,
        user,
        data,
        timestamp: Date.now(),
        priority,
        source: 'kale-ndar-backend',
      };

      // Store event for replay capability
      this.eventCache.set(eventId, event);
      await this.redis.setex(
        `event:${eventId}`,
        86400, // 24 hours
        JSON.stringify(event)
      );

      // Broadcast to subscribed users
      await this.broadcastEvent(event);

      // Trigger automated actions based on event type
      await this.processEventActions(event);

      logger.info('Real-time event emitted:', {
        eventId,
        eventType,
        marketId,
        user,
        priority,
      });

      return eventId;
    } catch (error) {
      logger.error('Failed to emit real-time event:', error);
      throw error;
    }
  }

  /**
   * Process Reflector webhook notifications
   */
  async processReflectorWebhook(webhookData: any): Promise<void> {
    try {
      const { subscription, price, prevPrice, timestamp } = webhookData.update?.event || webhookData;
      
      if (!subscription || !price) {
        logger.warn('Invalid Reflector webhook payload:', webhookData);
        return;
      }

      // Find associated market
      const marketId = await this.getMarketForSubscription(subscription);
      if (!marketId) {
        logger.warn(`No market found for subscription ${subscription}`);
        return;
      }

      // Calculate price change
      const priceChange = prevPrice ? 
        ((price - prevPrice) / prevPrice) * 100 : 0;

      // Emit price update event
      await this.emitEvent(
        EventType.PRICE_UPDATE,
        {
          price: price.toString(),
          previousPrice: prevPrice?.toString() || price.toString(),
          change: priceChange,
          subscription,
        },
        marketId,
        undefined,
        'high'
      );

      // Check if this should trigger market resolution
      if (await this.shouldTriggerResolution(marketId, price)) {
        await this.emitEvent(
          EventType.MARKET_RESOLVED,
          { price: price.toString(), triggeredBy: 'oracle' },
          marketId,
          undefined,
          'critical'
        );
      }

      logger.info('Reflector webhook processed:', {
        subscription,
        marketId,
        price: price.toString(),
        priceChange,
      });
    } catch (error) {
      logger.error('Reflector webhook processing failed:', error);
    }
  }

  /**
   * Live odds calculation and broadcasting
   */
  async updateLiveOdds(marketId: string): Promise<void> {
    try {
      // This would typically calculate current odds based on liquidity
      const oddsData = {
        marketId,
        odds: {
          '0': '15000', // 1.5 odds for outcome 0
          '1': '25000', // 2.5 odds for outcome 1
        },
        timestamp: Date.now(),
      };

      await this.emitEvent(
        EventType.ODDS_CHANGED,
        oddsData,
        marketId,
        undefined,
        'medium'
      );

      logger.info('Live odds updated:', { marketId, oddsData });
    } catch (error) {
      logger.error('Failed to update live odds:', error);
    }
  }

  /**
   * Push notification service
   */
  async sendPushNotification(
    user: string,
    title: string,
    message: string,
    notificationType: NotificationType,
    data?: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<string> {
    try {
      const notificationId = uuidv4();
      const notification: PushNotification = {
        id: notificationId,
        user,
        title,
        message,
        notificationType,
        data,
        timestamp: Date.now(),
        isRead: false,
        priority,
      };

      // Store notification
      this.notifications.set(notificationId, notification);
      await this.redis.setex(
        `notification:${notificationId}`,
        604800, // 7 days
        JSON.stringify(notification)
      );

      // Add to user's notification list
      await this.redis.sadd(`user_notifications:${user}`, notificationId);

      // Send via WebSocket if user is connected
      await this.sendNotificationViaWebSocket(user, notification);

      // Send via external push service (implementation depends on platform)
      await this.sendExternalPushNotification(notification);

      logger.info('Push notification sent:', {
        notificationId,
        user,
        title,
        notificationType,
        priority,
      });

      return notificationId;
    } catch (error) {
      logger.error('Failed to send push notification:', error);
      throw error;
    }
  }

  /**
   * Live chat for markets
   */
  async sendMarketMessage(
    sender: string,
    marketId: string,
    message: string,
    messageType: MessageType = MessageType.GENERAL
  ): Promise<string> {
    try {
      const messageId = uuidv4();
      const chatMessage: ChatMessage = {
        id: messageId,
        marketId,
        sender,
        message,
        messageType,
        timestamp: Date.now(),
        replies: [],
        likes: 0,
        isModerated: false,
      };

      // Store message
      this.chatMessages.set(messageId, chatMessage);
      await this.redis.setex(
        `chat_message:${messageId}`,
        86400, // 24 hours
        JSON.stringify(chatMessage)
      );

      // Add to market's message list
      await this.redis.lpush(`market_messages:${marketId}`, messageId);

      // Broadcast message to subscribed users
      await this.emitEvent(
        EventType.SOCIAL_INTERACTION,
        {
          type: 'chat_message',
          messageId,
          sender,
          message,
          messageType,
        },
        marketId,
        sender,
        'low'
      );

      logger.info('Market message sent:', {
        messageId,
        marketId,
        sender,
        messageType,
      });

      return messageId;
    } catch (error) {
      logger.error('Failed to send market message:', error);
      throw error;
    }
  }

  /**
   * Live leaderboard updates
   */
  async updateLiveLeaderboard(leagueId: string): Promise<void> {
    try {
      // This would typically recalculate scores for all participants
      const leaderboardData = {
        leagueId,
        leaderboard: [
          { address: 'user1', score: '1500' },
          { address: 'user2', score: '1200' },
          { address: 'user3', score: '1000' },
        ],
        timestamp: Date.now(),
      };

      await this.emitEvent(
        EventType.LEAGUE_LEADERBOARD_UPDATED,
        leaderboardData,
        undefined,
        undefined,
        'medium'
      );

      logger.info('Live leaderboard updated:', { leagueId, leaderboardData });
    } catch (error) {
      logger.error('Failed to update live leaderboard:', error);
    }
  }

  /**
   * Start market data stream
   */
  async startMarketDataStream(
    marketId: string,
    updateIntervals: {
      priceUpdates: number;    // seconds
      oddsUpdates: number;     // seconds
      volumeUpdates: number;   // seconds
    }
  ): Promise<void> {
    try {
      // Set up price update stream
      const priceStreamId = setInterval(async () => {
        try {
          await this.updateLiveOdds(marketId);
        } catch (error) {
          logger.error(`Price update failed for market ${marketId}:`, error);
        }
      }, updateIntervals.priceUpdates * 1000);

      // Set up odds update stream
      const oddsStreamId = setInterval(async () => {
        try {
          await this.updateLiveOdds(marketId);
        } catch (error) {
          logger.error(`Odds update failed for market ${marketId}:`, error);
        }
      }, updateIntervals.oddsUpdates * 1000);

      // Set up volume update stream
      const volumeStreamId = setInterval(async () => {
        try {
          await this.emitEvent(
            EventType.LIQUIDITY_ADDED,
            { marketId, volume: '1000000' }, // Placeholder volume
            marketId,
            undefined,
            'low'
          );
        } catch (error) {
          logger.error(`Volume update failed for market ${marketId}:`, error);
        }
      }, updateIntervals.volumeUpdates * 1000);

      const stream: MarketDataStream = {
        marketId,
        priceUpdates: priceStreamId,
        oddsUpdates: oddsStreamId,
        volumeUpdates: volumeStreamId,
        isActive: true,
        subscribers: new Set(),
      };

      this.marketStreams.set(marketId, stream);

      logger.info('Market data stream started:', {
        marketId,
        intervals: updateIntervals,
      });
    } catch (error) {
      logger.error('Failed to start market data stream:', error);
      throw error;
    }
  }

  /**
   * Stop market data stream
   */
  async stopMarketDataStream(marketId: string): Promise<void> {
    try {
      const stream = this.marketStreams.get(marketId);
      if (!stream) {
        return;
      }

      clearInterval(stream.priceUpdates);
      clearInterval(stream.oddsUpdates);
      clearInterval(stream.volumeUpdates);

      stream.isActive = false;
      this.marketStreams.delete(marketId);

      logger.info('Market data stream stopped:', { marketId });
    } catch (error) {
      logger.error('Failed to stop market data stream:', error);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(user: string, limit: number = 50): Promise<PushNotification[]> {
    try {
      const notificationIds = await this.redis.smembers(`user_notifications:${user}`);
      const notifications: PushNotification[] = [];

      for (const id of notificationIds.slice(0, limit)) {
        const notificationData = await this.redis.get(`notification:${id}`);
        if (notificationData) {
          notifications.push(JSON.parse(notificationData));
        }
      }

      return notifications.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      logger.error('Failed to get user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notification = this.notifications.get(notificationId);
      if (notification) {
        notification.isRead = true;
        this.notifications.set(notificationId, notification);
        await this.redis.setex(
          `notification:${notificationId}`,
          604800,
          JSON.stringify(notification)
        );
      }
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Get market chat messages
   */
  async getMarketChatMessages(marketId: string, limit: number = 100): Promise<ChatMessage[]> {
    try {
      const messageIds = await this.redis.lrange(`market_messages:${marketId}`, 0, limit - 1);
      const messages: ChatMessage[] = [];

      for (const id of messageIds) {
        const messageData = await this.redis.get(`chat_message:${id}`);
        if (messageData) {
          messages.push(JSON.parse(messageData));
        }
      }

      return messages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      logger.error('Failed to get market chat messages:', error);
      throw error;
    }
  }

  /**
   * Setup WebSocket server
   */
  private setupWebSocketServer(): void {
    this.wsServer = new WebSocket.Server({ port: this.config.wsPort });

    this.wsServer.on('connection', (ws: WebSocket, req) => {
      const connectionId = uuidv4();
      this.connections.set(connectionId, ws);

      logger.info('New WebSocket connection established:', { connectionId });

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          await this.handleWebSocketMessage(ws, connectionId, data);
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Invalid message format',
          }));
        }
      });

      ws.on('close', () => {
        logger.info('WebSocket connection closed:', { connectionId });
        this.removeClientSubscriptions(connectionId);
        this.connections.delete(connectionId);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', { connectionId, error: error.message });
        this.connections.delete(connectionId);
      });
    });
  }

  /**
   * Setup intervals for heartbeat and cleanup
   */
  private setupIntervals(): void {
    // Heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      this.connections.forEach((ws, connectionId) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          this.connections.delete(connectionId);
        }
      });
    }, this.config.heartbeatInterval);

    // Cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredData();
    }, this.config.cleanupInterval);
  }

  /**
   * Handle WebSocket messages
   */
  private async handleWebSocketMessage(ws: WebSocket, connectionId: string, data: any): Promise<void> {
    try {
      switch (data.type) {
        case 'SUBSCRIBE_MARKET':
          await this.subscribeToEvents(
            data.user,
            connectionId,
            [data.marketId],
            data.eventTypes || [],
            []
          );
          break;

        case 'SUBSCRIBE_USER_UPDATES':
          await this.subscribeToEvents(
            data.user,
            connectionId,
            [],
            data.eventTypes || [],
            [data.targetUser]
          );
          break;

        case 'UNSUBSCRIBE':
          await this.unsubscribeFromUpdates(data.subscriptionId);
          break;

        case 'SEND_MESSAGE':
          await this.sendMarketMessage(
            data.sender,
            data.marketId,
            data.message,
            data.messageType
          );
          break;

        case 'GET_NOTIFICATIONS':
          const notifications = await this.getUserNotifications(data.user, data.limit);
          ws.send(JSON.stringify({
            type: 'NOTIFICATIONS',
            data: notifications,
          }));
          break;

        default:
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Unknown message type',
          }));
      }
    } catch (error) {
      logger.error('Failed to handle WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Internal server error',
      }));
    }
  }

  /**
   * Broadcast event to subscribed users
   */
  private async broadcastEvent(event: RealtimeEvent): Promise<void> {
    try {
      const relevantSubscriptions = await this.getRelevantSubscriptions(event);
      
      for (const subscription of relevantSubscriptions) {
        const ws = this.connections.get(subscription.connectionId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          const message = this.formatWebSocketMessage(event);
          ws.send(message);
        }
      }

      // Also publish to Redis for other instances
      await this.redis.publish(`events:${event.eventType}`, JSON.stringify(event));
    } catch (error) {
      logger.error('Failed to broadcast event:', error);
    }
  }

  /**
   * Get relevant subscriptions for an event
   */
  private async getRelevantSubscriptions(event: RealtimeEvent): Promise<WebSocketSubscription[]> {
    try {
      const subscriptions: WebSocketSubscription[] = [];
      
      for (const subscription of this.subscriptions.values()) {
        if (!subscription.isActive) continue;

        let isRelevant = false;

        // Check if subscribed to this event type
        if (subscription.subscribedEvents.includes(event.eventType)) {
          isRelevant = true;
        }

        // Check if subscribed to this market
        if (event.marketId && subscription.subscribedMarkets.includes(event.marketId)) {
          isRelevant = true;
        }

        // Check if subscribed to this user
        if (event.user && subscription.subscribedUsers.includes(event.user)) {
          isRelevant = true;
        }

        if (isRelevant) {
          subscriptions.push(subscription);
        }
      }

      return subscriptions;
    } catch (error) {
      logger.error('Failed to get relevant subscriptions:', error);
      return [];
    }
  }

  /**
   * Format WebSocket message
   */
  private formatWebSocketMessage(event: RealtimeEvent): string {
    return JSON.stringify({
      type: event.eventType,
      id: event.id,
      data: event.data,
      timestamp: event.timestamp,
      priority: event.priority,
    });
  }

  /**
   * Process event actions
   */
  private async processEventActions(event: RealtimeEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case EventType.PRICE_UPDATE:
          if (event.marketId) {
            await this.updateLiveOdds(event.marketId);
          }
          break;

        case EventType.MARKET_RESOLVED:
          if (event.marketId) {
            await this.stopMarketDataStream(event.marketId);
          }
          break;

        case EventType.BET_PLACED:
          if (event.user) {
            await this.sendPushNotification(
              event.user,
              'Bet Placed',
              'Your bet has been placed successfully',
              NotificationType.WINNING_BET,
              event.data,
              'medium'
            );
          }
          break;

        default:
          // No specific action needed
          break;
      }
    } catch (error) {
      logger.error('Failed to process event actions:', error);
    }
  }

  /**
   * Internal helper functions
   */
  private async getMarketForSubscription(subscriptionId: string): Promise<string | null> {
    try {
      // This would typically query the market service
      return null; // Placeholder
    } catch (error) {
      logger.error('Failed to get market for subscription:', error);
      return null;
    }
  }

  private async shouldTriggerResolution(marketId: string, price: number): Promise<boolean> {
    try {
      // This would typically check market resolution conditions
      return false; // Placeholder
    } catch (error) {
      logger.error('Failed to check resolution trigger:', error);
      return false;
    }
  }

  private async sendNotificationViaWebSocket(user: string, notification: PushNotification): Promise<void> {
    try {
      // Find user's active connections
      for (const [connectionId, subscription] of this.subscriptions.entries()) {
        if (subscription.user === user && subscription.isActive) {
          const ws = this.connections.get(subscription.connectionId);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'NOTIFICATION',
              data: notification,
            }));
          }
        }
      }
    } catch (error) {
      logger.error('Failed to send notification via WebSocket:', error);
    }
  }

  private async sendExternalPushNotification(notification: PushNotification): Promise<void> {
    try {
      // This would typically integrate with push notification services
      // like Firebase, OneSignal, etc.
      logger.info('External push notification sent:', { notificationId: notification.id });
    } catch (error) {
      logger.error('Failed to send external push notification:', error);
    }
  }

  private async unsubscribeFromUpdates(subscriptionId: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.isActive = false;
        this.subscriptions.set(subscriptionId, subscription);
        await this.redis.del(`subscription:${subscriptionId}`);
      }
    } catch (error) {
      logger.error('Failed to unsubscribe from updates:', error);
    }
  }

  private removeClientSubscriptions(connectionId: string): void {
    try {
      for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
        if (subscription.connectionId === connectionId) {
          subscription.isActive = false;
          this.subscriptions.set(subscriptionId, subscription);
        }
      }
    } catch (error) {
      logger.error('Failed to remove client subscriptions:', error);
    }
  }

  private async cleanupExpiredData(): Promise<void> {
    try {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Clean up expired events
      for (const [id, event] of this.eventCache.entries()) {
        if (now - event.timestamp > maxAge) {
          this.eventCache.delete(id);
        }
      }

      // Clean up expired notifications
      for (const [id, notification] of this.notifications.entries()) {
        if (now - notification.timestamp > maxAge) {
          this.notifications.delete(id);
        }
      }

      // Clean up expired chat messages
      for (const [id, message] of this.chatMessages.entries()) {
        if (now - message.timestamp > maxAge) {
          this.chatMessages.delete(id);
        }
      }

      logger.info('Expired real-time data cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup expired data:', error);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      clearInterval(this.heartbeatInterval);
      clearInterval(this.cleanupInterval);

      // Stop all market streams
      for (const marketId of this.marketStreams.keys()) {
        await this.stopMarketDataStream(marketId);
      }

      // Close all WebSocket connections
      this.connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });

      // Close WebSocket server
      this.wsServer.close();

      // Close Redis connection
      await this.redis.quit();

      logger.info('Realtime event service shutdown completed');
    } catch (error) {
      logger.error('Failed to shutdown realtime event service:', error);
    }
  }
}
