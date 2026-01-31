import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    const { searchParams } = new URL(request.url);
    
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const quote_id = searchParams.get('quote_id');
    
    if (!quote_id) {
      return NextResponse.json(
        { success: false, message: 'Quote ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/retrievequotes/${quote_id}`;
    
    console.log('[Admin Delete Quote] Deleting quote:', quote_id);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    });

    console.log('[Admin Delete Quote] Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false,
        message: 'Failed to delete quote' 
      }));
      return NextResponse.json(errorData, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Admin Delete Quote] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}