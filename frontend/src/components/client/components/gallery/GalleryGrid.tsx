import React from 'react';
import { GalleryGridProps } from './gallery.types';
import GalleryCard from './GalleryCard';
import { getTierClass } from './gallery.utils';

const GalleryGrid: React.FC<GalleryGridProps> = ({
  items,
  viewMode,
  isVisible,
  themeColor,
  imageLoadStates,
  onCardClick,
  onImageLoad,
  onImageError,
  onReadMore,
  onHoverChange,
}) => {
  return (
    <div 
      className={`gallery-grid-container view-${viewMode} ${isVisible ? 'animate' : ''}`}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {items.map((item, index) => {
        const tier = getTierClass(item);
        const isImageLoaded = imageLoadStates[item.news_id];

        return (
          <GalleryCard
            key={`${item.news_id}-${index}`}
            item={item}
            index={index}
            tier={tier}
            isImageLoaded={isImageLoaded}
            themeColor={themeColor}
            onCardClick={onCardClick}
            onImageLoad={onImageLoad}
            onImageError={onImageError}
            onReadMore={onReadMore}
          />
        );
      })}
    </div>
  );
};

export default GalleryGrid;