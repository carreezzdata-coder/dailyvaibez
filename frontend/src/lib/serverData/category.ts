import { cookies } from 'next/headers';
import { getBackendUrl, createBackendHeaders, fastFetch, normalizeArticle } from './helpers';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  icon?: string;
  color?: string;
  description?: string;
}

interface CategoryContent {
  category: Category | null;
  news: any[];
  pagination: {
    current_page: number;
    per_page: number;
    total_news: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

function getDefaultPagination(limit: number) {
  return {
    current_page: 1,
    per_page: limit,
    total_news: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  };
}

function getEmptyCategoryContent(limit: number): CategoryContent {
  return {
    category: null,
    news: [],
    pagination: getDefaultPagination(limit),
  };
}

export async function fetchCategoryContent(slug: string, page: number = 1, limit: number = 20): Promise<CategoryContent> {
  const API_BASE_URL = getBackendUrl();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dailyvaibe_public_session')?.value;

  try {
    const response = await fastFetch(
      `${API_BASE_URL}/api/categories/${slug}/news?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: createBackendHeaders(sessionCookie),
      },
      12000
    );

    if (!response) {
      return getEmptyCategoryContent(limit);
    }

    const data = await response.json();
    
    const normalizedNews = Array.isArray(data.news) 
      ? data.news.map(normalizeArticle) 
      : [];
    
    return {
      category: data.category || null,
      news: normalizedNews,
      pagination: data.pagination || getDefaultPagination(limit),
    };
  } catch (error) {
    return getEmptyCategoryContent(limit);
  }
}

export async function fetchGroupContent(slug: string, page: number = 1, limit: number = 20): Promise<CategoryContent> {
  const API_BASE_URL = getBackendUrl();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dailyvaibe_public_session')?.value;

  try {
    const response = await fastFetch(
      `${API_BASE_URL}/api/category-groups/${slug}/news?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: createBackendHeaders(sessionCookie),
      },
      12000
    );

    if (!response) {
      return getEmptyCategoryContent(limit);
    }

    const data = await response.json();
    
    const normalizedNews = Array.isArray(data.news) 
      ? data.news.map(normalizeArticle) 
      : [];
    
    return {
      category: data.category || null,
      news: normalizedNews,
      pagination: data.pagination || getDefaultPagination(limit),
    };
  } catch (error) {
    return getEmptyCategoryContent(limit);
  }
}