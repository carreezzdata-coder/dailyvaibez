import { cookies } from 'next/headers';
import { getBackendUrl, createBackendHeaders, fastFetch } from './helpers';

interface QuotesData {
  quotes: Array<{
    quote_id: number;
    quote_text: string;
    sayer_name: string;
    sayer_title: string;
    sayer_image_url: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  strikingQuotes: Array<any>;
  trendingQuotes: Array<any>;
}

export async function fetchQuotesData(): Promise<QuotesData> {
  const API_BASE_URL = getBackendUrl();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dailyvaibe_public_session')?.value;
  
  try {
    const response = await fastFetch(
      `${API_BASE_URL}/api/clientquotes`,
      {
        method: 'GET',
        headers: createBackendHeaders(sessionCookie),
      },
      10000
    );
    
    if (!response) {
      return {
        quotes: [],
        strikingQuotes: [],
        trendingQuotes: []
      };
    }
    
    const data = await response.json();
    
    if (!data.success) {
      return {
        quotes: [],
        strikingQuotes: [],
        trendingQuotes: []
      };
    }
    
    return {
      quotes: data.quotes || [],
      strikingQuotes: data.strikingQuotes || [],
      trendingQuotes: data.trendingQuotes || []
    };
  } catch (error) {
    console.error('[QUOTES] Fetch error:', error);
    return {
      quotes: [],
      strikingQuotes: [],
      trendingQuotes: []
    };
  }
}