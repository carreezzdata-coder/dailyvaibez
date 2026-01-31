export function getBackendUrl(): string {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production' ||
    process.env.RENDER === 'true';
  
  const url = isProduction
    ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.dailyvaibe.com')
    : 'http://localhost:5000';
  
  return url.replace(/\/$/, '');
}

export function createBackendHeaders(sessionCookie?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'DailyVaibe-Frontend/2.0',
  };

  if (sessionCookie) {
    headers['Cookie'] = `dailyvaibe_public_session=${sessionCookie}`;
  }

  return headers;
}

export async function fastFetch(url: string, options: RequestInit, timeout: number = 5000): Promise<Response | null> {
  // Skip network calls during build if backend is unreachable
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('[BUILD] Skipping network call during build:', url);
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 30 }
    });
    
    clearTimeout(timeoutId);
    return response.ok ? response : null;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[FETCH ERROR]', url, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production' ||
    process.env.RENDER === 'true';
  
  if (!isProduction) {
    return `http://localhost:5000/${cleanUrl}`;
  }
  
  const cdnUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://api.dailyvaibe.com';
  return `${cdnUrl.replace(/\/$/, '')}/${cleanUrl}`;
}

function classifyMediaKind(platform: string, postType: string): 'video' | 'post' {
  const videoPlatforms = ['youtube', 'vimeo', 'dailymotion', 'tiktok'];
  const videoKeywords = ['video', 'reel', 'short'];
  
  const platformLower = (platform || '').toLowerCase();
  const typeLower = (postType || '').toLowerCase();
  
  const isVideoPlatform = videoPlatforms.some(vp => platformLower.includes(vp));
  const isVideoType = videoKeywords.some(vk => typeLower.includes(vk));
  
  return (isVideoPlatform || isVideoType) ? 'video' : 'post';
}

function normalizeArticleImages(images: any[]): any[] {
  if (!Array.isArray(images) || images.length === 0) return [];
  
  return images
    .map((img: any, idx: number) => ({
      image_url: getImageUrl(img.image_url),
      image_caption: img.image_caption || img.caption || '',
      alt_text: img.alt_text || img.image_caption || '',
      is_featured: Boolean(img.is_featured),
      position: img.position ?? img.display_order ?? idx
    }))
    .sort((a, b) => a.position - b.position);
}

function normalizeArticleMedia(mediaArray: any[]): any[] {
  if (!Array.isArray(mediaArray) || mediaArray.length === 0) return [];
  
  return mediaArray
    .map((item: any, idx: number) => ({
      kind: classifyMediaKind(item.platform || '', item.post_type || ''),
      video_url: item.post_url || item.video_url || item.url || '',
      platform: (item.platform || 'unknown').toLowerCase(),
      embed_code: item.embed_code || item.embed_html || item.oembed_html || '',
      caption: item.caption || item.post_text || '',
      position: item.position ?? item.display_order ?? idx,
      thumbnail_url: getImageUrl(item.thumbnail_url),
      author_name: item.author_name || '',
      author_handle: item.author_handle || ''
    }))
    .filter(item => item.video_url)
    .sort((a, b) => a.position - b.position);
}

export function normalizeArticle(article: any): any {
  let images: any[] = [];
  if (Array.isArray(article.images) && article.images.length > 0) {
    images = normalizeArticleImages(article.images);
  }
  
  let media: any[] = [];
  const possibleMediaKeys = ['media', 'social_media', 'social_videos', 'all_videos'];
  
  for (const key of possibleMediaKeys) {
    if (Array.isArray(article[key]) && article[key].length > 0) {
      media = normalizeArticleMedia(article[key]);
      break;
    }
  }
  
  const featuredImage = images.find(img => img.is_featured) || images[0];
  const mainImageUrl = getImageUrl(article.image_url) || 
                       featuredImage?.image_url || 
                       '/images/default-article.jpg';

  return {
    news_id: article.news_id || 0,
    title: article.title || 'Untitled',
    excerpt: article.excerpt || article.meta_description || '',
    slug: article.slug || '',
    image_url: mainImageUrl,
    images,
    media,
    published_at: article.published_at || new Date().toISOString(),
    reading_time: article.reading_time || 3,
    views: article.views || 0,
    likes_count: article.likes_count || 0,
    comments_count: article.comments_count || 0,
    share_count: article.share_count || 0,
    first_name: article.first_name || article.author?.first_name || 'Daily Vaibe',
    last_name: article.last_name || article.author?.last_name || 'Editor',
    category_name: article.category_name || article.category?.name || 'Uncategorized',
    category_slug: article.category_slug || article.category?.slug || 'uncategorized',
    category_color: article.category_color || article.category?.color || '',
    meta_description: article.meta_description || '',
    tags: Array.isArray(article.tags) ? article.tags : 
          (typeof article.tags === 'string' ? article.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
    content: article.content || '',
    processed_content: article.processed_content || '',
    images_data: article.images_data || [],
    social_videos: article.social_videos || [],
    additional_images: article.additional_images || [],
    quotes_data: article.quotes_data || [],
    author_id: article.author_id,
    category_id: article.category_id,
  };
}