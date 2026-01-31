// src/app/api/adverts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, buildHeadersFromRequest, forwardCookies } from '@/lib/backend-config';

export async function POST(request: NextRequest) {
  const backendUrl = getBackendUrl();
  
  try {
    const body = await request.json();
    const headers = buildHeadersFromRequest(request);
    
    const response = await fetch(`${backendUrl}/api/adverts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn(`Backend adverts returned ${response.status}`);
      return NextResponse.json(
        { 
          success: true,
          topAds: [],
          bottomAds: [],
          sidebarAds: [],
          inlineAds: [],
          totalAds: 0,
          message: 'No ads available'
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data);
    
    forwardCookies(response, nextResponse);
    
    return nextResponse;
    
  } catch (error: any) {
    console.error('Adverts API error:', error.message);
    
    return NextResponse.json(
      {
        success: true,
        topAds: [],
        bottomAds: [],
        sidebarAds: [],
        inlineAds: [],
        totalAds: 0,
        message: 'Ads temporarily unavailable'
      },
      { status: 200 }
    );
  }
}