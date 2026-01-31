'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatNumber, getImageUrl, getCategoryColor, getCategoryIcon } from '../../../lib/clientData';
import { useUserPreferences } from '../hooks/useUserPreferences';
import Ribbon from '../components/Ribbon';
import Header from '../components/Header';
import Horizontal from '../components/Horizontal';
import Footer from '../components/Footer';
import Gallery from '../components/Gallery';
import { Camera, TrendingUp, Clock, Eye, Pin, Heart } from 'lucide-react';

interface CategoryPageClientProps {
  initialData: {
    category: any;
    news: any[];
    pagination: any;
    pinnedNews?: any[];
  };
  slug: string;
}

const GROUP_SLUGS = ['world', 'counties', 'politics', 'business', 'opinion', 'sports', 'lifestyle', 'entertainment', 'tech', 'other'];

export default function CategoryPageClient({ initialData, slug }: CategoryPageClientProps) {
  const router = useRouter();
  const { trackCategoryVisit } = useUserPreferences();
  
  const [showGallery, setShowGallery] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('white');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [flashIndex, setFlashIndex] = useState(0);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  
  const [categoryData, setCategoryData] = useState(initialData);
  const { category, news, pagination, pinnedNews = [] } = categoryData;

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isGroup = GROUP_SLUGS.includes(slug);

  // Separate pinned and regular news
  const validPinnedNews = Array.isArray(pinnedNews) ? pinnedNews : [];
  const pinnedNewsIds = new Set(validPinnedNews.map(item => item.news_id));
  
  // Filter out pinned news from regular news to avoid duplicates
  const regularNews = news.filter(article => !pinnedNewsIds.has(article.news_id));
  
  // Sort regular news by date
  const sortedNews = [...regularNews].sort((a, b) => {
    const dateA = new Date(a.published_at).getTime();
    const dateB = new Date(b.published_at).getTime();
    return dateB - dateA;
  });

  // Combine pinned (first) + regular news
  const allNews = [...validPinnedNews, ...sortedNews];

  useEffect(() => {
    trackCategoryVisit(slug);
  }, [slug, trackCategoryVisit]);

  useEffect(() => {
    const timer = setTimeout(() => setButtonsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (allNews.length > 0) {
      const interval = setInterval(() => {
        setFlashIndex((prev) => (prev + 1) % Math.min(5, allNews.length));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [allNews.length]);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vybes-theme', theme);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('vybes-theme') || 'white';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleArticleClick = (article: any) => {
    router.push(`/client/articles/${article.slug}`);
  };

  const handleLoadMore = useCallback(async () => {
    if (!pagination.has_next || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = pagination.current_page + 1;
      const apiUrl = isGroup 
        ? `/api/client/category-groups?slug=${slug}&page=${nextPage}&limit=20`
        : `/api/client/categories?slug=${slug}&page=${nextPage}&limit=20`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const newData = await response.json();
        setCategoryData(prev => ({
          ...newData,
          news: [...prev.news, ...newData.news],
          pinnedNews: prev.pinnedNews // Keep original pinned news
        }));
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [pagination, isLoadingMore, isGroup, slug]);

  useEffect(() => {
    if (!loadMoreRef.current || !pagination.has_next) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [pagination.has_next, isLoadingMore, handleLoadMore]);

  const getExcerpt = (article: any) => {
    if (article.excerpt) return article.excerpt;
    if (article.content) {
      const plainText = article.content.replace(/<[^>]+>/g, '').trim();
      return plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '');
    }
    return '';
  };

  const config = {
    color: getCategoryColor(slug),
    icon: getCategoryIcon(slug),
    name: category?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
  };

  const featuredArticle = allNews[0];
  const remainingNews = allNews.slice(1);
  const latestNews = allNews.slice(0, 65);
  const trendingNews = [...allNews].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 65);
  const ribbonNews = allNews.slice(0, 20);
  const trendingItems = allNews.slice(0, 5);
  const currentTrending = trendingItems[flashIndex];

  if (showGallery) {
    return <Gallery allNews={allNews} onArticleClick={handleArticleClick} />;
  }

  const TrendingFlash = () => {
    if (!currentTrending) return null;

    return (
      <div className="trending-flash-banner">
        <div className="trending-flash-inner">
          <TrendingUp className="trending-icon-flash" size={16} />
          <span className="trending-label-flash">TRENDING</span>
          <div 
            className="trending-content-flash"
            onClick={() => handleArticleClick(currentTrending)}
            role="button" 
            tabIndex={0}
          >
            <span className="trending-title-flash">{currentTrending.title}</span>
            <span className="trending-meta-flash">
              <Eye size={10} /> {formatNumber(currentTrending.views)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const isPinned = (articleId: number) => pinnedNewsIds.has(articleId);

  return (
    <div className="category-page">
      <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      <Horizontal activeCategory={slug} />

      {allNews.length > 0 && (
        <Ribbon 
          news={ribbonNews} 
          onArticleClick={handleArticleClick}
          title={`Latest in ${config.name}`}
        />
      )}

      <TrendingFlash />

      <main className="main-container">
        {allNews.length > 0 ? (
          <div className="category-page-layout">
            <aside className="category-left-sidebar">
              <h3 className="sidebar-title">
                <Clock size={13} />
                Latest
              </h3>
              <div className="sidebar-article-list">
                {latestNews.map((article: any) => (
                  <div 
                    key={article.news_id} 
                    className="sidebar-article-item" 
                    onClick={() => handleArticleClick(article)} 
                    role="button" 
                    tabIndex={0}
                  >
                    <div className="sidebar-thumbnail">
                      {article.image_url ? (
                        <img 
                          src={getImageUrl(article.image_url) || ''} 
                          alt={article.title}
                          width="80"
                          height="80"
                          loading="lazy"
                        />
                      ) : (
                        <div className="thumbnail-placeholder">{config.icon}</div>
                      )}
                    </div>
                    <div className="sidebar-article-content">
                      <div className="sidebar-article-title">{article.title}</div>
                      <div className="sidebar-article-meta">
                        <span>{formatDate(article.published_at)}</span>
                        <span><Eye size={10} /> {formatNumber(article.views || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <div className="category-main-content">
              {featuredArticle && (
                <article 
                  className="category-featured-article" 
                  onClick={() => handleArticleClick(featuredArticle)} 
                  role="button" 
                  tabIndex={0}
                >
                  <div className="featured-image-container">
                    {featuredArticle.image_url && (
                      <img 
                        src={getImageUrl(featuredArticle.image_url) || ''} 
                        alt={featuredArticle.title}
                        width="800"
                        height="450"
                        loading="eager"
                      />
                    )}
                    {isPinned(featuredArticle.news_id) && (
                      <div className="pinned-badge">
                        <Pin size={80} strokeWidth={2} />
                      </div>
                    )}
                  </div>
                  <div className="featured-content">
                    <h1 className="featured-title">{featuredArticle.title}</h1>
                    {getExcerpt(featuredArticle) && (
                      <p className="featured-excerpt">{getExcerpt(featuredArticle)}</p>
                    )}
                    <div className="featured-meta">
                      <span className="article-author">
                        By {featuredArticle.first_name} {featuredArticle.last_name}
                      </span>
                      <span className="article-date">{formatDate(featuredArticle.published_at)}</span>
                      <div className="article-stats">
                        <span><Heart size={12} /> {formatNumber(featuredArticle.likes_count || 0)}</span>
                        <span>•</span>
                        <span><Eye size={12} /> {formatNumber(featuredArticle.views || 0)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              )}

              <div className="articles-grid">
                {remainingNews.map((article: any) => (
                  <article 
                    key={article.news_id} 
                    className="article-card" 
                    onClick={() => handleArticleClick(article)} 
                    role="button" 
                    tabIndex={0}
                  >
                    <div className="article-card-image">
                      {article.image_url && (
                        <img 
                          src={getImageUrl(article.image_url) || ''} 
                          alt={article.title}
                          width="400"
                          height="225"
                          loading="lazy"
                        />
                      )}
                      {isPinned(article.news_id) && (
                        <div className="pinned-badge small">
                          <Pin size={56} strokeWidth={2} />
                        </div>
                      )}
                    </div>
                    <div className="article-card-content">
                      <h3 className="article-card-title">{article.title}</h3>
                      {getExcerpt(article) && (
                        <p className="article-excerpt">{getExcerpt(article)}</p>
                      )}
                      <div className="article-meta">
                        <div className="article-author">
                          By {article.first_name} {article.last_name}
                        </div>
                        <div className="article-date">{formatDate(article.published_at)}</div>
                        <div className="article-stats">
                          <span><Heart size={11} /> {formatNumber(article.likes_count || 0)}</span>
                          <span>•</span>
                          <span><Eye size={11} /> {formatNumber(article.views || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {pagination.has_next && (
                <div ref={loadMoreRef} className="load-more-section">
                  {isLoadingMore && (
                    <div className="load-more-spinner">⏳ Loading more articles...</div>
                  )}
                </div>
              )}
            </div>

            <aside className="category-right-sidebar">
              <h3 className="sidebar-title">
                <TrendingUp size={13} />
                Trending
              </h3>
              <div className="sidebar-article-list">
                {trendingNews.map((article: any) => (
                  <div 
                    key={article.news_id} 
                    className="sidebar-article-item trending" 
                    onClick={() => handleArticleClick(article)} 
                    role="button" 
                    tabIndex={0}
                  >
                    <div className="sidebar-thumbnail">
                      {article.image_url ? (
                        <img 
                          src={getImageUrl(article.image_url) || ''} 
                          alt={article.title}
                          width="80"
                          height="80"
                          loading="lazy"
                        />
                      ) : (
                        <div className="thumbnail-placeholder">{config.icon}</div>
                      )}
                    </div>
                    <div className="sidebar-article-content">
                      <div className="sidebar-article-title">{article.title}</div>
                      <div className="sidebar-article-meta">
                        <span className="trending-badge">🔥</span>
                        <span><Eye size={10} /> {formatNumber(article.views || 0)}</span>
                        <span><Heart size={10} /> {formatNumber(article.likes_count || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" style={{ color: config.color }}>
              {config.icon}
            </div>
            <h3 className="empty-title">No articles found</h3>
            <p className="empty-text">
              There are currently no articles in the {config.name} category.
            </p>
            <button 
              onClick={() => router.push('/client')} 
              className="load-more-btn"
            >
              🏠 Browse Other Categories
            </button>
          </div>
        )}
      </main>

      <button 
        className={`sidebar-hamburger hamburger-right mobile-only ${buttonsVisible ? 'visible' : ''}`}
        onClick={() => setShowRightSidebar(true)}
        title="Trending"
      >
        <TrendingUp size={20} />
      </button>

      <button 
        className={`sidebar-hamburger hamburger-left mobile-only ${buttonsVisible ? 'visible' : ''}`}
        onClick={() => setShowLeftSidebar(true)}
        title="Latest Stories"
      >
        <Clock size={20} />
      </button>

      {showLeftSidebar && (
        <>
          <div 
            className="mobile-sidebar-overlay active" 
            onClick={() => setShowLeftSidebar(false)} 
            role="button" 
            tabIndex={0}
          />
          <div className="mobile-sidebar-drawer left">
            <button className="mobile-sidebar-close" onClick={() => setShowLeftSidebar(false)}>×</button>
            <h3 className="sidebar-title">
              <Clock size={13} />
              Latest Stories
            </h3>
            <div className="sidebar-article-list">
              {latestNews.map((article: any) => (
                <div 
                  key={article.news_id} 
                  className="sidebar-article-item" 
                  onClick={() => { 
                    handleArticleClick(article); 
                    setShowLeftSidebar(false); 
                  }} 
                  role="button" 
                  tabIndex={0}
                >
                  <div className="sidebar-thumbnail">
                    {article.image_url ? (
                      <img 
                        src={getImageUrl(article.image_url) || ''} 
                        alt={article.title}
                        width="80"
                        height="80"
                        loading="lazy"
                      />
                    ) : (
                      <div className="thumbnail-placeholder">{config.icon}</div>
                    )}
                  </div>
                  <div className="sidebar-article-content">
                    <div className="sidebar-article-title">{article.title}</div>
                    <div className="sidebar-article-meta">
                      <span>{formatDate(article.published_at)}</span>
                      <span><Eye size={10} /> {formatNumber(article.views || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showRightSidebar && (
        <>
          <div 
            className="mobile-sidebar-overlay active" 
            onClick={() => setShowRightSidebar(false)} 
            role="button" 
            tabIndex={0}
          />
          <div className="mobile-sidebar-drawer right">
            <button className="mobile-sidebar-close" onClick={() => setShowRightSidebar(false)}>×</button>
            <h3 className="sidebar-title">
              <TrendingUp size={13} />
              Trending
            </h3>
            <div className="sidebar-article-list">
              {trendingNews.map((article: any) => (
                <div 
                  key={article.news_id} 
                  className="sidebar-article-item trending" 
                  onClick={() => { 
                    handleArticleClick(article); 
                    setShowRightSidebar(false); 
                  }} 
                  role="button" 
                  tabIndex={0}
                >
                  <div className="sidebar-thumbnail">
                    {article.image_url ? (
                      <img 
                        src={getImageUrl(article.image_url) || ''} 
                        alt={article.title}
                        width="80"
                        height="80"
                        loading="lazy"
                      />
                    ) : (
                      <div className="thumbnail-placeholder">{config.icon}</div>
                    )}
                  </div>
                  <div className="sidebar-article-content">
                    <div className="sidebar-article-title">{article.title}</div>
                    <div className="sidebar-article-meta">
                      <span className="trending-badge">🔥</span>
                      <span><Eye size={10} /> {formatNumber(article.views || 0)}</span>
                      <span><Heart size={10} /> {formatNumber(article.likes_count || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <button 
        className={`stories-btn ${buttonsVisible ? 'visible' : ''}`}
        onClick={() => setShowGallery(true)} 
        title="View Gallery"
      >
        <Camera size={24} strokeWidth={2.5} />
      </button>

      <Footer />
    </div>
  );
}