interface VideoAPIResponse {
  success: boolean;
  message?: string;
  articles?: any[];
  count?: number;
  total_videos?: number;
  meta?: {
    limit?: number;
    timestamp?: string;
  };
}

interface PlatformsAPIResponse {
  success: boolean;
  message?: string;
  platforms?: any[];
  timestamp?: string;
}

interface VideosContent {
  articles: any[];
  count: number;
  total_videos: number;
  meta: {
    limit: number;
    platform: string;
    timestamp: string;
  };
}

interface VideoPlatformsResponse {
  platforms: any[];
  timestamp: string;
}

function getBackendUrl(): string {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production' ||
    process.env.RENDER === 'true';
  
  const url = isProduction
    ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.dailyvaibe.com')
    : 'http://localhost:5000';
  
  return url.replace(/\/$/, '');
}

async function fastFetch(url: string, options: RequestInit, timeout: number = 5000): Promise<Response | null> {
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

function normalizeArticle(article: any): any {
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

function normalizeVideos(articles: any[]): any[] {
  if (!Array.isArray(articles)) return [];
  return articles.map(normalizeArticle);
}

export async function fetchVideosContent(
  page: number = 1,
  limit: number = 12,
  platform: string = 'all'
): Promise<VideosContent> {
  try {
    const offset = (page - 1) * limit;
    
    let url = `${getBackendUrl()}/api/videos/articles?limit=${limit}&offset=${offset}`;
    if (platform !== 'all') {
      url += `&platform=${encodeURIComponent(platform)}`;
    }

    const response = await fastFetch(url, {
      next: { 
        revalidate: 300,
        tags: ['videos', `videos-${platform}`]
      }
    });

    if (!response) {
      throw new Error('No response from server');
    }

    const data: VideoAPIResponse = await response.json();

    if (!data || !data.success) {
      throw new Error(data?.message || 'Failed to fetch videos');
    }

    const normalizedArticles = normalizeVideos(data.articles || []);

    return {
      articles: normalizedArticles,
      count: data.count || normalizedArticles.length,
      total_videos: data.total_videos || 0,
      meta: {
        limit: data.meta?.limit || limit,
        platform: platform,
        timestamp: data.meta?.timestamp || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[SERVER DATA] Error fetching videos:', error);
    
    return {
      articles: [],
      count: 0,
      total_videos: 0,
      meta: {
        limit,
        platform,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export async function fetchVideoPlatforms(): Promise<VideoPlatformsResponse> {
  try {
    const url = `${getBackendUrl()}/api/videos/platforms`;

    const response = await fastFetch(url, {
      next: { 
        revalidate: 600,
        tags: ['video-platforms']
      }
    });

    if (!response) {
      throw new Error('No response from server');
    }

    const data: PlatformsAPIResponse = await response.json();

    if (!data || !data.success) {
      throw new Error(data?.message || 'Failed to fetch platforms');
    }

    return {
      platforms: data.platforms || [],
      timestamp: data.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('[SERVER DATA] Error fetching platforms:', error);
    
    return {
      platforms: [],
      timestamp: new Date().toISOString()
    };
  }
}