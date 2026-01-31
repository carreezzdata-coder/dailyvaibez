import { cookies } from 'next/headers';
import { getBackendUrl, createBackendHeaders, fastFetch, normalizeArticle } from './helpers';

interface PinnedData {
  news: any[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

function getDefaultPagination(limit: number) {
  return {
    current_page: 1,
    per_page: limit,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  };
}

export async function fetchPinnedData(page: number = 1, limit: number = 10, categorySlug?: string): Promise<PinnedData> {
  const API_BASE_URL = getBackendUrl();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dailyvaibe_public_session')?.value;

  try {
    const url = categorySlug 
      ? `${API_BASE_URL}/api/pinned?page=${page}&limit=${limit}&category=${categorySlug}`
      : `${API_BASE_URL}/api/pinned?page=${page}&limit=${limit}`;

    const response = await fastFetch(
      url,
      {
        method: 'GET',
        headers: createBackendHeaders(sessionCookie),
      },
      12000
    );

    if (!response) {
      return {
        news: [],
        pagination: getDefaultPagination(limit)
      };
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        news: [],
        pagination: getDefaultPagination(limit)
      };
    }

    const normalizedNews = Array.isArray(data.news) 
      ? data.news.map(normalizeArticle) 
      : [];
    
    return {
      news: normalizedNews,
      pagination: data.pagination || getDefaultPagination(limit)
    };
  } catch (error) {
    console.error('Error fetching pinned data:', error);
    return {
      news: [],
      pagination: getDefaultPagination(limit)
    };
  }
}