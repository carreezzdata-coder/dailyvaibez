import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export const dynamic = 'force-dynamic';

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (endpoint !== 'categories') {
      return NextResponse.json({
        success: false,
        message: 'Invalid endpoint'
      }, { status: 400, headers: corsHeaders });
    }

    const cookieHeader = request.headers.get('Cookie') || '';
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/createposts/categories`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.statusText}`,
        error: errorText
      }, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { 
      status: 200,
      headers: corsHeaders
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: getCorsHeaders(request) });
  }
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/createposts/news`;

    const formData = await request.formData();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: formData
    });

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response Text:', responseText.substring(0, 500));
      return NextResponse.json({
        success: false,
        message: 'Invalid JSON response from backend',
        error: responseText.substring(0, 200)
      }, { status: 500, headers: corsHeaders });
    }

    if (!response.ok) {
      return NextResponse.json(data, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    const nextResponse = NextResponse.json(data, { 
      status: 201,
      headers: corsHeaders 
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: getCorsHeaders(request) });
  }
}

export async function PUT(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    const formData = await request.formData();
    const newsId = formData.get('news_id');
    
    if (!newsId) {
      return NextResponse.json({
        success: false,
        message: 'News ID is required'
      }, { status: 400, headers: corsHeaders });
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/createposts/news/${newsId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: formData
    });

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Invalid response from backend'
      }, { status: 500, headers: corsHeaders });
    }

    if (!response.ok) {
      return NextResponse.json(data, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    const nextResponse = NextResponse.json(data, { 
      status: 200,
      headers: corsHeaders 
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: getCorsHeaders(request) });
  }
}

export async function DELETE(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    const body = await request.json();
    const newsId = body.news_id;
    
    if (!newsId) {
      return NextResponse.json({
        success: false,
        message: 'News ID is required'
      }, { status: 400, headers: corsHeaders });
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/createposts/news/${newsId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Invalid response from backend'
      }, { status: 500, headers: corsHeaders });
    }

    if (!response.ok) {
      return NextResponse.json(data, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    const nextResponse = NextResponse.json(data, { 
      status: 200,
      headers: corsHeaders 
    });
    
    forwardCookies(response, nextResponse);
    return nextResponse;
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: getCorsHeaders(request) });
  }
}