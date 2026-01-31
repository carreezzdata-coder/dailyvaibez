import React from 'react';
import { GalleryControlsProps } from './gallery.types';

const GalleryControls: React.FC<GalleryControlsProps> = ({
  sortBy,
  viewMode,
  itemsPerPage,
  onSortChange,
  onViewModeChange,
  onItemsPerPageChange,
}) => {
  return (
    <div className="gallery-controls-bar">
      <div className="gallery-controls-row">
        <select 
          value={sortBy} 
          onChange={(e) => onSortChange(e.target.value)} 
          className="gallery-control-select"
        >
          <option value="recent">⏰ Most Recent</option>
          <option value="views">👁️ Most Viewed</option>
          <option value="likes">❤️ Most Liked</option>
        </select>

        <select 
          value={viewMode} 
          onChange={(e) => onViewModeChange(e.target.value)} 
          className="gallery-control-select"
        >
          <option value="masonry">🎨 Masonry View</option>
          <option value="grid">📱 Grid View</option>
          <option value="list">📋 List View</option>
        </select>

        <select 
          value={itemsPerPage} 
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))} 
          className="gallery-control-select"
        >
          <option value={12}>Show 12</option>
          <option value={24}>Show 24</option>
          <option value={36}>Show 36</option>
          <option value={48}>Show 48</option>
        </select>
      </div>
    </div>
  );
};

export default GalleryControls;