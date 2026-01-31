import { useState, useEffect, useCallback } from 'react';
import { useClientSession } from './ClientSessions';
import { useCookieConfig } from '../cookies/useCookieConfig';
import { useUserPreferences } from './useUserPreferences';

interface NewsItem {
  news_id: number;
  title: string;
  slug: string;
  image_url: string;
  category_name: string;
  category_slug: string;
  category_color?: string;
  category_icon?: string;
  published_at: string;
  views: number;
  likes_count: number;
  comments_count: number;
  first_name: string;
  last_name: string;
  reading_time: number;
  excerpt?: string;
}

interface Quote {
  quote_id: number;
  quote_text: string;
  sayer_name: string;
  sayer_title: string;
  sayer_image_url?: string;
  created_at: string;
}

interface CategorySection {
  category_id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order_index: number;
  articles: NewsItem[];
}

interface HomeContent {
  breaking: NewsItem[];
  featured: NewsItem[];
  trending: NewsItem[];
  quotes: Quote[];
  categorySections: CategorySection[];
  headlines: NewsItem[];
  sliderSlides: NewsItem[];
}

interface UseHomeDataReturn {
  content: HomeContent;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isPersonalized: boolean;
}

function normalizeArticle(item: any): NewsItem {
  return {
    news_id: item.news_id || item.newsId || 0,
    title: item.title || 'Untitled',
    slug: item.slug || '',
    image_url: item.image_url || item.imageUrl || '',
    category_name: item.category_name || item.categoryName || 'Uncategorized',
    category_slug: item.category_slug || item.categorySlug || 'uncategorized',
    category_color: item.category_color || item.categoryColor || '#6366f1',
    category_icon: item.category_icon || item.categoryIcon || '📰',
    published_at: item.published_at || item.publishedAt || new Date().toISOString(),
    views: parseInt(item.views) || 0,
    likes_count: parseInt(item.likes_count || item.likesCount) || 0,
    comments_count: parseInt(item.comments_count || item.commentsCount) || 0,
    first_name: item.first_name || item.firstName || 'Daily Vaibe',
    last_name: item.last_name || item.lastName || 'Editor',
    reading_time: parseInt(item.reading_time || item.readingTime) || 5,
    excerpt: item.excerpt || item.meta_description || item.metaDescription || '',
  };
}

function normalizeCategorySection(section: any): CategorySection {
  return {
    category_id: section.category_id || section.categoryId || 0,
    name: section.name || 'Uncategorized',
    slug: section.slug || 'general',
    description: section.description || '',
    color: section.color || '#6366f1',
    icon: section.icon || '📰',
    order_index: section.order_index || section.orderIndex || 999,
    articles: Array.isArray(section.articles) 
      ? section.articles.map(normalizeArticle)
      : []
  };
}

const EMPTY_CONTENT: HomeContent = {
  breaking: [],
  featured: [],
  trending: [],
  quotes: [],
  categorySections: [],
  headlines: [],
  sliderSlides: [],
};

export function useHomeData(initialData?: any): UseHomeDataReturn {
  const { sessionToken } = useClientSession();
  const { userBehavior, preferences, hasConsent } = useCookieConfig();
  const { preferences: userPrefs, geoLocation, isHydrated } = useUserPreferences();
  
  const [content, setContent] = useState<HomeContent>(() => {
    if (!initialData) return EMPTY_CONTENT;
    
    return {
      breaking: Array.isArray(initialData.breaking || initialData.breakingNews)
        ? (initialData.breaking || initialData.breakingNews).map(normalizeArticle)
        : [],
      featured: Array.isArray(initialData.featured || initialData.featuredNews)
        ? (initialData.featured || initialData.featuredNews).map(normalizeArticle)
        : [],
      trending: Array.isArray(initialData.trending)
        ? initialData.trending.map(normalizeArticle)
        : [],
      quotes: Array.isArray(initialData.quotes || initialData.latestQuotes)
        ? (initialData.quotes || initialData.latestQuotes)
        : [],
      categorySections: Array.isArray(initialData.categorySections) 
        ? initialData.categorySections.map(normalizeCategorySection)
        : [],
      headlines: Array.isArray(initialData.headlines)
        ? initialData.headlines.map(normalizeArticle)
        : [],
      sliderSlides: Array.isArray(initialData.sliderSlides || initialData.slider)
        ? (initialData.sliderSlides || initialData.slider).map(normalizeArticle)
        : [],
    };
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const isPersonalized = isHydrated && hasConsent && preferences.personalization;

  const processData = useCallback((data: any): HomeContent => {
    const breaking = Array.isArray(data.breakingNews || data.breaking) 
      ? (data.breakingNews || data.breaking).map(normalizeArticle)
      : [];

    const featured = Array.isArray(data.featuredNews || data.featured)
      ? (data.featuredNews || data.featured).map(normalizeArticle)
      : [];

    const trending = Array.isArray(data.trending)
      ? data.trending.map(normalizeArticle)
      : [];

    const quotes = Array.isArray(data.latestQuotes || data.quotes)
      ? (data.latestQuotes || data.quotes)
      : [];

    const headlines = Array.isArray(data.headlines)
      ? data.headlines.map(normalizeArticle)
      : [];

    const sliderSlides = Array.isArray(data.sliderSlides || data.slider)
      ? (data.sliderSlides || data.slider).map(normalizeArticle)
      : (featured.length > 0 ? featured.slice(0, 8) : []);

    const categorySections = Array.isArray(data.categorySections)
      ? data.categorySections.map(normalizeCategorySection)
      : [];

    return {
      breaking,
      featured,
      trending,
      quotes,
      categorySections,
      headlines,
      sliderSlides,
    };
  }, []);

  const fetchHomeContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isPersonalized && isHydrated) {
        const payload = {
          personalized: true,
          preferences: {
            preferredCategories: userBehavior.preferredCategories || userPrefs.favoriteCategories || [],
            categoryVisits: userBehavior.categoryVisits || {},
            totalVisits: userBehavior.totalVisits || 0
          },
          location: {
            county: geoLocation.county,
            town: geoLocation.town,
            category: geoLocation.category
          }
        };

        const [personalizedRes, quotesRes] = await Promise.all([
          fetch('/api/client/personalized', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
            },
            body: JSON.stringify(payload)
          }).catch(() => null),
          fetch('/api/client/quotes?_t=' + Date.now(), {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
          }).catch(() => null)
        ]);

        if (personalizedRes && personalizedRes.ok) {
          const personalizedData = await personalizedRes.json();
          const quotesData = quotesRes && quotesRes.ok ? await quotesRes.json() : { quotes: [] };

          const processedContent = processData({
            ...personalizedData,
            latestQuotes: quotesData.success ? quotesData.quotes : []
          });
          
          setContent(processedContent);
          setHasFetched(true);
          return;
        }
      }

      const [homeRes, quotesRes] = await Promise.all([
        fetch('/api/client/home?_t=' + Date.now(), {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
          },
          cache: 'no-store'
        }),
        fetch('/api/client/quotes?_t=' + Date.now(), {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        }).catch(() => null)
      ]);

      if (!homeRes.ok) {
        throw new Error(`HTTP ${homeRes.status}: Failed to fetch home data`);
      }

      const homeData = await homeRes.json();
      const quotesData = quotesRes && quotesRes.ok ? await quotesRes.json() : { quotes: [] };

      const processedContent = processData({
        ...homeData,
        latestQuotes: quotesData.success ? quotesData.quotes : []
      });
      
      setContent(processedContent);
      setHasFetched(true);

    } catch (err) {
      console.error('[useHomeData] Error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMsg);
      
      if (content.categorySections.length === 0 && initialData) {
        setContent(processData(initialData));
      }
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken, processData, isPersonalized, userBehavior, userPrefs, geoLocation, isHydrated, initialData, content.categorySections.length]);

  const refresh = useCallback(async () => {
    await fetchHomeContent();
  }, [fetchHomeContent]);

  useEffect(() => {
    if (!hasFetched && content.categorySections.length === 0) {
      fetchHomeContent();
    }
  }, [hasFetched, fetchHomeContent, content.categorySections.length]);

  return {
    content,
    isLoading,
    error,
    refresh,
    isPersonalized
  };
}