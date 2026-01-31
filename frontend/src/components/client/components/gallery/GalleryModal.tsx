import React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { getImageUrl, formatDate, getCategoryColor } from '@/lib/clientData';
import { GalleryModalProps } from './gallery.types';
import GalleryShare from './GalleryShare';

const GalleryModal: React.FC<GalleryModalProps> = ({
  selectedItem,
  currentIndex,
  totalItems,
  themeColor,
  onClose,
  onNavigate,
  onReadMore,
  onShare,
  posterRef,
}) => {
  if (!selectedItem) return null;

  const handleOverlayClick = () => {
    onClose();
  };

  const handlePosterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClose();
    }
  };

  return (
    <div 
      className="gallery-modal-overlay" 
      onClick={handleOverlayClick} 
      role="button" 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Close modal"
    >
      <div 
        className="gallery-modal-poster" 
        onClick={handlePosterClick} 
        ref={posterRef} 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button 
          className="gallery-modal-close no-screenshot" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {currentIndex > 0 && (
          <button 
            className="gallery-nav-btn gallery-nav-prev no-screenshot" 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('prev');
            }}
            aria-label="Previous article"
          >
            <ChevronLeft size={32} />
          </button>
        )}
        
        {currentIndex < totalItems - 1 && (
          <button 
            className="gallery-nav-btn gallery-nav-next no-screenshot" 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('next');
            }}
            aria-label="Next article"
          >
            <ChevronRight size={32} />
          </button>
        )}

        <div className="poster-image-container">
          <div className="poster-image-wrapper">
            <Image
              src={getImageUrl(selectedItem.image_url)}
              alt={selectedItem.title}
              width={700}
              height={1244}
              sizes="700px"
              quality={100}
              priority
              style={{ objectFit: 'cover' }}
              unoptimized={false}
            />
          </div>
          
          <div className="poster-gradient-overlay"></div>
          
          <div className="poster-logo">Daily Vaibe</div>

          <div 
            className="poster-category-badge" 
            style={{ background: getCategoryColor(selectedItem.category_slug) }}
          >
            {selectedItem.category_name}
          </div>

          <div className="poster-text-overlay">
            <div className="poster-text-box">
              <h2 id="modal-title" className="poster-title">{selectedItem.title}</h2>
              
              <div className="poster-meta">
                <span>By {selectedItem.first_name} {selectedItem.last_name}</span>
                <span>•</span>
                <span>{formatDate(selectedItem.published_at)}</span>
              </div>

              <button 
                className="poster-read-more-btn"
                style={{ background: themeColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  onReadMore(selectedItem);
                }}
                aria-label={`Read full article: ${selectedItem.title}`}
              >
                <BookOpen size={18} />
                Read Article
              </button>
            </div>
          </div>

          <GalleryShare 
            article={selectedItem}
            themeColor={themeColor}
            posterRef={posterRef}
            onShare={onShare}
          />
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;