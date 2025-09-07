import React, { useState, useEffect } from 'react';
import { Bell, X, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'market_update' | 'bet_placed' | 'market_resolved' | 'price_alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

const RealtimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === 'granted');
        });
      }
    }
  }, []);

  useEffect(() => {
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        const notification: Notification = {
          id: payload.payload.id || Date.now().toString(),
          type: payload.payload.type,
          title: payload.payload.title,
          message: payload.payload.message,
          timestamp: new Date(payload.payload.timestamp),
          read: false,
          data: payload.payload.data,
        };

        console.log('Received notification:', notification);
        
        setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10 notifications

        // Show browser notification if permission granted
        if (hasPermission && 'Notification' in window) {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
          });
        }
      })
      .subscribe();

    // Simulate some notifications for demo
    const simulateNotifications = () => {
      const notifications = [
        {
          type: 'market_update' as const,
          title: 'Market Odds Changed',
          message: 'Bitcoin market odds shifted by 15%',
        },
        {
          type: 'bet_placed' as const,
          title: 'New Bet Placed',
          message: 'Large bet of 50,000 KALE placed on ETH market',
        },
        {
          type: 'price_alert' as const,
          title: 'Price Alert',
          message: 'BTC reached your target price of $95,000',
        },
        {
          type: 'market_resolved' as const,
          title: 'Market Resolved',
          message: 'Q1 earnings market has been resolved',
        },
      ];

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      const notification: Notification = {
        id: Date.now().toString(),
        ...randomNotification,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev].slice(0, 10));

      if (hasPermission && 'Notification' in window) {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    };

    // Simulate notifications every 30-60 seconds
    const interval = setInterval(simulateNotifications, Math.random() * 30000 + 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [hasPermission]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'market_update':
        return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'bet_placed':
        return <TrendingDown className="w-4 h-4 text-accent-teal" />;
      case 'price_alert':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'market_resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs p-0 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="bg-gradient-card border-white/10 shadow-card-hover">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-white/10 last:border-b-0 cursor-pointer hover:bg-secondary/20 transition-colors ${
                        !notification.read ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-foreground truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!hasPermission && 'Notification' in window && (
                <div className="p-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => Notification.requestPermission().then(permission => {
                      setHasPermission(permission === 'granted');
                    })}
                  >
                    Enable Browser Notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RealtimeNotifications;