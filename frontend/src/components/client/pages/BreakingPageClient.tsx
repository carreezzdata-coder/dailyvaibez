'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatNumber, getImageUrl } from '../../../lib/clientData';
import { useBreaking } from '../hooks/useBreaking';
import Header from '../components/Header';
import Horizontal from '../components/Horizontal';
import Ribbon from '../components/Ribbon';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';

interface BreakingPageClientProps {
  initialData: {
    news: any[];
    pagination: any;
  };
}

export default function BreakingPageClient({ initialData }: BreakingPageClientProps) {
  const router = useRouter();
  const [showGallery, setShowGallery] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('white');
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { news, refresh, isLoading } = useBreaking(initialData.news);

  const config = { 
    title: 'Breaking News', 
    icon: '🔥', 
    color: '#e74c3c', 
    badge: 'BREAKING' 
  };

  const normalizeNewsForGallery = (newsItems: any[]) => {
    return newsItems.map((item) => ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags
    }));
  };

  const heroNews = news.slice(0, 1);
  const importantNews = news.slice(1, 4);
  const regularNews = news.slice(4);
  const recentNews = news.slice(0, 6);
  const popularNews = [...news].sort((a, b) => b.views - a.views).slice(0, 10);

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

  const handleArticleClick = (article: any) => {
    router.push(`/client/articles/${article.slug}`);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const getReadingTime = (content: string) => {
    if (!content) return 1;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (showGallery) {
    return <Gallery allNews={normalizeNewsForGallery(news)} onArticleClick={handleArticleClick} />;
  }

  return (
    <div className="breaking-page">
      <div className={`header-wrapper ${isHeaderVisible ? 'visible' : 'hidden'}`}>
        <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      </div>
      <Horizontal activeCategory="home" />

      <Ribbon onArticleClick={handleArticleClick} />

      <main className="main-container">
        {news.length > 0 ? (
          <div className="breaking-layout">
            <aside className="updates-left-sidebar">
              <h3 className="sidebar-title">📚 Recent Updates</h3>
              <div className="sidebar-article-list">
                {recentNews.map((article: any) => (
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
                          loading="lazy"
                          width="70"
                          height="70"
                        />
                      ) : (
                        <div className="thumbnail-placeholder">{config.icon}</div>
                      )}
                    </div>
                    <div className="sidebar-article-content">
                      <div className="sidebar-article-title">{article.title}</div>
                      <div className="sidebar-article-meta">
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <div className="breaking-center-content">
              {heroNews.length > 0 && heroNews.map((article: any) => (
                <article 
                  key={article.news_id} 
                  className="breaking-hero-card"
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="breaking-hero-badge">
                    <span className="live-pulse"></span>
                    {config.badge}
                  </div>
                  <div className="breaking-hero-image">
                    {article.image_url ? (
                      <img 
                        src={getImageUrl(article.image_url) || ''} 
                        alt={article.title}
                        loading="eager"
                        width="1200"
                        height="600"
                      />
                    ) : (
                      <div className="hero-image-placeholder" style={{ background: config.color }}>
                        {config.icon}
                      </div>
                    )}
                    <div className="hero-overlay"></div>
                  </div>
                  <div className="breaking-hero-content">
                    <div className="breaking-hero-category" style={{ color: config.color }}>
                      {article.category_name}
                    </div>
                    <h2 className="breaking-hero-title">{article.title}</h2>
                    {article.excerpt && (
                      <p 
                        className="breaking-hero-excerpt"
                        dangerouslySetInnerHTML={{ 
                          __html: truncateText(article.excerpt, 200)
                            .replace(/\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/g, '<span class="excerpt-highlight">$1</span>')
                            .replace(/\[BOLD\](.*?)\[\/BOLD\]/g, '<strong class="excerpt-bold">$1</strong>')
                            .replace(/\[ITALIC\](.*?)\[\/ITALIC\]/g, '<em class="excerpt-italic">$1</em>')
                        }}
                      />
                    )}
                    {article.content && (
                      <p 
                        className="breaking-hero-preview"
                        dangerouslySetInnerHTML={{ 
                          __html: truncateText(article.content, 300)
                            .replace(/\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/g, '<span class="content-highlight">$1</span>')
                            .replace(/\[BOLD\](.*?)\[\/BOLD\]/g, '<strong class="content-bold">$1</strong>')
                            .replace(/\[ITALIC\](.*?)\[\/ITALIC\]/g, '<em class="content-italic">$1</em>')
                        }}
                      />
                    )}
                    <div className="breaking-hero-meta">
                      <div className="breaking-hero-author">
                        <span className="hero-author-avatar">
                          {article.first_name?.[0]}{article.last_name?.[0]}
                        </span>
                        <div className="hero-author-info">
                          <span className="hero-author-name">{article.first_name} {article.last_name}</span>
                          <span className="hero-author-role">{article.role_name || 'Journalist'}</span>
                        </div>
                      </div>
                      <div className="breaking-hero-stats">
                        <span>🕒 {formatDate(article.published_at)}</span>
                        <span>📖 {getReadingTime(article.content)} min read</span>
                        <span>👁 {formatNumber(article.views)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {importantNews.length > 0 && (
                <div className="breaking-important-grid">
                  {importantNews.map((article: any) => (
                    <article 
                      key={article.news_id} 
                      className="breaking-important-card"
                      onClick={() => handleArticleClick(article)}
                    >
                      <div className="breaking-important-image">
                        {article.image_url ? (
                          <img 
                            src={getImageUrl(article.image_url) || ''} 
                            alt={article.title}
                            loading="lazy"
                            width="400"
                            height="250"
                          />
                        ) : (
                          <div className="important-image-placeholder" style={{ background: config.color }}>
                            {config.icon}
                          </div>
                        )}
                      </div>
                      <div className="breaking-important-content">
                        <div className="breaking-important-category" style={{ color: config.color }}>
                          {article.category_name}
                        </div>
                        <h3 className="breaking-important-title">{article.title}</h3>
                        <div className="breaking-important-meta">
                          <div className="breaking-important-author">
                            <span className="important-author-avatar">
                              {article.first_name?.[0]}{article.last_name?.[0]}
                            </span>
                            <span>{article.first_name} {article.last_name}</span>
                          </div>
                          <div className="breaking-important-stats">
                            <span>🕒 {formatDate(article.published_at)}</span>
                            <span>👁 {formatNumber(article.views)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {regularNews.length > 0 && (
                <div className="breaking-regular-list">
                  {regularNews.map((article: any) => (
                    <article 
                      key={article.news_id} 
                      className="breaking-regular-card"
                      onClick={() => handleArticleClick(article)}
                    >
                      <div className="breaking-regular-image">
                        {article.image_url ? (
                          <img 
                            src={getImageUrl(article.image_url) || ''} 
                            alt={article.title}
                            loading="lazy"
                            width="200"
                            height="150"
                          />
                        ) : (
                          <div className="regular-image-placeholder" style={{ background: config.color }}>
                            {config.icon}
                          </div>
                        )}
                      </div>
                      <div className="breaking-regular-content">
                        <div className="breaking-regular-category" style={{ color: config.color }}>
                          {article.category_name}
                        </div>
                        <h3 className="breaking-regular-title">{article.title}</h3>
                        <div className="breaking-regular-meta">
                          <div className="breaking-regular-author">
                            <span className="regular-author-avatar">
                              {article.first_name?.[0]}{article.last_name?.[0]}
                            </span>
                            <span>{article.first_name} {article.last_name}</span>
                          </div>
                          <div className="breaking-regular-stats">
                            <span>🕒 {formatDate(article.published_at)}</span>
                            <span>👁 {formatNumber(article.views)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="updates-right-sidebar">
              <h3 className="sidebar-title">🔥 Most Popular</h3>
              <div className="sidebar-article-list">
                {popularNews.map((article: any, index: number) => (
                  <div 
                    key={article.news_id} 
                    className="sidebar-article-item trending" 
                    onClick={() => handleArticleClick(article)} 
                    role="button" 
                    tabIndex={0}
                  >
                    <div className="popularity-rank" style={{ background: config.color }}>
                      {index + 1}
                    </div>
                    <div className="sidebar-thumbnail">
                      {article.image_url ? (
                        <img 
                          src={getImageUrl(article.image_url) || ''} 
                          alt={article.title}
                          loading="lazy"
                          width="70"
                          height="70"
                        />
                      ) : (
                        <div className="thumbnail-placeholder">{config.icon}</div>
                      )}
                    </div>
                    <div className="sidebar-article-content">
                      <div className="sidebar-article-title">{article.title}</div>
                      <div className="sidebar-article-meta">
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
            <h3 className="empty-title">No {config.title.toLowerCase()} available</h3>
            <button 
              onClick={() => router.push('/client')} 
              className="load-more-btn"
              style={{ background: config.color }}
            >
              🏠 Back to Home
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
            <h3 className="sidebar-title">📚 Recent Updates</h3>
            <div className="sidebar-article-list">
              {recentNews.map((article: any) => (
                <div 
                  key={article.news_id} 
                  className="sidebar-article-item" 
                  onClick={() => { handleArticleClick(article); setShowLeftSidebar(false); }} 
                  role="button" 
                  tabIndex={0}
                >
                  <div className="sidebar-thumbnail">
                    {article.image_url ? (
                      <img 
                        src={getImageUrl(article.image_url) || ''} 
                        alt={article.title}
                        loading="lazy"
                        width="70"
                        height="70"
                      />
                    ) : (
                      <div className="thumbnail-placeholder">{config.icon}</div>
                    )}
                  </div>
                  <div className="sidebar-article-content">
                    <div className="sidebar-article-title">{article.title}</div>
                    <div className="sidebar-article-meta">
                      <span>{formatDate(article.published_at)}</span>
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
            <h3 className="sidebar-title">🔥 Most Popular</h3>
            <div className="sidebar-article-list">
              {popularNews.map((article: any, index: number) => (
                <div 
                  key={article.news_id} 
                  className="sidebar-article-item trending" 
                  onClick={() => { handleArticleClick(article); setShowRightSidebar(false); }} 
                  role="button" 
                  tabIndex={0}
                >
                  <div className="popularity-rank" style={{ background: config.color }}>
                    {index + 1}
                  </div>
                  <div className="sidebar-thumbnail">
                    {article.image_url ? (
                      <img 
                        src={getImageUrl(article.image_url) || ''} 
                        alt={article.title}
                        loading="lazy"
                        width="70"
                        height="70"
                      />
                    ) : (
                      <div className="thumbnail-placeholder">{config.icon}</div>
                    )}
                  </div>
                  <div className="sidebar-article-content">
                    <div className="sidebar-article-title">{article.title}</div>
                    <div className="sidebar-article-meta">
                      <span>{formatNumber(article.views)}</span>
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