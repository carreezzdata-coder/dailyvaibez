// frontend/src/app/api/client/geo/route.ts
// frontend/src/app/api/client/geo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, buildHeadersFromRequest, forwardCookies, safeFetch } from '@/lib/backend-config';

const isDev = process.env.NODE_ENV === 'development';
const ENV_PREFIX = isDev ? '🔵 [DEV]' : '🟢 [PROD]';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'current';
    
    const backendUrl = getBackendUrl();
    const headers = buildHeadersFromRequest(request);

    let endpoint = '';
    let queryParams = '';

    switch (action) {
      case 'current':
        endpoint = '/api/client/geo/current';
        break;
      
      case 'stats':
        endpoint = '/api/client/geo/stats';
        break;
      
      case 'today':
        endpoint = '/api/client/geo/today';
        break;
      
      case 'trends':
        const days = searchParams.get('days') || '7';
        endpoint = '/api/client/geo/trends';
        queryParams = `?days=${days}`;
        break;
      
      case 'county':
        const countyName = searchParams.get('county');
        if (!countyName) {
          return NextResponse.json(
            { success: false, error: 'County name required' },
            { status: 400 }
          );
        }
        endpoint = `/api/client/geo/county/${encodeURIComponent(countyName)}`;
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const response = await safeFetch(`${backendUrl}${endpoint}${queryParams}`, {
      method: 'GET',
      headers,
      credentials: 'include',
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    forwardCookies(response, nextResponse);

    if (data.cacheHeaders) {
      Object.entries(data.cacheHeaders).forEach(([key, value]) => {
        nextResponse.headers.set(key, value as string);
      });
    }

    return nextResponse;
  } catch (error) {
    console.error(`${ENV_PREFIX} ❌ Geo GET error:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch geo data',
        location: { county: null, town: null, category: 'UNKNOWN' }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deviceId, county, town, category } = body;
    
    const backendUrl = getBackendUrl();
    const headers = buildHeadersFromRequest(request);

    let endpoint = '';
    let payload = body;

    switch (action) {
      case 'register':
        endpoint = '/api/client/geo/register';
        payload = { deviceId, county, town, category };
        break;
      
      case 'cleanup':
        endpoint = '/api/client/geo/cleanup';
        payload = {};
        break;
      
      case 'archive':
        endpoint = '/api/client/geo/archive';
        payload = {};
        break;
      
      case 'reset-daily':
        endpoint = '/api/client/geo/reset-daily';
        payload = {};
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const response = await safeFetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    forwardCookies(response, nextResponse);

    return nextResponse;
  } catch (error) {
    console.error(`${ENV_PREFIX} ❌ Geo POST error:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process geo request'
      },
      { status: 500 }
    );
  }
}