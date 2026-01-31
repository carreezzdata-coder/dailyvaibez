'use client';

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useHomeData } from '@/components/client/hooks/useHomeData';

const Gallery = dynamic(() => import('../components/Gallery'), { ssr: false });
const Header = dynamic(() => import('../components/Header'));
const Horizontal = dynamic(() => import('../components/Horizontal'));
const Footer = dynamic(() => import('../components/Footer'));
const Headings = dynamic(() => import('../components/home/Headings'));
const HomeCategories = dynamic(() => import('../components/home/HomeCategories'));
const TimelineView = dynamic(() => import('../components/home/Timelineview'), { ssr: false });
const HeroSlider = dynamic(() => import('../components/home/HeroSlider'));
const Sidebar = dynamic(() => import('../components/home/Sidebar'), { ssr: false });
const QuotesSidebar = dynamic(() => import('../components/home/QuotesSideBar'));

interface SessionData {
  isAuthenticated: boolean;
  csrf_token: string | null;
}

export interface Article {
  news_id: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image_url?: string | null;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
  first_name?: string;
  last_name?: string;
  published_at: string;
  views?: number;
  likes_count?: number;
  reading_time?: number;
  tags?: string | string[];
}

interface Quote {
  quote_id: number;
  quote_text: string;
  sayer_name: string;
  sayer_title: string;
  sayer_image_url?: string;
  active: boolean;
}

interface CategorySection {
  slug: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  order_index: number;
  articles: Article[];
  priority?: 'high' | 'medium' | 'low';
  score?: number;
}

interface HomePageData {
  sessionData: SessionData;
  sliderSlides?: Article[];
  categorySections?: CategorySection[];
  breaking?: Article[];
  featured?: Article[];
  trending?: Article[];
}

const MobileHamburgerControls = memo(({ 
  activePanel, 
  setActivePanel,
  onGalleryClick 
}: { 
  activePanel: string | null;
  setActivePanel: (p: string | null) => void;
  onGalleryClick: () => void;
}) => (
  <div className="floating-action-rail">
    <button
      className={`hamburger-btn ${activePanel === 'quotes' ? 'active' : ''}`}
      onClick={() => setActivePanel(activePanel === 'quotes' ? null : 'quotes')}
      aria-label="Quotes"
      title="Quotes"
    >
      💬
    </button>
    <button
      className={`hamburger-btn ${activePanel === 'headlines' ? 'active' : ''}`}
      onClick={() => setActivePanel(activePanel === 'headlines' ? null : 'headlines')}
      aria-label="Headlines"
      title="Headlines"
    >
      📰
    </button>
    <button
      className={`hamburger-btn ${activePanel === 'sidebar' ? 'active' : ''}`}
      onClick={() => setActivePanel(activePanel === 'sidebar' ? null : 'sidebar')}
      aria-label="Trending & Featured"
      title="Trending & Featured"
    >
      ☰
    </button>
    <button
      className="hamburger-btn"
      onClick={onGalleryClick}
      aria-label="Gallery"
      title="Gallery"
    >
      📸
    </button>
  </div>
));

MobileHamburgerControls.displayName = 'MobileHamburgerControls';

const MobileSidebarPanel = memo(({ 
  onArticleClick,
  onClose 
}: { 
  onArticleClick: (article: Article) => void;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'trending'>('featured');

  return (
    <>
      <div className="mobile-overlay-backdrop active" onClick={onClose} />
      <div className="mobile-overlay-panel active mobile-sidebar-drawer">
        <div className="mobile-sidebar-header">
          <h3 className="sidebar-header-title">
            {activeTab === 'featured' ? '⭐ Featured' : '📈 Trending'}
          </h3>
          <button className="mobile-sidebar-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="sidebar-toggle-buttons mobile">
          <button
            className={`sidebar-toggle-btn ${activeTab === 'featured' ? 'active' : ''}`}
            onClick={() => setActiveTab('featured')}
          >
            <span className="toggle-icon">⭐</span>
            <span className="toggle-text">Featured</span>
          </button>
          <button
            className={`sidebar-toggle-btn ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <span className="toggle-icon">📈</span>
            <span className="toggle-text">Trending</span>
          </button>
        </div>

        <Sidebar 
          type={activeTab}
          onArticleClick={(article) => {
            onArticleClick(article);
            onClose();
          }} 
        />
      </div>
    </>
  );
});

MobileSidebarPanel.displayName = 'MobileSidebarPanel';

export default function HomePageClient({ initialData }: { initialData: HomePageData }) {
  const router = useRouter();
  const { content, isLoading } = useHomeData(initialData);
  
  const [showGallery, setShowGallery] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('white');
  const [viewMode, setViewMode] = useState<'category' | 'timeline'>('category');
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleThemeChange = useCallback((theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vybes-theme', theme);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    const savedTheme = localStorage.getItem('vybes-theme') || 'white';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedViewMode = localStorage.getItem('vybes-view-mode') as 'category' | 'timeline' || 'category';
    setViewMode(savedViewMode);
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    
    const checkMobile = () => setIsMobile(window.innerWidth < 1200);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isHydrated]);

  const handleArticleClick = useCallback((article: any) => {
    if (article?.slug) {
      router.push(`/client/articles/${article.slug}`);
    }
  }, [router]);

  const handleQuoteClick = useCallback((quote: Quote) => {
    router.push('/client/quotes');
  }, [router]);

  const handleViewModeToggle = useCallback(() => {
    const newMode = viewMode === 'category' ? 'timeline' : 'category';
    setViewMode(newMode);
    if (isHydrated) {
      localStorage.setItem('vybes-view-mode', newMode);
    }
  }, [viewMode, isHydrated]);

  const allNewsItems = useMemo(() => {
    if (!content) return [];
    return [
      ...(content.breaking || []),
      ...(content.featured || []),
      ...(content.trending || []),
      ...(content.categorySections || []).flatMap(cat => cat.articles || []),
    ];
  }, [content]);

  if (showGallery) {
    return <Gallery allNews={allNewsItems} onArticleClick={handleArticleClick} />;
  }

  if (!content) {
    return <div className="news-homepage-loading">Loading...</div>;
  }

  return (
    <div className="news-homepage">
      <div className="header-wrapper">
        <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      </div>
      
      <div className="horizontal-wrapper">
        <Horizontal activeCategory="home" />
      </div>

      <main className="main-content-column">
        <section className="hero-section">
          <div className="quotes-sidebar-col home-desktop-only">
            <QuotesSidebar onQuoteClick={handleQuoteClick} />
          </div>

          <div className="hero-slider-col">
            {isLoading && !content.sliderSlides?.length ? (
              <div className="hero-slider-loading">Loading slider...</div>
            ) : !content.sliderSlides?.length ? (
              <div className="hero-slider-error">No featured stories available</div>
            ) : (
              <HeroSlider slides={content.sliderSlides} onSlideClick={handleArticleClick} />
            )}
          </div>

          <div className="headlines-sidebar home-desktop-only">
            <Headings onArticleClick={handleArticleClick} />
          </div>
        </section>

        {isHydrated && isMobile && (
          <MobileHamburgerControls
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            onGalleryClick={() => setShowGallery(true)}
          />
        )}

        {isHydrated && !isMobile && (
          <button className="stories-btn" onClick={() => setShowGallery(true)}>
            📸
          </button>
        )}

        {isHydrated && isMobile && activePanel && (
          <>
            {activePanel === 'quotes' && (
              <>
                <div className="mobile-overlay-backdrop active" onClick={() => setActivePanel(null)} />
                <div className="mobile-overlay-panel active">
                  <QuotesSidebar onQuoteClick={(quote) => { handleQuoteClick(quote); setActivePanel(null); }} />
                </div>
              </>
            )}
            {activePanel === 'headlines' && (
              <>
                <div className="mobile-overlay-backdrop active" onClick={() => setActivePanel(null)} />
                <div className="mobile-overlay-panel active">
                  <Headings onArticleClick={(article) => { handleArticleClick(article); setActivePanel(null); }} />
                </div>
              </>
            )}
            {activePanel === 'sidebar' && (
              <MobileSidebarPanel
                onArticleClick={handleArticleClick}
                onClose={() => setActivePanel(null)}
              />
            )}
          </>
        )}

        <div className="view-mode-toggle-container">
          <button className={`view-mode-toggle ${viewMode === 'category' ? 'active' : ''}`} onClick={handleViewModeToggle}>
            <span className="toggle-icon">🗂</span>
            <span className="toggle-text">Category</span>
          </button>
          <button className={`view-mode-toggle ${viewMode === 'timeline' ? 'active' : ''}`} onClick={handleViewModeToggle}>
            <span className="toggle-icon">📱</span>
            <span className="toggle-text">Timeline</span>
          </button>
        </div>

        <div className={`categories-layout ${viewMode === 'timeline' ? 'timeline-mode' : 'category-mode'}`}>
          <div className="categories-main">
            {viewMode === 'timeline' ? (
              <TimelineView onArticleClick={handleArticleClick} />
            ) : (
              <HomeCategories sections={content.categorySections || []} onArticleClick={handleArticleClick} />
            )}
          </div>

          {viewMode === 'category' && isHydrated && !isMobile && (
            <>
              <Sidebar type="featured" onArticleClick={handleArticleClick} />
              <Sidebar type="trending" onArticleClick={handleArticleClick} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}