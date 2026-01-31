'use client';

import { useState, useCallback, useEffect } from 'react';

export interface ArticleData {
  news_id: number;
  title: string;
  slug: string;
  image_url: string | null;
  category_name: string;
  published_at: string;
}

export interface Notification {
  notification_id: string | number;
  type: 'article' | 'comment' | 'like' | 'system' | 'breaking';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  time_ago?: string;
  article_data?: ArticleData | null;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  total: number;
  unread_count: number;
}

interface MarkReadResponse {
  success: boolean;
  message?: string;
  unread_count?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const fetchNotifications = useCallback(async (options: {
    limit?: number;
    unreadOnly?: boolean;
  } = {}): Promise<Notification[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: (options.limit || 20).toString(),
      });

      if (options.unreadOnly) {
        params.append('unread_only', 'true');
      }

      const response = await fetch(`/api/client/notifications?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data: NotificationsResponse = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
        return data.notifications;
      } else {
        throw new Error('Failed to load notifications');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string | number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/client/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      const data: MarkReadResponse = await response.json();

      if (data.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.notification_id === notificationId ? { ...n, is_read: true } : n
          )
        );
        if (data.unread_count !== undefined) {
          setUnreadCount(data.unread_count);
        } else {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/client/notifications/read-all`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }

      const data: MarkReadResponse = await response.json();

      if (data.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      return false;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string | number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/client/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }

      const data: MarkReadResponse = await response.json();

      if (data.success) {
        setNotifications(prev => {
          const notification = prev.find(n => n.notification_id === notificationId);
          if (notification && !notification.is_read) {
            setUnreadCount(count => Math.max(0, count - 1));
          }
          return prev.filter(n => n.notification_id !== notificationId);
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete notification:', err);
      return false;
    }
  }, []);

  const clearAllNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/client/notifications/clear-all`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to clear all notifications: ${response.status}`);
      }

      const data: MarkReadResponse = await response.json();

      if (data.success) {
        setNotifications([]);
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
      return false;
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (isHydrated) {
      fetchNotifications({ limit: 20 });

      const interval = setInterval(() => {
        fetchNotifications({ limit: 20 });
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [isHydrated, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isHydrated,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
  };
}