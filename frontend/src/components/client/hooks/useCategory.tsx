'use client';

import { useState, useCallback } from 'react';
import { useClientSession } from './ClientSessions';
import { normalizeArticles, type NewsArticle } from '@/lib/clientData';

export interface CategorySEO {
  title: string;
  description: string;
  canonical_url: string;
}

export interface CategoryPagination {
  current_page: number;
  per_page: number;
  total_news: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Category {
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  is_group?: boolean;
  sub_categories?: any[];
}

export interface CategoryResponse {
  success: boolean;
  news: NewsArticle[];
  category?: Category;
  pagination: CategoryPagination;
  seo?: CategorySEO;
  message?: string;
}

export interface UseCategoryReturn {
  loadMoreNews: (slug: string, page: number, limit?: number) => Promise<NewsArticle[]>;
  loadCategoryData: (slug: string, page?: number, limit?: number) => Promise<CategoryResponse | null>;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  categorySEO: CategorySEO | null;
  pagination: CategoryPagination | null;
}

const MAIN_CATEGORY_GROUPS = [
  'world', 'counties', 'politics', 'business', 'opinion',
  'sports', 'lifestyle', 'entertainment', 'tech', 'other'
];

export const useCategory = (): UseCategoryReturn => {
  const { sessionToken } = useClientSession();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [categorySEO, setCategorySEO] = useState<CategorySEO | null>(null);
  const [pagination, setPagination] = useState<CategoryPagination | null>(null);

  const loadCategoryData = useCallback(async (
    slug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<CategoryResponse | null> => {
    if (!slug || slug.trim() === '') {
      setLoadMoreError('Invalid category slug');
      return null;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const isGroup = MAIN_CATEGORY_GROUPS.includes(slug);
      const endpoint = isGroup ? 'category-groups' : 'categories';
      const url = `/api/client/${endpoint}?slug=${encodeURIComponent(slug)}&page=${page}&limit=${limit}`;
      
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
        if (data.seo) setCategorySEO(data.seo);
        if (data.pagination) setPagination(data.pagination);
        
        return {
          ...data,
          news: newsItems
        };
      } else {
        setLoadMoreError(data.message || 'Failed to load category data');
        return null;
      }
    } catch (err) {
      setLoadMoreError(`Failed to load category data: ${err}`);
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
    const result = await loadCategoryData(slug, page, limit);
    return result?.news || [];
  }, [loadCategoryData]);

  return {
    loadMoreNews,
    loadCategoryData,
    isLoadingMore,
    loadMoreError,
    categorySEO,
    pagination
  };
};