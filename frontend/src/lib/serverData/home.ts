import { cookies } from 'next/headers';

interface SessionData {
  isAuthenticated: boolean;
  isAnonymous?: boolean;
  client_id?: string | null;
  csrf_token: string | null;
}

interface CategorySection {
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  orderIndex: number;
  articles: any[];
}

interface HomeContent {
  sessionData: SessionData;
  sliderSlides: any[];
  headlines: any[];
  categorySections: CategorySection[];
  topArticles: any[];
  trending: any[];
  latest: any[];
  popular: any[];
  politicsNews: any[];
  countiesNews: any[];
  opinionNews: any[];
  businessNews: any[];
  sportsNews: any[];
  technologyNews: any[];
  breakingNews: any[];
  featuredNews: any[];
  latestQuotes: any[];
  categories: any[];
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

function createBackendHeaders(sessionCookie?: string): HeadersInit {
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

async function getServerSessionData(): Promise<SessionData> {
  const API_BASE_URL = getBackendUrl();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dailyvaibe_public_session')?.value;

  if (!sessionCookie) {
    return { 
      isAuthenticated: false, 
      isAnonymous: true, 
      client_id: null, 
      csrf_token: null 
    };
  }

  try {
    const response = await fastFetch(
      `${API_BASE_URL}/api/client/auth/verify`,
      {
        method: 'GET',
        headers: createBackendHeaders(sessionCookie),
      },
      8000
    );

    if (!response) {
      return { 
        isAuthenticated: false, 
        isAnonymous: true, 
        client_id: null, 
        csrf_token: null 
      };
    }

    const data = await response.json();
    
    return {
      isAuthenticated: data.isAuthenticated || false,
      isAnonymous: data.isAnonymous || true,
      client_id: data.client_id || null,
      csrf_token: data.csrf_token || null,
    };
  } catch (error) {
    return { 
      isAuthenticated: false, 
      isAnonymous: true, 
      client_id: null, 
      csrf_token: null 
    };
  }
}

const normalizeArticle = (article: any) => ({
  newsId: article.newsId || article.news_id,
  title: article.title,
  excerpt: article.excerpt || article.meta_description || article.metaDescription || '',
  slug: article.slug,
  imageUrl: article.imageUrl || article.image_url,
  publishedAt: article.publishedAt || article.published_at,
  readingTime: article.readingTime || article.reading_time || 3,
  views: article.views || 0,
  likesCount: article.likesCount || article.likes_count || 0,
  commentsCount: article.commentsCount || article.comments_count || 0,
  shareCount: article.shareCount || article.share_count || 0,
  firstName: article.firstName || article.first_name || 'Daily Vaibe',
  lastName: article.lastName || article.last_name || 'Editor',
  categoryName: article.categoryName || article.category_name || 'Uncategorized',
  categorySlug: article.categorySlug || article.category_slug || 'general',
  categoryColor: article.categoryColor || article.category_color || '#6366f1',
  categoryIcon: article.categoryIcon || article.category_icon || '📰',
  metaDescription: article.metaDescription || article.meta_description || ''
});

export async function fetchHomeContent(): Promise<HomeContent> {
  const API_BASE_URL = getBackendUrl();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dailyvaibe_public_session')?.value;
  const sessionData = await getServerSessionData();

  try {
    const response = await fastFetch(
      `${API_BASE_URL}/api/client/home`,
      {
        method: 'GET',
        headers: createBackendHeaders(sessionCookie),
        cache: 'no-store'
      },
      10000
    );

    if (!response) {
      return {
        sessionData,
        sliderSlides: [],
        headlines: [],
        categorySections: [],
        topArticles: [],
        trending: [],
        latest: [],
        popular: [],
        politicsNews: [],
        countiesNews: [],
        opinionNews: [],
        businessNews: [],
        sportsNews: [],
        technologyNews: [],
        breakingNews: [],
        featuredNews: [],
        latestQuotes: [],
        categories: [],
      };
    }

    const data = await response.json();
    
    const normalizeArray = (arr: any[]) => Array.isArray(arr) ? arr.map(normalizeArticle) : [];
    
    const normalizeCategorySection = (section: any): CategorySection => ({
      categoryId: section.categoryId || section.category_id || 0,
      name: section.name || 'Uncategorized',
      slug: section.slug || 'general',
      description: section.description || '',
      color: section.color || '#6366f1',
      icon: section.icon || '📰',
      orderIndex: section.orderIndex || section.order_index || 999,
      articles: normalizeArray(section.articles || [])
    });

    const categorySections = Array.isArray(data.categorySections) 
      ? data.categorySections.map(normalizeCategorySection)
      : [];

    const sliderSlides = normalizeArray(data.sliderSlides || []);
    const headlines = normalizeArray(data.headlines || []);
    
    return {
      sessionData,
      sliderSlides,
      headlines,
      categorySections,
      topArticles: [],
      trending: [],
      latest: [],
      popular: [],
      politicsNews: [],
      countiesNews: [],
      opinionNews: [],
      businessNews: [],
      sportsNews: [],
      technologyNews: [],
      breakingNews: [],
      featuredNews: [],
      latestQuotes: [],
      categories: [],
    };
  } catch (error) {
    console.error('[HOME] Fetch error:', error);
    return {
      sessionData,
      sliderSlides: [],
      headlines: [],
      categorySections: [],
      topArticles: [],
      trending: [],
      latest: [],
      popular: [],
      politicsNews: [],
      countiesNews: [],
      opinionNews: [],
      businessNews: [],
      sportsNews: [],
      technologyNews: [],
      breakingNews: [],
      featuredNews: [],
      latestQuotes: [],
      categories: [],
    };
  }
}