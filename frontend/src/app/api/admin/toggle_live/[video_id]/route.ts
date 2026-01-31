import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ video_id: string }> }
) {
  try {
    const params = await context.params;
    const videoId = params.video_id;
    
    console.log('[Toggle Live] Video ID:', videoId);
    
    if (!videoId) {
      return NextResponse.json({
        success: false,
        message: 'Video ID is required'
      }, { status: 400, headers: corsHeaders });
    }
    
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    console.log('[Toggle Live] CSRF Token present:', !!csrfToken);
    console.log('[Toggle Live] Cookie present:', !!cookieHeader);
    
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const body = await request.json();
    console.log('[Toggle Live] Request body:', body);
    
    if (!body.admin_id) {
      return NextResponse.json(
        { success: false, message: 'Admin ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/toggle-live/${videoId}/toggle-live`;
    
    console.log('[Toggle Live] Forwarding to backend:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    console.log('[Toggle Live] Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: 'Failed to toggle live status' 
      }));
      console.error('[Toggle Live] Backend error:', errorData);
      return NextResponse.json(errorData, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    console.log('[Toggle Live] Success:', data);
    
    const nextResponse = NextResponse.json(data, { headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Toggle Live] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      backendUrl: getBackendUrl()
    }, { status: 500, headers: corsHeaders });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ video_id: string }> }
) {
  try {
    const params = await context.params;
    const videoId = params.video_id;
    
    if (!videoId) {
      return NextResponse.json({
        success: false,
        message: 'Video ID is required'
      }, { status: 400, headers: corsHeaders });
    }
    
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/toggle-live/${videoId}/live-status`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: 'Failed to get live status' 
      }));
      return NextResponse.json(errorData, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Get Live Status] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}