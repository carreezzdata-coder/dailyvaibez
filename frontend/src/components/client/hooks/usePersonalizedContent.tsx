'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserPreferences } from './useUserPreferences';

interface PersonalizedContent {
  featured: any[];
  timeline: any[];
  slider: any[];
  categorySections: any[];
}

export function usePersonalizedContent() {
  const { preferences, geoLocation, cookieConsent, isHydrated } = useUserPreferences();
  const [content, setContent] = useState<PersonalizedContent>({
    featured: [],
    timeline: [],
    slider: [],
    categorySections: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildPersonalizationPayload = useCallback(() => {
    if (!cookieConsent || !isHydrated) {
      return {
        personalized: false,
        preferences: { preferredCategories: [] },
        location: { county: null, town: null }
      };
    }

    const categoryVisits: Record<string, number> = {};
    preferences.visitHistory.forEach(visit => {
      categoryVisits[visit.slug] = visit.count;
    });

    return {
      personalized: true,
      preferences: {
        preferredCategories: preferences.favoriteCategories,
        categoryVisits,
        totalVisits: preferences.totalVisits,
        contentType: preferences.contentType
      },
      location: {
        county: geoLocation.county,
        town: geoLocation.town,
        category: geoLocation.category
      }
    };
  }, [cookieConsent, isHydrated, preferences, geoLocation]);

  const fetchPersonalizedContent = useCallback(async () => {
    if (!isHydrated) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload = buildPersonalizationPayload();
      
      const response = await fetch('/api/client/personalized', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data.success) {
        setContent({
          featured: data.featured || [],
          timeline: data.timeline || [],
          slider: data.slider || [],
          categorySections: data.categorySections || []
        });
      } else {
        throw new Error(data.message || 'Failed to fetch personalized content');
      }
    } catch (err) {
      console.error('Personalized content error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated, buildPersonalizationPayload]);

  useEffect(() => {
    if (isHydrated) {
      fetchPersonalizedContent();
    }
  }, [isHydrated, fetchPersonalizedContent]);

  return {
    content,
    isLoading,
    error,
    refresh: fetchPersonalizedContent,
    isPersonalized: cookieConsent && isHydrated
  };
}

export function usePersonalizedSlider() {
  const { preferences, cookieConsent, isHydrated } = useUserPreferences();
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    if (!isHydrated) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        personalized: cookieConsent && isHydrated,
        preferredCategories: preferences.favoriteCategories,
        contentType: preferences.contentType,
        limit: 8
      };

      const response = await fetch('/api/client/slider/personalized', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data.success) {
        setSlides(data.slides || []);
      } else {
        throw new Error(data.message || 'Failed to fetch slides');
      }
    } catch (err) {
      console.error('Slider fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load slides');
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated, cookieConsent, preferences]);

  useEffect(() => {
    if (isHydrated) {
      fetchSlides();
    }
  }, [isHydrated, fetchSlides]);

  return { 
    slides, 
    isLoading, 
    error,
    refresh: fetchSlides 
  };
}

export function usePersonalizedTimeline(initialPage = 1) {
  const { preferences, cookieConsent, isHydrated } = useUserPreferences();
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async (pageNum: number, append = false) => {
    if (!isHydrated) return;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const categoryVisits: Record<string, number> = {};
      preferences.visitHistory.forEach(visit => {
        categoryVisits[visit.slug] = visit.count;
      });

      const payload = {
        personalized: cookieConsent && isHydrated,
        preferredCategories: preferences.favoriteCategories,
        categoryVisits,
        contentType: preferences.contentType,
        page: pageNum,
        limit: 20
      };

      const response = await fetch('/api/client/timeline/personalized', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setArticles(prev => [...prev, ...(data.articles || [])]);
        } else {
          setArticles(data.articles || []);
        }
        setHasMore(data.pagination?.has_next || false);
      } else {
        throw new Error(data.message || 'Failed to fetch timeline');
      }
    } catch (err) {
      console.error('Timeline fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [isHydrated, cookieConsent, preferences]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTimeline(nextPage, true);
    }
  }, [isLoadingMore, hasMore, page, fetchTimeline]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchTimeline(1, false);
  }, [fetchTimeline]);

  useEffect(() => {
    if (isHydrated) {
      fetchTimeline(1, false);
    }
  }, [isHydrated]);

  return { 
    articles, 
    isLoading, 
    isLoadingMore,
    hasMore, 
    error,
    loadMore, 
    refresh 
  };
}

export function usePersonalizedCategories() {
  const { preferences, geoLocation, isHydrated } = useUserPreferences();
  const [categorySections, setCategorySections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorySections = useCallback(async () => {
    if (!isHydrated) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        preferredCategories: preferences.favoriteCategories,
        contentType: preferences.contentType,
        location: {
          county: geoLocation.county,
          town: geoLocation.town
        }
      };

      const response = await fetch('/api/client/categories/personalized', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data.success) {
        setCategorySections(data.sections || []);
      } else {
        throw new Error(data.message || 'Failed to fetch category sections');
      }
    } catch (err) {
      console.error('Category sections fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated, preferences, geoLocation]);

  useEffect(() => {
    if (isHydrated) {
      fetchCategorySections();
    }
  }, [isHydrated, fetchCategorySections]);

  return {
    categorySections,
    isLoading,
    error,
    refresh: fetchCategorySections
  };
}