import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const slug = params.slug || [];
    const id = slug.length === 1 && /^\d+$/.test(slug[0]) ? slug[0] : null;
    
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    let backendUrl: string;

    if (id) {
      backendUrl = `${getBackendUrl()}/api/admin/retrieveposts/${id}`;
    } else {
      const { searchParams } = new URL(request.url);
      const backendParams = new URLSearchParams();
      
      searchParams.forEach((value, key) => {
        backendParams.set(key, value);
      });
      
      if (!backendParams.has('page')) backendParams.set('page', '1');
      if (!backendParams.has('limit')) backendParams.set('limit', '20');
      if (!backendParams.has('sort')) backendParams.set('sort', 'published_at');
      if (!backendParams.has('order')) backendParams.set('order', 'DESC');

      backendUrl = `${getBackendUrl()}/api/admin/retrieveposts?${backendParams.toString()}`;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { success: false, message: errorText };
      }

      return NextResponse.json(errorData, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    const data = await response.json();
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
    return NextResponse.json({
      success: false,
      message: 'Network error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const slug = params.slug || [];
    
    if (slug.length === 2 && /^\d+$/.test(slug[0]) && slug[1] === 'approval') {
      const id = slug[0];
      
      const cookieHeader = request.headers.get('Cookie') || '';
      const csrfToken = request.headers.get('X-CSRF-Token') || '';

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      };
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

      let body = {};
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({
          success: false,
          message: 'Invalid request body'
        }, { 
          status: 400,
          headers: corsHeaders 
        });
      }

      const backendUrl = `${getBackendUrl()}/api/admin/retrieveposts/${id}/approval`;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json();
      const nextResponse = NextResponse.json(data, { 
        status: response.status,
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });

      forwardCookies(response, nextResponse);
      return nextResponse;
    }

    return NextResponse.json({
      success: false,
      message: 'POST route not found'
    }, { 
      status: 404,
      headers: corsHeaders 
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Request failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const slug = params.slug || [];

    if (slug.length === 2 && /^\d+$/.test(slug[0]) && slug[1] === 'promotions') {
      const id = slug[0];
      
      const cookieHeader = request.headers.get('Cookie') || '';
      const csrfToken = request.headers.get('X-CSRF-Token') || '';

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      };
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

      let body = {};
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({
          success: false,
          message: 'Invalid request body'
        }, { 
          status: 400,
          headers: corsHeaders 
        });
      }

      const backendUrl = `${getBackendUrl()}/api/admin/retrieveposts/${id}/promotions`;

      const response = await fetch(backendUrl, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json();
      const nextResponse = NextResponse.json(data, { 
        status: response.status,
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });

      forwardCookies(response, nextResponse);
      return nextResponse;
    }

    return NextResponse.json({
      success: false,
      message: 'PUT route not found'
    }, { 
      status: 404,
      headers: corsHeaders 
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Request failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const slug = params.slug || [];
    const id = slug.length === 1 && /^\d+$/.test(slug[0]) ? slug[0] : null;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Valid post ID is required'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    let body = {};
    try {
      body = await request.json();
    } catch {}

    const backendUrl = `${getBackendUrl()}/api/admin/retrieveposts/${id}`;

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { 
      status: response.status,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Delete failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}