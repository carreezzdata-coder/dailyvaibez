'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatNumber, getImageUrl } from '@/lib/clientData';

interface FooterArticle {
  slug: string;
  title: string;
  views: number;
  image_url: string;
  news_id?: number;
  likes_count?: number;
  category_name?: string;
}

interface FooterMarqueeProps {
  articles: FooterArticle[];
  position: 'top' | 'bottom';
  trackBehavior?: (action: string) => void;
}

export default function FooterMarquee({ articles, position, trackBehavior }: FooterMarqueeProps) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number | null>(null);
  const positionRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || articles.length === 0) return;
    
    const track = trackRef.current;
    if (!track) return;

    const SCROLL_SPEED = position === 'top' ? 0.8 : 1.0;
    const ITEM_WIDTH = 180 + 12;
    const ITEMS_COUNT = articles.length / 3;
    const ITEMS_WIDTH = ITEM_WIDTH * ITEMS_COUNT;

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
  }, [articles.length, isMobile, isHovered, position]);

  const scrollLeft = useCallback(() => {
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
  }, [isMobile]);

  const scrollRight = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    
    if (isMobile) {
      track.scrollBy({ left: 300, behavior: 'smooth' });
    } else {
      const SCROLL_AMOUNT = 400;
      const ITEM_WIDTH = 180 + 12;
      const ITEMS_COUNT = articles.length / 3;
      const ITEMS_WIDTH = ITEM_WIDTH * ITEMS_COUNT;
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
  }, [isMobile, articles.length]);

  const handleArticleClick = useCallback((slug: string) => {
    if (trackBehavior) {
      trackBehavior('footer_article_click');
    }
    router.push(`/client/articles/${slug}`);
  }, [router, trackBehavior]);

  if (articles.length === 0) {
    const slotClass = position === 'top' ? 'top-ad-slot' : 'bottom-ad-slot';
    return (
      <div className={position === 'top' ? 'footer-top-ads' : 'footer-bottom-ads'}>
        <div className={position === 'top' ? 'top-ads-marquee' : 'bottom-ads-marquee'}>
          {Array.from({ length: position === 'top' ? 12 : 10 }).map((_, i) => (
            <div key={`${position}-placeholder-${i}`} className={slotClass}>
              <span>Loading...</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const slotClass = position === 'top' ? 'top-ad-slot' : 'bottom-ad-slot';
  const marqueeClass = position === 'top' ? 'top-ads-marquee' : 'bottom-ads-marquee';
  const sectionClass = position === 'top' ? 'footer-top-ads' : 'footer-bottom-ads';

  return (
    <div 
      className={sectionClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        className="marquee-scroll-btn marquee-scroll-left"
        onClick={scrollLeft}
        aria-label="Scroll left"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      
      <div className="marquee-container">
        <div 
          ref={trackRef}
          className={marqueeClass}
          style={!isMobile ? { 
            transform: 'translateX(0)', 
            transition: 'transform 0.1s linear'
          } : {}}
        >
          {articles.map((article, index) => {
            const uniqueKey = `${position}-${article.slug}-${index}`;
            const imageUrl = getImageUrl(article.image_url);
            
            return (
              <div
                key={uniqueKey}
                className={slotClass}
                onClick={() => handleArticleClick(article.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleArticleClick(article.slug)}
                style={{ 
                  backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer'
                }}
                aria-label={`View article: ${article.title}`}
              >
                <div className="article-overlay">
                  {article.category_name && (
                    <span className="article-category">{article.category_name}</span>
                  )}
                  <span className="article-views">👁️ {formatNumber(article.views)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <button 
        className="marquee-scroll-btn marquee-scroll-right"
        onClick={scrollRight}
        aria-label="Scroll right"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  );
}