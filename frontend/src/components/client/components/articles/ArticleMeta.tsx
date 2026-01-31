'use client';

import React from 'react';
import { formatDate, formatNumber } from '../../../../lib/clientData';
import { Clock, Eye, Heart, Calendar, User, Share2 } from 'lucide-react';

interface ArticleMetaProps {
  excerpt?: string;
  author: {
    first_name: string;
    last_name: string;
    author_id: number;
  };
  publishedAt: string;
  views: number;
  likes: number;
  readingTime: number;
  onLike: () => void;
  onShare: (platform: string) => void;
}

export default function ArticleMeta({
  excerpt,
  author,
  publishedAt,
  views,
  likes,
  readingTime,
  onLike,
  onShare
}: ArticleMetaProps) {
  const processExcerpt = (text: string) => {
    if (!text) return null;

    const html = text
      .replace(/\[HIGHLIGHT\]([\s\S]*?)\[\/HIGHLIGHT\]/g, '<span class="excerpt-highlight">$1</span>')
      .replace(/\[BOLD\]([\s\S]*?)\[\/BOLD\]/g, '<strong class="excerpt-bold">$1</strong>')
      .replace(/\[ITALIC\]([\s\S]*?)\[\/ITALIC\]/g, '<em class="excerpt-italic">$1</em>')
      .replace(/\n/g, '<br />');

    return <div className="article-excerpt-box" itemProp="description" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="article-meta-section">
      {excerpt && processExcerpt(excerpt)}
      
      <div className="article-meta-bar">
        <div className="meta-author" itemProp="author" itemScope itemType="https://schema.org/Person">
          <div className="author-avatar">
            <User size={18} />
          </div>
          <div className="author-info">
            <span className="author-name" itemProp="name">
              {author.first_name} {author.last_name}
            </span>
            <div className="author-date">
              <Calendar size={11} />
              <time itemProp="datePublished" dateTime={publishedAt}>
                {formatDate(publishedAt)}
              </time>
            </div>
          </div>
        </div>
        
        <div className="meta-stats">
          <span className="stat-item">
            <Eye size={14} />
            {formatNumber(views)}
          </span>
          <button onClick={onLike} className="stat-item like-btn" aria-label="Like article">
            <Heart size={14} />
            {formatNumber(likes)}
          </button>
          <span className="stat-item">
            <Clock size={14} />
            {readingTime} min
          </span>
        </div>
      </div>

      <div className="article-social-share compact">
        <button className="share-btn facebook" onClick={() => onShare('facebook')} aria-label="Share on Facebook">
          <span>📘</span>
        </button>
        <button className="share-btn twitter" onClick={() => onShare('twitter')} aria-label="Share on Twitter">
          <span>🐦</span>
        </button>
        <button className="share-btn whatsapp" onClick={() => onShare('whatsapp')} aria-label="Share on WhatsApp">
          <span>💬</span>
        </button>
        <button className="share-btn linkedin" onClick={() => onShare('linkedin')} aria-label="Share on LinkedIn">
          <span>💼</span>
        </button>
      </div>
    </div>
  );
}