import { useState, useEffect, useCallback, useRef } from 'react';
import { useClientSession } from './ClientSessions';
import { useCookieConfig } from '../cookies/useCookieConfig';
import { useUserPreferences } from './useUserPreferences';

interface Article {
  news_id: number;
  title: string;
  slug: string;
  image_url: string | null;
  category_name: string;
  category_slug: string;
  published_at: string;
  views: number;
  likes_count: number;
  first_name?: string;
  last_name?: string;
  excerpt?: string;
  reading_time?: number;
}

interface Pagination {
  current_page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

interface UseTimelineDataReturn {
  articles: Article[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  isPersonalized: boolean;
}

export function useTimelineData(initialArticles?: Article[]): UseTimelineDataReturn {
  const { sessionToken } = useClientSession();
  const { userBehavior, preferences, hasConsent } = useCookieConfig();
  const { preferences: userPrefs, geoLocation, isHydrated } = useUserPreferences();
  
  const [articles, setArticles] = useState<Article[]>(initialArticles || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    per_page: 20,
    has_next: false,
    has_prev: false
  });

  const isPersonalized = isHydrated && hasConsent && preferences.personalization;

  const buildPersonalizationPayload = useCallback((page: number) => {
    return {
      personalized: isPersonalized,
      preferences: {
        preferredCategories: isPersonalized 
          ? (userBehavior.preferredCategories || userPrefs.favoriteCategories || [])
          : [],
        categoryVisits: isPersonalized ? (userBehavior.categoryVisits || {}) : {},
        totalVisits: isPersonalized ? (userBehavior.totalVisits || 0) : 0
      },
      location: {
        county: isPersonalized ? geoLocation.county : null,
        town: isPersonalized ? geoLocation.town : null,
        category: isPersonalized ? geoLocation.category : null
      },
      page,
      limit: 20
    };
  }, [isPersonalized, userBehavior, userPrefs, geoLocation]);

  const fetchArticles = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      let response;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      };

      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      if (isPersonalized && isHydrated) {
        const payload = buildPersonalizationPayload(page);

        response = await fetch('/api/client/personalization', {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          console.warn('[useTimelineData] Personalized fetch failed, falling back to default');
          response = await fetch(`/api/client/timeline?page=${page}&limit=20`, {
            credentials: 'include',
            headers
          });
        }
      } else {
        response = await fetch(`/api/client/timeline?page=${page}&limit=20`, {
          credentials: 'include',
          headers
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load timeline');
      }

      const newArticles = data.timeline || data.articles || [];
      
      if (!Array.isArray(newArticles)) {
        throw new Error('Invalid response format: articles not an array');
      }

      if (append) {
        setArticles(prev => [...prev, ...newArticles]);
      } else {
        setArticles(newArticles);
      }
      
      if (data.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({
          current_page: page,
          per_page: 20,
          has_next: newArticles.length === 20,
          has_prev: page > 1
        });
      }
      
      hasFetchedRef.current = true;

    } catch (err) {
      console.error('[useTimelineData] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load timeline';
      setError(errorMessage);
      
      if (!append && initialArticles && initialArticles.length > 0) {
        setArticles(initialArticles);
      } else if (!append) {
        setArticles([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [sessionToken, isPersonalized, buildPersonalizationPayload, isHydrated, initialArticles]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !pagination.has_next) return;
    
    const nextPage = pagination.current_page + 1;
    await fetchArticles(nextPage, true);
  }, [isLoadingMore, pagination, fetchArticles]);

  const refresh = useCallback(async () => {
    hasFetchedRef.current = false;
    setPagination({
      current_page: 1,
      per_page: 20,
      has_next: false,
      has_prev: false
    });
    await fetchArticles(1, false);
  }, [fetchArticles]);

  useEffect(() => {
    if (!hasFetchedRef.current && articles.length === 0) {
      fetchArticles(1, false);
    }
  }, [fetchArticles, articles.length]);

  useEffect(() => {
    if (hasFetchedRef.current && isHydrated) {
      refresh();
    }
  }, [isPersonalized]);

  return {
    articles,
    isLoading,
    isLoadingMore,
    error,
    hasMore: pagination.has_next,
    loadMore,
    refresh,
    isPersonalized
  };
}