'use client';

import React, { useEffect, useRef } from 'react';
import { useMobileVideo, loadVideoScripts } from '@/components/client/hooks/useHomeVideo';
import { formatNumber, getImageUrl } from '@/lib/clientData';

const getPlatformIcon = (platform: string): string => {
  const p = platform?.toLowerCase() || '';
  if (p.includes('youtube')) return '▶️';
  if (p.includes('facebook')) return '👥';
  if (p.includes('twitter') || p === 'x') return '🐦';
  if (p.includes('instagram')) return '📷';
  if (p.includes('tiktok')) return '🎵';
  return '🎬';
};

export default function MobileVideoDisplay() {
  const { video, loading, error } = useMobileVideo();
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (video) {
      loadVideoScripts([video]);
      
      const timer = setTimeout(() => {
        if (window.twttr && videoRef.current) {
          window.twttr.widgets.load(videoRef.current);
        }
        if (window.FB && videoRef.current) {
          window.FB.XFBML.parse(videoRef.current);
        }
        if (window.instgrm && videoRef.current) {
          window.instgrm.Embeds.process();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [video]);

  const renderVideoEmbed = () => {
    if (!video) return null;

    const { featured_video } = video;
    const platform = featured_video.platform?.toLowerCase() || '';

    if (featured_video.embed_code) {
      return (
        <div 
          className="mobile-video-embed-wrapper"
          dangerouslySetInnerHTML={{ __html: featured_video.embed_code }}
        />
      );
    }

    if (platform.includes('youtube')) {
      const videoId = featured_video.post_url.match(/[?&]v=([^&]+)/)?.[1] ||
                     featured_video.post_url.match(/youtu\.be\/([^?&]+)/)?.[1];
      
      if (videoId) {
        return (
          <div className="mobile-video-embed-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=0`}
              title={featured_video.caption || video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      }
    }

    if (platform.includes('facebook')) {
      return (
        <div className="mobile-video-embed-wrapper" ref={videoRef}>
          <div 
            className="fb-video" 
            data-href={featured_video.post_url}
            data-width="100%"
            data-show-text="false"
            data-autoplay="false"
          />
        </div>
      );
    }

    if (platform.includes('twitter') || platform === 'x') {
      return (
        <div className="mobile-video-embed-wrapper" ref={videoRef}>
          <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true">
            <a href={featured_video.post_url}>View on X</a>
          </blockquote>
        </div>
      );
    }

    return (
      <div className="mobile-video-fallback-container">
        <div className="fallback-thumbnail-wrapper">
          {featured_video.thumbnail_url ? (
            <img 
              src={getImageUrl(featured_video.thumbnail_url)} 
              alt={video.title}
              className="thumbnail-image-mobile"
            />
          ) : (
            <div className="thumbnail-placeholder-mobile">
              <span className="placeholder-icon-mobile">
                {getPlatformIcon(featured_video.platform)}
              </span>
            </div>
          )}
        </div>
        <a 
          href={featured_video.post_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="play-button-mobile"
        >
          ▶ Play Video
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mobile-video-wrapper">
        <div className="mobile-video-header-section">
          <h2 className="mobile-video-header-title">
            <span className="mobile-video-header-icon">🎥</span>
            Trending Video
          </h2>
        </div>
        <div className="mobile-video-loading-wrapper">
          <div className="loading-spinner-mobile"></div>
          <p className="loading-text-mobile">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-video-wrapper">
        <div className="mobile-video-header-section">
          <h2 className="mobile-video-header-title">
            <span className="mobile-video-header-icon">🎥</span>
            Trending Video
          </h2>
        </div>
        <div className="mobile-video-error-wrapper">
          <div className="error-icon-mobile">⚠️</div>
          <p className="error-text-mobile">Could not load video</p>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="mobile-video-wrapper" ref={videoRef}>
      <div className="mobile-video-header-section">
        <h2 className="mobile-video-header-title">
          <span className="mobile-video-header-icon">🎥</span>
          Trending Video
        </h2>
      </div>
      
      <div className="mobile-video-container">
        <div className="mobile-video-badge-row">
          <span className="video-platform-badge-mobile">
            {getPlatformIcon(video.featured_video.platform)}
            {video.featured_video.platform?.toUpperCase()}
          </span>
          <span className="video-fresh-badge-mobile">🔥 HOT</span>
        </div>
        
        <h3 className="mobile-video-title-text">{video.title}</h3>
        
        {renderVideoEmbed()}
        
        <div className="mobile-video-stats-section">
          <div className="stat-item-mobile">
            <span className="stat-icon-mobile">👁</span>
            <span className="stat-value-mobile">{formatNumber(video.views)}</span>
          </div>
          <div className="stat-item-mobile">
            <span className="stat-icon-mobile">❤️</span>
            <span className="stat-value-mobile">{formatNumber(video.likes_count || 0)}</span>
          </div>
          {video.featured_video.views_count && (
            <div className="stat-item-mobile">
              <span className="stat-icon-mobile">▶️</span>
              <span className="stat-value-mobile">
                {formatNumber(video.featured_video.views_count)}
              </span>
            </div>
          )}
        </div>
        
        {video.featured_video.caption && (
          <p className="mobile-video-caption-text">{video.featured_video.caption}</p>
        )}
      </div>
    </div>
  );
}