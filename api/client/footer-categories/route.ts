// frontend/src/app/api/client/footer-categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, createErrorResponse, createSuccessResponse } from '@/lib/backend-config';

export async function GET(request: NextRequest) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const backendUrl = getBackendUrl();
    const fullUrl = `${backendUrl}/api/footer-categories`;

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store',
      });
    } catch (fetchError) {
      return createErrorResponse(
        'Could not connect to backend server',
        503,
        {
          groups: {},
          all_categories: [],
          total_categories: 0,
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return createErrorResponse(
        `Failed to fetch footer categories: ${response.status}`,
        response.status,
        {
          groups: {},
          all_categories: [],
          total_categories: 0,
          backendError: errorText.substring(0, 200),
        }
      );
    }

    let data;
    try {
      data = await response.json();
      
      if (!data.success) {
        console.warn('Backend returned success: false');
      }
      
      if (!data.groups || typeof data.groups !== 'object') {
        data.groups = {};
      }
      
    } catch (jsonError) {
      return createErrorResponse(
        'Invalid response format from backend',
        502,
        {
          groups: {},
          all_categories: [],
          total_categories: 0,
        }
      );
    }
    
    const nextResponse = createSuccessResponse(data);
    forwardCookies(response, nextResponse);

    return nextResponse;

  } catch (error) {
    return createErrorResponse(
      'Internal server error',
      500,
      {
        groups: {},
        all_categories: [],
        total_categories: 0,
        detail: error instanceof Error ? error.message : 'Unknown error',
      }
    );
  }
}