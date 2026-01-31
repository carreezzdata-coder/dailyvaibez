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
  const requestId = `vel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const body = await request.json();
    const { action, article_id, timestamp } = body;

    console.log(`[${requestId}] Velocity track: action=${action}, article=${article_id}`);

    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/api/client/velocity`;

    const headers = buildHeadersFromRequest(request, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId
    });

    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, article_id, timestamp }),
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
          message: 'Failed to track velocity',
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
  const requestId = `vel-get-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`[${requestId}] Fetch velocity metrics`);

    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/api/client/velocity`;

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
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[${requestId}] Backend error ${response.status} (${elapsed}ms):`, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to fetch velocity metrics',
          metrics: {
            hourly: 0,
            daily: 0,
            weekly: 0,
            peakHour: 14,
            optimalPostTime: '14:00',
            trendingScore: 0
          },
          elapsed_ms: elapsed
        }, 
        { status: 200 }
      );
    }

    const data = await response.json();
    
    console.log(`[${requestId}] Metrics fetched in ${elapsed}ms`);

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
      success: false,
      message: 'Internal server error',
      metrics: {
        hourly: 0,
        daily: 0,
        weekly: 0,
        peakHour: 14,
        optimalPostTime: '14:00',
        trendingScore: 0
      },
      elapsed_ms: elapsed,
      request_id: requestId
    }, { status: 200 });
  }
}