import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

export async function GET(request: NextRequest) {
  try {
    console.log('[Client Quotes Route] Starting fetch from backend');
    
    const backendUrl = `${getBackendUrl()}/api/clientquotes`;
    console.log('[Client Quotes Route] Backend URL:', backendUrl);
    
    const headers = buildHeadersFromRequest(request);
    console.log('[Client Quotes Route] Request headers:', Object.keys(headers));
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
      cache: 'no-store',
    });

    console.log('[Client Quotes Route] Backend response status:', response.status);
    console.log('[Client Quotes Route] Backend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Client Quotes Route] Backend error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status} ${response.statusText}`,
        error: errorText,
        quotes: [],
        strikingQuotes: [],
        trendingQuotes: []
      }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('[Client Quotes Route] Backend response data structure:', {
      success: data.success,
      hasQuotes: !!data.quotes,
      quotesIsArray: Array.isArray(data.quotes),
      quotesCount: data.quotes?.length || 0,
      strikingCount: data.strikingQuotes?.length || 0,
      trendingCount: data.trendingQuotes?.length || 0,
      dataKeys: Object.keys(data),
      firstQuotePreview: data.quotes?.[0] ? {
        id: data.quotes[0].quote_id,
        text: data.quotes[0].quote_text?.substring(0, 50),
        sayer: data.quotes[0].sayer_name
      } : 'No quotes'
    });

    if (!data.success) {
      console.error('[Client Quotes Route] Backend returned success: false');
      return NextResponse.json({
        success: false,
        message: data.message || 'Quotes data not found',
        quotes: [],
        strikingQuotes: [],
        trendingQuotes: []
      }, { status: 404 });
    }

    const quotes = Array.isArray(data.quotes) ? data.quotes : [];
    const strikingQuotes = Array.isArray(data.strikingQuotes) ? data.strikingQuotes : [];
    const trendingQuotes = Array.isArray(data.trendingQuotes) ? data.trendingQuotes : [];

    console.log('[Client Quotes Route] Processed data:', {
      quotesCount: quotes.length,
      strikingCount: strikingQuotes.length,
      trendingCount: trendingQuotes.length
    });

    if (quotes.length === 0) {
      console.warn('[Client Quotes Route] Warning: No quotes in response array');
    }

    const nextResponse = NextResponse.json({
      success: true,
      quotes: quotes,
      strikingQuotes: strikingQuotes,
      trendingQuotes: trendingQuotes
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'max-age=900',
        'Vary': 'Accept-Encoding'
      }
    });

    forwardCookies(response, nextResponse);
    
    console.log('[Client Quotes Route] Successfully returning data');
    return nextResponse;

  } catch (error) {
    console.error('[Client Quotes Route] Caught error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      quotes: [],
      strikingQuotes: [],
      trendingQuotes: []
    }, { status: 500 });
  }
}