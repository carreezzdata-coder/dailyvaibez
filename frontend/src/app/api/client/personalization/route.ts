import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

const TIMEOUT = 15000;
const MAX_RETRIES = 2;

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 404 || response.status < 500) {
        return response;
      }
      
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}

function calculatePersonalizationScore(
  article: any,
  preferences: any,
  location: any
): number {
  let score = article.trending_score || 0;
  
  if (preferences?.preferredCategories && Array.isArray(preferences.preferredCategories)) {
    const categoryIndex = preferences.preferredCategories.indexOf(article.category_slug);
    if (categoryIndex !== -1) {
      const boost = (preferences.preferredCategories.length - categoryIndex) * 50;
      score += boost;
    }
  }
  
  if (preferences?.categoryVisits && preferences.categoryVisits[article.category_slug]) {
    const visitBoost = Math.min(preferences.categoryVisits[article.category_slug] * 5, 100);
    score += visitBoost;
  }

  if (location?.county && article.category_slug === 'counties') {
    score += 75;
  }

  if (location?.town && article.title?.toLowerCase().includes(location.town.toLowerCase())) {
    score += 50;
  }

  const hoursAgo = article.hours_ago || 0;
  if (hoursAgo < 6) {
    score *= 1.2;
  } else if (hoursAgo < 24) {
    score *= 1.1;
  }
  
  return score;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `pers-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const body = await request.json();
    const { 
      page = 1, 
      limit = 20, 
      preferences, 
      location, 
      personalized = false 
    } = body;

    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/api/fetchall?page=${page}&limit=${limit}`;

    const headers = buildHeadersFromRequest(request, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId
    });

    const response = await fetchWithRetry(endpoint, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store',
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      console.error(`[${requestId}] Backend returned ${response.status} in ${elapsed}ms`);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend error: ${response.status}`,
          timeline: [],
          articles: [],
          pagination: {
            current_page: page,
            per_page: limit,
            has_next: false,
            has_prev: page > 1
          }
        }, 
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[${requestId}] Backend returned success=false`);
      return NextResponse.json({
        success: false,
        message: data.message || 'Backend returned error',
        timeline: [],
        articles: [],
        pagination: {
          current_page: page,
          per_page: limit,
          has_next: false,
          has_prev: page > 1
        }
      }, { status: 500 });
    }

    let articles = data.news || [];

    if (personalized && preferences && articles.length > 0) {
      articles = articles.map((article: any) => ({
        ...article,
        personalization_score: calculatePersonalizationScore(article, preferences, location)
      }));

      articles.sort((a: any, b: any) => {
        const scoreA = a.personalization_score || 0;
        const scoreB = b.personalization_score || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
    }
    
    const responseData = {
      success: true,
      timeline: articles,
      articles: articles,
      featured: articles.filter((a: any) => a.promotions?.featured).slice(0, 5),
      slider: articles.filter((a: any) => a.trending_score > 100).slice(0, 8),
      pagination: data.pagination || {
        current_page: page,
        per_page: limit,
        has_next: articles.length === limit,
        has_prev: page > 1
      },
      personalized: personalized,
      meta: {
        elapsed_ms: elapsed,
        request_id: requestId
      }
    };

    const cacheHeaders: Record<string, string> = {
      'Cache-Control': personalized ? 'private, max-age=60, must-revalidate' : 'public, max-age=120, s-maxage=180',
      'Vary': 'Cookie, Authorization',
      'X-Response-Time': `${elapsed}ms`,
      'X-Request-ID': requestId
    };

    const nextResponse = NextResponse.json(responseData, { headers: cacheHeaders });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[${requestId}] Personalization error (${elapsed}ms):`, error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to load personalized content',
      timeline: [],
      articles: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        has_next: false,
        has_prev: false
      },
      personalized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `pers-get-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/api/fetchall?page=${page}&limit=${limit}`;

    const headers = buildHeadersFromRequest(request, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId
    });

    const response = await fetchWithRetry(endpoint, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store',
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      console.error(`[${requestId}] Backend returned ${response.status} in ${elapsed}ms`);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend error: ${response.status}`,
          timeline: [],
          articles: []
        }, 
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({
        success: false,
        message: data.message || 'Backend returned error',
        timeline: [],
        articles: []
      }, { status: 500 });
    }

    const articles = data.news || [];
    
    const cacheHeaders: Record<string, string> = {
      'Cache-Control': 'public, max-age=120, s-maxage=180',
      'Vary': 'Cookie',
      'X-Response-Time': `${elapsed}ms`,
      'X-Request-ID': requestId
    };

    const nextResponse = NextResponse.json({
      success: true,
      timeline: articles,
      articles: articles,
      featured: articles.filter((a: any) => a.promotions?.featured).slice(0, 5),
      slider: articles.filter((a: any) => a.trending_score > 100).slice(0, 8),
      pagination: data.pagination
    }, { headers: cacheHeaders });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[${requestId}] GET error (${elapsed}ms):`, error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to load content',
      timeline: [],
      articles: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}