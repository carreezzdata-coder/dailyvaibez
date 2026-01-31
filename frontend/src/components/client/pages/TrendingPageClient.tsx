'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, getImageUrl } from '../../../lib/clientData';
import { useTrending } from '../hooks/useTrending';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { getHeatLevel } from '../../../lib/trending/trendingScore';
import { velocityTier } from '../../../lib/trending/velocityCalc';
import Header from '../components/Header';
import Horizontal from '../components/Horizontal';
import Footer from '../components/Footer';
import Gallery from '../components/Gallery';
import TrendingHero from '../components/trending/TrendingHero';
import TrendingCard from '../components/trending/TrendingCard';
import TrendingControls from '../components/trending/TrendingControls';
import RecentsSidebar from '../components/trending/RecentsSidebar';
import type { NewsItem } from '../hooks/useArticle';


interface TrendingPageClientProps {
  initialData: {
    breaking: NewsItem[];
    trending: NewsItem[];
    lastUpdate: string;
  };
}

export default function TrendingPageClient({ initialData }: TrendingPageClientProps) {
  const router = useRouter();
  const { 
    data, 
    refresh, 
    isRefreshing, 
    sortBy, 
    setSortBy, 
    filteredNews,
    velocityData 
  } = useTrending(initialData);
  
  const { preferences, geoLocation, trackCategoryVisit } = useUserPreferences();

  const [showGallery, setShowGallery] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('white');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showRecentsList, setShowRecentsList] = useState(false);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    data.trending.forEach(article => {
      if (article.category_name && article.category_slug) {
        cats.add(JSON.stringify({
          name: article.category_name,
          slug: article.category_slug,
          color: article.category_color
        }));
      }
    });
    return Array.from(cats).map(c => JSON.parse(c));
  }, [data.trending]);

  const smartTrendingNews = useMemo(() => {
    let newsToSort = selectedCategory !== 'all' 
      ? filteredNews.filter(article => article.category_slug === selectedCategory) 
      : filteredNews;

    if (preferences.favoriteCategories.length > 0) {
      newsToSort = newsToSort.map(article => ({
        ...article,
        _preferenceBoost: preferences.favoriteCategories.includes(article.category_slug) ? 1.3 : 1.0
      }));
    }

    if (geoLocation.county) {
      newsToSort = newsToSort.map(article => {
        const tagsArray = Array.isArray(article.tags) ? article.tags : [];
        return {
          ...article,
          _geoBoost: (article.category_slug === 'counties' || tagsArray.some(tag => 
            tag.toLowerCase().includes(geoLocation.county?.toLowerCase() || ''))) ? 1.2 : 1.0
        };
      });
    }

    return newsToSort;
  }, [filteredNews, selectedCategory, preferences.favoriteCategories, geoLocation]);

  const heroArticles = smartTrendingNews.slice(0, 3);
  const gridArticles = smartTrendingNews.slice(3, 33);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('vybes-theme') || 'white';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vybes-theme', theme);
    }
  };

  const handleArticleClick = (article: NewsItem) => {
    trackCategoryVisit(article.category_slug);
    router.push(`/client/articles/${article.slug}`);
  };

  if (showGallery) {
    const galleryNews = smartTrendingNews.map(article => ({
      ...article,
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags
    }));
    
    const handleGalleryArticleClick = (article: { slug: string; category_slug: string }) => {
      trackCategoryVisit(article.category_slug);
      router.push(`/client/articles/${article.slug}`);
    };
    
    return <Gallery allNews={galleryNews} onArticleClick={handleGalleryArticleClick} />;
  }

  return (
    <div className="trending-page">
      <div className={`header-wrapper ${isHeaderVisible ? 'visible' : 'hidden'}`}>
        <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      </div>
      <Horizontal activeCategory="breaking" />

      <button 
        className="mobile-sidebar-toggle mobile-recents" 
        onClick={() => setShowRecentsList(!showRecentsList)}
        aria-label="Toggle Recents List"
      >
        <span className="toggle-icon">📊</span>
        <span className="toggle-label">Recents</span>
      </button>

      <div className="trending-layout">
        <main className="main-content">
          <TrendingControls
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            availableCategories={availableCategories}
            sortBy={sortBy}
            onSortChange={setSortBy}
            isRefreshing={isRefreshing}
          />

          {smartTrendingNews.length > 0 ? (
            <>
              {heroArticles.length > 0 && (
                <TrendingHero
                  mainArticle={heroArticles[0]}
                  sideArticles={heroArticles.slice(1)}
                  onArticleClick={handleArticleClick}
                  velocityData={velocityData}
                  preferences={preferences}
                />
              )}

              <div className="trending-grid">
                {gridArticles.map((article, index) => {
                  const actualRank = index + 4;
                  const velocity = velocityData.get(article.news_id);
                  
                  return (
                    <TrendingCard
                      key={article.news_id}
                      article={article}
                      rank={actualRank}
                      velocityTier={velocity ? velocityTier(velocity.delta) : 'slow'}
                      heatLevel={velocity ? getHeatLevel(velocity.score) : 1}
                      isFavoriteCategory={preferences.favoriteCategories.includes(article.category_slug)}
                      onClick={() => handleArticleClick(article)}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔥</div>
              <h3 className="empty-title">No Trending News Available</h3>
              <p className="empty-text">
                {selectedCategory !== 'all' 
                  ? 'No trending articles in this category. Try selecting "All Categories"' 
                  : 'Trending articles will appear here.'}
              </p>
              <button 
                onClick={() => selectedCategory !== 'all' ? setSelectedCategory('all') : refresh()} 
                className="empty-switch-btn"
              >
                {selectedCategory !== 'all' ? 'View All Categories' : '🔄 Refresh Now'}
              </button>
            </div>
          )}
        </main>

        <RecentsSidebar
          articles={smartTrendingNews}
          isVisible={showRecentsList}
          onClose={() => setShowRecentsList(false)}
          onArticleClick={handleArticleClick}
        />
      </div>

      <button 
        className="stories-btn" 
        onClick={() => setShowGallery(true)}
        aria-label="View Gallery"
      >
        <div className="stories-icon">📸</div>
        <div className="stories-text">Stories</div>
      </button>

      <Footer />
    </div>
  );
}