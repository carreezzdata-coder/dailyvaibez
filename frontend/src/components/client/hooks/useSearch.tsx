'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface SearchResult {
  news_id: string | number;
  title: string;
  excerpt: string;
  slug: string;
  category_id: number;
  primary_category_id?: number | null;
  editor_pick: boolean;
  image_url: string;
  thumbnail_url: string;
  tags: string[];
  reading_time: number;
  views: number;
  likes_count: number;
  comments_count: number;
  share_count: number;
  published_at: string;
  meta_description?: string;
  first_name: string;
  last_name: string;
  author_name: string;
  category_name: string;
  category_slug: string;
  primary_category?: {
    category_id: number;
    name: string;
    slug: string;
  } | null;
  relevance_score?: number;
  url: string;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
  query: string;
  sort?: string;
  categories?: string | null;
  pagination?: {
    current_page: number;
    total_pages: number;
    per_page: number;
    offset: number;
    has_next: boolean;
    has_prev: boolean;
  };
  search_meta?: {
    query_time: string;
    result_count: number;
  };
}

export function useSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const search = useCallback(async (
    query: string,
    options: {
      limit?: number;
      categories?: string;
      sort?: 'relevance' | 'recent' | 'popular' | 'trending';
      offset?: number;
    } = {}
  ): Promise<SearchResult[]> => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setTotalResults(0);
      return [];
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: (options.limit || 10).toString(),
        sort: options.sort || 'relevance',
        offset: (options.offset || 0).toString()
      });

      if (options.categories) {
        params.append('categories', options.categories);
      }

      const response = await fetch(`/api/client/search?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data: SearchResponse = await response.json();

      if (data.success) {
        setSearchResults(data.results);
        setTotalResults(data.total);
        return data.results;
      } else {
        throw new Error('Search request failed');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Search request aborted');
        return [];
      }
      
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
      setTotalResults(0);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setTotalResults(0);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const saveSearchHistory = useCallback((query: string) => {
    if (!isHydrated || typeof window === 'undefined' || !query.trim()) return;
    
    try {
      const historyStr = localStorage.getItem('vt_search_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      
      const newHistory = [
        query.trim(), 
        ...history.filter((q: string) => q.toLowerCase() !== query.trim().toLowerCase())
      ].slice(0, 10);
      
      localStorage.setItem('vt_search_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save search history:', e);
    }
  }, [isHydrated]);

  const getSearchHistory = useCallback((): string[] => {
    if (!isHydrated || typeof window === 'undefined') return [];
    
    try {
      const historyStr = localStorage.getItem('vt_search_history');
      return historyStr ? JSON.parse(historyStr) : [];
    } catch (e) {
      console.error('Failed to get search history:', e);
      return [];
    }
  }, [isHydrated]);

  const clearSearchHistory = useCallback(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('vt_search_history');
    } catch (e) {
      console.error('Failed to clear search history:', e);
    }
  }, [isHydrated]);

  return {
    search,
    clearSearch,
    saveSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    isSearching,
    searchResults,
    totalResults,
    error,
    isHydrated,
  };
}