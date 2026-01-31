import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

const TIMEOUT = 20000;
const MAX_RETRIES = 3;

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
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (attempt < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `home-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`[${requestId}] Home page request started`);

    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/api/client/home?_t=${Date.now()}`;

    console.log(`[${requestId}] Fetching from: ${endpoint}`);

    const headers = buildHeadersFromRequest(request, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const response = await fetchWithRetry(endpoint, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store',
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[${requestId}] Backend error ${response.status} (${elapsed}ms):`, errorText.substring(0, 500));
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend error: ${response.status}`,
          error: errorText.substring(0, 200),
          sliderSlides: [],
          headlines: [],
          categorySections: [],
          elapsed_ms: elapsed
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log(`[${requestId}] Backend response:`, {
      success: data.success,
      categorySections: data.categorySections?.length || 0,
      sliderSlides: data.sliderSlides?.length || 0,
      headlines: data.headlines?.length || 0
    });

    if (!data.success) {
      console.error(`[${requestId}] Backend returned success=false`);
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Backend returned unsuccessful response',
          sliderSlides: [],
          headlines: [],
          categorySections: [],
          elapsed_ms: elapsed
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(data.categorySections)) {
      console.warn(`[${requestId}] categorySections is not an array:`, typeof data.categorySections);
      data.categorySections = [];
    }

    if (!Array.isArray(data.sliderSlides)) {
      console.warn(`[${requestId}] sliderSlides is not an array:`, typeof data.sliderSlides);
      data.sliderSlides = [];
    }

    console.log(`[${requestId}] Success: ${data.categorySections.length} categories, ${data.sliderSlides.length} slides in ${elapsed}ms`);

    const cacheHeaders: Record<string, string> = {
      'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=240',
      'CDN-Cache-Control': 'max-age=120',
      'X-Response-Time': `${elapsed}ms`,
      'X-Request-ID': requestId,
      'Vary': 'Accept-Encoding'
    };

    const nextResponse = NextResponse.json(data, { headers: cacheHeaders });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[${requestId}] Critical error (${elapsed}ms):`, error);
    console.error(`[${requestId}] Stack:`, error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      sliderSlides: [],
      headlines: [],
      categorySections: [],
      elapsed_ms: elapsed,
      request_id: requestId
    }, { status: 500 });
  }
}