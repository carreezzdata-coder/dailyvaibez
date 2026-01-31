import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCookies } from '../hooks/useCookies';
import { useCategoryFooter } from '../hooks/useCategoryFooter';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useCategory } from '../hooks/useCategory';
import CookieBanner from '../cookies/CookieBanner';
import FooterMarquee from './FooterFunctions/FooterMarquee';
import FooterCategories from './FooterFunctions/FooterCategories';
import FooterBrand from './FooterFunctions/FooterBrand';
import FooterBottom from './FooterFunctions/FooterBottom';
import FooterMobileOverlay from './FooterFunctions/FooterMobileOverlay';
import FooterMobileTrigger from './FooterFunctions/FooterMobileTrigger';

interface Category {
  category_id: number;
  name: string;
  slug: string;
}

interface CategoryGroup {
  title: string;
  icon: string;
  description: string;
  mainSlug: string | null;
  categories: Category[];
}

interface FooterArticle {
  slug: string;
  title: string;
  views: number;
  image_url: string;
  news_id?: number;
  likes_count?: number;
  category_name?: string;
}

export default function Footer() {
  const { showBanner, trackBehavior, openManageModal } = useCookies();
  const { groups: rawGroups, isLoading, error: categoryError } = useCategoryFooter();
  const { trackCategoryVisit, isHydrated } = useUserPreferences();
  const { loadCategoryData } = useCategory();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subCategoryImages, setSubCategoryImages] = useState<{ [key: string]: FooterArticle[] }>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  const groups = useMemo(() => {
    if (!rawGroups || typeof rawGroups !== 'object' || Object.keys(rawGroups).length === 0) {
      return [];
    }
    
    const orderedGroups = [
      { key: 'world', order: 1 },
      { key: 'counties', order: 2 },
      { key: 'politics', order: 3 },
      { key: 'business', order: 4 },
      { key: 'opinion', order: 5 },
      { key: 'sports', order: 6 },
      { key: 'lifestyle', order: 7 },
      { key: 'entertainment', order: 8 },
      { key: 'tech', order: 9 },
      { key: 'other', order: 10 }
    ];

    return orderedGroups
      .map(({ key }) => {
        const group = rawGroups[key];
        if (!group) return null;
        return {
          title: group.title || key,
          icon: group.icon || '📰',
          description: group.description || '',
          mainSlug: group.mainSlug || group.slug || key,
          categories: Array.isArray(group.categories) ? group.categories : []
        };
      })
      .filter(Boolean) as CategoryGroup[];
  }, [rawGroups]);

  useEffect(() => {
    if (!groups.length || imagesLoaded || !isHydrated) return;

    const loadImages = async () => {
      try {
        const allSubCategories = groups.flatMap(group => group.categories);
        
        const imagePromises = allSubCategories.map(async (category) => {
          try {
            const result = await loadCategoryData(category.slug, 1, 12);
            
            if (result && result.success && result.news && result.news.length > 0) {
              const articlesWithImages = result.news
                .filter((article: any) => article.image_url && article.image_url.trim() !== '')
                .slice(0, 12)
                .map((article: any) => ({
                  slug: article.slug,
                  title: article.title || 'Untitled',
                  views: article.views || 0,
                  image_url: article.image_url,
                  news_id: article.news_id,
                  likes_count: article.likes_count || 0,
                  category_name: category.name
                }));
              
              return {
                slug: category.slug,
                articles: articlesWithImages
              };
            }
          } catch (error) {
            console.error(`Failed to fetch images for ${category.slug}:`, error);
          }
          return null;
        });

        const results = await Promise.all(imagePromises);
        const imagesMap: { [key: string]: FooterArticle[] } = {};
        
        results.forEach(result => {
          if (result && result.articles.length > 0) {
            imagesMap[result.slug] = result.articles;
          }
        });

        setSubCategoryImages(imagesMap);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Failed to load footer images:', error);
        setImagesLoaded(true);
      }
    };

    const timer = setTimeout(loadImages, 500);
    return () => clearTimeout(timer);
  }, [groups, imagesLoaded, isHydrated, loadCategoryData]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const { topArticles, bottomArticles } = useMemo(() => {
    const allArticles = Object.values(subCategoryImages).flat();
    
    if (allArticles.length === 0) {
      return { topArticles: [], bottomArticles: [] };
    }

    const sortedArticles = [...allArticles].sort((a, b) => (b.views || 0) - (a.views || 0));
    const topSelection = sortedArticles.slice(0, 20);
    const bottomSelection = sortedArticles.slice(0, 15);
    
    return {
      topArticles: [...topSelection, ...topSelection, ...topSelection],
      bottomArticles: [...bottomSelection, ...bottomSelection, ...bottomSelection]
    };
  }, [subCategoryImages]);

  const handleMobileMenuOpen = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  if (isLoading) {
    return (
      <footer className="comprehensive-footer">
        <div className="footer-loading">
          <div className="loading-spinner"></div>
          <p>Loading footer...</p>
        </div>
      </footer>
    );
  }

  return (
    <>
      <footer className="comprehensive-footer">
        {categoryError && (
          <div className="footer-error">
            <p>⚠️ {categoryError}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <FooterMarquee 
          articles={topArticles} 
          position="top" 
          trackBehavior={trackBehavior}
        />

        <FooterCategories 
          groups={groups} 
          trackBehavior={trackBehavior}
          trackCategoryVisit={trackCategoryVisit}
        />

        <FooterBrand />

        <FooterMarquee 
          articles={bottomArticles} 
          position="bottom" 
          trackBehavior={trackBehavior}
        />

        <FooterBottom 
          showBanner={showBanner}
          openManageModal={openManageModal}
        />
      </footer>

      <button
        onClick={handleMobileMenuOpen}
        className={`footer-categories-hamburger ${buttonsVisible ? 'visible' : ''}`}
        aria-label="Open Categories Menu"
        aria-expanded={mobileMenuOpen}
        type="button"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      </button>

      <FooterMobileTrigger onClick={handleMobileMenuOpen} />

      <FooterMobileOverlay
        isOpen={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        groups={groups}
        marqueeArticles={[...topArticles, ...bottomArticles]}
        trackBehavior={trackBehavior}
        trackCategoryVisit={trackCategoryVisit}
        openManageModal={openManageModal}
      />

      <CookieBanner />
    </>
  );
}