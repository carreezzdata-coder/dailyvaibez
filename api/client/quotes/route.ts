import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

export async function GET(request: NextRequest) {
  try {
    console.log('[Client Quotes Route] Fetching quotes from backend');
    
    const backendUrl = `${getBackendUrl()}/api/clientquotes`;
    console.log('[Client Quotes Route] Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: buildHeadersFromRequest(request),
      credentials: 'include',
      cache: 'no-store',
    });

    console.log('[Client Quotes Route] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Client Quotes Route] Backend error:', errorText);
      
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status}`,
        error: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('[Client Quotes Route] Response structure:', {
      success: data.success,
      quotesCount: data.quotes?.length || 0,
      strikingCount: data.strikingQuotes?.length || 0,
      trendingCount: data.trendingQuotes?.length || 0
    });

    if (!data.success) {
      return NextResponse.json({
        success: false,
        message: 'Quotes data not found'
      }, { status: 404 });
    }

    const nextResponse = NextResponse.json({
      success: true,
      quotes: data.quotes || [],
      strikingQuotes: data.strikingQuotes || [],
      trendingQuotes: data.trendingQuotes || []
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'max-age=900',
        'Vary': 'Accept-Encoding'
      }
    });

    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Client Quotes Route] Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}