import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

const TIMEOUT = 15000;
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
  const requestId = `brk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    
    console.log(`[${requestId}] Breaking request: page=${page}, limit=${limit}`);

    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/api/updates/breaking?page=${page}&limit=${limit}`;

    console.log(`[${requestId}] Fetching: ${endpoint}`);

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
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[${requestId}] Backend error ${response.status} (${elapsed}ms):`, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend error: ${response.status}`,
          elapsed_ms: elapsed
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log(`[${requestId}] Success: ${data.news?.length || 0} items in ${elapsed}ms`);

    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Backend returned unsuccessful response',
          elapsed_ms: elapsed
        },
        { status: 500 }
      );
    }

    const cacheHeaders: Record<string, string> = {
      'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
      'CDN-Cache-Control': 'max-age=60',
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
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      elapsed_ms: elapsed,
      request_id: requestId
    }, { status: 500 });
  }
}