'use client';

import React from 'react';
import { formatNumber, getImageUrl } from '../../../../lib/clientData';
import { getTimeSince } from '../../../../lib/trending/trendingScore';
import VelocityIndicator from './VelocityIndicator';
import type { NewsItem } from '../../hooks/useArticle';

interface TrendingCardProps {
  article: NewsItem;
  rank: number;
  velocityTier: 'fast' | 'medium' | 'slow';
  heatLevel: number;
  isFavoriteCategory: boolean;
  onClick: () => void;
}

export default function TrendingCard({
  article,
  rank,
  velocityTier,
  heatLevel,
  isFavoriteCategory,
  onClick
}: TrendingCardProps) {
  const isTopTen = rank <= 10;

  return (
    <div
      className={`trending-card ${isTopTen ? 'top-ten' : ''}`}
      data-heat={heatLevel}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="card-rank">#{rank}</div>

      {velocityTier === 'fast' && (
        <VelocityIndicator delta={12000} position="card" />
      )}

      <div className="card-image-wrapper">
        {article.image_url ? (
          <img
            src={getImageUrl(article.image_url)}
            alt={article.title}
            loading="lazy"
          />
        ) : (
          <div className="card-image-placeholder">📰</div>
        )}
        <div className="card-image-overlay">
          <span
            className="card-category"
            style={article.category_color ? { backgroundColor: article.category_color } : {}}
          >
            {article.category_name}
          </span>
          {isFavoriteCategory && (
            <span className="card-favorite">⭐</span>
          )}
        </div>
      </div>

      <div className="card-content-box">
        <h3 className="card-title">{article.title}</h3>
        {article.excerpt && <p className="card-excerpt">{article.excerpt}</p>}

        <div className="card-meta-grid">
          <div className="meta-author">
            <div className="author-avatar">
              {article.first_name?.[0]}{article.last_name?.[0]}
            </div>
            <span className="author-name">
              {article.first_name} {article.last_name}
            </span>
          </div>

          <div className="meta-stats">
            <span className="stat-item">👁️ {formatNumber(article.views)}</span>
            <span className="stat-separator">•</span>
            <span className="stat-item">❤️ {formatNumber(article.likes_count)}</span>
            <span className="stat-separator">•</span>
            <span className="stat-item">💬 {formatNumber(article.comments_count)}</span>
          </div>

          <div className="meta-time">
            <span className="time-text">{getTimeSince(article.published_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}