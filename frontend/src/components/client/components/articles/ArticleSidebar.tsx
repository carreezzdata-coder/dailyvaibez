'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getImageUrl, formatNumber, formatDate } from '../../../../lib/clientData';
import { Eye, Calendar, X } from 'lucide-react';

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

interface ArticleSidebarProps {
  relatedArticles: RelatedArticle[];
  onArticleClick: (article: RelatedArticle) => void;
  onClose?: () => void;
}

export default function ArticleSidebar({ 
  relatedArticles, 
  onArticleClick,
  onClose
}: ArticleSidebarProps) {
  const [visibleCount, setVisibleCount] = useState(20);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = () => {
    if (isLoading || visibleCount >= relatedArticles.length) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 20, relatedArticles.length));
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

  const visibleArticles = relatedArticles.slice(0, visibleCount);

  return (
    <aside className="art-rec-container">
      {/* Mobile Close Button */}
      {onClose && (
        <button className="art-rec-mobile-close" onClick={onClose} aria-label="Close sidebar">
          <X size={24} />
        </button>
      )}

      <div className="art-rec-sticky-wrapper" ref={scrollRef}>
        <div className="art-rec-widget-box">
          <h2 className="art-rec-heading">
            <span className="art-rec-icon">💡</span>
            Recommended for You
          </h2>

          <div className="art-rec-list">
            {visibleArticles.map((article: RelatedArticle, index: number) => (
              <React.Fragment key={article.news_id}>
                <div 
                  onClick={() => onArticleClick(article)} 
                  className="art-rec-card"
                >
                  <div className="art-rec-image-box">
                    {article.image_url ? (
                      <img 
                        src={getImageUrl(article.image_url) || ''} 
                        alt={article.title} 
                        loading="lazy"
                        width="80"
                        height="80"
                        className="art-rec-img"
                      />
                    ) : (
                      <div className="art-rec-placeholder">📰</div>
                    )}
                  </div>
                  <div className="art-rec-text-area">
                    <h4 className="art-rec-title">{article.title}</h4>
                    <div className="art-rec-metadata">
                      <span className="art-rec-stat">
                        <Eye size={10} /> {formatNumber(article.views)}
                      </span>
                      <span className="art-rec-stat">
                        <Calendar size={10} /> {formatDate(article.published_at)}
                      </span>
                    </div>
                  </div>
                </div>
                {(index + 1) % 10 === 0 && index < visibleArticles.length - 1 && (
                  <div className="art-rec-ad-slot" key={`ad-${index}`}>
                    <div className="art-rec-ad-label">Advertisement</div>
                  </div>
                )}
              </React.Fragment>
            ))}
            
            {isLoading && (
              <div className="art-rec-loader">
                <div className="art-rec-spinner"></div>
                <p>Loading more articles...</p>
              </div>
            )}
            
            {visibleCount >= relatedArticles.length && relatedArticles.length > 0 && (
              <div className="art-rec-end-msg">
                <p>🎉 You've reached the end!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}