'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserPreferences } from './useUserPreferences';

interface SliderItem {
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
  first_name: string;
  last_name: string;
  reading_time: number;
  excerpt?: string;
}

interface UseSliderDataReturn {
  slides: SliderItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isPersonalized: boolean;
}

function normalizeSlide(item: any): SliderItem {
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
    first_name: item.first_name || item.firstName || 'Daily Vaibe',
    last_name: item.last_name || item.lastName || 'Editor',
    reading_time: parseInt(item.reading_time || item.readingTime) || 5,
    excerpt: item.excerpt || item.meta_description || item.metaDescription || '',
  };
}

export function useSliderData(initialSlides?: SliderItem[]): UseSliderDataReturn {
  const { preferences, cookieConsent, isHydrated } = useUserPreferences();
  const [slides, setSlides] = useState<SliderItem[]>(initialSlides || []);
  const [isLoading, setIsLoading] = useState(!initialSlides || initialSlides.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(!!initialSlides);

  const isPersonalized = isHydrated && cookieConsent;

  const fetchSlides = useCallback(async () => {
    if (!isHydrated) return;

    setIsLoading(true);
    setError(null);

    try {
      let endpoint = '/api/client/slider';
      let options: RequestInit = {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (isPersonalized && preferences.favoriteCategories.length > 0) {
        endpoint = '/api/client/slider/personalized';
        options = {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalized: true,
            preferredCategories: preferences.favoriteCategories,
            contentType: preferences.contentType,
            limit: 8
          })
        };
      }

      const response = await fetch(endpoint, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const normalizedSlides = Array.isArray(data.slides)
          ? data.slides.map(normalizeSlide)
          : Array.isArray(data.sliderSlides)
          ? data.sliderSlides.map(normalizeSlide)
          : [];

        setSlides(normalizedSlides);
        setHasFetched(true);
      } else {
        throw new Error(data.message || 'Failed to fetch slider data');
      }
    } catch (err) {
      console.error('[useSliderData] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load slider');
      
      if (initialSlides && initialSlides.length > 0) {
        setSlides(initialSlides);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated, isPersonalized, preferences, initialSlides]);

  const refresh = useCallback(async () => {
    await fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (!hasFetched && isHydrated) {
      fetchSlides();
    }
  }, [hasFetched, isHydrated, fetchSlides]);

  return {
    slides,
    isLoading,
    error,
    refresh,
    isPersonalized
  };
}