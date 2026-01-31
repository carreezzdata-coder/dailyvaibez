'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCategoryIcon, isGroupCategory } from '@/lib/clientData';

interface Category {
  category_id: number;
  name: string;
  slug: string;
}

interface CategoryGroup {
  title: string;
  icon: string;
  mainSlug: string | null;
  categories: Category[];
}

interface FooterMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  groups: CategoryGroup[];
  trackBehavior?: (action: string) => void;
  trackCategoryVisit: (slug: string) => void;
}

const GROUP_TO_CATEGORY_MAP: { [key: string]: string } = {
  'World': 'world',
  'Counties': 'counties',
  'Politics': 'politics',
  'Business': 'business',
  'Opinion': 'opinion',
  'Sports': 'sports',
  'Life & Style': 'lifestyle',
  'Entertainment': 'entertainment',
  'Technology': 'tech',
  'Other': 'other',
};

export default function FooterMobileMenu({ 
  isOpen, 
  onClose, 
  groups, 
  trackBehavior, 
  trackCategoryVisit 
}: FooterMobileMenuProps) {
  const router = useRouter();

  const handleSubCategoryClick = useCallback((slug: string) => {
    const isMainCategory = isGroupCategory(slug);
    
    if (trackBehavior) {
      trackBehavior(slug);
    }
    trackCategoryVisit(slug);
    onClose();
    
    if (isMainCategory) {
      router.push(`/client/categories/${slug}`);
    } else {
      router.push(`/client/sub-categories/${slug}`);
    }
  }, [router, trackBehavior, trackCategoryVisit, onClose]);

  const handleCategoryGroupClick = useCallback((groupTitle: string, mainSlug?: string | null) => {
    const categorySlug = mainSlug || GROUP_TO_CATEGORY_MAP[groupTitle];
    if (categorySlug) {
      if (trackBehavior) {
        trackBehavior(categorySlug);
      }
      trackCategoryVisit(categorySlug);
      onClose();
      router.push(`/client/categories/${categorySlug}`);
    }
  }, [router, trackBehavior, trackCategoryVisit, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="footer-mobile-menu-overlay active"
        onClick={onClose}
        aria-hidden="true"
      />
      <nav 
        className="footer-mobile-menu active"
        role="navigation"
        aria-label="Mobile categories menu"
      >
        <div className="footer-mobile-menu-header">
          <h2 className="footer-mobile-menu-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '8px'}}>
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            Categories
          </h2>
          <button
            onClick={onClose}
            className="footer-mobile-menu-close"
            aria-label="Close Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="footer-mobile-menu-grid">
          {groups.map((group, idx) => (
            <div key={`mobile-${group.title}-${idx}`} className="footer-mobile-section">
              <div 
                className="footer-mobile-section-header"
                onClick={() => handleCategoryGroupClick(group.title, group.mainSlug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCategoryGroupClick(group.title, group.mainSlug)}
              >
                <span className="footer-mobile-icon" aria-hidden="true">
                  {group.icon || getCategoryIcon(group.mainSlug || '')}
                </span>
                <h3 className="footer-mobile-section-title">{group.title}</h3>
                <span className="main-category-indicator" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              </div>
              
              <ul className="footer-mobile-links-list">
                {group.categories.map((category) => (
                  <li key={category.category_id}>
                    <button
                      onClick={() => handleSubCategoryClick(category.slug)}
                      className="footer-mobile-link-item"
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}