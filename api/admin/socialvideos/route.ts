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
    
    const title = formData.get('title');
    const video_url = formData.get('video_url');
    const admin_id = formData.get('admin_id');
    
    if (!title || !video_url) {
      return NextResponse.json(
        { success: false, message: 'Title and video URL are required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (!admin_id) {
      return NextResponse.json(
        { success: false, message: 'Admin ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/socialvideos`;
    
    const backendFormData = new FormData();
    
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      body: backendFormData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false,
        message: 'Failed to create video' 
      }));
      return NextResponse.json(errorData, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: 201, headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      backendUrl: getBackendUrl()
    }, { status: 500, headers: corsHeaders });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const { searchParams } = new URL(request.url);
    
    const videoId = searchParams.get('video_id');
    
    const backendUrl = getBackendUrl();
    const url = videoId 
      ? `${backendUrl}/api/admin/socialvideos/${videoId}`
      : `${backendUrl}/api/admin/socialvideos`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false,
        message: 'Failed to fetch video' 
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