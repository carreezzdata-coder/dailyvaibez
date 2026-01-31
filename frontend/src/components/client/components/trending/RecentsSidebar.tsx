'use client';

import React from 'react';
import { formatNumber, getImageUrl } from '../../../../lib/clientData';
import { getTimeSince } from '../../../../lib/trending/trendingScore';
import type { NewsItem } from '../../hooks/useArticle';

interface RecentsSidebarProps {
  articles: NewsItem[];
  isVisible: boolean;
  onClose: () => void;
  onArticleClick: (article: NewsItem) => void;
}

export default function RecentsSidebar({
  articles,
  isVisible,
  onClose,
  onArticleClick
}: RecentsSidebarProps) {
  return (
    <aside className={`recents-sidebar right-sidebar ${isVisible ? 'visible' : ''}`}>
      <div className="recents-header">
        <h3 className="recents-title">📊 Recent Trends</h3>
        <button className="close-recents" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="recents-list">
        {articles.map((article, index) => (
          <div
            key={article.news_id}
            className="recent-item"
            onClick={() => {
              onArticleClick(article);
              onClose();
            }}
            role="button"
            tabIndex={0}
          >
            <div className="recent-rank">#{index + 1}</div>

            <div className="recent-thumbnail">
              {article.image_url ? (
                <img
                  src={getImageUrl(article.image_url)}
                  alt={article.title}
                  loading="lazy"
                />
              ) : (
                <div className="recent-placeholder">📰</div>
              )}
            </div>

            <div className="recent-content">
              <h4 className="recent-title">{article.title}</h4>
              <div className="recent-meta">
                <span className="recent-category">{article.category_name}</span>
                <span className="recent-time">{getTimeSince(article.published_at)}</span>
              </div>
              <div className="recent-stats">
                <span>👁️ {formatNumber(article.views)}</span>
                <span>❤️ {formatNumber(article.likes_count)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}