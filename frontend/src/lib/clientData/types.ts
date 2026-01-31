export interface SessionData {
  isAuthenticated: boolean;
  isAnonymous?: boolean;
  client_id?: string | null;
  csrf_token: string | null;
}

export interface ArticleImage {
  image_url: string;
  image_caption?: string;
  alt_text?: string;
  is_featured?: boolean;
  position?: number;
}

export interface ArticleMedia {
  kind: 'video' | 'post';
  video_url: string;
  platform: string;
  embed_code?: string;
  caption?: string;
  position: number;
  thumbnail_url?: string;
  author_name?: string;
  author_handle?: string;
}

export interface NewsArticle {
  news_id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  images: ArticleImage[];
  media: ArticleMedia[];
  published_at: string;
  reading_time: number;
  views: number;
  likes_count: number;
  first_name: string;
  last_name: string;
  author_name?: string;
  category_name: string;
  category_slug: string;
}

export interface VideoArticle {
  news_id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  views: number;
  likes_count: number;
  comments_count: number;
  reading_time: number;
  published_at: string;
  author: {
    first_name: string;
    last_name: string;
    full_name: string;
  };
  category: {
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
  featured_video: {
    platform: string;
    post_url: string;
    embed_code?: string;
    caption?: string;
    thumbnail_url?: string;
    duration?: number;
    likes_count?: number;
    comments_count?: number;
    views_count?: number;
    author_name?: string;
    author_handle?: string;
    post_date?: string;
    is_featured?: boolean;
    position?: number;
  };
  video_count: number;
}

export interface VideoPlatformCount {
  platform_group: string;
  article_count: number;
  video_count: number;
}

export interface VideosContent {
  articles: VideoArticle[];
  count: number;
  total_videos: number;
  meta: {
    limit: number;
    platform?: string;
    timestamp: string;
  };
}

export interface VideoPlatformsResponse {
  platforms: VideoPlatformCount[];
  timestamp: string;
}

export interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  icon?: string;
  color?: string;
  description?: string;
  isGroup?: boolean;
  order_index?: number;
}

export interface CategoryGroup {
  title: string;
  categories: Category[];
}

export interface HomeContent {
  sessionData: SessionData;
  sliderSlides: NewsArticle[];
  headlines: NewsArticle[];
  topArticles: NewsArticle[];
  trending: NewsArticle[];
  latest: NewsArticle[];
  popular: NewsArticle[];
  politicsNews: NewsArticle[];
  countiesNews: NewsArticle[];
  opinionNews: NewsArticle[];
  businessNews: NewsArticle[];
  sportsNews: NewsArticle[];
  technologyNews: NewsArticle[];
  breakingNews: NewsArticle[];
  featuredNews: NewsArticle[];
  categories: Category[];
}

export interface CategoryContent {
  category: Category | null;
  news: NewsArticle[];
  pagination: {
    current_page: number;
    per_page: number;
    total_news: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ArticleContent {
  article: NewsArticle & {
    content: string;
    category_color?: string;
    category_icon?: string;
  };
  related_articles: NewsArticle[];
}