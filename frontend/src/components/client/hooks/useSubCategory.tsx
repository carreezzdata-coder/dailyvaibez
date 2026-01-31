'use client';

import { useState, useCallback } from 'react';
import { useClientSession } from './ClientSessions';
import { normalizeArticles, type NewsArticle } from '@/lib/clientData';

interface SubCategorySEO {
  title: string;
  description: string;
  canonical_url: string;
}

interface SubCategoryPagination {
  current_page: number;
  per_page: number;
  total_news: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface SubCategoryResponse {
  success: boolean;
  news: NewsArticle[];
  category?: {
    category_id: number;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
  };
  pagination: SubCategoryPagination;
  seo?: SubCategorySEO;
  message?: string;
}

interface UseSubCategoryReturn {
  loadMoreNews: (slug: string, page: number, limit?: number) => Promise<NewsArticle[]>;
  loadSubCategoryData: (slug: string, page?: number, limit?: number) => Promise<SubCategoryResponse | null>;
  getRecommendedNews: (news: NewsArticle[], count?: number) => NewsArticle[];
  getMoreStories: (news: NewsArticle[], skip?: number, count?: number) => NewsArticle[];
  getSponsoredBlocks: (news: NewsArticle[], blockSize?: number) => NewsArticle[][];
  truncateContent: (content: string, maxWords?: number) => { truncated: string; wordCount: number; isTruncated: boolean };
  isLoadingMore: boolean;
  loadMoreError: string | null;
  subCategorySEO: SubCategorySEO | null;
  pagination: SubCategoryPagination | null;
}

export const useSubCategory = (): UseSubCategoryReturn => {
  const { sessionToken } = useClientSession();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [subCategorySEO, setSubCategorySEO] = useState<SubCategorySEO | null>(null);
  const [pagination, setPagination] = useState<SubCategoryPagination | null>(null);

  const loadSubCategoryData = useCallback(async (
    slug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SubCategoryResponse | null> => {
    if (!slug || slug.trim() === '') {
      setLoadMoreError('Invalid sub-category slug');
      return null;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const url = `/api/client/category?slug=${encodeURIComponent(slug)}&page=${page}&limit=${limit}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data.success) {
        const newsItems = normalizeArticles(data.news || []);
        if (data.seo) setSubCategorySEO(data.seo);
        if (data.pagination) setPagination(data.pagination);
        
        return {
          ...data,
          news: newsItems
        };
      } else {
        setLoadMoreError(data.message || 'Failed to load sub-category data');
        return null;
      }
    } catch (err) {
      setLoadMoreError(`Failed to load sub-category data: ${err}`);
      return null;
    } finally {
      setIsLoadingMore(false);
    }
  }, [sessionToken]);

  const loadMoreNews = useCallback(async (
    slug: string, 
    page: number, 
    limit: number = 20
  ): Promise<NewsArticle[]> => {
    const result = await loadSubCategoryData(slug, page, limit);
    return result?.news || [];
  }, [loadSubCategoryData]);

  const getRecommendedNews = useCallback((news: NewsArticle[], count: number = 8): NewsArticle[] => {
    return news.slice(0, count);
  }, []);

  const getMoreStories = useCallback((news: NewsArticle[], skip: number = 8, count: number = 10): NewsArticle[] => {
    return news.slice(skip, skip + count);
  }, []);

  const getSponsoredBlocks = useCallback((news: NewsArticle[], blockSize: number = 3): NewsArticle[][] => {
    const blocks: NewsArticle[][] = [];
    for (let i = 0; i < news.length; i += blockSize) {
      blocks.push(news.slice(i, i + blockSize));
    }
    return blocks;
  }, []);

  const truncateContent = useCallback((content: string, maxWords: number = 200) => {
    if (!content) return { truncated: '', wordCount: 0, isTruncated: false };
    
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    const words = plainText.split(/\s+/);
    const wordCount = words.length;
    
    if (wordCount <= maxWords) {
      return { truncated: plainText, wordCount, isTruncated: false };
    }
    
    const truncated = words.slice(0, maxWords).join(' ') + '...';
    return { truncated, wordCount, isTruncated: true };
  }, []);

  return {
    loadMoreNews,
    loadSubCategoryData,
    getRecommendedNews,
    getMoreStories,
    getSponsoredBlocks,
    truncateContent,
    isLoadingMore,
    loadMoreError,
    subCategorySEO,
    pagination
  };
};