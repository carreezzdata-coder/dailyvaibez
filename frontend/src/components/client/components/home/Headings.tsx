import React, { useMemo } from 'react';
import { formatNumber } from '@/lib/clientData';
import { useBreaking } from '@/components/client/hooks/useBreaking';
import { useArticle } from '@/components/client/hooks/useArticle';
import type { NewsItem } from '@/components/client/hooks/useArticle';

interface HeadingsProps {
  onArticleClick: (article: NewsItem) => void;
}

export default function Headings({ onArticleClick }: HeadingsProps) {
  const { news: breakingNews, isLoading: breakingLoading, error: breakingError } = useBreaking();
  const { allNews: regularArticles, isLoadingNews: articlesLoading } = useArticle();

  const formatDateTime = useMemo(() => {
    return (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  }, []);

  const sortedHeadlines = useMemo(() => {
    const headlines = (!breakingError && breakingNews.length > 0) ? breakingNews : regularArticles;
    return [...headlines].sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    ).slice(0, 10);
  }, [breakingNews, regularArticles, breakingError]);

  const isLoading = breakingLoading || articlesLoading;

  if (sortedHeadlines.length === 0) {
    return (
      <div className="headings-sidebar">
        <div className="headings-header">
          <h2 className="headings-title">
            <span className="headings-icon">📰</span>
            Headlines
          </h2>
          {isLoading && <span className="headings-loading">↻</span>}
        </div>
        <div className="headings-empty">
          <p>No headlines available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="headings-sidebar">
      <div className="headings-header">
        <h2 className="headings-title">
          <span className="headings-icon">📰</span>
          Headlines
        </h2>
        {isLoading && <span className="headings-loading">↻</span>}
      </div>
      
      <div className="headings-list">
        {sortedHeadlines.map((article, index) => {
          const authorName = article.first_name 
            ? `${article.first_name} ${article.last_name || ''}`.trim() 
            : 'Staff Writer';

          return (
            <div
              key={`headline-${article.news_id}-${index}`}
              className="headline-item"
              onClick={() => onArticleClick(article)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onArticleClick(article);
                }
              }}
            >
              <div className="headline-number">{index + 1}</div>
              
              <div className="headline-content">
                <h3 className="headline-title">{article.title}</h3>
                
                <div className="headline-meta">
                  <span className="headline-author">
                    <span className="meta-icon">✍️</span> {authorName}
                  </span>
                  <span className="headline-separator">•</span>
                  <span className="headline-date">
                    <span className="meta-icon">📅</span> {formatDateTime(article.published_at)}
                  </span>
                </div>
                
                <div className="headline-info">
                  <span className="headline-views">
                    <span className="meta-icon">👁️</span> {formatNumber(article.views)}
                  </span>
                  <span className="headline-separator">•</span>
                  <span className="headline-likes">
                    <span className="meta-icon">❤️</span> {formatNumber(article.likes_count || 0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}