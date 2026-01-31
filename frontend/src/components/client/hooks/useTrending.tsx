'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useClientSession } from './ClientSessions';
import type { NewsItem } from './useArticle';

interface VelocityMetrics {
  score: number;
  delta: number;
  trend: 'rising' | 'falling' | 'stable';
}

interface TrendingData {
  breaking: NewsItem[];
  trending: NewsItem[];
  lastUpdate: string;
}

interface UseTrendingReturn {
  data: TrendingData;
  activeTab: 'breaking' | 'trending';
  setActiveTab: (tab: 'breaking' | 'trending') => void;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  error: string | null;
  sortBy: 'latest' | 'views' | 'engagement';
  setSortBy: (sort: 'latest' | 'views' | 'engagement') => void;
  filteredNews: NewsItem[];
  velocityData: Map<number, VelocityMetrics>;
}

const normalizeNewsItem = (item: any): NewsItem => {
  const tags = Array.isArray(item.tags) ? item.tags : 
    (typeof item.tags === 'string' && item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
  const seoKeywords = Array.isArray(item.seo_keywords) ? item.seo_keywords :
    (typeof item.seo_keywords === 'string' && item.seo_keywords ? item.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : []);

  return {
    news_id: item.news_id || 0,
    title: item.title || 'Untitled',
    content: item.content || '',
    processed_content: item.processed_content || '',
    excerpt: item.excerpt || item.meta_description || '',
    slug: item.slug || '',
    category_id: item.category_id || 0,
    category_ids: item.category_ids || [],
    category_name: item.category_name || 'Uncategorized',
    category_slug: item.category_slug || 'uncategorized',
    category_color: item.category_color || '',
    featured: Boolean(item.featured),
    featured_until: item.featured_until || null,
    image_url: item.image_url || '',
    status: item.status || 'published',
    priority: item.priority || 'medium',
    tags,
    meta_description: item.meta_description || '',
    seo_keywords: seoKeywords,
    reading_time: parseInt(item.reading_time) || 5,
    views: parseInt(item.views) || 0,
    likes_count: parseInt(item.likes_count) || 0,
    comments_count: parseInt(item.comments_count) || 0,
    share_count: parseInt(item.share_count) || 0,
    first_name: item.first_name || 'Daily Vaibe',
    last_name: item.last_name || 'Editor',
    author_email: item.author_email || item.author?.email || '',
    published_at: item.published_at || new Date().toISOString(),
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    youtube_url: item.youtube_url || item.youtube?.url || '',
    youtube_id: item.youtube_id || item.youtube?.id || '',
    youtube_title: item.youtube_title || item.youtube?.title || '',
    youtube_thumbnail: item.youtube_thumbnail || item.youtube?.thumbnail || '',
    youtube: item.youtube || (item.youtube_id ? {
      url: item.youtube_url, id: item.youtube_id,
      title: item.youtube_title, thumbnail: item.youtube_thumbnail
    } : null),
    images_data: item.images_data || [],
    social_videos: item.social_videos || [],
    additional_images: item.additional_images || [],
    quotes_data: item.quotes_data || [],
    seo: item.seo,
    author: item.author,
    category: item.category,
    all_images: item.all_images || [],
    all_videos: item.all_videos || [],
    all_categories: item.all_categories || []
  };
};

const ensureTrendingData = (data: Partial<TrendingData> | undefined | null): TrendingData => {
  return {
    breaking: Array.isArray(data?.breaking) ? data.breaking : [],
    trending: Array.isArray(data?.trending) ? data.trending : [],
    lastUpdate: data?.lastUpdate || new Date().toISOString()
  };
};

export const useTrending = (initialData?: Partial<TrendingData>): UseTrendingReturn => {
  const { sessionToken } = useClientSession();
  const [data, setData] = useState<TrendingData>(() => ensureTrendingData(initialData));
  const [activeTab, setActiveTab] = useState<'breaking' | 'trending'>('trending');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'engagement'>('engagement');
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const previousScoresRef = useRef<Map<number, number>>(new Map());

  const calculateTrendingScore = useCallback((article: NewsItem): number => {
    const now = Date.now();
    const publishedTime = new Date(article.published_at).getTime();
    const hoursAgo = (now - publishedTime) / (1000 * 60 * 60);
    
    let timeFactor: number;
    if (hoursAgo < 1) {
      timeFactor = 3.0;
    } else if (hoursAgo < 3) {
      timeFactor = 2.0;
    } else if (hoursAgo < 6) {
      timeFactor = 1.5;
    } else if (hoursAgo < 12) {
      timeFactor = 1.2;
    } else if (hoursAgo < 24) {
      timeFactor = 1.0;
    } else if (hoursAgo < 48) {
      timeFactor = 0.5;
    } else if (hoursAgo < 72) {
      timeFactor = 0.3;
    } else {
      timeFactor = 0.2;
    }
    
    const viewScore = article.views * 1;
    const likeScore = article.likes_count * 5;
    const commentScore = article.comments_count * 10;
    const shareScore = article.share_count * 15;
    
    const totalEngagement = viewScore + likeScore + commentScore + shareScore;
    
    const engagementPerHour = totalEngagement / Math.max(hoursAgo, 0.1);
    const velocityBonus = engagementPerHour > 100 ? 1.5 : engagementPerHour > 50 ? 1.2 : 1.0;
    
    return Math.round(totalEngagement * timeFactor * velocityBonus);
  }, []);

  const velocityData = useMemo(() => {
    const velocityMap = new Map<number, VelocityMetrics>();
    const newsArray = activeTab === 'breaking' 
      ? (Array.isArray(data.breaking) ? data.breaking : [])
      : (Array.isArray(data.trending) ? data.trending : []);

    if (newsArray.length === 0) {
      return velocityMap;
    }

    newsArray.forEach((article) => {
      if (!article || typeof article.news_id === 'undefined') {
        return;
      }

      const currentScore = calculateTrendingScore(article);
      const previousScore = previousScoresRef.current.get(article.news_id) || currentScore;
      const delta = currentScore - previousScore;
      
      let trend: 'rising' | 'falling' | 'stable' = 'stable';
      if (delta > currentScore * 0.1) trend = 'rising';
      else if (delta < -currentScore * 0.1) trend = 'falling';

      velocityMap.set(article.news_id, {
        score: currentScore,
        delta,
        trend
      });
      
      previousScoresRef.current.set(article.news_id, currentScore);
    });

    return velocityMap;
  }, [data, activeTab, calculateTrendingScore]);

  const fetchNews = useCallback(async (type: 'breaking' | 'trending'): Promise<NewsItem[]> => {
    try {
      const endpoint = type === 'breaking' ? '/api/client/breaking' : '/api/client/trending';
      const response = await fetch(`${endpoint}?limit=50&_t=${Date.now()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        console.warn(`${type} endpoint returned ${response.status}`);
        return [];
      }

      const result = await response.json();
      
      if (!result.success) {
        console.warn(`${type} fetch not successful:`, result.message);
        return [];
      }

      const newsArray = result.news || [];
      
      return Array.isArray(newsArray) ? newsArray.map(normalizeNewsItem) : [];
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      return [];
    }
  }, [sessionToken]);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const [breakingNews, trendingNews] = await Promise.all([
        fetchNews('breaking'),
        fetchNews('trending')
      ]);

      if (mountedRef.current) {
        setData({
          breaking: Array.isArray(breakingNews) ? breakingNews : [],
          trending: Array.isArray(trendingNews) ? trendingNews : [],
          lastUpdate: new Date().toISOString()
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error('Refresh error:', err);
        setError('Failed to refresh news');
      }
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [fetchNews]);

  useEffect(() => {
    mountedRef.current = true;

    if (!data.trending || data.trending.length === 0) {
      refresh();
    }

    refreshIntervalRef.current = setInterval(() => {
      if (mountedRef.current) refresh();
    }, 60000);

    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refresh]);

  const filteredNews = useMemo(() => {
    const newsArray = activeTab === 'breaking' 
      ? (Array.isArray(data.breaking) ? data.breaking : [])
      : (Array.isArray(data.trending) ? data.trending : []);
    
    if (!Array.isArray(newsArray) || newsArray.length === 0) {
      return [];
    }
    
    const sorted = [...newsArray].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        case 'views':
          return b.views - a.views;
        case 'engagement':
          const scoreA = calculateTrendingScore(a);
          const scoreB = calculateTrendingScore(b);
          return scoreB - scoreA;
        default:
          return 0;
      }
    });

    return sorted;
  }, [data, activeTab, sortBy, calculateTrendingScore]);

  return {
    data,
    activeTab,
    setActiveTab,
    refresh,
    isRefreshing,
    error,
    sortBy,
    setSortBy,
    filteredNews,
    velocityData
  };
};