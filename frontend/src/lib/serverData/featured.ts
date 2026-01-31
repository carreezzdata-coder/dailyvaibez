import { cookies } from 'next/headers';
import { getBackendUrl, createBackendHeaders, fastFetch, normalizeArticle } from './helpers';

interface FeaturedData {
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

export async function fetchFeaturedData(page: number = 1, limit: number = 50): Promise<FeaturedData> {
  const API_BASE_URL = getBackendUrl();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dailyvaibe_public_session')?.value;

  try {
    const response = await fastFetch(
      `${API_BASE_URL}/api/updates/featured?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: createBackendHeaders(sessionCookie),
      },
      10000
    );

    if (!response) {
      return {
        news: [],
        pagination: {
          current_page: 1,
          per_page: limit,
          total_items: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        }
      };
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        news: [],
        pagination: {
          current_page: 1,
          per_page: limit,
          total_items: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        }
      };
    }

    const normalizedNews = Array.isArray(data.news) 
      ? data.news.map(normalizeArticle) 
      : [];

    return {
      news: normalizedNews,
      pagination: data.pagination || {
        current_page: page,
        per_page: limit,
        total_items: normalizedNews.length,
        total_pages: Math.ceil(normalizedNews.length / limit),
        has_next: false,
        has_prev: false,
      }
    };
  } catch (error) {
    console.error('[FEATURED] Fetch error:', error);
    return {
      news: [],
      pagination: {
        current_page: 1,
        per_page: limit,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      }
    };
  }
}