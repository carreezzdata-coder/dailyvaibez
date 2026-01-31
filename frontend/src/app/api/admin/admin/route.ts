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
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'stats';
    const range = searchParams.get('range') || '7d';
    const limit = searchParams.get('limit') || '10';
    
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const backendUrl = getBackendUrl();
    let url = '';

    switch (endpoint) {
      case 'stats':
        url = `${backendUrl}/api/admin/admin/dashboard/stats`;
        break;
      case 'activity':
        url = `${backendUrl}/api/admin/admin/dashboard/recent-activity?limit=${limit}`;
        break;
      case 'performance':
        url = `${backendUrl}/api/admin/admin/dashboard/performance?range=${range}`;
        break;
      case 'permissions':
        url = `${backendUrl}/api/admin/admin/permissions`;
        break;
      case 'profile':
        url = `${backendUrl}/api/admin/admin/profile`;
        break;
      case 'health':
        url = `${backendUrl}/api/admin/admin/system/health`;
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid endpoint' },
          { status: 400, headers: corsHeaders }
        );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
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

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        errorData = { 
          success: false, 
          message: `Backend error: ${response.status} ${response.statusText}`,
          details: responseText.substring(0, 200)
        };
      }
      
      return NextResponse.json(
        errorData,
        { status: response.status, headers: corsHeaders }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Backend returned non-JSON response',
          contentType,
          responsePreview: responseText.substring(0, 200)
        },
        { status: 500, headers: corsHeaders }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to parse backend response',
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const nextResponse = NextResponse.json(data, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error while fetching admin data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function PUT(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!csrfToken) {
      return NextResponse.json(
        { success: false, message: 'CSRF token required' },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json();

    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/admin/profile`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
      'X-CSRF-Token': csrfToken,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to parse backend response',
          error: parseError instanceof Error ? parseError.message : 'Unknown error'
        },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status, headers: corsHeaders }
      );
    }

    const nextResponse = NextResponse.json(data, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error while updating profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}