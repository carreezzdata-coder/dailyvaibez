import type { NewsArticle, ArticleImage, ArticleMedia, VideoArticle } from './types';
import { getImageUrl } from './imageUtils';
import { getCategoryColor, getCategoryIcon } from './categoryUtils';
import { calculateReadingTime } from './formatUtils';

function classifyMediaKind(platform: string, postType: string): 'video' | 'post' {
  const videoPlatforms = ['youtube', 'vimeo', 'dailymotion', 'tiktok'];
  const videoKeywords = ['video', 'reel', 'short'];
  const platformLower = (platform || '').toLowerCase();
  const typeLower = (postType || '').toLowerCase();
  const isVideoPlatform = videoPlatforms.some(vp => platformLower.includes(vp));
  const isVideoType = videoKeywords.some(vk => typeLower.includes(vk));
  return (isVideoPlatform || isVideoType) ? 'video' : 'post';
}

export function normalizeArticle(apiResponse: any): NewsArticle {
  const article = apiResponse.article || apiResponse;
  let images: ArticleImage[] = [];
  if (Array.isArray(article.images)) {
    images = article.images.map((img: any) => ({
      image_url: getImageUrl(img.image_url),
      image_caption: img.image_caption,
      alt_text: img.alt_text,
      is_featured: Boolean(img.is_featured),
      position: img.position ?? 0
    }));
  }
  images.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  let media: ArticleMedia[] = [];
  const mediaSources = [article.media, article.social_videos, article.all_videos, article.social_media, article.social_media_links];
  for (const source of mediaSources) {
    if (Array.isArray(source) && source.length > 0) {
      media = source.map((item: any) => ({
        kind: classifyMediaKind(item.platform || '', item.post_type || ''),
        video_url: item.video_url || item.post_url || item.url || '',
        platform: (item.platform || 'unknown').toLowerCase(),
        embed_code: item.embed_code || item.embed_html || item.oembed_html || '',
        caption: item.caption || item.post_text || '',
        position: item.position ?? item.display_order ?? 0,
        thumbnail_url: getImageUrl(item.thumbnail_url || item.image_url),
        author_name: item.author_name,
        author_handle: item.author_handle
      }));
      break;
    }
  }
  media.sort((a, b) => a.position - b.position);
  const featuredImage = images.find(img => img.is_featured) || images[0];
  const mainImageUrl = getImageUrl(article.image_url) || featuredImage?.image_url || '/images/default-article.jpg';
  return {
    news_id: String(article.news_id ?? ''),
    slug: article.slug ?? '',
    title: article.title ?? 'Untitled',
    excerpt: article.excerpt ?? (article.title ? `${article.title.slice(0, 150)}...` : ''),
    content: article.content ?? '',
    image_url: mainImageUrl,
    images,
    media,
    published_at: article.published_at ?? new Date().toISOString(),
    reading_time: article.reading_time ?? calculateReadingTime(article.content, article.title),
    views: article.views ?? 0,
    likes_count: article.likes_count ?? 0,
    first_name: article.first_name ?? '',
    last_name: article.last_name ?? '',
    author_name: article.author_name ?? '',
    category_name: article.category_name ?? '',
    category_slug: article.category_slug ?? '',
  };
}

export function normalizeArticles(articles: any[]): NewsArticle[] {
  return articles.map(normalizeArticle);
}

export function normalizeVideoArticle(apiResponse: any): VideoArticle {
  const article = apiResponse.article || apiResponse;
  const video = article.featured_video || article.videos?.[0] || {};
  
  return {
    news_id: article.news_id || 0,
    title: article.title || '',
    slug: article.slug || '',
    excerpt: article.excerpt || '',
    image_url: getImageUrl(article.image_url),
    views: article.views || 0,
    likes_count: article.likes_count || 0,
    comments_count: article.comments_count || 0,
    reading_time: article.reading_time || 3,
    published_at: article.published_at || new Date().toISOString(),
    author: {
      first_name: article.first_name || article.author?.first_name || 'VybesTribe',
      last_name: article.last_name || article.author?.last_name || 'Editor',
      full_name: article.author_name || `${article.first_name || ''} ${article.last_name || ''}`.trim() || 'VybesTribe Editor'
    },
    category: {
      name: article.category_name || article.category?.name || '',
      slug: article.category_slug || article.category?.slug || '',
      color: article.category_color || article.category?.color || getCategoryColor(article.category_slug || ''),
      icon: article.category_icon || article.category?.icon || getCategoryIcon(article.category_slug || '')
    },
    featured_video: {
      platform: video.platform || '',
      post_url: video.post_url || video.video_url || '',
      embed_code: video.embed_code || '',
      caption: video.caption || '',
      thumbnail_url: getImageUrl(video.thumbnail_url),
      duration: video.duration || 0,
      likes_count: video.likes_count || 0,
      comments_count: video.comments_count || 0,
      views_count: video.views_count || 0,
      author_name: video.author_name || '',
      author_handle: video.author_handle || '',
      post_date: video.post_date || '',
      is_featured: video.is_featured !== undefined ? video.is_featured : true,
      position: video.position || 1
    },
    video_count: article.video_count || 1
  };
}

export function normalizeVideos(articles: any[]): VideoArticle[] {
  return articles.map(normalizeVideoArticle);
}