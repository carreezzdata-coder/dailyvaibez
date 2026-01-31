// frontend/src/app/api/admin/permissions/route.ts
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'me';
    const action = searchParams.get('action');
    
    const backendUrl = getBackendUrl();
    let url = `${backendUrl}/api/admin/permissions`;
    
    if (endpoint === 'check' && action) {
      url = `${backendUrl}/api/admin/permissions/check/${action}`;
    } else if (endpoint === 'me') {
      url = `${backendUrl}/api/admin/permissions/me`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(request),
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ 
          success: false, 
          message: 'Authentication required',
          authenticated: false
        }, { status: 401 });
      }
      
      if (response.status === 403) {
        return NextResponse.json({ 
          success: false, 
          message: 'Insufficient permissions'
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: `Backend error: ${response.status}`
      }, { status: response.status });
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
    console.error('Permissions GET error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch permissions'
    }, { status: 500 });
  }
}