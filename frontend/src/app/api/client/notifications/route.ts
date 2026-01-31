// frontend/src/app/api/client/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    let backendUrl = `${getBackendUrl()}/api/notifications`;
    const params = new URLSearchParams();

    if (action === 'list' || !action) {
      params.append('limit', limit);
      if (unreadOnly) {
        params.append('unread_only', 'true');
      }
      backendUrl += `?${params.toString()}`;
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (request.headers.has('authorization')) {
      headers.set('Authorization', request.headers.get('authorization')!);
    }
    if (request.headers.has('cookie')) {
      headers.set('Cookie', request.headers.get('cookie')!);
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
      cache: 'no-cache'
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status}`,
        error: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data);
    
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('Notifications GET error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    let backendUrl = `${getBackendUrl()}/api/notifications`;

    if (action === 'mark-read' && id) {
      backendUrl += `/${id}/read`;
    } else if (action === 'mark-all-read') {
      backendUrl += '/read-all';
    } else if (action === 'create') {
      backendUrl += '/create';
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid action'
      }, { status: 400 });
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (request.headers.has('authorization')) {
      headers.set('Authorization', request.headers.get('authorization')!);
    }
    if (request.headers.has('cookie')) {
      headers.set('Cookie', request.headers.get('cookie')!);
    }

    let body = null;
    if (action === 'create') {
      const requestBody = await request.json();
      body = JSON.stringify(requestBody);
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status}`,
        error: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data);
    
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('Notifications POST error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process notification action',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    let backendUrl = `${getBackendUrl()}/api/notifications`;

    if (action === 'delete' && id) {
      backendUrl += `/${id}`;
    } else if (action === 'clear-all') {
      backendUrl += '/clear-all';
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid action'
      }, { status: 400 });
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (request.headers.has('authorization')) {
      headers.set('Authorization', request.headers.get('authorization')!);
    }
    if (request.headers.has('cookie')) {
      headers.set('Cookie', request.headers.get('cookie')!);
    }

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status}`,
        error: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data);
    
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('Notifications DELETE error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to delete notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}