'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatNumber, getImageUrl } from '../../../lib/clientData';
import { useArticle } from '../hooks/useArticle';
import { useUserPreferences } from '../hooks/useUserPreferences';
import Gallery from '../components/Gallery';
import Ribbon from '../components/Ribbon';
import Header from '../components/Header';
import Horizontal from '../components/Horizontal';
import Footer from '../components/Footer';
import ArticleHeader from '../components/articles/ArticleHeader';
import ArticleMeta from '../components/articles/ArticleMeta';
import ArticleContent from '../components/articles/ArticleContent';
import ArticleMedia from '../components/articles/ArticleMedia';
import ArticleSidebar from '../components/articles/ArticleSidebar';
import RelatedArticles from '../components/articles/RelatedArticles';
import Lightbox from '../components/articles/Lightbox';
import MobileMenu from '../components/articles/MobileMenu';
import StickyAd from '../components/articles/StickyAd';
import { Camera } from 'lucide-react';

interface ArticlePageClientProps {
  initialData: any;
}

export default function ArticlePageClient({ initialData }: ArticlePageClientProps) {
  const router = useRouter();
  const { trackView, trackLike } = useArticle();
  const { trackCategoryVisit, trackArticleRead } = useUserPreferences();
  const [showGallery, setShowGallery] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('white');
  const [likeCount, setLikeCount] = useState(initialData.article.likes_count);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingStartTime] = useState(Date.now());
  const [showStickyAd, setShowStickyAd] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  const { article, related_articles } = initialData;
  
  const allImages = useMemo(() => 
    [...(article.images || [])].sort((a, b) => (a.position || 0) - (b.position || 0)),
    [article.images]
  );
  
  const headerImages = useMemo(() => 
    allImages.filter(img => !img.position || img.position === 0),
    [allImages]
  );
  
  const inlineMedia = useMemo(() => 
    (article.media || []).filter((m: any) => typeof m.position === 'number' && m.position >= 1),
    [article.media]
  );
  
  const wordCount = article.content ? article.content.split(/\s+/).length : 0;
  const estimatedReadTime = article.reading_time || Math.ceil(wordCount / 200);

  const headerImageLocalIndex = headerImages.findIndex(
    img => img.image_url === allImages[currentImageIndex]?.image_url
  );
  const activeHeaderIndex = headerImageLocalIndex >= 0 ? headerImageLocalIndex : 0;

  const sidebarArticleIds = useMemo(() => 
    related_articles.slice(0, 50).map((a: any) => a.news_id),
    [related_articles]
  );

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      const url = window.location.href;
      const shareText = `${article.title}\n\nRead more at: ${url}`;
      
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', shareText);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.article-content-wrapper')) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          e.preventDefault();
          const url = window.location.href;
          const shareText = `${article.title}\n\nRead more at: ${url}`;
          navigator.clipboard.writeText(shareText);
        }
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [article.title]);

  useEffect(() => {
    if (article?.category_slug) {
      trackCategoryVisit(article.category_slug);
    }
    
    return () => {
      if (article?.category_slug && article?.slug) {
        const timeSpent = Math.floor((Date.now() - readingStartTime) / 1000);
        trackArticleRead(article.category_slug, article.slug, timeSpent);
      }
    };
  }, [article?.category_slug, article?.slug, trackCategoryVisit, trackArticleRead, readingStartTime]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolled = (currentScrollY / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(scrolled, 100));
      setShowStickyAd(currentScrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setButtonsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('vybes-theme') || 'white';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    if (article?.slug && !hasTrackedView) {
      const timer = setTimeout(() => {
        trackView(article.slug);
        setHasTrackedView(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [article?.slug, hasTrackedView, trackView]);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vybes-theme', theme);
    }
  };

  const handleRelatedClick = (relatedArticle: any) => {
    setShowMobileSidebar(false);
    router.push(`/client/articles/${relatedArticle.slug}`);
  };

  const handleLikeClick = async () => {
    setLikeCount((prev: number) => prev + 1);
    await trackLike(article.slug);
  };

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = article.title;

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handleLightboxIndexChange = (newIndex: number) => {
    setCurrentImageIndex(newIndex);
  };

  if (showGallery) {
    return <Gallery allNews={related_articles} onArticleClick={handleRelatedClick} />;
  }

  return (
    <>
      <Lightbox 
        isOpen={lightboxOpen}
        images={allImages}
        currentIndex={currentImageIndex}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={handleLightboxIndexChange}
      />
      
      {showMobileSidebar && (
        <div 
          className="art-rec-overlay" 
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      
      <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
      
      <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      <Horizontal activeCategory={article.category_slug} />

      <main className="main-container">
        <div className="article-page-layout">
          <div className="article-main-column">
            <article className="article-content-wrapper">
              <ArticleHeader 
                title={article.title}
                categoryName={article.category_name}
                categoryColor={article.category_color}
              />

              <ArticleMeta
                excerpt={article.excerpt}
                author={{
                  first_name: article.first_name,
                  last_name: article.last_name,
                  author_id: article.author_id
                }}
                publishedAt={article.published_at}
                views={article.views}
                likes={likeCount}
                readingTime={estimatedReadTime}
                onLike={handleLikeClick}
                onShare={handleShare}
              />

              {headerImages.length > 0 && (
                <ArticleMedia
                  images={headerImages}
                  allImages={allImages}
                  activeIndex={activeHeaderIndex}
                  onImageClick={handleImageClick}
                  onThumbnailClick={setCurrentImageIndex}
                />
              )}

              <ArticleContent
                content={article.content}
                allImages={allImages}
                media={inlineMedia}
                onImageClick={handleImageClick}
                relatedArticles={related_articles}
                onArticleClick={handleRelatedClick}
              />

              {article.tags && typeof article.tags === 'string' && article.tags.trim() && (
                <div className="article-tags-section">
                  <div className="article-tags">
                    <span className="tags-label">Tags:</span>
                    {article.tags.split(',').map((tag: string, idx: number) => (
                      <span key={idx} className="tag-pill">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="article-social-share full">
                <span className="share-label">Share this story:</span>
                <button className="share-btn facebook" onClick={() => handleShare('facebook')}>Facebook</button>
                <button className="share-btn twitter" onClick={() => handleShare('twitter')}>Twitter</button>
                <button className="share-btn whatsapp" onClick={() => handleShare('whatsapp')}>WhatsApp</button>
                <button className="share-btn linkedin" onClick={() => handleShare('linkedin')}>LinkedIn</button>
              </div>
            </article>

            <RelatedArticles
              articles={related_articles}
              categoryName={article.category_name}
              onArticleClick={handleRelatedClick}
              excludeIds={sidebarArticleIds}
            />
          </div>

          <ArticleSidebar
            relatedArticles={related_articles}
            onArticleClick={handleRelatedClick}
          />
          
          <div className={`art-rec-mobile-wrapper ${showMobileSidebar ? 'active' : ''}`}>
            <ArticleSidebar
              relatedArticles={related_articles}
              onArticleClick={handleRelatedClick}
            />
          </div>
        </div>
      </main>

      <button 
        className={`sidebar-hamburger mobile-only ${buttonsVisible ? 'visible' : ''}`}
        onClick={() => setShowMobileSidebar(true)}
        aria-label="Show recommended articles"
      >
        💡
      </button>

      {showStickyAd && <StickyAd />}

      <Ribbon 
        news={related_articles.slice(0, 12)} 
        onArticleClick={handleRelatedClick}
        title="You May Also Like"
      />

      <button 
        className={`stories-btn ${buttonsVisible ? 'visible' : ''}`}
        onClick={() => setShowGallery(true)} 
        title="View Gallery" 
        aria-label="View gallery"
      >
        <Camera size={28} strokeWidth={2.5} />
      </button>

      <Footer />
    </>
  );
}