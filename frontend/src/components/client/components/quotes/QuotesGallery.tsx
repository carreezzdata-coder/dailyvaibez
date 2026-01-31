'use client';

import React, { useState, useEffect } from 'react';
import { Quote } from '../../hooks/useQuotes';
import { getTierClass, getThemeColor } from './QuotesUtils';
import QuoteCard from './QuoteCard';
import QuotesControls from './QuotesControls';

interface QuotesGalleryProps {
  allQuotes: Quote[];
  currentTheme: string;
  onQuoteClick: (quote: Quote, index: number) => void;
}

const QuotesGallery: React.FC<QuotesGalleryProps> = ({
  allQuotes,
  currentTheme,
  onQuoteClick,
}) => {
  const [viewMode, setViewMode] = useState<string>('masonry');
  const [itemsPerPage, setItemsPerPage] = useState<number>(24);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const themeColor = getThemeColor(currentTheme);
  const displayedQuotes = allQuotes.slice(0, itemsPerPage);

  useEffect(() => {
    console.log('[QuotesGallery] Rendering:', {
      totalQuotes: allQuotes.length,
      itemsPerPage,
      displayedCount: displayedQuotes.length,
      viewMode
    });
  }, [allQuotes.length, itemsPerPage, displayedQuotes.length, viewMode]);

  const handleLoadMore = () => {
    const newCount = itemsPerPage + 12;
    setItemsPerPage(newCount);
    console.log('[QuotesGallery] Loading more:', { oldCount: itemsPerPage, newCount });
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 50);
  };

  const handleItemsPerPageChange = (count: number) => {
    setItemsPerPage(count);
  };

  if (!allQuotes || allQuotes.length === 0) {
    return (
      <div className="quotes-center-content">
        <div className="quotes-header-section">
          <h1 className="quotes-main-title">Words That Shape Our World</h1>
          <p className="quotes-subtitle">No quotes available at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quotes-center-content">
      <div className="quotes-header-section">
        <h1 className="quotes-main-title">Words That Shape Our World</h1>
        <p className="quotes-subtitle">Powerful quotes from influential voices</p>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
          Showing {displayedQuotes.length} of {allQuotes.length} quotes
        </p>
      </div>

      <QuotesControls
        viewMode={viewMode}
        itemsPerPage={itemsPerPage}
        onViewModeChange={handleViewModeChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <div className={`quotes-gallery-grid view-${viewMode} ${isVisible ? 'animate' : ''}`}>
        {displayedQuotes.map((quote, index) => {
          const tier = getTierClass(index);
          return (
            <QuoteCard
              key={`${quote.quote_id}-${index}`}
              quote={quote}
              index={index}
              tier={tier}
              themeColor={themeColor}
              onCardClick={onQuoteClick}
            />
          );
        })}
      </div>

      {displayedQuotes.length < allQuotes.length && (
        <div className="quotes-load-more">
          <button className="load-more-btn" onClick={handleLoadMore}>
            Load More Quotes ({allQuotes.length - displayedQuotes.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default QuotesGallery;