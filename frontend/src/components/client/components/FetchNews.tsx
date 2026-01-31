// frontend/src/components/client/components/FetchNews.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useClientSession } from '../hooks/ClientSessions';
import { normalizeArticle, type NewsArticle } from '@/lib/clientData';

interface FetchNewsConfig {
  type: 'breaking' | 'featured' | 'trending';
  limit?: number;
  autoFetch?: boolean;
  refreshInterval?: number;
  cacheKey?: string;
}

interface FetchNewsResult {
  news: NewsArticle[];
}

export function useFetchNews(config: FetchNewsConfig) {
  const { sessionToken } = useClientSession();
  const [data, setData] = useState<FetchNewsResult>({ news: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchNews = useCallback(async (): Promise<FetchNewsResult | undefined> => {
    if (!mountedRef.current) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();
    const fetchTimeout = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, 15000);

    try {
      const url = `/api/client/fetch?type=${config.type}&limit=${config.limit || 20}&_t=${Date.now()}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
        },
        signal: abortControllerRef.current.signal,
        cache: 'no-store'
      });

      clearTimeout(fetchTimeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch news');
      }

      const rawNews = result.news || result.breaking_news || result.featured_news || result.trending_news;
      const normalizedData: FetchNewsResult = {
        news: Array.isArray(rawNews) ? rawNews.map(normalizeArticle) : []
      };

      if (mountedRef.current) {
        setData(normalizedData);
        setLastFetch(Date.now());
        setIsLoading(false);
        setError(null);
      }

      return normalizedData;

    } catch (err: unknown) {
      clearTimeout(fetchTimeout);

      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch news';

      if (mountedRef.current) {
        setError(errorMsg);
        setIsLoading(false);
      }
      
      return;
    }
  }, [config, sessionToken]);

  useEffect(() => {
    if (config.autoFetch !== false) {
      fetchNews();
    }
  }, [config.type, config.limit]);

  useEffect(() => {
    if (config.refreshInterval && config.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          fetchNews();
        }
      }, config.refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [config.refreshInterval, fetchNews]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const refresh = useCallback(() => {
    return fetchNews();
  }, [fetchNews]);

  return {
    data,
    isLoading,
    error,
    lastFetch,
    refresh
  };
}

export default useFetchNews;