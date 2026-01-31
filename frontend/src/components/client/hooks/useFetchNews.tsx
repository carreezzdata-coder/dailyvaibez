'use client';

import { useState, useCallback } from 'react';
import { useClientSession } from './ClientSessions';
import { normalizeArticle, type NewsArticle } from '@/lib/clientData';

interface UseFetchNewsReturn {
  searchNews: (query: string, page?: number, limit?: number) => Promise<NewsArticle[]>;
  isSearching: boolean;
  searchError: string | null;
}

export const useFetchNews = (): UseFetchNewsReturn => {
  const { sessionToken } = useClientSession();
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchNews = useCallback(async (
    query: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<NewsArticle[]> => {
    if (!query.trim()) return [];
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const url = `/api/client/fetch?type=search&q=${encodeURIComponent(query)}&page=${page}&limit=${limit}&_t=${Date.now()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data.news) ? data.news.map(normalizeArticle) : [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setSearchError(errorMessage);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [sessionToken]);

  return { 
    searchNews, 
    isSearching, 
    searchError 
  };
};