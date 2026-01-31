'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HorizontalProps {
  activeCategory?: string;
}

interface CategoryItem {
  slug: string;
  name: string;
  icon: string;
  isGroup: boolean;
}

const MAIN_CATEGORIES: CategoryItem[] = [
  { slug: 'home', name: 'Home', icon: '🏠', isGroup: false },
  { slug: 'world', name: 'Globe', icon: '🌍', isGroup: true },
  { slug: 'counties', name: 'Counties', icon: '🏢', isGroup: true },
  { slug: 'politics', name: 'Politics', icon: '🏛️', isGroup: true },
  { slug: 'business', name: 'Business', icon: '💼', isGroup: true },
  { slug: 'opinion', name: 'Opinion', icon: '💭', isGroup: true },
  { slug: 'sports', name: 'Sports', icon: '⚽', isGroup: true },
  { slug: 'lifestyle', name: 'Life & Style', icon: '🎭', isGroup: true },
  { slug: 'entertainment', name: 'Entertainment', icon: '🎉', isGroup: true },
  { slug: 'tech', name: 'Technology', icon: '💻', isGroup: true },
  { slug: 'other', name: 'Other', icon: '📌', isGroup: true }
];

function Horizontal({ activeCategory }: HorizontalProps) {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleCategoryClick = useCallback((categorySlug: string) => {
    closeMobileMenu();
    setTimeout(() => {
      if (categorySlug === 'home') {
        router.push('/client');
      } else {
        router.push(`/client/categories/${categorySlug}`);
      }
    }, 150);
  }, [router]);

  const closeMobileMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowMobileMenu(false);
      setIsClosing(false);
    }, 250);
  }, []);

  const openMobileMenu = useCallback(() => {
    setShowMobileMenu(true);
    setIsClosing(false);
  }, []);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileMenu]);

  return (
    <>
      <nav className="category-navigation desktop-only">
        <div className="main-container">
          <div className="nav-categories">
            {MAIN_CATEGORIES.map((cat) => (
              <button 
                key={cat.slug}
                type="button"
                className={`nav-category ${activeCategory === cat.slug ? 'active' : ''}`} 
                onClick={() => handleCategoryClick(cat.slug)}
                aria-current={activeCategory === cat.slug ? 'page' : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <button 
        type="button"
        className="horizontal-hamburger mobile-only" 
        onClick={openMobileMenu}
        title="Categories Menu"
        aria-label="Open categories menu"
        aria-expanded={showMobileMenu}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {showMobileMenu && (
        <>
          <div 
            className={`horizontal-mobile-overlay ${isClosing ? 'closing' : 'active'}`}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div 
            className={`horizontal-mobile-panel ${isClosing ? 'closing' : 'active'}`} 
            role="dialog" 
            aria-modal="true" 
            aria-label="Categories menu"
          >
            <div className="horizontal-mobile-header">
              <h3 className="horizontal-mobile-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                Categories
              </h3>
              <button 
                type="button"
                className="horizontal-close-btn" 
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="horizontal-mobile-scroll">
              <div className="horizontal-mobile-list">
                {MAIN_CATEGORIES.map((cat) => (
                  <button 
                    key={cat.slug}
                    type="button"
                    className={`horizontal-mobile-item ${activeCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.slug)}
                    aria-current={activeCategory === cat.slug ? 'page' : undefined}
                  >
                    <span className="item-icon" aria-hidden="true">{cat.icon}</span>
                    <span className="item-name">{cat.name}</span>
                    <svg className="item-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Horizontal;