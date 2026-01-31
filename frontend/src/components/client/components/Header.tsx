'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Stocks from './header/Stocks';
import Search from './header/Search';
import Notifications from './header/Notifications';

interface HeaderProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="10.5" cy="10.5" r="7.5"/>
    <path d="m21 21-5.5-5.5" strokeLinecap="round"/>
  </svg>
);

const QuotesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="quotesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
    </defs>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="url(#quotesGrad)"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="url(#quotesGrad)"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="trendGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="url(#trendGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17 6 23 6 23 12" stroke="url(#trendGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BreakingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="breakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
    </defs>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="url(#breakGrad)"/>
  </svg>
);

const FeaturedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="featGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#featGrad)"/>
  </svg>
);

const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="bellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="url(#bellGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="url(#bellGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Header({ currentTheme, onThemeChange }: HeaderProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const cycleTheme = () => {
    const themes = ['white', 'dark', 'african'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex]);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (showMobileSearch) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileSearch]);

  return (
    <>
      <header className="dynamic-header">
        <div className="header-compact-section">
          <div className="logo-section">
            <div className="logo-container" onClick={() => router.push('/client')} role="button" tabIndex={0}>
              <div className="logo-text">
                <span className="logo-daily">Daily</span>
                <span className="logo-vaibe">Vaibe</span>
              </div>
            </div>
          </div>

          {!isMobile && (
            <div className="search-inline">
              <Search SearchIcon={SearchIcon} />
            </div>
          )}

          <div className="nav-center">
            {isMobile && (
              <button className="mobile-search-trigger" onClick={() => setShowMobileSearch(true)} aria-label="Open search" title="Search">
                <SearchIcon />
              </button>
            )}

            <div className="nav-icon-group">
              <button className="nav-icon-btn" onClick={() => router.push('/client/quotes')} aria-label="Quotes" title="Quotes">
                <QuotesIcon />
              </button>
              <button className="nav-icon-btn" onClick={() => router.push('/client/trending')} aria-label="Trending" title="Trending">
                <TrendingIcon />
              </button>
              <button className="nav-icon-btn" onClick={() => router.push('/client/breaking')} aria-label="Breaking News" title="Breaking News">
                <BreakingIcon />
              </button>
              <button className="nav-icon-btn" onClick={() => router.push('/client/featured')} aria-label="Featured" title="Featured">
                <FeaturedIcon />
              </button>
              <Notifications BellIcon={BellIcon} />
            </div>
          </div>

          {!isMobile && (
            <div className="stock-ticker-compact">
              <Stocks />
            </div>
          )}

          <div className="header-controls">
            <div className="theme-switcher-compact" data-active={currentTheme} onClick={cycleTheme} title="Switch Theme" role="button" tabIndex={0}>
              <div className="theme-ring theme-ring-outer" />
              <div className="theme-ring theme-ring-middle" />
              <div className="theme-ring theme-ring-inner" />
              <div className="theme-center" />
            </div>
          </div>
        </div>
      </header>

      {showMobileSearch && (
        <div className="mobile-search-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMobileSearch(false);
            }
          }} role="button" tabIndex={0}>
          <div className="mobile-search-box">
            <button className="close-search" onClick={() => setShowMobileSearch(false)} aria-label="Close search">
              <CloseIcon />
            </button>
            <Search isMobile={true} SearchIcon={SearchIcon} onMobileClose={() => setShowMobileSearch(false)} />
          </div>
        </div>
      )}
    </>
  );
}