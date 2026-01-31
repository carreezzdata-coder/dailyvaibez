import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export const dynamic = 'force-dynamic';

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const { searchParams, pathname } = new URL(request.url);
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const backendUrl = getBackendUrl();
    const endpoint = pathname.split('/').pop();
    
    let url: string;
    if (endpoint === 'pending') {
      url = `${backendUrl}/api/admin/postapproval/pending`;
    } else if (endpoint === 'all') {
      const status = searchParams.get('status') || '';
      const limit = searchParams.get('limit') || '50';
      const offset = searchParams.get('offset') || '0';
      url = `${backendUrl}/api/admin/postapproval/all?status=${status}&limit=${limit}&offset=${offset}`;
    } else if (endpoint && /^\d+$/.test(endpoint)) {
      url = `${backendUrl}/api/admin/postapproval/details/${endpoint}`;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid endpoint' },
        { status: 400, headers: corsHeaders }
      );
    }

    const headers: HeadersInit = {
      'Cookie': cookieHeader,
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        success: false,
        message: `Backend error: ${response.status} ${response.statusText}`
      }));
      
      return NextResponse.json(
        errorData,
        { status: response.status, headers: corsHeaders }
      );
    }

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { 
      status: 200,
      headers: corsHeaders
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch approval data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const { pathname } = new URL(request.url);
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const pathParts = pathname.split('/');
    const action = pathParts[pathParts.length - 2];
    const newsId = pathParts[pathParts.length - 1];

    if (!newsId || !/^\d+$/.test(newsId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid news ID' },
        { status: 400, headers: corsHeaders }
      );
    }

    const backendUrl = getBackendUrl();
    let url: string;
    
    if (action === 'submit') {
      url = `${backendUrl}/api/admin/postapproval/submit/${newsId}`;
    } else if (action === 'approve') {
      url = `${backendUrl}/api/admin/postapproval/approve/${newsId}`;
    } else if (action === 'reject') {
      url = `${backendUrl}/api/admin/postapproval/reject/${newsId}`;
    } else if (action === 'request-changes') {
      url = `${backendUrl}/api/admin/postapproval/request-changes/${newsId}`;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await request.json();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { success: false, message: responseText };
      }
      return NextResponse.json(errorData, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    const data = JSON.parse(responseText);
    const nextResponse = NextResponse.json(data, { 
      status: 200,
      headers: corsHeaders 
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process approval action',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}