'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../../../../lib/clientData';

interface ArticleImage {
  image_url: string;
  image_caption?: string;
  alt_text?: string;
  position?: number;
}

interface LightboxProps {
  isOpen: boolean;
  images: ArticleImage[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export default function Lightbox({ isOpen, images, currentIndex, onClose, onIndexChange }: LightboxProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (scrollRef.current && images.length > 1) {
      const thumbWidth = 70;
      const gap = 10;
      const scrollPosition = activeIndex * (thumbWidth + gap);
      scrollRef.current.scrollTo({
        left: scrollPosition - (scrollRef.current.offsetWidth / 2) + (thumbWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, activeIndex]);

  const handlePrevious = () => {
    if (images.length <= 1) return;
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    onIndexChange(newIndex);
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    const newIndex = (activeIndex + 1) % images.length;
    setActiveIndex(newIndex);
    onIndexChange(newIndex);
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    onIndexChange(index);
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft -= 150;
  };

  const handleScrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft += 150;
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div 
      className="lightbox-overlay" 
      onClick={onClose}
      role="button" 
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Close lightbox">
        <X size={24} />
      </button>

      <div 
        className="lightbox-content" 
        onClick={(e) => e.stopPropagation()}
        role="button" 
        tabIndex={0}
      >
        <div className="lightbox-main-wrapper">
          <img
            src={getImageUrl(images[activeIndex]?.image_url) || ''}
            alt={images[activeIndex]?.alt_text || images[activeIndex]?.image_caption || 'Article image'}
            className="lightbox-main-image"
            width="1200"
            height="800"
          />

          {images.length > 1 && (
            <>
              <button 
                className="lightbox-nav prev" 
                onClick={handlePrevious} 
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <button 
                className="lightbox-nav next" 
                onClick={handleNext} 
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="lightbox-thumbnails-strip">
            <button 
              className="lightbox-scroll-btn prev" 
              onClick={handleScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="lightbox-thumbnails-scroll" ref={scrollRef}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`lightbox-thumbnail ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(idx)}
                  role="button" 
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleThumbnailClick(idx);
                    }
                  }}
                >
                  <img
                    src={getImageUrl(img.image_url) || ''}
                    alt={`Thumbnail ${idx + 1}`}
                    loading="lazy"
                    width="70"
                    height="70"
                  />
                  {idx === activeIndex && <div className="lightbox-thumb-bar" />}
                </div>
              ))}
            </div>

            <button 
              className="lightbox-scroll-btn next" 
              onClick={handleScrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {images[activeIndex]?.image_caption && (
          <div className="lightbox-caption">
            {images[activeIndex].image_caption}
          </div>
        )}

        {images.length > 1 && (
          <div className="lightbox-counter">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}