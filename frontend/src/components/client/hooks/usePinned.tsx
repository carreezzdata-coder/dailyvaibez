'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useClientSession } from './ClientSessions';
import type { NewsItem } from './useArticle';

interface UsePinnedReturn {
  news: NewsItem[];
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
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

export const usePinned = (initialNews: NewsItem[] = [], categorySlug?: string): UsePinnedReturn => {
  const { sessionToken } = useClientSession();
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchPinned = useCallback(async (): Promise<NewsItem[]> => {
    try {
      const categoryParam = categorySlug ? `&category=${encodeURIComponent(categorySlug)}` : '';
      const response = await fetch(`/api/client/pinned?limit=50${categoryParam}&_t=${Date.now()}`, {
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
        if (response.status === 404) {
          return [];
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        return [];
      }

      const newsArray = result.news || [];
      return Array.isArray(newsArray) ? newsArray.map(normalizeNewsItem) : [];
    } catch (err) {
      return [];
    }
  }, [sessionToken, categorySlug]);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const pinnedNews = await fetchPinned();
      if (mountedRef.current) {
        setNews(pinnedNews);
      }
    } catch (err) {
      if (mountedRef.current) {
        setNews([]);
        setError(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchPinned]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();

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

  return {
    news,
    refresh,
    isLoading,
    error
  };
};