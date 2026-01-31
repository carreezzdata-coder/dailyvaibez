import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export const dynamic = 'force-dynamic';

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: getCorsHeaders(request) });
}

// GET - Fetch messages
export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const type = searchParams.get('type') || 'all';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    const backendUrl = getBackendUrl();
    
    let url = `${backendUrl}/api/admin/adminmessages`;
    
    if (endpoint === 'unread-count') {
      url = `${backendUrl}/api/admin/adminmessages/unread-count`;
    } else if (endpoint === 'admins-list') {
      url = `${backendUrl}/api/admin/adminmessages/admins-list`;
    } else {
      url = `${backendUrl}/api/admin/adminmessages?type=${type}&page=${page}&limit=${limit}`;
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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { 
        status: response.status, 
        headers: corsHeaders 
      });
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
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

// POST - Send message
export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    if (!csrfToken) {
      return NextResponse.json(
        { success: false, message: 'CSRF token required' },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/adminmessages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { 
      status: response.status,
      headers: corsHeaders
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

// PATCH - Mark as read
export async function PATCH(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('message_id');
    
    if (!messageId) {
      return NextResponse.json(
        { success: false, message: 'Message ID required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/adminmessages/${messageId}/read`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include'
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { 
      status: response.status,
      headers: corsHeaders
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

// DELETE - Delete message
export async function DELETE(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('message_id');
    
    if (!messageId) {
      return NextResponse.json(
        { success: false, message: 'Message ID required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/adminmessages/${messageId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include'
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { 
      status: response.status,
      headers: corsHeaders
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}