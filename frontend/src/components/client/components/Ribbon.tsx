'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { getImageUrl, formatNumber } from '@/lib/clientData';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface RibbonProps {
  articles?: any[];
  news?: any[];
  onArticleClick: (article: any) => void;
  title?: string;
}

export default function Ribbon({ articles, news, onArticleClick, title = "Trending Now" }: RibbonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { preferences, getPrioritizedCategories } = useUserPreferences();

  const sourceNews = useMemo(() => articles || news || [], [articles, news]);

  const sortedNews = useMemo(() => {
    if (!sourceNews || sourceNews.length === 0) {
      return [];
    }

    const prioritizedCategories = getPrioritizedCategories();
    const categoryPriority = new Map(
      prioritizedCategories.map((cat, idx) => [cat.toLowerCase(), idx])
    );

    const scored = sourceNews.map((article) => {
      let score = 0;
      const categorySlug = (article.category_slug || '').toLowerCase();
      const categoryName = (article.category_name || '').toLowerCase();
      
      if (categoryPriority.has(categorySlug)) {
        score += (10 - categoryPriority.get(categorySlug)!) * 100;
      } else if (categoryPriority.has(categoryName)) {
        score += (10 - categoryPriority.get(categoryName)!) * 100;
      }
      
      score += (article.views || 0) * 0.1;
      score += (article.likes_count || 0) * 2;
      score += (article.comments_count || 0) * 5;
      
      const publishedDate = new Date(article.published_at);
      const ageInHours = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
      if (ageInHours < 24) {
        score += 50;
      } else if (ageInHours < 72) {
        score += 25;
      }
      
      return { article, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(item => item.article);
  }, [sourceNews, getPrioritizedCategories]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ribbonRef.current) {
      observer.observe(ribbonRef.current);
    }

    return () => {
      if (ribbonRef.current) {
        observer.unobserve(ribbonRef.current);
      }
    };
  }, [isVisible]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
    trackRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !trackRef.current) return;
    const x = e.touches[0].pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const displayNews = sortedNews.length > 0 ? sortedNews : sourceNews;

  if (!displayNews || displayNews.length === 0) {
    return null;
  }

  const tripleNews = [...displayNews, ...displayNews, ...displayNews];

  const renderRibbonItem = (article: any, index: number, keyPrefix: string) => {
    const imageUrl = getImageUrl(article.image_url);
    const uniqueKey = article.news_id 
      ? `${keyPrefix}-${article.news_id}-${index}` 
      : `${keyPrefix}-${article.slug}-${index}`;
    
    return (
      <div
        key={uniqueKey}
        className="ribbon-story"
        onClick={() => !isDragging && onArticleClick(article)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onArticleClick(article)}
      >
        <div className="ribbon-story-inner">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={article.title || 'Article image'}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="ribbon-story-placeholder">
              📰
            </div>
          )}
          <div className="ribbon-story-overlay">
            <span className="ribbon-story-category">
              {article.category_name || 'News'}
            </span>
            <h4 className="ribbon-story-title">
              {article.title || 'Untitled'}
            </h4>
            <div className="ribbon-story-stats">
              <span>👁 {formatNumber(article.views || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="news-ribbon" ref={ribbonRef}>
      <div className="ribbon-container">
        {title && (
          <div className="ribbon-header">
            <h3 className="ribbon-title">{title}</h3>
            {preferences.contentType !== 'mixed' && (
              <span className="ribbon-personalized-badge">
                🎯 Personalized
              </span>
            )}
          </div>
        )}
        <div 
          className={`ribbon-scroll-track ${isVisible ? 'visible' : ''}`}
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {tripleNews.map((article: any, index: number) => 
            renderRibbonItem(article, index, 'ribbon-story')
          )}
        </div>
      </div>
    </div>
  );
}