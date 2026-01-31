import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const { searchParams } = new URL(request.url);
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/quotes?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false,
        message: 'Failed to fetch quotes' 
      }));
      return NextResponse.json(errorData, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Admin Quotes GET] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
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
    
    const formData = await request.formData();
    
    const quote_text = formData.get('quote_text');
    const sayer_name = formData.get('sayer_name');
    const sayer_title = formData.get('sayer_title');
    const editor_pick = formData.get('editor_pick');
    const sayer_image = formData.get('sayer_image');
    
    if (!quote_text || !sayer_name) {
      return NextResponse.json(
        { success: false, message: 'Quote text and sayer name are required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const backendFormData = new FormData();
    backendFormData.append('quote_text', String(quote_text));
    backendFormData.append('sayer_name', String(sayer_name));
    backendFormData.append('sayer_title', String(sayer_title || ''));
    backendFormData.append('editor_pick', String(editor_pick || 'false'));
    
    if (sayer_image && sayer_image instanceof File) {
      backendFormData.append('sayer_image', sayer_image);
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/quotes`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      body: backendFormData,
      credentials: 'include',
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, message: 'Invalid response from backend' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status, headers: corsHeaders });
    }

    const nextResponse = NextResponse.json(data, { status: 201, headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Admin Quotes POST] Exception:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    const { searchParams } = new URL(request.url);
    
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const quote_id = searchParams.get('quote_id');
    
    if (!quote_id) {
      return NextResponse.json(
        { success: false, message: 'Quote ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const body = await request.json();
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/quotes/${quote_id}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false,
        message: 'Failed to update quote' 
      }));
      return NextResponse.json(errorData, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Admin Quotes PUT] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    const { searchParams } = new URL(request.url);
    
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const quote_id = searchParams.get('quote_id');
    
    if (!quote_id) {
      return NextResponse.json(
        { success: false, message: 'Quote ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/quotes/${quote_id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false,
        message: 'Failed to delete quote' 
      }));
      return NextResponse.json(errorData, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Admin Quotes DELETE] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}