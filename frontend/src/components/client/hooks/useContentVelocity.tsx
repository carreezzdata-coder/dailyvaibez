'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useClientSession } from './ClientSessions';

interface VelocityMetrics {
  hourly: number;
  daily: number;
  weekly: number;
  peakHour: number;
  optimalPostTime: string;
  trendingScore: number;
}

interface ContentItem {
  news_id: number;
  published_at: string;
  views: number;
  likes_count: number;
  share_count: number;
}

interface UseContentVelocityReturn {
  metrics: VelocityMetrics;
  trackPublish: (articleId: number) => Promise<void>;
  getOptimalPostTime: () => string;
  calculateTrendingScore: (article: ContentItem) => number;
  isTracking: boolean;
  refresh: () => Promise<void>;
}

export const useContentVelocity = (): UseContentVelocityReturn => {
  const { sessionToken } = useClientSession();
  const [metrics, setMetrics] = useState<VelocityMetrics>({
    hourly: 0,
    daily: 0,
    weekly: 0,
    peakHour: 14,
    optimalPostTime: '14:00',
    trendingScore: 0
  });
  const [isTracking, setIsTracking] = useState(false);
  const cacheRef = useRef<Map<number, number>>(new Map());

  const calculateTrendingScore = useCallback((article: ContentItem): number => {
    const now = Date.now();
    const publishedTime = new Date(article.published_at).getTime();
    const hoursAgo = (now - publishedTime) / (1000 * 60 * 60);

    let timeFactor = 1.0;
    if (hoursAgo < 1) timeFactor = 3.0;
    else if (hoursAgo < 3) timeFactor = 2.5;
    else if (hoursAgo < 6) timeFactor = 2.0;
    else if (hoursAgo < 12) timeFactor = 1.5;
    else if (hoursAgo < 24) timeFactor = 1.2;
    else if (hoursAgo < 48) timeFactor = 0.8;
    else timeFactor = 0.5;

    const engagementScore = 
      (article.views || 0) * 1 +
      (article.likes_count || 0) * 5 +
      (article.share_count || 0) * 10;

    const velocityBonus = hoursAgo > 0 ? (engagementScore / hoursAgo) * 0.1 : 1.0;

    return Math.round(engagementScore * timeFactor * (1 + velocityBonus));
  }, []);

  const trackPublish = useCallback(async (articleId: number): Promise<void> => {
    setIsTracking(true);

    try {
      await fetch('/api/client/velocity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
        },
        body: JSON.stringify({
          action: 'publish',
          article_id: articleId,
          timestamp: new Date().toISOString()
        }),
        credentials: 'include'
      });

      cacheRef.current.set(articleId, Date.now());
    } catch (err) {
      console.error('Failed to track publish:', err);
    } finally {
      setIsTracking(false);
    }
  }, [sessionToken]);

  const getOptimalPostTime = useCallback((): string => {
    const kenyaHour = new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      hour12: false
    });

    const currentHour = parseInt(kenyaHour);

    if (currentHour >= 6 && currentHour < 9) return '07:00';
    if (currentHour >= 9 && currentHour < 12) return '10:00';
    if (currentHour >= 12 && currentHour < 15) return '14:00';
    if (currentHour >= 15 && currentHour < 18) return '16:00';
    if (currentHour >= 18 && currentHour < 21) return '19:00';
    return '21:00';
  }, []);

  const refresh = useCallback(async () => {
    setIsTracking(true);

    try {
      const response = await fetch('/api/client/velocity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to refresh velocity metrics:', err);
    } finally {
      setIsTracking(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    refresh();

    const interval = setInterval(() => {
      refresh();
    }, 300000);

    return () => clearInterval(interval);
  }, [refresh]);

  return {
    metrics,
    trackPublish,
    getOptimalPostTime,
    calculateTrendingScore,
    isTracking,
    refresh
  };
};