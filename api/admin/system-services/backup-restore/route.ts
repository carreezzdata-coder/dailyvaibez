// FILE: frontend/src/app/api/admin/system-services/backup-restore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/systemservices/backup-restore`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Cookie': cookieHeader, 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status, headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const body = await request.json();
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/systemservices/backup-restore`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Cookie': cookieHeader, 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status, headers: corsHeaders });
    forwardCookies(response, nextResponse);
    return nextResponse;
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}