'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useClientSession } from './ClientSessions';

export interface ArticleImage {
  image_url: string;
  image_caption?: string | null;
  alt_text?: string | null;
  is_featured: boolean;
  position: number;
  storage_provider?: string;
  cloudflare_id?: string | null;
  width?: number | null;
  height?: number | null;
  mime_type?: string | null;
}

export interface ArticleMedia {
  kind: 'video' | 'post';
  video_url: string;
  platform: string;
  post_type?: string;
  embed_code?: string | null;
  caption?: string | null;
  position: number;
  is_featured: boolean;
  show_full_embed: boolean;
  auto_embed: boolean;
  thumbnail_url?: string | null;
  author_name?: string | null;
  author_handle?: string | null;
  author_avatar_url?: string | null;
  post_date?: string | null;
  duration?: number | null;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  oembed_url?: string | null;
  oembed_data?: any;
}

export interface NewsItem {
  news_id: number;
  title: string;
  content: string;
  processed_content?: string;
  excerpt: string;
  slug: string;
  category_id: number;
  category_ids?: number[];
  category_name: string;
  category_slug: string;
  category_color?: string;
  category_icon?: string;
  featured: boolean;
  featured_until?: string | null;
  image_url: string;
  status: string;
  priority: string;
  tags: string | string[];
  meta_description?: string;
  seo_keywords?: string | string[];
  reading_time: number;
  views: number;
  likes_count: number;
  comments_count: number;
  share_count: number;
  first_name: string;
  last_name: string;
  author_name?: string;
  author_id?: number;
  author_email?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  images?: ArticleImage[];
  media?: ArticleMedia[];
  youtube_url?: string;
  youtube_id?: string;
  youtube_title?: string;
  youtube_thumbnail?: string;
  youtube?: {
    url: string | null;
    id: string | null;
    title: string | null;
    thumbnail: string | null;
  } | null;
  images_data?: any[];
  social_videos?: any[];
  additional_images?: any[];
  quotes_data?: any[];
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    canonical_url: string;
    og_image: string | null;
    og_type: string;
    published_time: string;
    modified_time: string;
    author: string;
    section: string;
    tags: string[];
  };
  author?: {
    author_id: number | null;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string | null;
    role: string | null;
  };
  category?: {
    category_id: number;
    name: string;
    slug: string;
    color: string | null;
    description: string | null;
    icon: string | null;
  };
  all_images?: any[];
  all_videos?: any[];
  all_categories?: any[];
}

interface UseArticleReturn {
  trackView: (slug: string) => Promise<void>;
  trackLike: (slug: string, clientId?: string) => Promise<{ liked: boolean; likes_count: number } | null>;
  trackShare: (slug: string, platform: string) => Promise<{ share_count: number } | null>;
  fetchAllNews: () => Promise<NewsItem[]>;
  isTracking: boolean;
  trackingError: string | null;
  allNews: NewsItem[];
  isLoadingNews: boolean;
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

export const useArticle = (): UseArticleReturn => {
  const { sessionToken, clientId } = useClientSession();
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const newsCache = useRef<NewsItem[]>([]);
  const lastFetchTime = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000;

  const trackView = useCallback(async (slug: string): Promise<void> => {
    const trimmedSlug = slug?.trim();
    if (!trimmedSlug) return;
    
    setIsTracking(true);
    setTrackingError(null);
    
    try {
      const response = await fetch('/api/client/article', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` }) 
        },
        body: JSON.stringify({ 
          action: 'view', 
          slug: trimmedSlug, 
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown', 
          ip_address: 'frontend' 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to track view');
    } catch (error) {
      setTrackingError('Failed to track view');
    } finally {
      setIsTracking(false);
    }
  }, [sessionToken]);

  const trackLike = useCallback(async (slug: string, providedClientId?: string): Promise<{ liked: boolean; likes_count: number } | null> => {
    const trimmedSlug = slug?.trim();
    if (!trimmedSlug) return null;
    
    const effectiveClientId = providedClientId || clientId;
    if (!effectiveClientId) return null;
    
    setIsTracking(true);
    setTrackingError(null);
    
    try {
      const response = await fetch('/api/client/article', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` }) 
        },
        body: JSON.stringify({ 
          action: 'like', 
          slug: trimmedSlug, 
          client_id: effectiveClientId 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to track like');
      
      const data = await response.json();
      return { liked: data.liked, likes_count: data.likes_count };
    } catch (error) {
      setTrackingError('Failed to track like');
      return null;
    } finally {
      setIsTracking(false);
    }
  }, [sessionToken, clientId]);

  const trackShare = useCallback(async (slug: string, platform: string): Promise<{ share_count: number } | null> => {
    const trimmedSlug = slug?.trim();
    if (!trimmedSlug) return null;
    
    setIsTracking(true);
    setTrackingError(null);
    
    try {
      const response = await fetch('/api/client/article', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` }) 
        },
        body: JSON.stringify({ 
          action: 'share', 
          slug: trimmedSlug, 
          platform 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to track share');
      
      const data = await response.json();
      return { share_count: data.share_count };
    } catch (error) {
      setTrackingError('Failed to track share');
      return null;
    } finally {
      setIsTracking(false);
    }
  }, [sessionToken]);

  const fetchAllNews = useCallback(async (): Promise<NewsItem[]> => {
    const now = Date.now();
    if (newsCache.current.length > 0 && (now - lastFetchTime.current) < CACHE_DURATION) {
      return newsCache.current;
    }

    setIsLoadingNews(true);
    
    try {
      const endpoints = [
        '/api/client/news',
        '/api/client/featured',
        '/api/client/trending',
        '/api/client/breaking'
      ];

      const responses = await Promise.allSettled(
        endpoints.map(endpoint =>
          fetch(`${endpoint}?limit=100&_t=${Date.now()}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
            },
            cache: 'no-store'
          })
        )
      );

      const allNewsItems: NewsItem[] = [];
      const seenIds = new Set<number>();

      for (const result of responses) {
        if (result.status === 'fulfilled' && result.value.ok) {
          try {
            const data = await result.value.json();
            const newsArray = data.news || data.trending || data.breaking || [];
            
            if (Array.isArray(newsArray)) {
              newsArray.forEach((item: any) => {
                const normalized = normalizeNewsItem(item);
                if (!seenIds.has(normalized.news_id)) {
                  seenIds.add(normalized.news_id);
                  allNewsItems.push(normalized);
                }
              });
            }
          } catch (parseError) {
            console.warn('Error parsing news response:', parseError);
          }
        }
      }

      allNewsItems.sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );

      newsCache.current = allNewsItems;
      lastFetchTime.current = now;
      setAllNews(allNewsItems);
      
      return allNewsItems;
    } catch (error) {
      console.error('Error fetching all news:', error);
      return newsCache.current;
    } finally {
      setIsLoadingNews(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    fetchAllNews();
  }, [fetchAllNews]);

  return { 
    trackView, 
    trackLike, 
    trackShare, 
    fetchAllNews,
    isTracking, 
    trackingError,
    allNews,
    isLoadingNews
  };
};