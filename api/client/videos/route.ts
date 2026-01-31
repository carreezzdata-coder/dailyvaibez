// app/api/client/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

/**
 * GET /api/client/videos
 * Enhanced video articles endpoint with switch support
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract and validate parameters
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
    const platform = searchParams.get('platform') || 'all';
    const enabled = searchParams.get('enabled') || 'true';
    
    console.log('[VIDEOS API ROUTE] Request params:', { 
      limit, 
      offset, 
      platform,
      enabled 
    });

    // If videos are disabled, return empty result immediately
    if (enabled === 'false') {
      return NextResponse.json({
        success: true,
        articles: [],
        count: 0,
        total_videos: 0,
        disabled: true,
        meta: {
          limit,
          offset,
          platform,
          enabled: false,
          timestamp: new Date().toISOString()
        }
      }, {
        headers: {
          'Cache-Control': 'public, max-age=60',
        }
      });
    }

    // Build backend URL with all parameters
    let backendUrl = `${getBackendUrl()}/api/videos/articles?limit=${limit}&offset=${offset}&enabled=${enabled}`;
    
    if (platform && platform !== 'all') {
      backendUrl += `&platform=${encodeURIComponent(platform)}`;
    }
    
    console.log('[VIDEOS API ROUTE] Fetching from backend:', backendUrl);
    
    // Fetch from backend with proper headers and error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    let response;
    try {
      response = await fetch(backendUrl, {
        method: 'GET',
        headers: buildHeadersFromRequest(request),
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('[VIDEOS API ROUTE] Request timeout');
        return NextResponse.json({
          success: false,
          articles: [],
          count: 0,
          total_videos: 0,
          error: 'Request timeout',
          meta: {
            limit,
            offset,
            platform,
            enabled: true,
            timestamp: new Date().toISOString()
          }
        }, { status: 504 });
      }
      
      throw fetchError;
    }

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VIDEOS API ROUTE] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Return empty array for client resilience
      return NextResponse.json({
        success: true,
        articles: [],
        count: 0,
        total_videos: 0,
        warning: `Backend returned ${response.status}`,
        meta: {
          limit,
          offset,
          platform,
          enabled: true,
          timestamp: new Date().toISOString()
        }
      }, { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60',
        }
      });
    }

    // Parse and validate response data
    const data = await response.json();
    
    // Ensure proper data structure
    const responseData = {
      success: data.success ?? true,
      articles: Array.isArray(data.articles) ? data.articles : [],
      count: data.count || 0,
      total_count: data.total_count || 0,
      total_videos: data.total_videos || 0,
      disabled: data.disabled || false,
      meta: {
        limit,
        offset,
        platform,
        enabled: enabled === 'true',
        has_more: data.meta?.has_more || false,
        timestamp: data.meta?.timestamp || new Date().toISOString()
      }
    };
    
    console.log('[VIDEOS API ROUTE] Success:', {
      articles: responseData.articles.length,
      total_videos: responseData.total_videos,
      platform,
      enabled
    });
    
    // Create response with proper caching
    const nextResponse = NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'max-age=900',
        'Vary': 'Accept-Encoding, Platform',
      }
    });

    // Forward any cookies from backend
    forwardCookies(response, nextResponse);
    
    return nextResponse;

  } catch (error) {
    console.error('[VIDEOS API ROUTE] Unexpected error:', error);
    
    const { searchParams } = new URL(request.url);
    
    // Return graceful fallback
    return NextResponse.json({
      success: false,
      articles: [],
      count: 0,
      total_videos: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      meta: {
        limit: parseInt(searchParams.get('limit') || '12', 10),
        offset: parseInt(searchParams.get('offset') || '0', 10),
        platform: searchParams.get('platform') || 'all',
        enabled: searchParams.get('enabled') !== 'false',
        timestamp: new Date().toISOString()
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  }
}

/**
 * OPTIONS /api/client/videos
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}