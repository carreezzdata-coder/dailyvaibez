'use client';

import React, { useState, useEffect } from 'react';
import { formatNumber, getImageUrl } from '../../../lib/clientData';

interface SpinnerProps {
  news: any[];
  onArticleClick: (article: any) => void;
}

export default function Spinner({ news, onArticleClick }: SpinnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const trendingNews = news.slice(0, 12);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setRotation(prev => (prev + 15) % 360);
      setCurrentIndex(prev => (prev + 1) % trendingNews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, trendingNews.length]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setRotation(0);
      setCurrentIndex(0);
    }
  };

  const itemsToShow = 6;
  const angleStep = 180 / (itemsToShow - 1);

  return (
    <>
      <button 
        className={`spinner-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        title="Trending Spinner"
      >
        <div className="spinner-trigger-icon">📰</div>
      </button>

      {isOpen && (
        <>
          <div 
            className="spinner-overlay" 
            onClick={handleToggle}
            role="button" 
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleToggle();
              }
            }}
          />
          <div className="spinner-container">
            <div className="spinner-center">
              <div className="spinner-logo">DV</div>
            </div>

            <div 
              className="spinner-track"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {trendingNews.slice(0, itemsToShow).map((article, index) => {
                const angle = angleStep * index;
                const radius = 180;
                const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                const y = Math.sin((angle - 90) * Math.PI / 180) * radius;

                return (
                  <div
                    key={article.news_id || index}
                    className="spinner-item"
                    style={{
                      transform: `translate(${x}px, ${y}px) rotate(-${rotation}deg)`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onArticleClick(article);
                      setIsOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        onArticleClick(article);
                        setIsOpen(false);
                      }
                    }}
                    role="button" 
                    tabIndex={0}
                  >
                    <div className="spinner-item-image">
                      {article.image_url ? (
                        <img 
                          src={getImageUrl(article.image_url) || ''} 
                          alt={article.title}
                          loading="lazy"
                          width={80}
                          height={80}
                        />
                      ) : (
                        <div className="spinner-item-placeholder">📰</div>
                      )}
                    </div>
                    <div className="spinner-item-views">
                      👁 {formatNumber(article.views)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="spinner-current-article">
              {trendingNews[currentIndex] && (
                <>
                  <h4 className="spinner-current-title">
                    {trendingNews[currentIndex].title}
                  </h4>
                  <div className="spinner-current-meta">
                    {trendingNews[currentIndex].category_name} • {formatNumber(trendingNews[currentIndex].views)} views
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}