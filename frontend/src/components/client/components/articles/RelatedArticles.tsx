'use client';

import React, { useState, useEffect } from 'react';
import { getImageUrl, formatDate } from '../../../../lib/clientData';
import { User, Calendar } from 'lucide-react';

interface RelatedArticle {
  news_id: number;
  title: string;
  slug: string;
  image_url?: string;
  first_name: string;
  last_name: string;
  published_at: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
  categoryName: string;
  onArticleClick: (article: RelatedArticle) => void;
  excludeIds?: number[];
}

export default function RelatedArticles({ 
  articles, 
  categoryName, 
  onArticleClick, 
  excludeIds = [] 
}: RelatedArticlesProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredArticles = articles.filter(article => !excludeIds.includes(article.news_id));
  const displayCount = isMobile ? 10 : 20;

  return (
    <section className="related-articles-section">
      <h2 className="section-title">More From {categoryName}</h2>
      
      <div className="related-articles-grid">
        {filteredArticles.slice(0, displayCount).map((rel: RelatedArticle) => (
          <article 
            key={rel.news_id}
            onClick={() => onArticleClick(rel)}
            className="related-article-card"
          >
            <div className="related-article-image">
              {rel.image_url ? (
                <img 
                  src={getImageUrl(rel.image_url) || ''} 
                  alt={rel.title} 
                  loading="lazy"
                  width="280"
                  height="160"
                />
              ) : (
                <div className="image-placeholder">📰</div>
              )}
            </div>
            <div className="related-article-content">
              <h3 className="related-article-title">{rel.title}</h3>
              <div className="related-article-meta">
                <span className="meta-item">
                  <User size={10} />
                  {rel.first_name} {rel.last_name}
                </span>
                <span className="meta-item">
                  <Calendar size={10} />
                  {formatDate(rel.published_at)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}