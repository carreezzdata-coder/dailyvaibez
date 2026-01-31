'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { formatNumber, formatDate, getImageUrl } from '@/lib/clientData';
import { useFeatured } from '@/components/client/hooks/useFeatured';
import { useTrending } from '@/components/client/hooks/useTrending';
import type { NewsItem } from '@/components/client/hooks/useArticle';

interface SidebarProps {
  type: 'featured' | 'trending';
  onArticleClick: (article: NewsItem) => void;
}

export default function Sidebar({ type, onArticleClick }: SidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { news: featuredNews, isLoading: featuredLoading } = useFeatured();
  const { data: trendingData, isRefreshing: trendingLoading } = useTrending();

  const articles = useMemo(() => {
    return type === 'featured' ? featuredNews : (trendingData?.trending || []);
  }, [type, featuredNews, trendingData]);

  const isLoading = type === 'featured' ? featuredLoading : trendingLoading;

  useEffect(() => {
    if (!containerRef.current || articles.length === 0) return;

    const items = containerRef.current.querySelectorAll('.home-sb-entry');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [articles]);

  return (
    <div ref={containerRef} className="home-sb-wrapper">
      <div className="home-sb-section">
        <div className="home-sb-top-bar">
          <span className="home-sb-emoji">{type === 'featured' ? '⭐' : '📈'}</span>
          <h3 className="home-sb-label">
            {type === 'featured' ? 'Featured' : 'Trending'}
          </h3>
          {isLoading && <span className="home-sb-loading-icon">↻</span>}
        </div>

        <div className="home-sb-entries-list">
          {articles.length === 0 && !isLoading ? (
            <div className="home-sb-no-content">
              <p>No {type} articles available</p>
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={`${type}-${article.news_id}`}
                className="home-sb-entry"
                onClick={() => article && onArticleClick(article)}
                role="button" 
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && article && onArticleClick(article)}
              >
                <div className="home-sb-img-wrapper">
                  {article?.image_url ? (
                    <img
                      src={getImageUrl(article.image_url)}
                      alt={article.title}
                      loading="lazy"
                      width="60"
                      height="60"
                      className="home-sb-img"
                    />
                  ) : (
                    <div className="home-sb-img-fallback">📰</div>
                  )}
                </div>
                
                <div className="home-sb-info">
                  <h4 className="home-sb-headline">{article?.title || 'Loading...'}</h4>
                  <div className="home-sb-details">
                    {article?.published_at && (
                      <span className="home-sb-date">📅 {formatDate(article.published_at)}</span>
                    )}
                    {type === 'featured' && article?.first_name && (
                      <span className="home-sb-writer">✍️ {article.first_name} {article.last_name || ''}</span>
                    )}
                    <span className="home-sb-views">👁 {article?.views ? formatNumber(article.views) : '0'}</span>
                    {type === 'trending' && article?.likes_count !== undefined && (
                      <span className="home-sb-hearts">❤️ {formatNumber(article.likes_count)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}