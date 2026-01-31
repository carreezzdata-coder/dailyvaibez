// frontend/src/components/client/components/articles/MediaGallery.tsx
'use client';

import React, { useState } from 'react';
import { getImageUrl } from '../../../../lib/clientData';

interface ArticleImage {
  image_url: string;
  image_caption?: string;
  alt_text?: string;
  position?: number;
}

interface MediaGalleryProps {
  images: ArticleImage[];
  onImageClick?: (index: number) => void;
  maxThumbnails?: number;
  showCaptions?: boolean;
}

export default function MediaGallery({ 
  images, 
  onImageClick, 
  maxThumbnails = 6,
  showCaptions = true 
}: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  if (!images || images.length === 0) return null;

  const handleImageError = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
    
    const originalUrl = images[index]?.image_url;
    if (originalUrl && !originalUrl.startsWith('http')) {
      const backendUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://api.dailyvaibe.com';
      e.currentTarget.src = `${backendUrl}${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}`;
    }
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    if (onImageClick) {
      onImageClick(index);
    }
  };

  const handlePrevious = () => {
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    if (onImageClick) {
      onImageClick(newIndex);
    }
  };

  const handleNext = () => {
    const newIndex = (activeIndex + 1) % images.length;
    setActiveIndex(newIndex);
    if (onImageClick) {
      onImageClick(newIndex);
    }
  };

  const displayImages = images.slice(0, maxThumbnails);

  return (
    <div className="media-gallery">
      {/* Main Image */}
      <div className="gallery-main">
        {images[activeIndex] && images[activeIndex].image_url && !imageErrors[activeIndex] ? (
          <img
            src={getImageUrl(images[activeIndex].image_url) || ''}
            alt={images[activeIndex].alt_text || images[activeIndex].image_caption || 'Gallery image'}
            className="gallery-main-image"
            loading="eager"
            onError={(e) => handleImageError(activeIndex, e)}
            onClick={() => onImageClick && onImageClick(activeIndex)}
            style={{ cursor: onImageClick ? 'pointer' : 'default' }}
          />
        ) : (
          <div className="gallery-placeholder">
            <span>🖼️</span>
            <p>Image unavailable</p>
          </div>
        )}
        
        {images.length > 1 && (
          <>
            <button 
              className="gallery-nav prev" 
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button 
              className="gallery-nav next" 
              onClick={handleNext}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="gallery-counter">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
        
        {images[activeIndex]?.image_caption && showCaptions && (
          <div className="gallery-caption">
            {images[activeIndex].image_caption}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {displayImages.map((image, index) => (
            <div
              key={index}
              className={`gallery-thumbnail ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(index)}
             role="button" tabIndex={0}>
              <img
                src={getImageUrl(image.image_url) || ''}
                alt={`Thumbnail ${index + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60"><rect width="100" height="60" fill="%23f0f0f0"/><text x="50" y="30" font-family="Arial" font-size="12" text-anchor="middle" fill="%23999">Thumb</text></svg>';
                }}
              />
              {index === activeIndex && <div className="thumbnail-active-indicator" />}
            </div>
          ))}
          
          {images.length > maxThumbnails && (
            <div className="gallery-more-thumbs">
              +{images.length - maxThumbnails}
            </div>
          )}
        </div>
      )}
    </div>
  );
}