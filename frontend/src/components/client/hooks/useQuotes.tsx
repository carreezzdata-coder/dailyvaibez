'use client';

import { useState, useCallback, useEffect } from 'react';

export interface Quote {
  quote_id: number;
  quote_text: string;
  sayer_name: string;
  sayer_title: string;
  sayer_image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface UseQuotesReturn {
  quotes: Quote[];
  strikingQuotes: Quote[];
  trendingQuotes: Quote[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasMore: boolean;
  totalAvailable: number;
}

const MAX_QUOTES = 84;

export const useQuotes = (initialQuotes?: Quote[]): UseQuotesReturn => {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes || []);
  const [strikingQuotes, setStrikingQuotes] = useState<Quote[]>([]);
  const [trendingQuotes, setTrendingQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/client/quotes?limit=${MAX_QUOTES}&_t=${Date.now()}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch quotes`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load quotes');
      }

      const fetchedQuotes = Array.isArray(data.quotes) ? data.quotes : [];
      const fetchedStriking = Array.isArray(data.strikingQuotes) ? data.strikingQuotes : [];
      const fetchedTrending = Array.isArray(data.trendingQuotes) ? data.trendingQuotes : [];

      console.log('[useQuotes] Fetched successfully:', {
        quotes: fetchedQuotes.length,
        striking: fetchedStriking.length,
        trending: fetchedTrending.length,
        total: data.total || fetchedQuotes.length
      });

      setQuotes(fetchedQuotes.slice(0, MAX_QUOTES));
      setStrikingQuotes(fetchedStriking);
      setTrendingQuotes(fetchedTrending);
      setTotalAvailable(data.total || fetchedQuotes.length);
      setHasFetched(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quotes';
      setError(errorMessage);
      console.error('[useQuotes] Error:', err);
      
      if (initialQuotes && initialQuotes.length > 0) {
        console.log('[useQuotes] Using initial data as fallback:', initialQuotes.length);
        setQuotes(initialQuotes.slice(0, MAX_QUOTES));
        setTotalAvailable(initialQuotes.length);
      } else {
        setQuotes([]);
        setStrikingQuotes([]);
        setTrendingQuotes([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [initialQuotes]);

  const refresh = useCallback(async () => {
    setHasFetched(false);
    await fetchQuotes();
  }, [fetchQuotes]);

  useEffect(() => {
    if (!hasFetched && quotes.length === 0) {
      fetchQuotes();
    }
  }, [hasFetched, fetchQuotes, quotes.length]);

  return { 
    quotes,
    strikingQuotes,
    trendingQuotes,
    isLoading, 
    error,
    refresh,
    hasMore: quotes.length < totalAvailable,
    totalAvailable
  };
};