import React from 'react';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { getImageUrl, formatNumber, getCategoryColor } from '@/lib/clientData';
import { GalleryCardProps } from './gallery.types';
import { getExcerpt } from './gallery.utils';

const GalleryCard: React.FC<GalleryCardProps> = ({
  item,
  index,
  tier,
  isImageLoaded,
  themeColor,
  onCardClick,
  onImageLoad,
  onImageError,
  onReadMore,
}) => {
  return (
    <article
      className={`gallery-card ${tier} ${isImageLoaded ? 'image-loaded' : ''}`}
      onClick={() => onCardClick(item, index)}
    >
      <div className="gallery-card-image">
        <div className="gallery-image-wrapper">
          <Image
            src={getImageUrl(item.image_url)}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={100}
            priority={index < 6}
            loading={index < 6 ? 'eager' : 'lazy'}
            onLoad={() => onImageLoad(item.news_id)}
            onError={onImageError}
            style={{ objectFit: 'cover' }}
            unoptimized={false}
          />
        </div>
        
        <div 
          className="gallery-category-badge" 
          style={{ background: getCategoryColor(item.category_slug) }}
        >
          {item.category_name}
        </div>

        <div className="gallery-image-overlay"></div>
      </div>

      <div className="gallery-card-content">
        <div className="gallery-card-header">
          <h3 className="gallery-card-title">{item.title}</h3>
          <div className="gallery-card-brand">Daily Vaibe</div>
        </div>

        {getExcerpt(item) && (
          <p className="gallery-card-excerpt">{getExcerpt(item)}</p>
        )}

        <div className="gallery-card-meta">
          <span className="stat-item">👁️ {formatNumber(item.views || 0)}</span>
          <span className="stat-item">❤️ {formatNumber(item.likes_count || 0)}</span>
          <button 
            className="gallery-read-more"
            style={{ borderColor: themeColor }}
            onClick={(e) => {
              e.stopPropagation();
              onReadMore(item, e);
            }}
          >
            <BookOpen size={14} />
            <span>Read</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default GalleryCard;