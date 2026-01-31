import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        message: 'Valid news ID is required'
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

    const backendUrl = `${getBackendUrl()}/api/admin/customize/${id}`;

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
        'Cache-Control': 'no-cache, no-store, must-revalidate'
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        message: 'Valid news ID is required'
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
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Invalid request body'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const backendUrl = `${getBackendUrl()}/api/admin/customize/${id}`;

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { 
        status: response.status,
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    const nextResponse = NextResponse.json(data, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Customize API] Error:', error);
    
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