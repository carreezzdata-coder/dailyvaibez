import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies, buildHeadersFromRequest } from '@/lib/backend-config';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    console.log('=== ROUTE API ===');
    console.log('Slug:', slug);
    console.log('Backend URL:', getBackendUrl());
    
    if (!slug) {
      return NextResponse.json({ 
        success: false, 
        message: 'Article slug is required' 
      }, { status: 400 });
    }

    const backendUrl = `${getBackendUrl()}/api/articles/${encodeURIComponent(slug)}`;
    console.log('Fetching from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: buildHeadersFromRequest(request),
      credentials: 'include',
      cache: 'no-store',
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Article not found in backend');
        return NextResponse.json({
          success: false,
          message: 'Article not found'
        }, { status: 404 });
      }
      
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status}`,
        error: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('Backend response structure:', {
      success: data.success,
      hasArticle: !!data.article,
      hasImages: !!data.article?.images,
      imagesCount: data.article?.images?.length || 0,
      hasMedia: !!data.article?.media,
      mediaCount: data.article?.media?.length || 0
    });

    if (!data.success || !data.article) {
      return NextResponse.json({
        success: false,
        message: 'Article data not found'
      }, { status: 404 });
    }

    if (data.article.images && data.article.images.length > 0) {
      console.log('First image:', {
        url: data.article.images[0].image_url,
        caption: data.article.images[0].image_caption,
        position: data.article.images[0].position
      });
    }
    
    if (data.article.media && data.article.media.length > 0) {
      console.log('First media:', {
        platform: data.article.media[0].platform,
        kind: data.article.media[0].kind,
        url: data.article.media[0].video_url || data.article.media[0].post_url
      });
    }

    const nextResponse = NextResponse.json({
      success: true,
      article: data.article,
      related_articles: data.related_articles || []
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'max-age=900',
        'Vary': 'Accept-Encoding'
      }
    });

    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('=== ROUTE API ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await request.json();
    const { action, ...otherData } = body;

    console.log('=== ARTICLE POST ACTION ===');
    console.log('Slug:', slug);
    console.log('Action:', action);

    if (!action || !slug) {
      return NextResponse.json({
        success: false,
        message: 'Action and slug are required'
      }, { status: 400 });
    }

    let endpoint = '';
    
    switch (action) {
      case 'view':
        endpoint = `${getBackendUrl()}/api/articles/${encodeURIComponent(slug)}/view`;
        break;
      case 'like':
        endpoint = `${getBackendUrl()}/api/articles/${encodeURIComponent(slug)}/like`;
        break;
      case 'share':
        endpoint = `${getBackendUrl()}/api/articles/${encodeURIComponent(slug)}/share`;
        break;
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }

    console.log('Calling backend:', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: buildHeadersFromRequest(request, { 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(otherData),
      cache: 'no-store'
    });

    const data = await response.json();
    
    const nextResponse = NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('=== ARTICLE POST ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Action failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}