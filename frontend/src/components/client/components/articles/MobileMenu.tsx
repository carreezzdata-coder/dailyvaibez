'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, Calendar } from 'lucide-react';
import { getImageUrl, formatNumber, formatDate } from '../../../../lib/clientData';

interface RelatedArticle {
  news_id: number;
  title: string;
  slug: string;
  image_url?: string;
  views: number;
  published_at: string;
  first_name?: string;
  last_name?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  relatedArticles: RelatedArticle[];
  onClose: () => void;
  onArticleClick: (article: RelatedArticle) => void;
}

export default function MobileMenu({ 
  isOpen, 
  relatedArticles, 
  onClose, 
  onArticleClick 
}: MobileMenuProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = () => {
    if (isLoading || visibleCount >= relatedArticles.length) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 10, relatedArticles.length));
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight - scrollTop - clientHeight < 200 && !isLoading) {
        loadMore();
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [isLoading, visibleCount, relatedArticles.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const visibleArticles = relatedArticles.slice(0, visibleCount);

  return (
    <>
      <div 
        className={`mobile-sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      <div className={`mobile-sidebar-drawer ${isOpen ? 'right' : ''}`} ref={scrollRef}>
        <button 
          className="mobile-sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        <h2 className="sidebar-title">
          <span className="widget-icon">💡</span>
          Recommended for You
        </h2>

        <div className="sidebar-article-list">
          {visibleArticles.map((article: RelatedArticle, index: number) => (
            <React.Fragment key={article.news_id}>
              <div 
                onClick={() => {
                  onArticleClick(article);
                  onClose();
                }} 
                className="sidebar-article-item"
              >
                <div className="sidebar-article-thumb">
                  {article.image_url ? (
                    <img 
                      src={getImageUrl(article.image_url) || ''} 
                      alt={article.title} 
                      loading="lazy"
                      width="70"
                      height="70"
                    />
                  ) : (
                    <div className="sidebar-thumb-placeholder">📰</div>
                  )}
                </div>
                <div className="sidebar-article-content">
                  <h4 className="sidebar-article-title">{article.title}</h4>
                  <div className="sidebar-article-meta">
                    <span className="meta-item">
                      <Eye size={10} /> {formatNumber(article.views)}
                    </span>
                    <span className="meta-item">
                      <Calendar size={10} /> {formatDate(article.published_at)}
                    </span>
                  </div>
                </div>
              </div>
              {(index + 1) % 5 === 0 && index < visibleArticles.length - 1 && (
                <div className="google-ad-sidebar" key={`ad-${index}`}>
                  <div className="ad-label">Advertisement</div>
                </div>
              )}
            </React.Fragment>
          ))}
          
          {isLoading && (
            <div className="sidebar-loading">
              <div className="loading-spinner"></div>
              <p>Loading more articles...</p>
            </div>
          )}
          
          {visibleCount >= relatedArticles.length && relatedArticles.length > 0 && (
            <div className="sidebar-end-message">
              <p>🎉 You've reached the end!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}