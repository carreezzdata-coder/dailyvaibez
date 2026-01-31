import { cookies } from 'next/headers';
import { getBackendUrl, createBackendHeaders, fastFetch, normalizeArticle } from './helpers';

interface ArticleContent {
  article: any;
  related_articles: any[];
}

export async function fetchArticleContent(slug: string): Promise<ArticleContent | null> {
  const API_BASE_URL = getBackendUrl();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dailyvaibe_public_session')?.value;

  try {
    const response = await fastFetch(
      `${API_BASE_URL}/api/articles/${slug}`,
      {
        method: 'GET',
        headers: createBackendHeaders(sessionCookie),
      },
      12000
    );

    if (!response) {
      return null;
    }

    const data = await response.json();
    
    if (!data.article) {
      return null;
    }

    const normalizedArticle = normalizeArticle(data.article);
    
    let relatedArticles: any[] = [];
    const categorySlug = data.article.category_slug;
    
    if (categorySlug) {
      try {
        const relatedResponse = await fastFetch(
          `${API_BASE_URL}/api/categories/${categorySlug}/news?limit=15`,
          {
            method: 'GET',
            headers: createBackendHeaders(sessionCookie),
          },
          10000
        );

        if (relatedResponse) {
          const relatedData = await relatedResponse.json();
          const filtered = (relatedData.news || []).filter(
            (article: any) => article.slug !== slug
          );
          relatedArticles = Array.isArray(filtered) 
            ? filtered.map(normalizeArticle) 
            : [];
        }
      } catch (error) {
        console.error('[ARTICLE] Related fetch error:', error);
      }
    }
    
    return {
      article: {
        ...normalizedArticle,
        content: normalizedArticle.content || '',
        category_color: data.article.category_color,
        category_icon: data.article.category_icon,
      },
      related_articles: relatedArticles,
    };
  } catch (error) {
    console.error('[ARTICLE] Fetch error:', error);
    return null;
  }
}