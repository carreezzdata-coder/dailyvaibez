// app/api/admin/edit/[id]/route.ts
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const { id } = params;
    
    console.log('[Edit Route GET] Request for ID:', id);
    
    if (!id || isNaN(Number(id))) {
      console.log('[Edit Route GET] Invalid ID:', id);
      return NextResponse.json(
        { success: false, message: 'Valid post ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/edit/news/${id}`;
    
    console.log('[Edit Route GET] Fetching from:', url);
    
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';

    if (!cookieHeader) {
      console.log('[Edit Route GET] No cookie header found');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log('[Edit Route GET] Response status:', response.status);
    console.log('[Edit Route GET] Response preview:', responseText.substring(0, 200));

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Edit Route GET] Failed to parse error response:', parseError);
        errorData = { 
          success: false, 
          message: `Backend error: ${response.status} ${response.statusText}`,
          details: responseText.substring(0, 200)
        };
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Post not found' },
          { status: 404, headers: corsHeaders }
        );
      }
      
      return NextResponse.json(
        errorData,
        { status: response.status, headers: corsHeaders }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('[Edit Route GET] Non-JSON response, content-type:', contentType);
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
      console.log('[Edit Route GET] Successfully parsed response');
    } catch (parseError) {
      console.error('[Edit Route GET] JSON parse error:', parseError);
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
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Edit Route GET] Request timeout');
      return NextResponse.json({
        success: false,
        message: 'Request timeout - server took too long to respond',
        error: 'Timeout after 30 seconds'
      }, { status: 504, headers: getCorsHeaders(request) });
    }
    
    console.error('[Edit Route GET] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error while fetching data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const { id } = params;
    
    console.log('[Edit Route PUT] Update request for ID:', id);
    
    if (!id || isNaN(Number(id))) {
      console.log('[Edit Route PUT] Invalid ID:', id);
      return NextResponse.json(
        { success: false, message: 'Valid post ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    if (!cookieHeader) {
      console.log('[Edit Route PUT] No cookie header');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!csrfToken) {
      console.log('[Edit Route PUT] No CSRF token');
      return NextResponse.json(
        { success: false, message: 'CSRF token required' },
        { status: 403, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    
    // Log form data for debugging
    console.log('[Edit Route PUT] Form data keys:', Array.from(formData.keys()));

    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/edit/news/${id}`;
    
    console.log('[Edit Route PUT] Sending to:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const headers: HeadersInit = {
      'Cookie': cookieHeader,
      'X-CSRF-Token': csrfToken,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log('[Edit Route PUT] Response status:', response.status);
    console.log('[Edit Route PUT] Response preview:', responseText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('[Edit Route PUT] Successfully parsed response');
    } catch (parseError) {
      console.error('[Edit Route PUT] JSON parse error:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to parse backend response',
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          responsePreview: responseText.substring(0, 200)
        },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      console.error('[Edit Route PUT] Backend error:', data);
      return NextResponse.json(
        data,
        { status: response.status, headers: corsHeaders }
      );
    }

    console.log('[Edit Route PUT] Success:', data.message);

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
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Edit Route PUT] Request timeout');
      return NextResponse.json({
        success: false,
        message: 'Request timeout - server took too long to respond',
        error: 'Timeout after 120 seconds'
      }, { status: 504, headers: getCorsHeaders(request) });
    }
    
    console.error('[Edit Route PUT] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error while updating post',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}