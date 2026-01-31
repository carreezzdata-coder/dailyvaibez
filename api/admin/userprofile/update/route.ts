// frontend/src/app/api/admin/userprofile/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export const dynamic = 'force-dynamic';

function buildHeaders(request: NextRequest, additionalHeaders: Record<string, string> = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  const csrfToken = request.headers.get('x-csrf-token');
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  if (forwardedFor) {
    headers['X-Forwarded-For'] = forwardedFor;
  } else if (realIp) {
    headers['X-Real-IP'] = realIp;
  }

  return headers;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.phone && !body.username) {
      return NextResponse.json({
        success: false,
        message: 'No fields to update'
      }, { status: 400 });
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/admin/userprofile/update`, {
      method: 'PUT',
      headers: buildHeaders(request),
      credentials: 'include',
      body: JSON.stringify(body)
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

      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          message: 'Profile not found'
        }, { status: 404 });
      }

      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          success: false,
          message: errorData.message || 'Username or phone already exists'
        }, { status: 409 });
      }

      const errorText = await response.text().catch(() => '');
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
    console.error('User profile UPDATE API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update user profile'
    }, { status: 500 });
  }
}