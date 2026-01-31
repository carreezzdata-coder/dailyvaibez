'use client';

import React from 'react';

interface TrendingControlsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  availableCategories: Array<{ name: string; slug: string; color: string }>;
  sortBy: 'latest' | 'views' | 'engagement';
  onSortChange: (sort: 'latest' | 'views' | 'engagement') => void;
  isRefreshing: boolean;
}

export default function TrendingControls({
  selectedCategory,
  onCategoryChange,
  availableCategories,
  sortBy,
  onSortChange,
  isRefreshing
}: TrendingControlsProps) {
  return (
    <div className="trending-controls">
      <div className="controls-left">
        <select
          className="category-filter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">All Categories</option>
          {availableCategories.map(cat => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="controls-right">
        {isRefreshing && (
          <div className="auto-refresh-indicator">
            <span className="refresh-spinner">🔄</span>
            <span className="refresh-text">Updating...</span>
          </div>
        )}

        <div className="sort-controls">
          <button
            className={`sort-btn ${sortBy === 'engagement' ? 'active' : ''}`}
            onClick={() => onSortChange('engagement')}
          >
            🔥 Top
          </button>
          <button
            className={`sort-btn ${sortBy === 'views' ? 'active' : ''}`}
            onClick={() => onSortChange('views')}
          >
            👁️ Views
          </button>
          <button
            className={`sort-btn ${sortBy === 'latest' ? 'active' : ''}`}
            onClick={() => onSortChange('latest')}
          >
            ⏰ Latest
          </button>
        </div>
      </div>
    </div>
  );
}