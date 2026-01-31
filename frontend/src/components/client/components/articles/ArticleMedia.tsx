import React, { useState } from 'react';
import { getImageUrl } from '../../../../lib/clientData';

interface ArticleImage {
  image_url: string;
  image_caption?: string;
  alt_text?: string;
  is_featured?: boolean;
  position?: number;
}

interface ArticleMediaProps {
  images?: ArticleImage[];
  allImages: ArticleImage[];
  activeIndex: number;
  onImageClick: (index: number) => void;
  onThumbnailClick: (index: number) => void;
}

export default function ArticleMedia({
  images = [],
  allImages,
  activeIndex,
  onImageClick,
  onThumbnailClick
}: ArticleMediaProps) {
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const headerImages = images.filter(img => !img.position || img.position === 0);

  const handlePrevious = () => {
    const newIndex = activeIndex === 0 ? headerImages.length - 1 : activeIndex - 1;
    const globalIndex = allImages.findIndex(
      img => img.image_url === headerImages[newIndex].image_url
    );
    onThumbnailClick(globalIndex >= 0 ? globalIndex : 0);
  };

  const handleNext = () => {
    const newIndex = (activeIndex + 1) % headerImages.length;
    const globalIndex = allImages.findIndex(
      img => img.image_url === headerImages[newIndex].image_url
    );
    onThumbnailClick(globalIndex >= 0 ? globalIndex : 0);
  };

  const handleImageError = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(prev => ({ ...prev, [index]: true }));
    
    const originalUrl = headerImages[index]?.image_url;
    if (originalUrl && !originalUrl.startsWith('http')) {
      const backendUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://api.dailyvaibe.com';
      e.currentTarget.src = `${backendUrl}${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}`;
    }
  };

  const handleClick = () => {
    const globalIndex = allImages.findIndex(
      img => img.image_url === headerImages[activeIndex].image_url
    );
    onImageClick(globalIndex >= 0 ? globalIndex : 0);
  };

  if (headerImages.length === 0) return null;

  return (
    <div className="article-media-section">
      <div 
        className="media-main-image" 
        onClick={handleClick}
        role="button" 
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {headerImages[activeIndex] && headerImages[activeIndex].image_url && !imageError[activeIndex] ? (
          <img
            src={getImageUrl(headerImages[activeIndex].image_url) || ''}
            alt={headerImages[activeIndex].image_caption || headerImages[activeIndex].alt_text || 'Article image'}
            loading="eager"
            onError={(e) => handleImageError(activeIndex, e)}
            width="800"
            height="450"
          />
        ) : (
          <div className="image-placeholder">
            <span>🖼️</span>
            <p>Image unavailable</p>
          </div>
        )}
        {headerImages[activeIndex]?.image_caption && (
          <div className="media-caption">{headerImages[activeIndex].image_caption}</div>
        )}
        {headerImages.length > 1 && (
          <React.Fragment>
            <button
              className="media-nav-btn prev"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="media-nav-btn next"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="media-image-counter">
              {activeIndex + 1} / {headerImages.length}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}