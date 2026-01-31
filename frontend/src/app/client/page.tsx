import { fetchHomeContent } from '@/lib/serverData';
import HomePageClient from '@/components/client/pages/HomePageClient';

const normalizeArticle = (article: any) => {
  if (!article) return null;
  
  return {
    news_id: article.newsId || article.news_id || 0,
    newsId: article.newsId || article.news_id || 0,
    title: article.title || '',
    slug: article.slug || '',
    image_url: article.imageUrl || article.image_url || null,
    imageUrl: article.imageUrl || article.image_url || null,
    category_name: article.categoryName || article.category_name || 'Uncategorized',
    categoryName: article.categoryName || article.category_name || 'Uncategorized',
    category_slug: article.categorySlug || article.category_slug || 'general',
    categorySlug: article.categorySlug || article.category_slug || 'general',
    category_color: article.categoryColor || article.category_color || '#6366f1',
    categoryColor: article.categoryColor || article.category_color || '#6366f1',
    category_icon: article.categoryIcon || article.category_icon || '📰',
    categoryIcon: article.categoryIcon || article.category_icon || '📰',
    published_at: article.publishedAt || article.published_at,
    publishedAt: article.publishedAt || article.published_at,
    views: article.views || 0,
    likes_count: article.likesCount || article.likes_count || 0,
    likesCount: article.likesCount || article.likes_count || 0,
    comments_count: article.commentsCount || article.comments_count || 0,
    commentsCount: article.commentsCount || article.comments_count || 0,
    share_count: article.shareCount || article.share_count || 0,
    shareCount: article.shareCount || article.share_count || 0,
    first_name: article.firstName || article.first_name || 'Daily Vaibe',
    firstName: article.firstName || article.first_name || 'Daily Vaibe',
    last_name: article.lastName || article.last_name || 'Editor',
    lastName: article.lastName || article.last_name || 'Editor',
    excerpt: article.excerpt || article.metaDescription || article.meta_description || '',
    reading_time: article.readingTime || article.reading_time || 5,
    readingTime: article.readingTime || article.reading_time || 5,
    featured: article.featured || false,
    trending_score: article.trendingScore || article.trending_score || 0
  };
};

const normalizeCategorySection = (section: any) => {
  if (!section) return null;
  
  const articles = Array.isArray(section.articles) 
    ? section.articles.map(normalizeArticle).filter(Boolean)
    : [];
  
  return {
    category_id: section.categoryId || section.category_id || 0,
    categoryId: section.categoryId || section.category_id || 0,
    name: section.name || 'Uncategorized',
    slug: section.slug || 'general',
    description: section.description || '',
    color: section.color || '#6366f1',
    icon: section.icon || '📰',
    order_index: section.orderIndex || section.order_index || 999,
    orderIndex: section.orderIndex || section.order_index || 999,
    articles
  };
};

const normalizeArray = (arr: any[], normalizer: (item: any) => any) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizer).filter(Boolean);
};

export default async function ClientHomePage() {
  try {
    const homeContent = await fetchHomeContent();
    
    const sliderSlides = normalizeArray(homeContent.sliderSlides || [], normalizeArticle);
    const headlines = normalizeArray(homeContent.headlines || [], normalizeArticle);
    const categorySections = normalizeArray(homeContent.categorySections || [], normalizeCategorySection);

    const initialData = {
      sessionData: homeContent.sessionData || {
        isAuthenticated: false,
        isAnonymous: true,
        clientId: null,
        client_id: null,
        csrf_token: null
      },
      sliderSlides,
      headlines,
      categorySections,
      breakingNews: [],
      featuredNews: [],
      trending: [],
      latestQuotes: []
    };

    return <HomePageClient initialData={initialData} />;
    
  } catch (error) {
    const fallbackData = {
      sessionData: { 
        isAuthenticated: false, 
        isAnonymous: true, 
        clientId: null,
        client_id: null,
        csrf_token: null 
      },
      sliderSlides: [],
      headlines: [],
      categorySections: [],
      breakingNews: [],
      featuredNews: [],
      trending: [],
      latestQuotes: []
    };

    return <HomePageClient initialData={fallbackData} />;
  }
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';