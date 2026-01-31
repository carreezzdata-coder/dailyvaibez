import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCategoryIcon, getCategoryColor } from '@/lib/clientData';
import { filterAndSortArticles } from './gallery.utils';
import { NewsArticle, CategoryGroup } from './gallery.types';

export const useGallery = (allNews: NewsArticle[], onClose?: () => void, returnPath?: string) => {
  const router = useRouter();
  const galleryRef = useRef<HTMLDivElement>(null);
  const flashReaderRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [filteredItems, setFilteredItems] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [viewMode, setViewMode] = useState<string>('masonry');
  const [itemsPerPage, setItemsPerPage] = useState<number>(24);
  const [selectedItem, setSelectedItem] = useState<NewsArticle | null>(null);
  const [currentModalIndex, setCurrentModalIndex] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [imageLoadStates, setImageLoadStates] = useState<{[key: string]: boolean}>({});
  const [flashArticle, setFlashArticle] = useState<NewsArticle | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/client/category-footer', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.groups) {
            const mappedGroups: CategoryGroup[] = data.groups.map((group: any) => ({
              title: group.title,
              icon: getCategoryIcon(group.title.toLowerCase().replace(/\s+/g, '-')),
              color: getCategoryColor(group.title.toLowerCase().replace(/\s+/g, '-')),
              slug: group.title.toLowerCase().replace(/\s+/g, '-'),
              categories: group.categories || []
            }));
            setCategoryGroups(mappedGroups);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = filterAndSortArticles(allNews, selectedCategory, sortBy, itemsPerPage);
    setFilteredItems(filtered);
  }, [selectedCategory, sortBy, allNews, itemsPerPage]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleReturn = useCallback(() => {
    if (onClose) {
      onClose();
    } else if (returnPath) {
      router.push(returnPath);
    } else {
      router.back();
    }
  }, [onClose, returnPath, router]);

  const handleCategoryClick = useCallback((slug: string, hasSubcategories: boolean) => {
    if (hasSubcategories) {
      setExpandedCategory(prev => prev === slug ? null : slug);
    } else {
      router.push(`/client/categories/${slug}`);
      if (onClose) onClose();
    }
  }, [router, onClose]);

  const handleSubcategoryClick = useCallback((slug: string) => {
    router.push(`/client/categories/${slug}`);
    if (onClose) onClose();
  }, [router, onClose]);

  const handleImageLoad = useCallback((newsId: number) => {
    setImageLoadStates(prev => ({ ...prev, [newsId]: true }));
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', e.currentTarget.src);
  }, []);

  const handleCardClick = useCallback((item: NewsArticle, index: number) => {
    setSelectedItem(item);
    setCurrentModalIndex(index);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleModalNavigation = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'next' && currentModalIndex < filteredItems.length - 1) {
      const newIndex = currentModalIndex + 1;
      setCurrentModalIndex(newIndex);
      setSelectedItem(filteredItems[newIndex]);
    } else if (direction === 'prev' && currentModalIndex > 0) {
      const newIndex = currentModalIndex - 1;
      setCurrentModalIndex(newIndex);
      setSelectedItem(filteredItems[newIndex]);
    }
  }, [currentModalIndex, filteredItems]);

  const handleReadMore = useCallback((article: NewsArticle, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFlashArticle(article);
  }, []);

  const handleCloseFlash = useCallback(() => {
    setFlashArticle(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    setItemsPerPage(prev => prev + 12);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (flashArticle && e.key === 'Escape') {
        handleCloseFlash();
      } else if (selectedItem && e.key === 'Escape') {
        handleModalClose();
      } else if (selectedItem && e.key === 'ArrowLeft') {
        handleModalNavigation('prev');
      } else if (selectedItem && e.key === 'ArrowRight') {
        handleModalNavigation('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, flashArticle, handleModalClose, handleCloseFlash, handleModalNavigation]);

  return {
    galleryRef,
    flashReaderRef,
    posterRef,
    filteredItems,
    selectedCategory,
    expandedCategory,
    categoryGroups,
    viewMode,
    itemsPerPage,
    selectedItem,
    currentModalIndex,
    sortBy,
    isVisible,
    isLoadingCategories,
    imageLoadStates,
    flashArticle,
    isHovering,
    setSelectedCategory,
    setExpandedCategory,
    setViewMode,
    setItemsPerPage,
    setSortBy,
    setIsHovering,
    handleReturn,
    handleCategoryClick,
    handleSubcategoryClick,
    handleImageLoad,
    handleImageError,
    handleCardClick,
    handleModalClose,
    handleModalNavigation,
    handleReadMore,
    handleCloseFlash,
    handleLoadMore,
  };
};