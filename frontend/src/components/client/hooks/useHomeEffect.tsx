'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface Article {
  news_id: number;
  title: string;
  slug: string;
  image_url: string | null;
  category_name: string;
  category_slug: string;
  category_color?: string;
  category_icon?: string;
  published_at: string;
  views: number;
  likes_count: number;
  first_name?: string;
  last_name?: string;
  excerpt?: string;
}

interface CategorySection {
  category_id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order_index: number;
  articles: Article[];
  priority?: 'high' | 'medium' | 'low';
  score?: number;
}

interface UserPreferences {
  preferredCategories?: string[];
  categoryVisits?: Record<string, number>;
  lastVisit?: string;
  totalVisits?: number;
}

interface UseHomeEffectReturn {
  orderedSections: CategorySection[];
  totalArticles: number;
  isProcessing: boolean;
  refresh: () => void;
}

export function useHomeEffect(
  sections: CategorySection[],
  userPreferences?: UserPreferences
): UseHomeEffectReturn {
  const [orderedSections, setOrderedSections] = useState<CategorySection[]>(sections || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculatePriority = useCallback((
    section: CategorySection,
    preferences: UserPreferences | null
  ): { priority: 'high' | 'medium' | 'low'; score: number } => {
    const preferredCategories = preferences?.preferredCategories || [];
    const categoryVisits = preferences?.categoryVisits || {};

    const prefIndex = preferredCategories.indexOf(section.slug);
    const visits = categoryVisits[section.slug] || 0;

    let priority: 'high' | 'medium' | 'low' = 'low';
    let score = section.order_index * 100;

    if (prefIndex === 0) {
      priority = 'high';
      score = -1000;
    } else if (prefIndex > 0 && prefIndex < 3) {
      priority = 'medium';
      score = -500 + (prefIndex * 100);
    } else if (visits > 10) {
      priority = 'medium';
      score = -300;
    } else if (visits > 5) {
      priority = 'low';
      score = -100;
    }

    return { priority, score };
  }, []);

  const sortArticlesByEngagement = useCallback((articles: Article[]): Article[] => {
    return [...articles].sort((a, b) => {
      const scoreA = a.views * 0.7 + a.likes_count * 0.3;
      const scoreB = b.views * 0.7 + b.likes_count * 0.3;
      return scoreB - scoreA;
    });
  }, []);

  const processSections = useCallback(() => {
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      setOrderedSections([]);
      setIsProcessing(false);
      return;
    }

    if (!isMounted) {
      setOrderedSections(sections);
      return;
    }

    setIsProcessing(true);

    let preferences = userPreferences || null;
    
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vt_user_behavior');
        if (stored && !preferences) {
          preferences = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }

    const processedSections = sections.map(section => {
      const { priority, score } = calculatePriority(section, preferences);
      const sortedArticles = sortArticlesByEngagement(section.articles);

      return {
        ...section,
        articles: sortedArticles,
        priority,
        score
      };
    });

    processedSections.sort((a, b) => a.score - b.score);

    setOrderedSections(processedSections);
    setIsProcessing(false);
  }, [sections, userPreferences, isMounted, calculatePriority, sortArticlesByEngagement]);

  useEffect(() => {
    if (isMounted) {
      processSections();
    } else {
      setOrderedSections(sections || []);
    }
  }, [isMounted, sections, processSections]);

  const totalArticles = useMemo(() => {
    return orderedSections.reduce((total, section) => total + (section.articles?.length || 0), 0);
  }, [orderedSections]);

  const refresh = useCallback(() => {
    processSections();
  }, [processSections]);

  return {
    orderedSections,
    totalArticles,
    isProcessing,
    refresh
  };
}

export function useArticleScoring() {
  const calculateScore = useCallback((article: Article): number => {
    let score = 0;

    const now = new Date().getTime();
    const publishedTime = new Date(article.published_at).getTime();
    const ageInHours = (now - publishedTime) / (1000 * 60 * 60);

    if (ageInHours < 24) {
      score += 100;
    } else if (ageInHours < 48) {
      score += 50;
    } else if (ageInHours < 168) {
      score += 25;
    }

    const viewsScore = Math.min(article.views / 100, 50);
    score += viewsScore;

    const likesScore = Math.min(article.likes_count / 10, 30);
    score += likesScore;

    const engagementRate = article.views > 0 
      ? (article.likes_count / article.views) * 100
      : 0;
    score += Math.min(engagementRate * 2, 20);

    return score;
  }, []);

  return { calculateScore };
}

export function useCategoryTracking() {
  const trackCategoryView = useCallback((categorySlug: string) => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('vt_user_behavior');
      const behavior = stored ? JSON.parse(stored) : {
        categoryVisits: {},
        preferredCategories: [],
        lastVisit: new Date().toISOString(),
        totalVisits: 0
      };

      behavior.categoryVisits[categorySlug] = (behavior.categoryVisits[categorySlug] || 0) + 1;
      behavior.lastVisit = new Date().toISOString();
      behavior.totalVisits += 1;

      const sortedCategories = Object.entries(behavior.categoryVisits)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat]) => cat);

      behavior.preferredCategories = sortedCategories;

      localStorage.setItem('vt_user_behavior', JSON.stringify(behavior));
    } catch (e) {
      console.error('Failed to track category view:', e);
    }
  }, []);

  const trackArticleRead = useCallback((categorySlug: string, articleSlug: string) => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('vt_user_behavior');
      const behavior = stored ? JSON.parse(stored) : {
        categoryVisits: {},
        articleReads: {},
        preferredCategories: [],
        lastVisit: new Date().toISOString(),
        totalVisits: 0
      };

      behavior.categoryVisits[categorySlug] = (behavior.categoryVisits[categorySlug] || 0) + 1;
      behavior.articleReads = behavior.articleReads || {};
      behavior.articleReads[articleSlug] = (behavior.articleReads[articleSlug] || 0) + 1;
      behavior.lastVisit = new Date().toISOString();

      const sortedCategories = Object.entries(behavior.categoryVisits)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat]) => cat);

      behavior.preferredCategories = sortedCategories;

      localStorage.setItem('vt_user_behavior', JSON.stringify(behavior));
    } catch (e) {
      console.error('Failed to track article read:', e);
    }
  }, []);

  return { trackCategoryView, trackArticleRead };
}