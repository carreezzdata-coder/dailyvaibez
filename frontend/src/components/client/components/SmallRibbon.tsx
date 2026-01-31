'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatNumber, getImageUrl } from '@/lib/clientData';
import { useArticle, NewsItem } from '@/components/client/hooks/useArticle';

interface SmallRibbonProps {
  onArticleClick: (article: NewsItem) => void;
}

export default function SmallRibbon({ onArticleClick }: SmallRibbonProps) {
  const { allNews, isLoadingNews, fetchAllNews } = useArticle();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);
  const positionRef = useRef<number>(0);

  // Fetch news on mount
  useEffect(() => {
    console.log('SmallRibbon mounted, fetching news...');
    fetchAllNews();
  }, [fetchAllNews]);

  // Log when news changes
  useEffect(() => {
    console.log('SmallRibbon allNews:', allNews.length, 'items');
    console.log('SmallRibbon isLoadingNews:', isLoadingNews);
  }, [allNews, isLoadingNews]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || allNews.length === 0 || !trackRef.current) return;
    
    const track = trackRef.current;
    const SCROLL_SPEED = 1.0;
    const ITEM_WIDTH = 140 + 12;
    const ITEMS_WIDTH = ITEM_WIDTH * allNews.length;

    const animate = () => {
      if (!isHovered) {
        positionRef.current += SCROLL_SPEED;
        
        if (positionRef.current >= ITEMS_WIDTH) {
          positionRef.current = 0;
        }
        
        if (track) {
          track.style.transform = `translateX(-${positionRef.current}px)`;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const timeout = setTimeout(() => {
      animate();
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [allNews.length, isMobile, isHovered]);

  const scrollLeft = () => {
    const track = trackRef.current;
    if (!track) return;
    
    if (isMobile) {
      track.scrollBy({ left: -300, behavior: 'smooth' });
    } else {
      const SCROLL_AMOUNT = 400;
      const newPosition = Math.max(0, positionRef.current - SCROLL_AMOUNT);
      
      track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      track.style.transform = `translateX(-${newPosition}px)`;
      positionRef.current = newPosition;
      
      setTimeout(() => {
        if (track) {
          track.style.transition = 'transform 0.1s linear';
        }
      }, 500);
    }
  };

  const scrollRight = () => {
    const track = trackRef.current;
    if (!track) return;
    
    if (isMobile) {
      track.scrollBy({ left: 300, behavior: 'smooth' });
    } else {
      const SCROLL_AMOUNT = 400;
      const ITEM_WIDTH = 140 + 12;
      const ITEMS_WIDTH = ITEM_WIDTH * allNews.length;
      const newPosition = Math.min(ITEMS_WIDTH, positionRef.current + SCROLL_AMOUNT);
      
      track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      track.style.transform = `translateX(-${newPosition}px)`;
      positionRef.current = newPosition;
      
      setTimeout(() => {
        if (track) {
          track.style.transition = 'transform 0.1s linear';
        }
      }, 500);
    }
  };

  // Show loading state
  if (isLoadingNews) {
    return (
      <div className="small-ribbon-wrapper">
        <button className="ribbon-nav-btn ribbon-nav-left" onClick={scrollLeft} aria-label="Scroll left">‹</button>
        <div className="small-ribbon-container">
          <div className="ribbon-track">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ribbon-item">
                <div className="ribbon-item-thumb">
                  <div className="ribbon-placeholder">⏳</div>
                </div>
                <div className="ribbon-item-content">
                  <span className="ribbon-category">LOADING</span>
                  <div className="ribbon-item-title">Loading articles...</div>
                  <div className="ribbon-item-meta">
                    <span className="ribbon-views">👁 0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="ribbon-nav-btn ribbon-nav-right" onClick={scrollRight} aria-label="Scroll right">›</button>
      </div>
    );
  }

  // Show empty state
  if (!allNews || allNews.length === 0) {
    return (
      <div className="small-ribbon-wrapper">
        <button className="ribbon-nav-btn ribbon-nav-left" onClick={scrollLeft} aria-label="Scroll left">‹</button>
        <div className="small-ribbon-container">
          <div className="ribbon-track">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ribbon-item">
                <div className="ribbon-item-thumb">
                  <div className="ribbon-placeholder">📰</div>
                </div>
                <div className="ribbon-item-content">
                  <span className="ribbon-category">NEWS</span>
                  <div className="ribbon-item-title">No articles available</div>
                  <div className="ribbon-item-meta">
                    <span className="ribbon-views">👁 0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="ribbon-nav-btn ribbon-nav-right" onClick={scrollRight} aria-label="Scroll right">›</button>
      </div>
    );
  }

  const duplicatedArticles = isMobile ? allNews : [...allNews, ...allNews, ...allNews];

  return (
    <div 
      className="small-ribbon-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button className="ribbon-nav-btn ribbon-nav-left" onClick={scrollLeft} aria-label="Scroll left">‹</button>
      <div className="small-ribbon-container">
        <div ref={trackRef} className="ribbon-track">
          {duplicatedArticles.map((article, index) => {
            const imageUrl = getImageUrl(article.image_url || '');
            const uniqueKey = `${article.news_id}-${index}`;
            
            return (
              <div
                key={uniqueKey}
                className="ribbon-item"
                onClick={() => onArticleClick(article)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onArticleClick(article);
                  }
                }}
              >
                <div className="ribbon-item-thumb">
                  {imageUrl ? (
                    <img src={imageUrl} alt={article.title} loading="lazy" />
                  ) : (
                    <div className="ribbon-placeholder">📰</div>
                  )}
                </div>
                <div className="ribbon-item-content">
                  <span className="ribbon-category">{article.category_name}</span>
                  <div className="ribbon-item-title">{article.title}</div>
                  <div className="ribbon-item-meta">
                    <span className="ribbon-views">👁 {formatNumber(article.views)}</span>
                    <span className="ribbon-likes">❤️ {formatNumber(article.likes_count)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <button className="ribbon-nav-btn ribbon-nav-right" onClick={scrollRight} aria-label="Scroll right">›</button>
    </div>
  );
}