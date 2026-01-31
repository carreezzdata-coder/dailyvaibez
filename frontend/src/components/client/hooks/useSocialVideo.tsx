'use client';

import { useState, useEffect, useCallback } from 'react';

export interface VideoArticle {
  news_id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  views: number;
  likes_count: number;
  comments_count: number;
  reading_time: number;
  published_at: string;
  category: {
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
  author: {
    first_name: string;
    last_name: string;
    full_name: string;
  };
  featured_video: {
    social_media_id?: number;
    platform: string;
    post_type?: string;
    post_url: string;
    embed_code: string;
    thumbnail_url: string;
    caption: string;
    duration?: number;
    views_count: number;
    likes_count: number;
    comments_count?: number;
    author_name: string;
    author_handle?: string;
    post_date?: string;
    is_featured?: boolean;
    position?: number;
  };
  video_count: number;
}

interface UseSocialVideoReturn {
  articles: VideoArticle[];
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
  videosEnabled: boolean;
  toggleVideos: () => void;
  refresh: () => void;
  totalVideos: number;
}

const VIDEOS_ENABLED_KEY = 'vybes-videos-enabled';

export function useSocialVideo(
  limit: number = 12,
  platform?: string
): UseSocialVideoReturn {
  const [articles, setArticles] = useState<VideoArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalVideos, setTotalVideos] = useState<number>(0);
  const [videosEnabled, setVideosEnabled] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    const saved = localStorage.getItem(VIDEOS_ENABLED_KEY);
    if (saved !== null) {
      setVideosEnabled(saved === 'true');
    }
  }, [isHydrated]);

  const fetchVideos = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (!isHydrated || (!videosEnabled && !reset)) {
      setArticles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const offset = (pageNum - 1) * limit;
      let url = `/api/client/videos?limit=${limit}&offset=${offset}&enabled=${videosEnabled}`;
      
      if (platform && platform !== 'all') {
        url += `&platform=${encodeURIComponent(platform)}`;
      }

      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.articles && Array.isArray(data.articles)) {
        if (reset) {
          setArticles(data.articles);
        } else {
          setArticles(prev => [...prev, ...data.articles]);
        }
        
        setHasMore(data.meta?.has_more || data.articles.length === limit);
        setTotalVideos(data.total_videos || 0);
      } else {
        if (reset) {
          setArticles([]);
        }
        setHasMore(false);
        setTotalVideos(0);
      }
    } catch (err) {
      console.error('[useSocialVideo] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      if (reset) {
        setArticles([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [limit, platform, videosEnabled, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    
    setPage(1);
    setArticles([]);
    setHasMore(true);
    fetchVideos(1, true);
  }, [platform, videosEnabled, isHydrated]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && videosEnabled && isHydrated) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(nextPage, false);
    }
  }, [loading, hasMore, page, videosEnabled, isHydrated, fetchVideos]);

  const toggleVideos = useCallback(() => {
    if (!isHydrated) return;
    
    const newState = !videosEnabled;
    setVideosEnabled(newState);
    localStorage.setItem(VIDEOS_ENABLED_KEY, String(newState));
    
    setPage(1);
    setArticles([]);
    setHasMore(newState);
    setError(null);
  }, [videosEnabled, isHydrated]);

  const refresh = useCallback(() => {
    if (!isHydrated) return;
    
    setPage(1);
    setArticles([]);
    setHasMore(true);
    setError(null);
    fetchVideos(1, true);
  }, [fetchVideos, isHydrated]);

  return { 
    articles, 
    loading, 
    error, 
    loadMore, 
    hasMore,
    videosEnabled,
    toggleVideos,
    refresh,
    totalVideos
  };
}

export function useHomeVideos(limit: number = 6) {
  return useSocialVideo(limit, 'all');
}

export function useVideosEnabled(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    const saved = localStorage.getItem(VIDEOS_ENABLED_KEY);
    if (saved !== null) {
      setEnabled(saved === 'true');
    }
  }, [isHydrated]);

  const setVideosEnabled = useCallback((newState: boolean) => {
    if (!isHydrated) return;
    
    setEnabled(newState);
    localStorage.setItem(VIDEOS_ENABLED_KEY, String(newState));
  }, [isHydrated]);

  return [enabled, setVideosEnabled];
}