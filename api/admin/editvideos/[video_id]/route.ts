import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function PUT(
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
    
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const body = await request.json();
    
    if (!body.admin_id) {
      return NextResponse.json(
        { success: false, message: 'Admin ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/editvideos/${videoId}`;
    
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
        message: 'Failed to update video' 
      }));
      return NextResponse.json(errorData, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}