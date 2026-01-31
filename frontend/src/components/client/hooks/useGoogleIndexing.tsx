'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useClientSession } from './ClientSessions';

interface IndexingMetrics {
  submitted: number;
  indexed: number;
  pending: number;
  lastUpdate: string;
}

interface UseGoogleIndexingReturn {
  submitUrl: (url: string, type?: 'URL_UPDATED' | 'URL_DELETED') => Promise<boolean>;
  submitBatch: (urls: string[]) => Promise<{ success: number; failed: number }>;
  checkIndexStatus: (url: string) => Promise<'INDEXED' | 'PENDING' | 'NOT_FOUND'>;
  metrics: IndexingMetrics;
  isSubmitting: boolean;
  error: string | null;
}

export const useGoogleIndexing = (): UseGoogleIndexingReturn => {
  const { sessionToken } = useClientSession();
  const [metrics, setMetrics] = useState<IndexingMetrics>({
    submitted: 0,
    indexed: 0,
    pending: 0,
    lastUpdate: new Date().toISOString()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queueRef = useRef<string[]>([]);
  const processingRef = useRef(false);

  const submitUrl = useCallback(async (url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/client/indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
        },
        body: JSON.stringify({ url, type }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMetrics(prev => ({
          ...prev,
          submitted: prev.submitted + 1,
          pending: prev.pending + 1,
          lastUpdate: new Date().toISOString()
        }));
        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit URL');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionToken]);

  const submitBatch = useCallback(async (urls: string[]): Promise<{ success: number; failed: number }> => {
    setIsSubmitting(true);
    setError(null);

    let success = 0;
    let failed = 0;

    try {
      for (const url of urls) {
        const result = await submitUrl(url);
        if (result) {
          success++;
        } else {
          failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return { success, failed };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch submission failed');
      return { success, failed: urls.length - success };
    } finally {
      setIsSubmitting(false);
    }
  }, [submitUrl]);

  const checkIndexStatus = useCallback(async (url: string): Promise<'INDEXED' | 'PENDING' | 'NOT_FOUND'> => {
    try {
      const response = await fetch(`/api/client/indexing?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
        },
        credentials: 'include'
      });

      if (!response.ok) {
        return 'NOT_FOUND';
      }

      const data = await response.json();
      return data.status || 'NOT_FOUND';
    } catch {
      return 'NOT_FOUND';
    }
  }, [sessionToken]);

  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) return;

    processingRef.current = true;

    while (queueRef.current.length > 0) {
      const url = queueRef.current.shift();
      if (url) {
        await submitUrl(url);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    processingRef.current = false;
  }, [submitUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      processQueue();
    }, 5000);

    return () => clearInterval(interval);
  }, [processQueue]);

  return {
    submitUrl,
    submitBatch,
    checkIndexStatus,
    metrics,
    isSubmitting,
    error
  };
};