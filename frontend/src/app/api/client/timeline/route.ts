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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
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

    const articles = data.news || [];
    
    const timelineResponse = NextResponse.json({
      success: true,
      timeline: articles,
      articles: articles,
      pagination: data.pagination || {
        current_page: page,
        per_page: limit,
        has_next: articles.length === limit,
        has_prev: page > 1
      },
      meta: {
        elapsed_ms: elapsed,
        request_id: requestId
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, must-revalidate',
        'Vary': 'Cookie, Authorization',
        'X-Response-Time': `${elapsed}ms`,
        'X-Request-ID': requestId
      }
    });
    
    forwardCookies(response, timelineResponse);
    return timelineResponse;

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[${requestId}] Timeline error (${elapsed}ms):`, error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to load timeline',
      timeline: [],
      articles: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        has_next: false,
        has_prev: false
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}