// frontend/src/app/api/client/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

export async function GET(request: NextRequest) {
  console.log('=== CATEGORIES ROUTE DEBUG START ===');
  console.log('Full URL:', request.url);
  
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    
    console.log('Extracted params:', { slug, page, limit });
    console.log('Backend base URL:', getBackendUrl());
    
    if (!slug) {
      console.log('ERROR: No slug provided');
      return NextResponse.json({
        success: false,
        message: 'Category slug is required'
      }, { status: 400 });
    }

    const backendUrl = `${getBackendUrl()}/api/news/category/${encodeURIComponent(slug)}?page=${page}&limit=${limit}`;
    console.log('Calling backend URL:', backendUrl);

    const headers = buildHeadersFromRequest(request);
    console.log('Request headers:', Object.fromEntries(new Headers(headers).entries()));

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
      cache: 'no-store'
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Backend error response body:', errorText);
      
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          message: `Category '${slug}' not found`,
          news: [],
          pagination: {
            current_page: 1,
            per_page: parseInt(limit),
            total_news: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false
          }
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status}`,
        error: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend response data keys:', Object.keys(data));
    console.log('News count:', data.news?.length || 0);
    console.log('=== CATEGORIES ROUTE DEBUG END ===');
    
    const nextResponse = NextResponse.json(data);
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('=== CATEGORIES ROUTE ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}