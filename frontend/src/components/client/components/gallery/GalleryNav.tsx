import React from 'react';
import { GalleryNavProps } from './gallery.types';

const GalleryNav: React.FC<GalleryNavProps> = ({
  selectedCategory,
  expandedCategory,
  categoryGroups,
  isLoadingCategories,
  themeColor,
  onCategorySelect,
  onCategoryExpand,
  onCategoryClick,
  onSubcategoryClick,
}) => {
  return (
    <nav className="gallery-horizontal-nav">
      <div className="gallery-nav-scroll">
        <button
          onClick={() => {
            onCategorySelect('all');
            onCategoryExpand(null);
          }}
          className={`gallery-nav-item ${selectedCategory === 'all' ? 'active' : ''}`}
          style={selectedCategory === 'all' ? { '--nav-color': themeColor } as React.CSSProperties : {}}
        >
          <span className="nav-item-icon">🌍</span>
          <span className="nav-item-text">All Stories</span>
        </button>

        {!isLoadingCategories && categoryGroups.map(group => {
          const hasSubcategories = group.categories && group.categories.length > 0;
          const isExpanded = expandedCategory === group.slug;
          const isActive = selectedCategory === group.slug;

          return (
            <div key={group.slug} className="gallery-nav-dropdown-wrapper">
              <button
                onClick={() => onCategoryClick(group.slug, hasSubcategories)}
                className={`gallery-nav-item ${isActive ? 'active' : ''}`}
                style={isActive ? { '--nav-color': themeColor } as React.CSSProperties : {}}
              >
                <span className="nav-item-icon">{group.icon}</span>
                <span className="nav-item-text">{group.title}</span>
                {hasSubcategories && (
                  <span className="nav-item-arrow">{isExpanded ? '▲' : '▼'}</span>
                )}
              </button>

              {hasSubcategories && isExpanded && (
                <div className="gallery-nav-dropdown">
                  {group.categories.map(subcat => (
                    <button
                      key={subcat.slug}
                      onClick={() => onSubcategoryClick(subcat.slug)}
                      className="gallery-nav-dropdown-item"
                      style={{ '--dropdown-color': themeColor } as React.CSSProperties}
                    >
                      {subcat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default GalleryNav;