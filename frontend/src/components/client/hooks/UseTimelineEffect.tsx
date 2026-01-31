'use client';

import { useState, useEffect, useMemo } from 'react';

interface Article {
  news_id: number;
  title: string;
  slug: string;
  image_url: string | null;
  category_name: string;
  category_slug: string;
  published_at: string;
  views: number;
  likes_count: number;
  first_name?: string;
  last_name?: string;
  excerpt?: string;
  reading_time?: number;
}

interface CookiePreferences {
  categoryVisits?: Record<string, number>;
  preferredCategories?: string[];
}

interface UseTimelineEffectReturn {
  sortedArticles: Article[];
  loadMore: () => Promise<void>;
  refresh: () => void;
}

export function useTimelineEffect(
  articles: Article[],
  preferences?: CookiePreferences
): UseTimelineEffectReturn {
  const [sortedArticles, setSortedArticles] = useState<Article[]>(articles || []);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateArticleScore = useMemo(() => {
    return (article: Article): number => {
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

      if (preferences?.preferredCategories && preferences.preferredCategories.length > 0) {
        const categoryIndex = preferences.preferredCategories.indexOf(article.category_slug);
        if (categoryIndex !== -1) {
          score += (5 - categoryIndex) * 10;
        }
      }

      if (preferences?.categoryVisits) {
        const categoryVisits = preferences.categoryVisits[article.category_slug] || 0;
        score += Math.min(categoryVisits * 2, 30);
      }

      return score;
    };
  }, [preferences]);

  useEffect(() => {
    if (!articles || articles.length === 0) {
      setSortedArticles([]);
      return;
    }

    if (!isMounted) {
      setSortedArticles(articles);
      return;
    }

    const articlesWithScores = articles.map(article => ({
      article,
      score: calculateArticleScore(article)
    }));

    articlesWithScores.sort((a, b) => b.score - a.score);

    const sorted = articlesWithScores.map(item => item.article);

    const deduped = sorted.filter((article, index, self) =>
      index === self.findIndex((a) => a.news_id === article.news_id)
    );

    setSortedArticles(deduped);
  }, [articles, calculateArticleScore, isMounted]);

  const loadMore = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  };

  const refresh = (): void => {
    if (!articles || articles.length === 0) {
      setSortedArticles([]);
      return;
    }

    const articlesWithScores = articles.map(article => ({
      article,
      score: calculateArticleScore(article)
    }));

    articlesWithScores.sort((a, b) => b.score - a.score);

    const sorted = articlesWithScores.map(item => item.article);

    const deduped = sorted.filter((article, index, self) =>
      index === self.findIndex((a) => a.news_id === article.news_id)
    );

    setSortedArticles(deduped);
  };

  return {
    sortedArticles,
    loadMore,
    refresh,
  };
}