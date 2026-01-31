import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30;

const TIMEOUT = 10000;

async function fetchWithTimeout(url: string, options: RequestInit, timeout = TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `idx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const body = await request.json();
    const { url, type = 'URL_UPDATED' } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'URL is required' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Indexing request: ${url} (${type})`);

    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/api/client/indexing`;

    const headers = buildHeadersFromRequest(request, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId
    });

    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url, type }),
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
          message: 'Failed to submit URL for indexing',
          elapsed_ms: elapsed
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log(`[${requestId}] Success in ${elapsed}ms`);

    const nextResponse = NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, no-cache',
        'X-Response-Time': `${elapsed}ms`,
        'X-Request-ID': requestId
      }
    });

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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `idx-chk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'URL parameter required' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Check indexing: ${url}`);

    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/api/client/indexing?url=${encodeURIComponent(url)}`;

    const headers = buildHeadersFromRequest(request, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId
    });

    const response = await fetchWithTimeout(endpoint, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store',
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      console.warn(`[${requestId}] Backend error ${response.status} (${elapsed}ms)`);
      
      return NextResponse.json(
        { 
          success: true, 
          status: 'NOT_FOUND',
          url,
          elapsed_ms: elapsed
        }, 
        { status: 200 }
      );
    }

    const data = await response.json();
    
    console.log(`[${requestId}] Status: ${data.status} in ${elapsed}ms`);

    const nextResponse = NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, max-age=300',
        'X-Response-Time': `${elapsed}ms`,
        'X-Request-ID': requestId
      }
    });

    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[${requestId}] Critical error (${elapsed}ms):`, error);
    
    return NextResponse.json({
      success: true,
      status: 'NOT_FOUND',
      elapsed_ms: elapsed,
      request_id: requestId
    }, { status: 200 });
  }
}