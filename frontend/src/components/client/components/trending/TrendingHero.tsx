'use client';

import React from 'react';
import { formatNumber, getImageUrl } from '../../../../lib/clientData';
import { getTimeSince } from '../../../../lib/trending/trendingScore';
import VelocityIndicator from './VelocityIndicator';
import type { NewsItem } from '../../hooks/useArticle';

interface TrendingHeroProps {
  mainArticle: NewsItem;
  sideArticles: NewsItem[];
  onArticleClick: (article: NewsItem) => void;
  velocityData: Map<number, { score: number; delta: number }>;
  preferences: { favoriteCategories: string[] };
}

export default function TrendingHero({ 
  mainArticle, 
  sideArticles, 
  onArticleClick,
  velocityData,
  preferences 
}: TrendingHeroProps) {
  const mainVelocity = velocityData.get(mainArticle.news_id);
  
  return (
    <section className="trending-hero">
      <article 
        className="hero-main"
        onClick={() => onArticleClick(mainArticle)}
        role="button"
        tabIndex={0}
      >
        <div className="hero-rank-badge">
          <span className="rank-number">#1</span>
          <span className="rank-label">Trending</span>
        </div>

        {mainVelocity && mainVelocity.delta > 5000 && (
          <VelocityIndicator 
            delta={mainVelocity.delta} 
            position="hero"
          />
        )}

        <div className="hero-image-wrapper">
          {mainArticle.image_url ? (
            <img 
              src={getImageUrl(mainArticle.image_url)} 
              alt={mainArticle.title}
              loading="eager"
            />
          ) : (
            <div className="hero-image-placeholder">📰</div>
          )}
          <div className="hero-overlay-gradient" />
        </div>

        <div className="hero-content-box">
          <div className="hero-category-row">
            <span 
              className="hero-category"
              style={mainArticle.category_color ? { backgroundColor: mainArticle.category_color } : {}}
            >
              {mainArticle.category_name}
            </span>
            {preferences.favoriteCategories.includes(mainArticle.category_slug) && (
              <span className="hero-favorite">⭐</span>
            )}
          </div>

          <h1 className="hero-title">{mainArticle.title}</h1>
          
          {mainArticle.excerpt && (
            <p className="hero-excerpt">{mainArticle.excerpt}</p>
          )}

          <div className="hero-meta">
            <div className="hero-author">
              <div className="hero-avatar">
                {mainArticle.first_name?.[0]}{mainArticle.last_name?.[0]}
              </div>
              <span className="hero-author-name">
                {mainArticle.first_name} {mainArticle.last_name}
              </span>
            </div>

            <div className="hero-stats">
              <span className="hero-stat">👁️ {formatNumber(mainArticle.views)}</span>
              <span className="hero-separator">•</span>
              <span className="hero-stat">❤️ {formatNumber(mainArticle.likes_count)}</span>
              <span className="hero-separator">•</span>
              <span className="hero-stat">💬 {formatNumber(mainArticle.comments_count)}</span>
            </div>
          </div>

          <div className="hero-badge-row">
            <span className="hero-time">{getTimeSince(mainArticle.published_at)}</span>
            {mainVelocity && mainVelocity.score > 80000 && (
              <span className="hero-fire-badge">
                🔥 {Math.floor(mainVelocity.score / 1000)}K
              </span>
            )}
          </div>
        </div>
      </article>

      <aside className="hero-side">
        {sideArticles.map((article, index) => {
          const velocity = velocityData.get(article.news_id);
          
          return (
            <div 
              key={article.news_id}
              className="hero-mini"
              onClick={() => onArticleClick(article)}
              role="button"
              tabIndex={0}
            >
              <div className="mini-rank">#{index + 2}</div>
              
              {velocity && velocity.delta > 3000 && (
                <VelocityIndicator delta={velocity.delta} position="mini" />
              )}

              <div className="mini-image">
                {article.image_url ? (
                  <img 
                    src={getImageUrl(article.image_url)} 
                    alt={article.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="mini-placeholder">📰</div>
                )}
              </div>

              <div className="mini-content">
                <span 
                  className="mini-category"
                  style={article.category_color ? { backgroundColor: article.category_color } : {}}
                >
                  {article.category_name}
                </span>
                <h3 className="mini-title">{article.title}</h3>
                <div className="mini-stats">
                  <span>👁️ {formatNumber(article.views)}</span>
                  <span>❤️ {formatNumber(article.likes_count)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </aside>
    </section>
  );
}