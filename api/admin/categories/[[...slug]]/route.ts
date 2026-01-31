// C:\Projects\Daily Vaibe\frontend\src\app\api\admin\categories\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    const headers: HeadersInit = {
      'Cookie': cookieHeader,
      'Content-Type': 'application/json',
    };
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    const backendUrl = getBackendUrl();
    
    // CLEAN: Just proxy to backend /api/admin/categories
    const url = queryString 
      ? `${backendUrl}/api/admin/categories?${queryString}` 
      : `${backendUrl}/api/admin/categories`;
    
    console.log(`[Categories Route] Proxying GET to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store'
    });

    const responseText = await response.text();
    console.log(`[Categories Route] Backend response status: ${response.status}`);
    console.log(`[Categories Route] Response length: ${responseText.length} chars`);
    
    if (!response.ok) {
      console.error(`[Categories Route] Backend error: ${responseText.substring(0, 300)}`);
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { 
          success: false, 
          message: 'Failed to fetch categories',
          details: responseText.substring(0, 200)
        };
      }
      
      return NextResponse.json(errorData, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Categories Route] JSON parse error:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Invalid JSON from backend',
        groups: {},
        total_categories: 0
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Log what we got
    if (data.success && data.groups) {
      const groupKeys = Object.keys(data.groups);
      let totalCats = 0;
      groupKeys.forEach(key => {
        const catCount = data.groups[key]?.categories?.length || 0;
        totalCats += catCount;
      });
      console.log(`[Categories Route] Success! ${groupKeys.length} groups, ${totalCats} categories`);
      console.log(`[Categories Route] Groups: ${groupKeys.join(', ')}`);
    } else {
      console.warn('[Categories Route] Response missing success or groups');
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
    console.error('[Categories Route] Fatal error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Network error connecting to backend',
        groups: {},
        total_categories: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}