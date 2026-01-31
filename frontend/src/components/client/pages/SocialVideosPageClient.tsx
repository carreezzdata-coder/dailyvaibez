'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocialVideo } from '@/components/client/hooks/useSocialVideo';
import { 
  formatDate, 
  formatNumber, 
  getImageUrl,
} from '@/lib/clientData';
const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('youtube')) return '▶️';
  if (p.includes('facebook')) return '📘';
  if (p.includes('instagram')) return '📷';
  if (p.includes('twitter') || p.includes('x')) return '🦅';
  if (p.includes('tiktok')) return '🎵';
  if (p.includes('twitch')) return '👾';
  if (p.includes('vimeo')) return '🎬';
  if (p.includes('dailymotion')) return '📹';
  return '📺';
};

const getPlatformColor = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('youtube')) return '#FF0000';
  if (p.includes('facebook')) return '#1877F2';
  if (p.includes('instagram')) return '#E4405F';
  if (p.includes('twitter') || p.includes('x')) return '#1DA1F2';
  if (p.includes('tiktok')) return '#000000';
  if (p.includes('twitch')) return '#9146FF';
  if (p.includes('vimeo')) return '#1AB7EA';
  if (p.includes('dailymotion')) return '#00D2FF';
  return '#666666';
};

const getPlatformName = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('youtube')) return 'YouTube';
  if (p.includes('facebook')) return 'Facebook';
  if (p.includes('instagram')) return 'Instagram';
  if (p.includes('twitter') || p.includes('x')) return 'Twitter/X';
  if (p.includes('tiktok')) return 'TikTok';
  if (p.includes('twitch')) return 'Twitch';
  if (p.includes('vimeo')) return 'Vimeo';
  if (p.includes('dailymotion')) return 'Dailymotion';
  return platform;
};

const extractVideoId = (platform: string, url: string) => {
  if (!url) return null;
  const p = platform.toLowerCase();
  
  if (p.includes('youtube')) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  }
  
  if (p.includes('vimeo')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }
  
  if (p.includes('dailymotion')) {
    const match = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
  
  return null;
};

const formatDuration = (seconds: number) => {
  if (!seconds) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const isLiveVideo = (platform: string, postType?: string) => {
  return platform.toLowerCase().includes('live') || postType?.toLowerCase().includes('live');
};

const isShortVideo = (platform: string, postType?: string) => {
  const p = platform.toLowerCase();
  const t = postType?.toLowerCase() || '';
  return p.includes('shorts') || t.includes('short') || t.includes('reel') || p.includes('tiktok');
};
import type { VideoArticle, VideoPlatformCount } from '@/lib/clientData';
import Header from '../components/Header';
import Horizontal from '../components/Horizontal';
import Footer from '../components/Footer';

interface SocialVideosPageClientProps {
  initialData?: {
    articles: VideoArticle[];
    total_videos: number;
  };
  initialPlatforms: VideoPlatformCount[];
  selectedPlatform: string;
  initialPage: number;
}

export default function SocialVideosPageClient({ 
  initialData, 
  initialPlatforms,
  selectedPlatform: initialSelectedPlatform,
  initialPage 
}: SocialVideosPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentTheme, setCurrentTheme] = useState('white');
  const [selectedPlatform, setSelectedPlatform] = useState(initialSelectedPlatform);
  
  const { 
    articles, 
    loading, 
    error, 
    loadMore, 
    hasMore,
    videosEnabled,
    toggleVideos,
    refresh,
    totalVideos
  } = useSocialVideo(12, selectedPlatform);

  const totalPlatformVideos = initialPlatforms.reduce((sum, platform) => sum + platform.video_count, 0);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vybes-theme', theme);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('vybes-theme') || 'white';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (platform === 'all') {
      newSearchParams.delete('platform');
    } else {
      newSearchParams.set('platform', platform);
    }
    newSearchParams.delete('page');
    
    const queryString = newSearchParams.toString();
    router.push(`/client/videos${queryString ? `?${queryString}` : ''}`);
  };

  const handleArticleClick = (article: VideoArticle) => {
    router.push(`/client/articles/${article.slug}`);
  };

  const renderVideoPreview = (article: VideoArticle) => {
    const video = article.featured_video;
    const platformLower = video.platform.toLowerCase();
    const videoId = extractVideoId(video.platform, video.post_url);

    if (video.embed_code) {
      return (
        <div 
          className="video-embed-preview"
          dangerouslySetInnerHTML={{ __html: video.embed_code }}
        />
      );
    }

    if (platformLower.includes('youtube') && videoId) {
      return (
        <div className="video-embed-preview youtube">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
            title={video.caption || article.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }

    if (platformLower.includes('vimeo') && videoId) {
      return (
        <div className="video-embed-preview vimeo">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
            title={video.caption || article.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }

    if (platformLower.includes('dailymotion') && videoId) {
      return (
        <div className="video-embed-preview dailymotion">
          <iframe
            src={`https://www.dailymotion.com/embed/video/${videoId}`}
            title={video.caption || article.title}
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }

    return (
      <div className="video-thumbnail-wrapper">
        {video.thumbnail_url ? (
          <img 
            src={getImageUrl(video.thumbnail_url)} 
            alt={video.caption || article.title}
            className="video-thumbnail"
            loading="lazy"
          />
        ) : article.image_url ? (
          <img 
            src={getImageUrl(article.image_url)} 
            alt={article.title}
            className="video-thumbnail"
            loading="lazy"
          />
        ) : (
          <div className="video-thumbnail-placeholder" style={{ background: article.category.color }}>
            <span className="placeholder-icon">{getPlatformIcon(video.platform)}</span>
          </div>
        )}
        <div className="video-play-overlay">
          <div className="play-button">▶</div>
        </div>
      </div>
    );
  };

  return (
    <div className="social-videos-page">
      <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      <Horizontal activeCategory="videos" />

      <div className="videos-hero">
        <div className="videos-hero-content">
          <h1 className="videos-title">🎥 Social Videos</h1>
          <p className="videos-subtitle">
            Watch the latest videos from across social media platforms
            {totalVideos > 0 && <span className="videos-count"> • {formatNumber(totalVideos)} videos</span>}
          </p>
          
          <div className="videos-controls">
            <button 
              className={`videos-toggle-btn ${videosEnabled ? 'enabled' : 'disabled'}`}
              onClick={toggleVideos}
            >
              {videosEnabled ? '🎥 Videos Enabled' : '🚫 Videos Disabled'}
            </button>
            {videosEnabled && (
              <button className="videos-refresh-btn" onClick={refresh}>
                🔄 Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {videosEnabled && (
        <div className="platform-filter-container">
          <div className="platform-filter-scroll">
            <button
              className={`platform-filter-btn ${selectedPlatform === 'all' ? 'active' : ''}`}
              onClick={() => handlePlatformChange('all')}
            >
              <span className="filter-icon">📺</span>
              <span>All Videos</span>
              <span className="filter-count">{formatNumber(totalPlatformVideos)}</span>
            </button>
            
            {initialPlatforms.map(platform => (
              <button
                key={platform.platform_group}
                className={`platform-filter-btn ${selectedPlatform === platform.platform_group ? 'active' : ''}`}
                onClick={() => handlePlatformChange(platform.platform_group)}
                style={{
                  '--platform-color': getPlatformColor(platform.platform_group)
                } as React.CSSProperties}
              >
                <span className="filter-icon">{getPlatformIcon(platform.platform_group)}</span>
                <span>{getPlatformName(platform.platform_group)}</span>
                <span className="filter-count">{formatNumber(platform.video_count)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="videos-main-container">
        {!videosEnabled ? (
          <div className="videos-disabled-message">
            <div className="disabled-icon">🚫</div>
            <h3>Videos are Disabled</h3>
            <p>Enable videos to start watching content from social media platforms.</p>
            <button onClick={toggleVideos} className="enable-videos-btn">
              Enable Videos
            </button>
          </div>
        ) : loading && articles.length === 0 ? (
          <div className="videos-loading">
            <div className="loading-spinner"></div>
            <p>Loading videos...</p>
          </div>
        ) : error ? (
          <div className="videos-error">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Videos</h3>
            <p>{error}</p>
            <button onClick={refresh} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="videos-grid">
              {articles.map(article => {
                const isLive = isLiveVideo(article.featured_video.platform, article.featured_video.post_type);
                const isShort = isShortVideo(article.featured_video.platform, article.featured_video.post_type);
                
                return (
                  <div 
                    key={article.news_id} 
                    className="video-article-card"
                    onClick={() => handleArticleClick(article)}
                    role="button" 
                    tabIndex={0}
                  >
                    <div className="video-card-header">
                      <span 
                        className="video-platform-badge"
                        style={{ background: getPlatformColor(article.featured_video.platform) }}
                      >
                        {getPlatformIcon(article.featured_video.platform)}
                        {getPlatformName(article.featured_video.platform)}
                      </span>
                      
                      {isLive && <span className="live-badge">🔴 LIVE</span>}
                      {isShort && <span className="short-badge">⚡ Short</span>}
                      
                      {article.video_count > 1 && (
                        <span className="video-count-badge">
                          +{article.video_count - 1}
                        </span>
                      )}
                    </div>

                    <div className="video-preview-container">
                      {renderVideoPreview(article)}
                      {article.featured_video.duration && article.featured_video.duration > 0 && (
                        <span className="video-duration">
                          {formatDuration(article.featured_video.duration)}
                        </span>
                      )}
                    </div>

                    <div className="video-card-body">
                      <div className="video-category-tag" style={{ background: article.category.color }}>
                        <span>{article.category.icon}</span>
                        <span>{article.category.name}</span>
                      </div>

                      <h3 className="video-card-title">{article.title}</h3>
                      
                      {article.excerpt && (
                        <p className="video-card-excerpt">{article.excerpt}</p>
                      )}

                      {article.featured_video.caption && 
                       article.featured_video.caption !== article.excerpt && (
                        <div className="video-caption">
                          <span className="caption-icon">💬</span>
                          <p>{article.featured_video.caption}</p>
                        </div>
                      )}
                      
                      <div className="video-card-meta">
                        <div className="video-author">
                          <span className="author-name">{article.author.full_name}</span>
                          <span className="video-date">📅 {formatDate(article.published_at)}</span>
                        </div>
                        
                        <div className="video-stats">
                          <span className="stat-item" title="Article Views">
                            👁 {formatNumber(article.views)}
                          </span>
                          <span className="stat-item" title="Likes">
                            ❤️ {formatNumber(article.likes_count)}
                          </span>
                          {article.featured_video.views_count > 0 && (
                            <span className="stat-item" title="Video Views">
                              ▶️ {formatNumber(article.featured_video.views_count)}
                            </span>
                          )}
                        </div>
                      </div>

                      {article.featured_video.author_name && (
                        <div className="original-creator">
                          <span className="creator-label">Original:</span>
                          <span className="creator-name">
                            {article.featured_video.author_handle 
                              ? `@${article.featured_video.author_handle}` 
                              : article.featured_video.author_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="videos-load-more">
                <button 
                  onClick={loadMore}
                  disabled={loading}
                  className="load-more-btn"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Loading...
                    </>
                  ) : (
                    'Load More Videos'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="videos-empty">
            <div className="empty-icon">🎥</div>
            <h3>No videos found</h3>
            <p>
              {selectedPlatform === 'all' 
                ? 'There are currently no videos available.' 
                : `No videos found for ${getPlatformName(selectedPlatform)}.`}
            </p>
            {selectedPlatform !== 'all' && (
              <button 
                onClick={() => handlePlatformChange('all')}
                className="empty-action-btn"
              >
                View All Videos
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}