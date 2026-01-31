import React from 'react';
import { X } from 'lucide-react';
import { formatDate, getCategoryColor } from '@/lib/clientData';
import { GalleryFlashReaderProps } from './gallery.types';

const GalleryFlashReader: React.FC<GalleryFlashReaderProps> = ({
  article,
  themeColor,
  onClose,
  onFullArticle,
  flashReaderRef,
}) => {
  if (!article) return null;

  const paragraphs = article.content?.split('\n').filter(p => p.trim()) || [];
  const midPoint = Math.floor(paragraphs.length / 2);

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClose();
    }
  };

  const handleFullArticleClick = () => {
    onFullArticle(article.slug);
  };

  return (
    <div 
      className="flash-reader-overlay" 
      onClick={handleOverlayClick} 
      role="button" 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Close flash reader"
    >
      <div 
        className="flash-reader-container" 
        onClick={handleContainerClick} 
        ref={flashReaderRef} 
        role="dialog"
        aria-modal="true"
        aria-labelledby="flash-title"
      >
        <button 
          className="flash-close-btn" 
          onClick={onClose}
          aria-label="Close flash reader"
        >
          <X size={24} />
        </button>

        <div className="flash-reader-content">
          <div className="flash-header">
            <span 
              className="flash-category-badge" 
              style={{ background: getCategoryColor(article.category_slug) }}
            >
              {article.category_name}
            </span>
            <h2 id="flash-title" className="flash-title">{article.title}</h2>
            <div className="flash-meta">
              <span>By {article.first_name} {article.last_name}</span>
              <span>•</span>
              <span>{formatDate(article.published_at)}</span>
              <span>•</span>
              <span>{article.reading_time || 5} min read</span>
            </div>
          </div>

          <div className="flash-body">
            {paragraphs.slice(0, midPoint).map((para, idx) => (
              <p key={`p1-${idx}`} dangerouslySetInnerHTML={{ __html: para }} />
            ))}

            <div className="flash-ad-slot">
              <div className="ad-label">Advertisement</div>
              <div className="ad-placeholder">
                <div className="ad-icon">📢</div>
                <p>Your ad could be here - Reach out to us!</p>
              </div>
            </div>

            {paragraphs.slice(midPoint).map((para, idx) => (
              <p key={`p2-${idx}`} dangerouslySetInnerHTML={{ __html: para }} />
            ))}

            {article.tags && (
              <div className="flash-tags">
                <span className="tags-label">Tags:</span>
                {article.tags.split(',').map((tag, idx) => (
                  <span key={idx} className="tag-pill">{tag.trim()}</span>
                ))}
              </div>
            )}

            <button 
              className="flash-full-article-btn"
              style={{ background: themeColor }}
              onClick={handleFullArticleClick}
              aria-label={`Read full article: ${article.title}`}
            >
              Read Full Article →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryFlashReader;