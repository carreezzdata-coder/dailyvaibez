'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { formatDate, formatNumber, getImageUrl } from '@/lib/clientData';
import { useTimelineData } from '@/components/client/hooks/useTimelineData';
import { useTimelineEffect } from '@/components/client/hooks/useTimelineEffect';
import Share from './Share';

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

interface TimelineViewProps {
  onArticleClick: (article: Article) => void;
  preferences?: any;
}

export default function TimelineView({ onArticleClick, preferences }: TimelineViewProps) {
  const { articles, isLoading, isLoadingMore, error, hasMore, loadMore } = useTimelineData();
  const { sortedArticles } = useTimelineEffect(articles, preferences);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [tapTimers, setTapTimers] = useState<{ [key: number]: NodeJS.Timeout }>({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (isLoadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  const handleCardClick = (article: Article) => {
    const timer = tapTimers[article.news_id];
    
    if (timer) {
      clearTimeout(timer);
      setTapTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[article.news_id];
        return newTimers;
      });
      handleLikeClick(null, article);
    } else {
      onArticleClick(article);
    }
  };

  const handleLikeClick = (e: React.MouseEvent | null, article: Article) => {
    if (e) {
      e.stopPropagation();
    }
  };

  const handleShareClick = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    setSelectedArticle(article);
    setShareModalOpen(true);
  };

  const handleCloseShare = () => {
    setShareModalOpen(false);
    setSelectedArticle(null);
  };

  const getAuthorInitial = useMemo(() => {
    return (article: Article) => {
      if (article.first_name) {
        return article.first_name.charAt(0).toUpperCase();
      }
      return 'A';
    };
  }, []);

  const getArticleUrl = useMemo(() => {
    return (article: Article) => {
      if (typeof window !== 'undefined') {
        return `${window.location.origin}/news/${article.slug}`;
      }
      return '';
    };
  }, []);

  const processExcerpt = (text: string) => {
    if (!text) return text;
    
    return text
      .replace(/\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/g, '<span class="excerpt-highlight">$1</span>')
      .replace(/\[BOLD\](.*?)\[\/BOLD\]/g, '<strong class="excerpt-bold">$1</strong>')
      .replace(/\[ITALIC\](.*?)\[\/ITALIC\]/g, '<em class="excerpt-italic">$1</em>');
  };

  if (isLoading && articles.length === 0) {
    return (
      <div className="timeline-container">
        <div className="timeline-loading">
          <div className="loading-spinner"></div>
          <p>Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="timeline-container">
        <div className="timeline-error">
          <p>⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="timeline-container">
        <div className="timeline-feed">
          {sortedArticles.map((article, index) => (
            <article
              key={`timeline-${article.news_id}-${index}`}
              className="timeline-card"
              onClick={() => handleCardClick(article)}
            >
              <div className="card-header">
                <div className="author-info">
                  <div className="author-avatar">
                    {getAuthorInitial(article)}
                  </div>
                  <div className="author-details">
                    <div className="author-name">
                      {article.first_name && `${article.first_name} ${article.last_name || ''}`}
                      {!article.first_name && 'Anonymous'}
                    </div>
                    <div className="post-time">
                      {formatDate(article.published_at)}
                      {article.reading_time && ` · ${article.reading_time} min read`}
                    </div>
                  </div>
                </div>
                <div className="category-pill">
                  {article.category_name}
                </div>
              </div>

              <div className="card-content-wrapper">
                <div className="card-image-container">
                  {article.image_url ? (
                    <img
                      src={getImageUrl(article.image_url)}
                      alt={article.title}
                      loading="lazy"
                      className="card-image"
                      width={600}
                      height={400}
                    />
                  ) : (
                    <div className="card-image-placeholder">
                      <span className="placeholder-icon">📰</span>
                    </div>
                  )}
                  
                  <div className="card-text-overlay">
                    <h3 className="card-title">{article.title}</h3>
                    {article.excerpt && (
                      <p 
                        className="card-excerpt"
                        dangerouslySetInnerHTML={{ __html: processExcerpt(article.excerpt) }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="action-btn"
                  onClick={(e) => handleLikeClick(e, article)}
                  aria-label="Like"
                >
                  <span className="action-icon">❤️</span>
                  <span className="action-count">{formatNumber(article.likes_count)}</span>
                </button>

                <button 
                  className="action-btn"
                  aria-label="Views"
                >
                  <span className="action-icon">👁️</span>
                  <span className="action-count">{formatNumber(article.views)}</span>
                </button>

                <button 
                  className="action-btn action-btn-share"
                  onClick={(e) => handleShareClick(e, article)}
                  aria-label="Share"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>

        {hasMore && (
          <div ref={loadMoreRef} className="timeline-load-more">
            {isLoadingMore ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <button onClick={loadMore} className="load-more-button">
                Load More
              </button>
            )}
          </div>
        )}

        {!hasMore && sortedArticles.length > 0 && (
          <div className="timeline-end">
            <p>✨ You've reached the end</p>
          </div>
        )}
      </div>

      {selectedArticle && (
        <Share
          isOpen={shareModalOpen}
          onClose={handleCloseShare}
          title={selectedArticle.title}
          url={getArticleUrl(selectedArticle)}
          imageUrl={selectedArticle.image_url || undefined}
        />
      )}
    </>
  );
}