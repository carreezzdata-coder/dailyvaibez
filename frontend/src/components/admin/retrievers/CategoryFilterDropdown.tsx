'use client';

import React from 'react';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id?: number;
  group?: string;
}

interface CategoryGroup {
  title: string;
  icon: string;
  description?: string;
  mainSlug?: string;
  categories: Category[];
}

interface CategoryFilterDropdownProps {
  categoryGroups: CategoryGroup[];
  categoryFilter: number[];
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onCategoryToggle: (categoryId: number) => void;
  onClearFilters: () => void;
}

const MAIN_CATEGORY_GROUPS: Record<string, { icon: string; color: string }> = {
  'live-world': { icon: '🌍', color: '#2563eb' },
  'counties': { icon: '🏛️', color: '#7c3aed' },
  'politics': { icon: '⚖️', color: '#dc2626' },
  'business': { icon: '💼', color: '#059669' },
  'opinion': { icon: '💭', color: '#ea580c' },
  'sports': { icon: '⚽', color: '#0891b2' },
  'lifestyle': { icon: '🌺', color: '#db2777' },
  'entertainment': { icon: '🎬', color: '#8b5cf6' },
  'tech': { icon: '💻', color: '#0284c7' },
  'other': { icon: '📌', color: '#0233df' }
};

const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = ({
  categoryGroups,
  categoryFilter,
  showDropdown,
  onToggleDropdown,
  onCategoryToggle,
  onClearFilters
}) => {
  return (
    <div className="category-filter-dropdown">
      <div className="filter-header-compact">
        <div className="filter-title-row">
          <h3>📂 Filter by Categories</h3>
          <button 
            className="toggle-categories-btn"
            onClick={onToggleDropdown}
          >
            {showDropdown ? '▲ Hide Filters' : '▼ Show Filters'}
          </button>
        </div>
        
        <div className="filter-stats-row">
          <span className="count-badge">
            {categoryFilter.length} categor{categoryFilter.length === 1 ? 'y' : 'ies'} selected
          </span>
          {categoryFilter.length > 0 && (
            <button 
              onClick={onClearFilters} 
              className="clear-btn"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="category-dropdown-content">
          <div className="category-groups-container">
            {categoryGroups.map(group => {
              const selectedCount = group.categories.filter(cat => 
                categoryFilter.includes(cat.category_id)
              ).length;

              const groupConfig = MAIN_CATEGORY_GROUPS[group.mainSlug || 'other'];

              return (
                <div key={group.mainSlug} className="category-group">
                  <div 
                    className="category-group-header"
                    style={{ borderLeftColor: groupConfig?.color }}
                  >
                    <span className="group-icon">{groupConfig?.icon || group.icon}</span>
                    <span className="group-name">{group.title}</span>
                    {selectedCount > 0 && (
                      <span className="group-selected-count">{selectedCount} selected</span>
                    )}
                  </div>
                  
                  <div className="category-checkboxes">
                    {group.categories.map(category => {
                      const isSelected = categoryFilter.includes(category.category_id);
                      return (
                        <label 
                          key={category.category_id} 
                          className={`category-checkbox-item ${isSelected ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onCategoryToggle(category.category_id)}
                          />
                          <span>{category.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterDropdown;