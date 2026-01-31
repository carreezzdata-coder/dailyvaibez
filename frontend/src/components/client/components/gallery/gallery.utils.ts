import { NewsArticle } from './gallery.types';
import html2canvas from 'html2canvas';

export const getTierClass = (item: NewsArticle): string => {
  const age = Math.floor((Date.now() - new Date(item.published_at).getTime()) / 3600000);
  if (age < 24) return 'tier-hero';
  if (age < 72) return 'tier-large';
  if (age < 168) return 'tier-medium';
  return 'tier-small';
};

export const getExcerpt = (article: NewsArticle): string => {
  if (article.excerpt) return article.excerpt;
  if (article.content) {
    const plainText = article.content.replace(/<[^>]+>/g, '').trim();
    return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }
  return '';
};

export const getThemeColor = (theme: string): string => {
  switch (theme) {
    case 'dark':
      return '#00ffc6';
    case 'african':
      return '#dc2626';
    default:
      return '#2563eb';
  }
};

export const filterAndSortArticles = (
  allNews: NewsArticle[],
  selectedCategory: string,
  sortBy: string,
  itemsPerPage: number
): NewsArticle[] => {
  let filtered = allNews.filter(item => item.image_url && item.image_url.trim() !== '');
  
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(item => 
      item.category_slug === selectedCategory || 
      item.category_name.toLowerCase() === selectedCategory.toLowerCase()
    );
  }
  
  if (sortBy === 'recent') {
    filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  } else if (sortBy === 'views') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sortBy === 'likes') {
    filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
  }
  
  return filtered.slice(0, itemsPerPage);
};

export const captureScreenshot = async (
  posterRef: React.RefObject<HTMLDivElement>
): Promise<string | null> => {
  if (!posterRef.current) return null;

  try {
    const canvas = await html2canvas(posterRef.current);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return null;
  }
};