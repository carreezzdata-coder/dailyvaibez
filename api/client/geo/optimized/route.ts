import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

const TIMEOUT = 10000;
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
        const delay = Math.min(500 * Math.pow(2, attempt), 2000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (attempt < retries - 1) {
        const delay = Math.min(500 * Math.pow(2, attempt), 2000);
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
  const requestId = `geo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'current';

    console.log(`[${requestId}] Geo request: action=${action}`);

    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/api/client/geo?action=${action}`;

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
          message: 'Failed to fetch geo data',
          location: {
            county: 'Unknown',
            town: 'Unknown',
            category: 'UNKNOWN'
          },
          elapsed_ms: elapsed
        }, 
        { status: 200 }
      );
    }

    const data = await response.json();
    
    console.log(`[${requestId}] Success:`, {
      action,
      hasLocation: !!data.location,
      elapsed_ms: elapsed
    });

    const cacheHeaders: Record<string, string> = action === 'stats' ? {
      'Cache-Control': 'public, max-age=180, s-maxage=300, stale-while-revalidate=1800',
      'CDN-Cache-Control': 'max-age=300',
      'Vary': 'Accept-Encoding',
      'X-Response-Time': `${elapsed}ms`,
      'X-Request-ID': requestId
    } : {
      'Cache-Control': 'private, max-age=300',
      'Vary': 'Cookie',
      'X-Response-Time': `${elapsed}ms`,
      'X-Request-ID': requestId
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
      location: {
        county: 'Unknown',
        town: 'Unknown',
        category: 'UNKNOWN'
      },
      elapsed_ms: elapsed,
      request_id: requestId
    }, { status: 200 });
  }
}