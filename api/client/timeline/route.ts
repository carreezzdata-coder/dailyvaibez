import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const backendUrl = `${getBackendUrl()}/api/fetchall?page=${page}&limit=${limit}`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    const timelineResponse = NextResponse.json({
      success: true,
      articles: data.news || [],
      pagination: data.pagination || {
        current_page: page,
        per_page: limit,
        has_next: false,
        has_prev: page > 1
      }
    });
    
    forwardCookies(response, timelineResponse);
    return timelineResponse;

  } catch (error) {
    console.error('[Timeline Route] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch timeline content',
      articles: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        has_next: false,
        has_prev: false
      }
    }, { status: 500 });
  }
}