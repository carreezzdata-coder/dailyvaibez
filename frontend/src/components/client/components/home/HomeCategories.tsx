import React, { useState, memo, useCallback, useEffect, useMemo } from 'react';

interface Article {
  news_id: string | number;
  title: string;
  excerpt?: string;
  image_url?: string;
  category_icon?: string;
  first_name?: string;
  last_name?: string;
  published_at: string;
  views: number;
  likes_count: number;
}

interface Section {
  slug: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  order_index: number;
  articles: Article[];
  priority?: 'high' | 'medium' | 'low';
  score?: number;
}

interface UserPreferences {
  preferredCategories?: string[];
  categoryVisits?: Record<string, number>;
}

interface ArticleCardProps {
  article: Article;
  size: 'large' | 'medium' | 'small' | 'thumbnail';
  onClick: () => void;
}

interface CategoryBlockProps {
  section: Section;
  onArticleClick: (article: Article) => void;
  priority: 'high' | 'medium' | 'low';
}

interface HomeCategoriesProps {
  sections: Section[];
  onArticleClick: (article: Article) => void;
  userPreferences?: UserPreferences;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const getImageUrl = (url?: string): string => url || '/placeholder.jpg';

const ArticleCard = memo<ArticleCardProps>(({ article, size, onClick }) => {
  const authorName = article.first_name 
    ? `${article.first_name} ${article.last_name || ''}`.trim() 
    : '';

  return (
    <div 
      className={`article-card-wrapper article-card-${size}`} 
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="article-card-image">
        {article.image_url ? (
          <img 
            src={getImageUrl(article.image_url)} 
            alt={article.title} 
            loading="lazy"
            className="article-image"
          />
        ) : (
          <div className="article-placeholder">
            {article.category_icon || '📰'}
          </div>
        )}
        <div className="article-card-gradient"></div>
        <div className="article-card-text">
          <h3 className="article-card-heading">{article.title}</h3>
          {(size === 'large' || size === 'medium') && article.excerpt && (
            <p className="article-card-excerpt">{article.excerpt}</p>
          )}
          <div className="article-card-meta">
            {size !== 'thumbnail' && authorName && (
              <span className="meta-item">✍️ {authorName}</span>
            )}
            <span className="meta-item">📅 {formatDate(article.published_at)}</span>
            <span className="meta-item">👁️ {formatNumber(article.views)}</span>
            {size === 'large' && (
              <span className="meta-item">❤️ {formatNumber(article.likes_count)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ArticleCard.displayName = 'ArticleCard';

const CategoryBlock = memo<CategoryBlockProps>(({ section, onArticleClick, priority }) => {
  const handleViewAll = useCallback(() => {
    window.location.href = `/client/categories/${section.slug}`;
  }, [section.slug]);

  const sortedArticles = useMemo(() => {
    return [...section.articles].sort((a, b) => b.views - a.views);
  }, [section.articles]);

  const articlesCount = priority === 'high' ? 12 : priority === 'medium' ? 8 : 6;
  const displayArticles = sortedArticles.slice(0, articlesCount);

  const getLayout = () => {
    if (priority === 'high') {
      return {
        large: displayArticles.slice(0, 1),
        medium: displayArticles.slice(1, 4),
        small: displayArticles.slice(4, 8),
        thumbnails: displayArticles.slice(8, 12)
      };
    }
    
    if (priority === 'medium') {
      return {
        large: [],
        medium: displayArticles.slice(0, 2),
        small: displayArticles.slice(2, 5),
        thumbnails: displayArticles.slice(5, 8)
      };
    }
    
    return {
      large: [],
      medium: [],
      small: displayArticles.slice(0, 3),
      thumbnails: displayArticles.slice(3, 6)
    };
  };

  const layout = getLayout();

  return (
    <section className="category-block" data-priority={priority}>
      <div className="category-block-header">
        <div className="category-block-title">
          <span className="category-title-icon" style={{ color: section.color }}>
            {section.icon}
          </span>
          <div>
            <h2 style={{ color: section.color }}>{section.name}</h2>
            {section.description && (
              <p className="category-description">{section.description}</p>
            )}
          </div>
        </div>
        <button 
          className="category-viewall-button" 
          onClick={handleViewAll}
          aria-label={`View all ${section.name} articles`}
          title={`View all ${section.name}`}
        />
      </div>

      <div className="category-articles-grid">
        {layout.large.map((article) => (
          <ArticleCard
            key={`large-${article.news_id}`}
            article={article}
            size="large"
            onClick={() => onArticleClick(article)}
          />
        ))}
        {layout.medium.map((article) => (
          <ArticleCard
            key={`medium-${article.news_id}`}
            article={article}
            size="medium"
            onClick={() => onArticleClick(article)}
          />
        ))}
        {layout.small.map((article) => (
          <ArticleCard
            key={`small-${article.news_id}`}
            article={article}
            size="small"
            onClick={() => onArticleClick(article)}
          />
        ))}
        {layout.thumbnails.map((article) => (
          <ArticleCard
            key={`thumb-${article.news_id}`}
            article={article}
            size="thumbnail"
            onClick={() => onArticleClick(article)}
          />
        ))}
      </div>
    </section>
  );
});

CategoryBlock.displayName = 'CategoryBlock';

export default function HomeCategories({ sections, onArticleClick, userPreferences }: HomeCategoriesProps) {
  const [orderedSections, setOrderedSections] = useState<Section[]>(sections || []);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      setOrderedSections([]);
      return;
    }

    if (!isMounted) {
      setOrderedSections(sections);
      return;
    }

    let cookiePreferences: UserPreferences | null = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vt_user_behavior');
        if (stored) {
          cookiePreferences = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }

    const preferences = userPreferences || cookiePreferences;
    const preferredCategories = preferences?.preferredCategories || [];
    const categoryVisits = preferences?.categoryVisits || {};

    const sectionsWithPriority = sections.map(section => {
      const prefIndex = preferredCategories.indexOf(section.slug);
      const visits = categoryVisits[section.slug] || 0;
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      let score = section.order_index * 100;

      if (prefIndex === 0) {
        priority = 'high';
        score = -1000;
      } else if (prefIndex > 0 && prefIndex < 3) {
        priority = 'medium';
        score = -500 + (prefIndex * 100);
      } else if (visits > 10) {
        priority = 'medium';
        score = -300;
      } else if (visits > 5) {
        priority = 'low';
        score = -100;
      }

      return { ...section, priority, score };
    });

    sectionsWithPriority.sort((a, b) => a.score - b.score);
    setOrderedSections(sectionsWithPriority);
  }, [sections, userPreferences, isMounted]);

  if (!orderedSections || orderedSections.length === 0) {
    return (
      <div className="categories-wrapper">
        <div className="categories-empty">
          <p>📰 Loading category sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-wrapper">
      {orderedSections.map((section) => {
        if (!section.articles || section.articles.length === 0) return null;
        
        return (
          <CategoryBlock
            key={section.slug}
            section={section}
            onArticleClick={onArticleClick}
            priority={section.priority || 'low'}
          />
        );
      })}
    </div>
  );
}