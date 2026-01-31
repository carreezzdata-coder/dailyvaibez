import React from 'react';

export type NewsArticle = {
  news_id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image_url: string;
  category_name: string;
  category_slug: string;
  first_name: string;
  last_name: string;
  published_at: string;
  views?: number;
  likes_count?: number;
  reading_time?: number;
  tags?: string;
};

export type SubCategory = {
  category_id: number;
  name: string;
  slug: string;
};

export type CategoryGroup = {
  title: string;
  icon: string;
  color: string;
  slug: string;
  categories: SubCategory[];
};

export type GalleryProps = {
  allNews: NewsArticle[];
  onArticleClick?: (article: NewsArticle) => void;
  currentTheme?: string;
  onClose?: () => void;
  returnPath?: string;
};

export type GalleryCardProps = {
  item: NewsArticle;
  index: number;
  tier: string;
  isImageLoaded: boolean;
  themeColor: string;
  onCardClick: (item: NewsArticle, index: number) => void;
  onImageLoad: (newsId: number) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onReadMore: (item: NewsArticle, e?: React.MouseEvent) => void;
};

export type GalleryNavProps = {
  selectedCategory: string;
  expandedCategory: string | null;
  categoryGroups: CategoryGroup[];
  isLoadingCategories: boolean;
  themeColor: string;
  onCategorySelect: (category: string) => void;
  onCategoryExpand: (slug: string | null) => void;
  onCategoryClick: (slug: string, hasSubcategories: boolean) => void;
  onSubcategoryClick: (slug: string) => void;
};

export type GalleryControlsProps = {
  sortBy: string;
  viewMode: string;
  itemsPerPage: number;
  onSortChange: (sort: string) => void;
  onViewModeChange: (mode: string) => void;
  onItemsPerPageChange: (count: number) => void;
};

export type GalleryGridProps = {
  items: NewsArticle[];
  viewMode: string;
  isVisible: boolean;
  themeColor: string;
  imageLoadStates: {[key: string]: boolean};
  onCardClick: (item: NewsArticle, index: number) => void;
  onImageLoad: (newsId: number) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onReadMore: (item: NewsArticle, e?: React.MouseEvent) => void;
  onHoverChange: (isHovering: boolean) => void;
};

export type GalleryModalProps = {
  selectedItem: NewsArticle | null;
  currentIndex: number;
  totalItems: number;
  themeColor: string;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onReadMore: (item: NewsArticle) => void;
  onShare: (platform: string, article: NewsArticle, e: React.MouseEvent) => void;
  posterRef: React.RefObject<HTMLDivElement>;
};

export type GalleryFlashReaderProps = {
  article: NewsArticle | null;
  themeColor: string;
  onClose: () => void;
  onFullArticle: (slug: string) => void;
  flashReaderRef: React.RefObject<HTMLDivElement>;
};

export type GalleryShareProps = {
  article: NewsArticle;
  themeColor: string;
  posterRef: React.RefObject<HTMLDivElement>;
  onShare: (platform: string, article: NewsArticle, e: React.MouseEvent) => void;
};