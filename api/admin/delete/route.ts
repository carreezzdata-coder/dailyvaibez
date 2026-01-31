import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const { id } = params;

    if (!id || !/^\d+$/.test(id)) {
      console.error('[Admin Delete] Invalid ID format:', id);
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

    console.log('[Admin Delete] Starting delete request:', {
      newsId: id,
      hasCookies: !!cookieHeader,
      hasCsrfToken: !!csrfToken,
      timestamp: new Date().toISOString()
    });

    let body = {};
    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await request.json();
      }
    } catch (error) {
      console.warn('[Admin Delete] No JSON body or parse error:', error);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const backendUrl = `${getBackendUrl()}/api/admin/delete/${id}`;
    console.log('[Admin Delete] Forwarding to backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    });

    const responseTime = Date.now() - startTime;
    console.log('[Admin Delete] Backend response:', {
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      contentType: response.headers.get('content-type')
    });

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Admin Delete] JSON parse error:', {
        error: parseError instanceof Error ? parseError.message : 'Unknown',
        responsePreview: responseText.substring(0, 200)
      });
      
      return NextResponse.json({
        success: false,
        message: 'Invalid response from backend',
        debug: {
          responsePreview: responseText.substring(0, 200)
        }
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    if (!response.ok) {
      console.error('[Admin Delete] Backend error:', {
        status: response.status,
        message: data.message || 'Unknown error'
      });
      
      return NextResponse.json(data, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    console.log('[Admin Delete] Success:', {
      newsId: id,
      responseTime: `${Date.now() - startTime}ms`
    });
    
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
    console.error('[Admin Delete] Unhandled error:', {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${Date.now() - startTime}ms`
    });
    
    return NextResponse.json({
      success: false,
      message: 'Network error - Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        backendUrl: getBackendUrl(),
        timestamp: new Date().toISOString()
      }
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}