import React, { memo } from 'react';
import { formatDate, formatNumber, getImageUrl } from '@/lib/clientData';
import { useSlider } from '@/components/client/hooks/useSlider';

interface SlideArticle {
  news_id: string | number;
  title: string;
  excerpt?: string;
  slug: string;
  image_url: string | null;
  published_at: string;
  reading_time?: number;
  views: number;
  likes_count?: number;
  comments_count?: number;
  first_name?: string;
  last_name?: string;
  category_name: string;
}

interface HeroSliderProps {
  slides?: SlideArticle[];
  onSlideClick: (article: SlideArticle) => void;
}

const Slide = memo(({ slide, isActive, onClick }: { slide: SlideArticle; isActive: boolean; onClick: () => void }) => {
  const imageUrl = getImageUrl(slide.image_url || '');
  const authorName = slide.first_name ? `${slide.first_name} ${slide.last_name || ''}`.trim() : null;

  return (
    <div 
      className={`hero-single-slide ${isActive ? 'slide-active' : ''}`}
      onClick={onClick}
      style={{ zIndex: isActive ? 2 : 1 }}
    >
      <div className="hero-image-container">
        <img src={imageUrl} alt={slide.title} loading={isActive ? 'eager' : 'lazy'} width="1200" height="675" />
      </div>
      <div className="hero-gradient-layer"></div>
      <div className="hero-text-overlay">
        <span className="hero-category-label">{slide.category_name}</span>
        <h1 className="hero-main-title">{slide.title}</h1>
        {slide.excerpt && <p className="hero-excerpt-text">{slide.excerpt}</p>}
        <div className="hero-metadata">
          {authorName && (
            <>
              <span className="hero-meta-item"><span className="meta-icon">✍️</span><span>{authorName}</span></span>
              <span className="hero-meta-separator">•</span>
            </>
          )}
          <span className="hero-meta-item"><span className="meta-icon">📅</span><span>{formatDate(slide.published_at)}</span></span>
          <span className="hero-meta-separator">•</span>
          <span className="hero-meta-item"><span className="meta-icon">👁️</span><span>{formatNumber(slide.views)}</span></span>
          {slide.likes_count && slide.likes_count > 0 && (
            <>
              <span className="hero-meta-separator">•</span>
              <span className="hero-meta-item"><span className="meta-icon">❤️</span><span>{formatNumber(slide.likes_count)}</span></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

Slide.displayName = 'Slide';

export default function HeroSlider({ slides = [], onSlideClick }: HeroSliderProps) {
  const {
    currentIndex,
    nextSlide,
    prevSlide,
    goToSlide,
    pauseAutoPlay,
    resumeAutoPlay
  } = useSlider({
    items: slides,
    autoPlayInterval: 6000,
    transitionDuration: 800
  });

  if (!slides || slides.length === 0) {
    return (
      <div className="hero-main-wrapper">
        <div className="hero-empty-state">
          <p>No featured stories available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-main-wrapper" onMouseEnter={pauseAutoPlay} onMouseLeave={resumeAutoPlay}>
      <div className="hero-slider-viewport">
        {slides.map((slide, index) => (
          <Slide
            key={`slide-${slide.news_id}`}
            slide={slide}
            isActive={index === currentIndex}
            onClick={() => onSlideClick(slide)}
          />
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button 
            className="hero-nav-button hero-nav-prev" 
            onClick={prevSlide}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              fontSize: '32px',
              width: '50px',
              height: '50px'
            }}
          >
            ‹
          </button>
          <button 
            className="hero-nav-button hero-nav-next" 
            onClick={nextSlide}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              fontSize: '32px',
              width: '50px',
              height: '50px'
            }}
          >
            ›
          </button>
          <div className="hero-dots-container">
            {slides.map((_, index) => (
              <button
                key={`dot-${index}`}
                className={`hero-dot-button ${index === currentIndex ? 'dot-active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}