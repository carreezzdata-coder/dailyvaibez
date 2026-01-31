import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export const dynamic = 'force-dynamic';

function buildHeaders(request: NextRequest) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) headers['Cookie'] = cookieHeader;
  
  const csrfToken = request.headers.get('x-csrf-token');
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  if (forwardedFor) headers['X-Forwarded-For'] = forwardedFor;
  else if (realIp) headers['X-Real-IP'] = realIp;
  
  return headers;
}

function handleError(status: number, message: string, data = {}) {
  return NextResponse.json({ success: false, message, ...data }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return handleError(400, 'Valid user ID is required');
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/admin/userroles/${id}`, {
      method: 'GET',
      headers: buildHeaders(request),
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401) return handleError(401, 'Authentication required', { authenticated: false });
      if (response.status === 403) return handleError(403, 'Insufficient permissions');
      if (response.status === 404) return handleError(404, 'User not found');
      return handleError(response.status, `Backend error: ${response.status}`);
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, {
      status: 200,
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate', 
        'Pragma': 'no-cache', 
        'Expires': '0' 
      }
    });

    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('User GET error:', error);
    return handleError(500, 'Failed to fetch user data');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return handleError(400, 'Valid user ID is required');
    }

    const body = await request.json();
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/api/admin/userroles/${id}`, {
      method: 'PUT',
      headers: buildHeaders(request),
      credentials: 'include',
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      if (response.status === 401) return handleError(401, 'Authentication required', { authenticated: false });
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        return handleError(403, errorData.message || 'Insufficient permissions');
      }
      if (response.status === 404) return handleError(404, 'User not found');
      
      const errorData = await response.json().catch(() => ({}));
      return handleError(response.status, errorData.message || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, {
      status: 200,
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate', 
        'Pragma': 'no-cache', 
        'Expires': '0' 
      }
    });

    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('User PUT error:', error);
    return handleError(500, 'Failed to update user');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return handleError(400, 'Valid user ID is required');
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/admin/userroles/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(request),
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401) return handleError(401, 'Authentication required', { authenticated: false });
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        return handleError(403, errorData.message || 'Insufficient permissions');
      }
      if (response.status === 404) return handleError(404, 'User not found');
      
      const errorData = await response.json().catch(() => ({}));
      return handleError(response.status, errorData.message || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, {
      status: 200,
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate', 
        'Pragma': 'no-cache', 
        'Expires': '0' 
      }
    });

    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('User DELETE error:', error);
    return handleError(500, 'Failed to delete user');
  }
}