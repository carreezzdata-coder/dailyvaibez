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

export async function GET(request: NextRequest) {
  try {
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/userroles`;

    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(request),
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401) return handleError(401, 'Authentication required', { authenticated: false, users: [] });
      if (response.status === 403) return handleError(403, 'Insufficient permissions', { users: [] });
      return handleError(response.status, `Backend error: ${response.status}`, { users: [] });
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
    console.error('User roles GET error:', error);
    return handleError(500, 'Failed to fetch user roles', { users: [] });
  }
}