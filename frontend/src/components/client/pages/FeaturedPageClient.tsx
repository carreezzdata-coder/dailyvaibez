'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatNumber, getImageUrl } from '../../../lib/clientData';
import { useFeatured } from '../hooks/useFeatured';
import Header from '../components/Header';
import Horizontal from '../components/Horizontal';
import Ribbon from '../components/Ribbon';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';

interface FeaturedPageClientProps {
  initialData: {
    news: any[];
    pagination: any;
  };
}

export default function FeaturedPageClient({ initialData }: FeaturedPageClientProps) {
  const router = useRouter();
  const [galleryMode, setGalleryMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState('white');
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  const { news, refresh, isLoading } = useFeatured(initialData.news);

  const pageSettings = { 
    title: 'Featured Stories', 
    icon: '⭐', 
    color: '#9b59b6', 
    badge: 'FEATURED' 
  };

  const convertNewsItems = (items: any[]) => {
    return items.map((item) => ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags
    }));
  };

  const tier1Articles = news.slice(0, 1);
  const tier2Articles = news.slice(1, 3);
  const tier3Articles = news.slice(3, 6);
  const tier4Articles = news.slice(6, 10);
  const additionalArticles = news.slice(10);
  const recentArticles = news.slice(0, 6);
  const topArticles = [...news].sort((a, b) => b.views - a.views).slice(0, 10);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('vybes-theme') || 'white';
      setActiveTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    const handleScrollEvent = () => {
      const currentPosition = window.scrollY;
      if (currentPosition > lastScroll && currentPosition > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScroll(currentPosition);
    };

    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, [lastScroll]);

  const changeTheme = (theme: string) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vybes-theme', theme);
    }
  };

  const goToArticle = (article: any) => {
    router.push(`/client/articles/${article.slug}`);
  };

  const limitText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const computeReadingTime = (content: string) => {
    if (!content) return 1;
    const totalWords = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(totalWords / 200));
  };

  if (galleryMode) {
    return <Gallery allNews={convertNewsItems(news)} onArticleClick={goToArticle} />;
  }

  return (
    <div className="featured-page">
      <div className={`header-wrapper ${headerVisible ? 'visible' : 'hidden'}`}>
        <Header currentTheme={activeTheme} onThemeChange={changeTheme} />
      </div>
      <Horizontal activeCategory="home" />

      <Ribbon onArticleClick={goToArticle} />

      <main className="main-container">
        {news.length > 0 ? (
          <div className="featured-layout">
            <aside className="updates-left-sidebar">
              <h3 className="sidebar-title">📚 Recent Updates</h3>
              <div className="sidebar-article-list">
                {recentArticles.map((article: any) => (
                  <div 
                    key={article.news_id} 
                    className="sidebar-article-item" 
                    onClick={() => goToArticle(article)} 
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
                        <div className="thumbnail-placeholder">{pageSettings.icon}</div>
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

            <div className="featured-center-content">
              {tier1Articles.length > 0 && (
                <div className="featured-level-1">
                  {tier1Articles.map((article: any) => (
                    <article 
                      key={article.news_id} 
                      className="featured-level-1-card"
                      onClick={() => goToArticle(article)}
                    >
                      <div className="featured-premium-badge" style={{ background: pageSettings.color }}>
                        <span className="premium-star">★</span>
                        EDITOR'S PICK
                      </div>
                      <div className="featured-level-1-image">
                        {article.image_url ? (
                          <img 
                            src={getImageUrl(article.image_url) || ''} 
                            alt={article.title}
                            loading="eager"
                            width="1200"
                            height="600"
                          />
                        ) : (
                          <div className="featured-image-placeholder" style={{ background: pageSettings.color }}>
                            {pageSettings.icon}
                          </div>
                        )}
                      </div>
                      <div className="featured-level-1-content">
                        <div className="featured-level-1-category" style={{ color: pageSettings.color }}>
                          {article.category_name}
                        </div>
                        <h2 className="featured-level-1-title">{article.title}</h2>
                        {article.excerpt && (
                          <p 
                            className="featured-level-1-excerpt"
                            dangerouslySetInnerHTML={{ 
                              __html: limitText(article.excerpt, 250)
                                .replace(/\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/g, '<span class="excerpt-highlight">$1</span>')
                                .replace(/\[BOLD\](.*?)\[\/BOLD\]/g, '<strong class="excerpt-bold">$1</strong>')
                                .replace(/\[ITALIC\](.*?)\[\/ITALIC\]/g, '<em class="excerpt-italic">$1</em>')
                            }}
                          />
                        )}
                        <div className="featured-level-1-meta">
                          <div className="featured-level-1-author">
                            <span className="featured-author-avatar" style={{ background: pageSettings.color }}>
                              {article.first_name?.[0]}{article.last_name?.[0]}
                            </span>
                            <div className="featured-author-info">
                              <span className="featured-author-name">
                                {article.first_name} {article.last_name}
                              </span>
                              <span className="featured-author-role">{article.role_name || 'Senior Editor'}</span>
                            </div>
                          </div>
                          <div className="featured-level-1-stats">
                            <span>🕒 {formatDate(article.published_at)}</span>
                            <span>📖 {computeReadingTime(article.content)} min read</span>
                            <span>👁 {formatNumber(article.views)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {tier2Articles.length > 0 && (
                <div className="featured-level-2">
                  {tier2Articles.map((article: any) => (
                    <article 
                      key={article.news_id} 
                      className="featured-level-2-card"
                      onClick={() => goToArticle(article)}
                    >
                      <div className="featured-level-2-image">
                        {article.image_url ? (
                          <img 
                            src={getImageUrl(article.image_url) || ''} 
                            alt={article.title}
                            loading="lazy"
                            width="600"
                            height="400"
                          />
                        ) : (
                          <div className="featured-image-placeholder" style={{ background: pageSettings.color }}>
                            {pageSettings.icon}
                          </div>
                        )}
                      </div>
                      <div className="featured-level-2-content">
                        <div className="featured-level-2-category" style={{ color: pageSettings.color }}>
                          {article.category_name}
                        </div>
                        <h3 className="featured-level-2-title">{article.title}</h3>
                        {article.excerpt && (
                          <p 
                            className="featured-level-2-excerpt"
                            dangerouslySetInnerHTML={{ 
                              __html: limitText(article.excerpt, 150)
                                .replace(/\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/g, '<span class="excerpt-highlight">$1</span>')
                                .replace(/\[BOLD\](.*?)\[\/BOLD\]/g, '<strong class="excerpt-bold">$1</strong>')
                                .replace(/\[ITALIC\](.*?)\[\/ITALIC\]/g, '<em class="excerpt-italic">$1</em>')
                            }}
                          />
                        )}
                        <div className="featured-level-2-meta">
                          <div className="featured-level-2-author">
                            <span className="featured-author-avatar" style={{ background: pageSettings.color }}>
                              {article.first_name?.[0]}{article.last_name?.[0]}
                            </span>
                            <span>{article.first_name} {article.last_name}</span>
                          </div>
                          <div className="featured-level-2-stats">
                            <span>🕒 {formatDate(article.published_at)}</span>
                            <span>👁 {formatNumber(article.views)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {tier3Articles.length > 0 && (
                <div className="featured-level-3">
                  {tier3Articles.map((article: any) => (
                    <article 
                      key={article.news_id} 
                      className="featured-level-3-card"
                      onClick={() => goToArticle(article)}
                    >
                      <div className="featured-level-3-image">
                        {article.image_url ? (
                          <img 
                            src={getImageUrl(article.image_url) || ''} 
                            alt={article.title}
                            loading="lazy"
                            width="400"
                            height="250"
                          />
                        ) : (
                          <div className="featured-image-placeholder" style={{ background: pageSettings.color }}>
                            {pageSettings.icon}
                          </div>
                        )}
                      </div>
                      <div className="featured-level-3-content">
                        <div className="featured-level-3-category" style={{ color: pageSettings.color }}>
                          {article.category_name}
                        </div>
                        <h3 className="featured-level-3-title">{article.title}</h3>
                        <div className="featured-level-3-meta">
                          <div className="featured-level-3-author">
                            <span className="featured-author-avatar" style={{ background: pageSettings.color }}>
                              {article.first_name?.[0]}{article.last_name?.[0]}
                            </span>
                            <span>{article.first_name} {article.last_name}</span>
                          </div>
                          <div className="featured-level-3-stats">
                            <span>🕒 {formatDate(article.published_at)}</span>
                            <span>👁 {formatNumber(article.views)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {tier4Articles.length > 0 && (
                <div className="featured-level-4">
                  {tier4Articles.map((article: any) => (
                    <article 
                      key={article.news_id} 
                      className="featured-level-4-card"
                      onClick={() => goToArticle(article)}
                    >
                      <div className="featured-level-4-image">
                        {article.image_url ? (
                          <img 
                            src={getImageUrl(article.image_url) || ''} 
                            alt={article.title}
                            loading="lazy"
                            width="200"
                            height="150"
                          />
                        ) : (
                          <div className="featured-image-placeholder" style={{ background: pageSettings.color }}>
                            {pageSettings.icon}
                          </div>
                        )}
                      </div>
                      <div className="featured-level-4-content">
                        <div className="featured-level-4-category" style={{ color: pageSettings.color }}>
                          {article.category_name}
                        </div>
                        <h3 className="featured-level-4-title">{article.title}</h3>
                        <div className="featured-level-4-meta">
                          <div className="featured-level-4-author">
                            <span className="featured-author-avatar" style={{ background: pageSettings.color }}>
                              {article.first_name?.[0]}{article.last_name?.[0]}
                            </span>
                            <span>{article.first_name} {article.last_name}</span>
                          </div>
                          <div className="featured-level-4-stats">
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
                {topArticles.map((article: any, index: number) => (
                  <div 
                    key={article.news_id} 
                    className="sidebar-article-item trending" 
                    onClick={() => goToArticle(article)} 
                    role="button" 
                    tabIndex={0}
                  >
                    <div className="popularity-rank" style={{ background: pageSettings.color }}>
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
                        <div className="thumbnail-placeholder">{pageSettings.icon}</div>
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
            <div className="empty-icon" style={{ color: pageSettings.color }}>
              {pageSettings.icon}
            </div>
            <h3 className="empty-title">No {pageSettings.title.toLowerCase()} available</h3>
            <button 
              onClick={() => router.push('/client')} 
              className="load-more-btn"
              style={{ background: pageSettings.color }}
            >
              🏠 Back to Home
            </button>
          </div>
        )}
      </main>

      <button className="sidebar-hamburger hamburger-left" onClick={() => setLeftPanelOpen(true)}>
        📚
      </button>

      <button className="sidebar-hamburger hamburger-right" onClick={() => setRightPanelOpen(true)}>
        🔥
      </button>

      {leftPanelOpen && (
        <>
          <div 
            className="mobile-sidebar-overlay active" 
            onClick={() => setLeftPanelOpen(false)} 
            role="button" 
            tabIndex={0}
          />
          <div className="mobile-sidebar-drawer left">
            <button className="mobile-sidebar-close" onClick={() => setLeftPanelOpen(false)}>×</button>
            <h3 className="sidebar-title">📚 Recent Updates</h3>
            <div className="sidebar-article-list">
              {recentArticles.map((article: any) => (
                <div 
                  key={article.news_id} 
                  className="sidebar-article-item" 
                  onClick={() => { goToArticle(article); setLeftPanelOpen(false); }} 
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
                      <div className="thumbnail-placeholder">{pageSettings.icon}</div>
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

      {rightPanelOpen && (
        <>
          <div 
            className="mobile-sidebar-overlay active" 
            onClick={() => setRightPanelOpen(false)} 
            role="button" 
            tabIndex={0}
          />
          <div className="mobile-sidebar-drawer right">
            <button className="mobile-sidebar-close" onClick={() => setRightPanelOpen(false)}>×</button>
            <h3 className="sidebar-title">🔥 Most Popular</h3>
            <div className="sidebar-article-list">
              {topArticles.map((article: any, index: number) => (
                <div 
                  key={article.news_id} 
                  className="sidebar-article-item trending" 
                  onClick={() => { goToArticle(article); setRightPanelOpen(false); }} 
                  role="button" 
                  tabIndex={0}
                >
                  <div className="popularity-rank" style={{ background: pageSettings.color }}>
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
                      <div className="thumbnail-placeholder">{pageSettings.icon}</div>
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

      <button className="stories-btn" onClick={() => setGalleryMode(true)} title="View Gallery">
        <div className="stories-icon">📸</div>
        <div className="stories-text">Stories</div>
      </button>

      <Footer />
    </div>
  );
}