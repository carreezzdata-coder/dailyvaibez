'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatNumber, getImageUrl, getCategoryColor, getCategoryIcon } from '../../../lib/clientData';
import { useSubCategory } from '../hooks/useSubCategory';
import { useUserPreferences } from '../hooks/useUserPreferences';
import Ribbon from '../components/Ribbon';
import Header from '../components/Header';
import Horizontal from '../components/Horizontal';
import Footer from '../components/Footer';
import Gallery from '../components/Gallery';
import { Pin } from 'lucide-react';

interface SubCategoryPageClientProps {
  initialData: {
    category: any;
    news: any[];
    pagination: any;
    pinnedNews?: any[];
  };
  slug: string;
}

export default function SubCategoryPageClient({ initialData, slug }: SubCategoryPageClientProps) {
  const router = useRouter();
  const { trackCategoryVisit } = useUserPreferences();
  const { 
    loadMoreNews, 
    getRecommendedNews, 
    getMoreStories, 
    getSponsoredBlocks,
    truncateContent,
    isLoadingMore 
  } = useSubCategory();
  
  const [showGallery, setShowGallery] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('white');
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [flashIndex, setFlashIndex] = useState(0);
  
  const [categoryData, setCategoryData] = useState(initialData);
  const { category, news, pagination, pinnedNews = [] } = categoryData;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const validPinnedNews = Array.isArray(pinnedNews) ? pinnedNews : [];
  const pinnedNewsIds = new Set(validPinnedNews.map(item => item.news_id));
  
  const regularNews = news.filter(article => !pinnedNewsIds.has(article.news_id));
  
  const sortedNews = [...regularNews].sort((a, b) => {
    const dateA = new Date(a.published_at).getTime();
    const dateB = new Date(b.published_at).getTime();
    return dateB - dateA;
  });

  const allNews = [...validPinnedNews, ...sortedNews];

  useEffect(() => {
    trackCategoryVisit(slug);
  }, [slug, trackCategoryVisit]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlashIndex((prev) => (prev + 1) % Math.min(5, allNews.length));
    }, 5000);
    return () => clearInterval(interval);
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

  const handleArticleClick = (article: any) => {
    router.push(`/client/articles/${article.slug}`);
  };

  const handleLoadMore = useCallback(async () => {
    if (!pagination.has_next || isLoadingMore) return;
    
    try {
      const nextPage = pagination.current_page + 1;
      const newNews = await loadMoreNews(slug, nextPage);
      
      if (newNews.length > 0) {
        setCategoryData(prev => ({
          ...prev,
          news: [...prev.news, ...newNews],
          pagination: {
            ...prev.pagination,
            current_page: nextPage,
            has_next: newNews.length === pagination.per_page
          },
          pinnedNews: prev.pinnedNews
        }));
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    }
  }, [pagination, isLoadingMore, loadMoreNews, slug]);

  useEffect(() => {
    if (!loadMoreRef.current || !pagination.has_next) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [pagination.has_next, isLoadingMore, handleLoadMore]);

  const getFreshnessBadge = (publishedAt: string) => {
    const now = new Date().getTime();
    const published = new Date(publishedAt).getTime();
    const hoursDiff = (now - published) / (1000 * 60 * 60);
    
    if (hoursDiff < 2) return { text: '🔴 Just In', class: 'badge-fresh' };
    if (hoursDiff < 24) return { text: '🟡 Today', class: 'badge-updated' };
    if (hoursDiff < 168) return { text: '⚪ This Week', class: 'badge-background' };
    return null;
  };

  const getReadingTime = (wordCount: number) => {
    const minutes = Math.ceil(wordCount / 200);
    return `⏱ ${minutes} min read`;
  };

  const processFormatting = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/g, '<span class="content-highlight">$1</span>')
      .replace(/\[BOLD\](.*?)\[\/BOLD\]/g, '<strong class="content-bold">$1</strong>')
      .replace(/\[ITALIC\](.*?)\[\/ITALIC\]/g, '<em class="content-italic">$1</em>');
  };

  const config = {
    color: getCategoryColor(slug),
    icon: getCategoryIcon(slug),
    name: category?.name || slug.charAt(0).toUpperCase() + slug.slice(1),
  };

  const recommendedNews = getRecommendedNews(allNews, 10);
  const moreStories = getMoreStories(allNews, 10, 10);
  const ribbonNews = allNews.slice(0, 15);
  const trendingItems = allNews.slice(0, 5);
  const currentTrending = trendingItems[flashIndex];

  const storyBlocks = allNews.map((article, index) => {
    const { truncated, wordCount, isTruncated } = truncateContent(article.content || article.excerpt || '', 180);
    return { ...article, truncatedContent: truncated, wordCount, isTruncated, blockIndex: index };
  });

  const sponsoredBlocks = getSponsoredBlocks(allNews.slice(0, 9), 3);

  const isPinned = (articleId: number) => pinnedNewsIds.has(articleId);

  if (showGallery) {
    return <Gallery allNews={allNews} onArticleClick={handleArticleClick} />;
  }

  const TrendingFlash = () => {
    if (!currentTrending) return null;

    return (
      <div className="trending-flash-banner">
        <div className="trending-flash-inner">
          <span className="trending-icon-flash">🔥</span>
          <span className="trending-label-flash">HOT</span>
          <div 
            className="trending-content-flash"
            onClick={() => handleArticleClick(currentTrending)}
            role="button" 
            tabIndex={0}
          >
            <span className="trending-title-flash">{currentTrending.title}</span>
            <span className="trending-meta-flash">
              👁 {formatNumber(currentTrending.views)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="subcategory-page">
      <div className={`header-wrapper ${isHeaderVisible ? 'visible' : 'hidden'}`}>
        <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      </div>
      <Horizontal activeCategory={slug} />

      <TrendingFlash />

      <Ribbon 
        articles={ribbonNews}
        onArticleClick={handleArticleClick}
      />

      <main className="main-container">
        {allNews.length > 0 ? (
          <div className="subcategory-revamped-layout">
            <aside className="subcategory-left-panel">
              <h3 className="panel-section-title">
                <span>📚</span>
                <span>Recent Stories</span>
              </h3>
              <div className="panel-article-list">
                {recommendedNews.map((article: any) => (
                  <div 
                    key={article.news_id} 
                    className="panel-article-item" 
                    onClick={() => handleArticleClick(article)} 
                    role="button" 
                    tabIndex={0}
                  >
                    <div className="panel-thumbnail">
                      {article.image_url ? (
                        <img 
                          src={getImageUrl(article.image_url) || ''} 
                          alt={article.title}
                          width="80"
                          height="80"
                          loading="lazy"
                        />
                      ) : (
                        <div className="panel-placeholder">{config.icon}</div>
                      )}
                    </div>
                    <div className="panel-article-info">
                      <h4 className="panel-article-title">{article.title}</h4>
                      <div className="panel-article-meta">
                        <span>🕒 {formatDate(article.published_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <div className="subcategory-center-content">
              {storyBlocks.map((story, index) => {
                const freshness = getFreshnessBadge(story.published_at);

                return (
                  <React.Fragment key={story.news_id}>
                    <div className="story-block">
                      <div className="story-inner">
                        <div className="story-header">
                          <div 
                            className="story-number"
                            style={{ background: config.color }}
                          >
                            #{index + 1}
                          </div>
                          <div className="story-title-wrapper">
                            <h2 
                              className="story-main-title" 
                              onClick={() => handleArticleClick(story)} 
                              role="button" 
                              tabIndex={0}
                            >
                              {story.title}
                              {freshness && (
                                <span className={`story-freshness-badge ${freshness.class}`}>
                                  {freshness.text}
                                </span>
                              )}
                            </h2>
                          </div>
                        </div>

                        <div className="story-content-grid">
                          <div 
                            className="story-image-wrapper" 
                            onClick={() => handleArticleClick(story)} 
                            role="button" 
                            tabIndex={0}
                          >
                            {story.image_url ? (
                              <>
                                <img 
                                  src={getImageUrl(story.image_url) || ''} 
                                  alt={story.title}
                                  width="600"
                                  height="400"
                                  loading="lazy"
                                />
                                {isPinned(story.news_id) && (
                                  <div className="pinned-badge-overlay">
                                    <Pin size={48} strokeWidth={2} />
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="story-image-placeholder" style={{ background: config.color }}>
                                {config.icon}
                              </div>
                            )}
                          </div>

                          <div className="story-text-content">
                            {story.excerpt && (
                              <p 
                                className="story-excerpt"
                                dangerouslySetInnerHTML={{ 
                                  __html: processFormatting(story.excerpt) 
                                }}
                              />
                            )}
                            
                            <div 
                              className="story-body"
                              dangerouslySetInnerHTML={{ 
                                __html: processFormatting(story.truncatedContent) 
                              }}
                            />

                            <button 
                              className="story-action-btn"
                              onClick={() => handleArticleClick(story)}
                            >
                              Read Full Story {getReadingTime(story.wordCount)}
                            </button>

                            <div className="story-meta-row">
                              <div className="story-author-info">
                                <div className="story-avatar">
                                  {story.first_name?.[0]}{story.last_name?.[0]}
                                </div>
                                <div className="story-author-details">
                                  <span className="story-author-name">
                                    By {story.first_name} {story.last_name}
                                  </span>
                                  <span className="story-date">📅 {formatDate(story.published_at)}</span>
                                </div>
                              </div>
                              <div className="story-stats">
                                <span>❤️ {formatNumber(story.likes_count)}</span>
                                <span>👁 {formatNumber(story.views)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(index + 1) % 3 === 0 && index < allNews.length - 1 && sponsoredBlocks[Math.floor(index / 3)] && (
                      <div className="sponsored-flash-block">
                        <div className="sponsored-header">
                          <span className="sponsored-icon">✨</span>
                          <span className="sponsored-label">More From {config.name}</span>
                        </div>
                        <div className="sponsored-grid">
                          {sponsoredBlocks[Math.floor(index / 3)].map((sponsoredArticle: any) => (
                            <div 
                              key={sponsoredArticle.news_id} 
                              className="sponsored-card"
                              onClick={() => handleArticleClick(sponsoredArticle)}
                              role="button" 
                              tabIndex={0}
                            >
                              <div className="sponsored-card-image">
                                {sponsoredArticle.image_url ? (
                                  <img 
                                    src={getImageUrl(sponsoredArticle.image_url) || ''} 
                                    alt={sponsoredArticle.title}
                                    width="300"
                                    height="200"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="story-image-placeholder" style={{ background: config.color }}>
                                    {config.icon}
                                  </div>
                                )}
                              </div>
                              <div className="sponsored-card-body">
                                <h4 className="sponsored-card-title">{sponsoredArticle.title}</h4>
                                <div className="sponsored-card-meta">
                                  <span>✍️ {sponsoredArticle.first_name} {sponsoredArticle.last_name}</span>
                                  <span>•</span>
                                  <span>👁 {formatNumber(sponsoredArticle.views)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {pagination.has_next && (
                <div ref={loadMoreRef} className="load-more-section">
                  {isLoadingMore && (
                    <div className="load-more-spinner">⏳ Loading more articles...</div>
                  )}
                </div>
              )}
            </div>

            <aside className="subcategory-right-panel">
              <h3 className="panel-section-title">
                <span>🔥</span>
                <span>Trending</span>
              </h3>
              <div className="panel-article-list">
                {moreStories.map((article: any) => (
                  <div 
                    key={article.news_id} 
                    className="panel-article-item" 
                    onClick={() => handleArticleClick(article)} 
                    role="button" 
                    tabIndex={0}
                  >
                    <div className="panel-thumbnail">
                      {article.image_url ? (
                        <img 
                          src={getImageUrl(article.image_url) || ''} 
                          alt={article.title}
                          width="80"
                          height="80"
                          loading="lazy"
                        />
                      ) : (
                        <div className="panel-placeholder">{config.icon}</div>
                      )}
                    </div>
                    <div className="panel-article-info">
                      <h4 className="panel-article-title">{article.title}</h4>
                      <div className="panel-article-meta">
                        <span className="panel-trending-badge">🔥 Hot</span>
                        <span>👁 {formatNumber(article.views)}</span>
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
            <button onClick={() => router.push('/client')} className="load-more-btn">
              🏠 Browse Other Categories
            </button>
          </div>
        )}
      </main>

      <button className="sidebar-hamburger hamburger-left" onClick={() => setShowLeftSidebar(true)}>
        📚
      </button>

      <button className="sidebar-hamburger hamburger-right" onClick={() => setShowRightSidebar(true)}>
        🔥
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
            <h3 className="panel-section-title">
              <span>📚</span>
              <span>Recent Stories</span>
            </h3>
            <div className="panel-article-list">
              {recommendedNews.map((article: any) => (
                <div 
                  key={article.news_id} 
                  className="panel-article-item" 
                  onClick={() => { 
                    handleArticleClick(article); 
                    setShowLeftSidebar(false); 
                  }} 
                  role="button" 
                  tabIndex={0}
                >
                  <div className="panel-thumbnail">
                    {article.image_url ? (
                      <img 
                        src={getImageUrl(article.image_url) || ''} 
                        alt={article.title}
                        width="80"
                        height="80"
                        loading="lazy"
                      />
                    ) : (
                      <div className="panel-placeholder">{config.icon}</div>
                    )}
                  </div>
                  <div className="panel-article-info">
                    <h4 className="panel-article-title">{article.title}</h4>
                    <div className="panel-article-meta">
                      <span>🕒 {formatDate(article.published_at)}</span>
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
            <h3 className="panel-section-title">
              <span>🔥</span>
              <span>Trending</span>
            </h3>
            <div className="panel-article-list">
              {moreStories.map((article: any) => (
                <div 
                  key={article.news_id} 
                  className="panel-article-item" 
                  onClick={() => { 
                    handleArticleClick(article); 
                    setShowRightSidebar(false); 
                  }} 
                  role="button" 
                  tabIndex={0}
                >
                  <div className="panel-thumbnail">
                    {article.image_url ? (
                      <img 
                        src={getImageUrl(article.image_url) || ''} 
                        alt={article.title}
                        width="80"
                        height="80"
                        loading="lazy"
                      />
                    ) : (
                      <div className="panel-placeholder">{config.icon}</div>
                    )}
                  </div>
                  <div className="panel-article-info">
                    <h4 className="panel-article-title">{article.title}</h4>
                    <div className="panel-article-meta">
                      <span>🔥 Hot</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <button className="stories-btn" onClick={() => setShowGallery(true)} title="View Gallery">
        <div className="stories-icon">📸</div>
        <div className="stories-text">Stories</div>
      </button>

      <Footer />
    </div>
  );
}