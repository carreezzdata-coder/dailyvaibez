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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action || !['change', 'reset'].includes(action)) {
      return NextResponse.json({
        success: false,
        message: 'Valid action required (change or reset)'
      }, { status: 400 });
    }

    const body = await request.json();

    if (action === 'change') {
      const { current_password, new_password } = body;

      if (!current_password?.trim() || !new_password?.trim()) {
        return NextResponse.json({
          success: false,
          message: 'Current password and new password are required'
        }, { status: 400 });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!passwordRegex.test(new_password.trim())) {
        return NextResponse.json({
          success: false,
          message: 'Password must be at least 6 characters with uppercase, lowercase, and numbers'
        }, { status: 400 });
      }

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/password/change`, {
        method: 'PUT',
        headers: buildHeaders(request),
        credentials: 'include',
        body: JSON.stringify({ current_password, new_password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            message: errorData.message || 'Authentication required'
          }, { status: 401 });
        }

        if (response.status === 404) {
          return NextResponse.json({
            success: false,
            message: 'User not found'
          }, { status: 404 });
        }

        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          success: false,
          message: errorData.message || `Backend error: ${response.status}`
        }, { status: response.status });
      }

      const data = await response.json();
      const nextResponse = NextResponse.json(data, {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });

      forwardCookies(response, nextResponse);
      return nextResponse;
    }

    if (action === 'reset') {
      const { user_id, new_password } = body;

      if (!user_id || !new_password?.trim()) {
        return NextResponse.json({
          success: false,
          message: 'User ID and new password are required'
        }, { status: 400 });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!passwordRegex.test(new_password.trim())) {
        return NextResponse.json({
          success: false,
          message: 'Password must be at least 6 characters with uppercase, lowercase, and numbers'
        }, { status: 400 });
      }

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/password/reset`, {
        method: 'PUT',
        headers: buildHeaders(request),
        credentials: 'include',
        body: JSON.stringify({ user_id, new_password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          return NextResponse.json({
            success: false,
            message: 'Authentication required'
          }, { status: 401 });
        }

        if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            message: errorData.message || 'Insufficient permissions'
          }, { status: 403 });
        }

        if (response.status === 404) {
          return NextResponse.json({
            success: false,
            message: 'User not found'
          }, { status: 404 });
        }

        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          success: false,
          message: errorData.message || `Backend error: ${response.status}`
        }, { status: response.status });
      }

      const data = await response.json();
      const nextResponse = NextResponse.json(data, {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });

      forwardCookies(response, nextResponse);
      return nextResponse;
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Password API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process password request'
    }, { status: 500 });
  }
}