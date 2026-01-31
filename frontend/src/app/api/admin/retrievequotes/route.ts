import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    const { searchParams } = new URL(request.url);
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/retrievequotes?${searchParams.toString()}`;
    
    console.log('[Admin Retrieve Quotes] Fetching from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store'
    });

    console.log('[Admin Retrieve Quotes] Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false,
        message: 'Failed to fetch quotes' 
      }));
      return NextResponse.json(errorData, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    
    console.log('[Admin Retrieve Quotes] Retrieved quotes:', data.total || 0);
    
    const nextResponse = NextResponse.json(data, { headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Admin Retrieve Quotes] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}