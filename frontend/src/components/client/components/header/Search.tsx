'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch, SearchResult } from '../../hooks/useSearch';

interface SearchProps {
  isMobile?: boolean;
  SearchIcon?: React.ComponentType;
  onMobileClose?: () => void;
}

const DefaultSearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

export default function Search({ isMobile = false, SearchIcon = DefaultSearchIcon, onMobileClose }: SearchProps) {
  const router = useRouter();
  const { search, searchResults, isSearching, clearSearch, saveSearchHistory } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node) && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        search(searchQuery, { limit: 10 });
        setShowResults(true);
      }, 300);
    } else {
      setShowResults(false);
      clearSearch();
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, search, clearSearch]);

  const handleSearchResultClick = useCallback((article: SearchResult) => {
    saveSearchHistory(searchQuery);
    router.push(`/client/articles/${article.slug}`);
    setShowResults(false);
    setSearchQuery('');
    clearSearch();
    if (onMobileClose) {
      onMobileClose();
    }
  }, [saveSearchHistory, router, searchQuery, clearSearch, onMobileClose]);

  const getExcerpt = useCallback((text: string, maxLength: number = 80): string => {
    if (!text) return '';
    const plainText = text.replace(/<[^>]+>/g, '').trim();
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
  }, []);

  if (isMobile) {
    return (
      <>
        <div className="mobile-search-input-wrapper">
          <input ref={searchInputRef} type="text" placeholder="Search articles..." className="mobile-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                search(searchQuery, { limit: 10 });
                setShowResults(true);
              }
            }} aria-label="Search input" autoFocus />
          <button className="mobile-search-btn" disabled={isSearching} aria-label="Search">
            {isSearching ? <div className="spinner" /> : <SearchIcon />}
          </button>
        </div>
        {showResults && searchResults.length > 0 && (
          <div className="mobile-search-results">
            {searchResults.map((result) => (
              <div key={result.news_id} className="mobile-search-result-item" onClick={() => handleSearchResultClick(result)} role="button" tabIndex={0} onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSearchResultClick(result);
                  }
                }}>
                {result.image_url && (
                  <div className="mobile-result-image">
                    <img src={result.image_url} alt={result.title} loading="lazy" />
                  </div>
                )}
                <div className="mobile-result-content">
                  <div className="mobile-result-category">{result.category_name}</div>
                  <div className="mobile-result-title">{result.title}</div>
                  <div className="mobile-result-excerpt">{getExcerpt(result.excerpt, 50)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
          <div className="mobile-no-results">No articles found for "{searchQuery}"</div>
        )}
      </>
    );
  }

  return (
    <div className="search-wrapper">
      <div className="search-icon-inline">
        <SearchIcon />
      </div>
      <input ref={searchInputRef} type="text" placeholder="Search articles..." className="search-input-inline" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => {
          if (searchResults.length > 0) {
            setShowResults(true);
          }
        }} onKeyDown={(e) => {
          if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
            search(searchQuery, { limit: 10 });
            setShowResults(true);
          }
        }} aria-label="Search input" />
      {showResults && searchResults.length > 0 && (
        <div ref={searchResultsRef} className="search-results-dropdown">
          <div className="search-results-header">Found {searchResults.length} results</div>
          <div className="search-results-list">
            {searchResults.map((result) => (
              <div key={result.news_id} className="search-result-item" onClick={() => handleSearchResultClick(result)} role="button" tabIndex={0} onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSearchResultClick(result);
                  }
                }}>
                {result.image_url && (
                  <div className="search-result-image">
                    <img src={result.image_url} alt={result.title} loading="lazy" />
                  </div>
                )}
                <div className="search-result-content">
                  <div className="search-result-category">{result.category_name}</div>
                  <div className="search-result-title">{result.title}</div>
                  <div className="search-result-excerpt">{getExcerpt(result.excerpt, 50)}</div>
                  <div className="search-result-meta">
                    <span>👁 {result.views || 0}</span>
                    <span>❤️ {result.likes_count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
        <div ref={searchResultsRef} className="search-results-dropdown">
          <div className="search-no-results">No articles found for "{searchQuery}"</div>
        </div>
      )}
    </div>
  );
}