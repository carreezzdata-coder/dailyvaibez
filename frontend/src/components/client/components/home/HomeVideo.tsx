'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHomeVideo } from '@/components/client/hooks/useHomeVideo';
import { formatNumber, getImageUrl } from '@/lib/clientData';

const loadVideoScripts = (platform: string) => {
  if (typeof window === 'undefined') return;
  
  const platformLower = platform?.toLowerCase() || '';
  
  if (platformLower.includes('twitter') || platformLower === 'x') {
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }
  
  if (platformLower.includes('facebook')) {
    if (!window.FB) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0';
      script.async = true;
      document.body.appendChild(script);
    }
  }
};

const VideoEmbed = ({ video, isFeatured }: { video: any; isFeatured?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const platform = video.featured_video?.platform?.toLowerCase() || '';
  const videoUrl = video.featured_video?.post_url || '';

  useEffect(() => {
    loadVideoScripts(platform);
    
    const timer = setTimeout(() => {
      if (platform.includes('twitter') && window.twttr && containerRef.current) {
        window.twttr.widgets.load(containerRef.current);
      }
      if (platform.includes('facebook') && window.FB && containerRef.current) {
        window.FB.XFBML.parse(containerRef.current);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [platform]);

  if (platform.includes('youtube')) {
    const videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1] || 
                   videoUrl.match(/youtu\.be\/([^?&]+)/)?.[1] ||
                   videoUrl.match(/youtube\.com\/live\/([^?&]+)/)?.[1];
    
    if (videoId) {
      return (
        <div className="video-embed-container" ref={containerRef}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
            title={video.title}
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
      <div className="video-embed-container" ref={containerRef}>
        <div 
          className="fb-video" 
          data-href={videoUrl}
          data-width="100%"
          data-show-text="false"
        />
      </div>
    );
  }

  if (platform.includes('twitter') || platform === 'x') {
    return (
      <div className="video-embed-container" ref={containerRef}>
        <blockquote className="twitter-tweet" data-theme="dark">
          <a href={videoUrl}>View on X</a>
        </blockquote>
      </div>
    );
  }

  return (
    <div className="video-embed-container">
      {video.featured_video?.thumbnail_url ? (
        <img 
          src={getImageUrl(video.featured_video.thumbnail_url)} 
          alt={video.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--background-tertiary)'
        }}>
          <span style={{ fontSize: '3rem' }}>🎥</span>
        </div>
      )}
    </div>
  );
};

interface HomeVideoProps {
  onLiveVideoClick?: (videoUrl: string) => void;
}

export default function HomeVideo({ onLiveVideoClick }: HomeVideoProps) {
  const router = useRouter();
  const { videos, liveStream, loading, error } = useHomeVideo();
  const [videosEnabled, setVideosEnabled] = useState(true);
  const [showLive, setShowLive] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('videos-enabled');
    if (saved !== null) {
      setVideosEnabled(saved === 'true');
    }

    const liveEnabled = localStorage.getItem('live-video-enabled');
    if (liveEnabled !== null) {
      setShowLive(liveEnabled === 'true');
    }
  }, []);

  const toggleVideos = () => {
    const newState = !videosEnabled;
    setVideosEnabled(newState);
    localStorage.setItem('videos-enabled', String(newState));
  };

  const toggleLive = () => {
    const newState = !showLive;
    setShowLive(newState);
    localStorage.setItem('live-video-enabled', String(newState));
  };

  if (!videosEnabled) {
    return (
      <div className="video-main-section">
        <div className="video-section-header">
          <h2 className="video-header-title">
            <span className="video-title-icon">📺</span>
            Daily Vaibe TV
          </h2>
          <button className="video-toggle-btn" onClick={toggleVideos}>
            Enable Videos
          </button>
        </div>
        <div className="video-disabled-message">
          <p>Videos are disabled. Click "Enable Videos" to watch.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="video-main-section">
        <div className="video-section-header">
          <h2 className="video-header-title">
            <span className="video-title-icon">📺</span>
            Daily Vaibe TV
          </h2>
          <div className="video-header-actions">
            <button className="video-toggle-btn" onClick={toggleVideos}>
              Disable Videos
            </button>
          </div>
        </div>
        <div className="video-loading-state">
          <div className="video-loading-spinner" />
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error || (!liveStream && (!videos || videos.length === 0))) {
    return (
      <div className="video-main-section">
        <div className="video-section-header">
          <h2 className="video-header-title">
            <span className="video-title-icon">📺</span>
            Daily Vaibe TV
          </h2>
          <button className="video-toggle-btn" onClick={toggleVideos}>
            Disable Videos
          </button>
        </div>
        <div className="video-error-fallback">
          <span className="video-fallback-icon">⚠️</span>
          <p>No videos available</p>
        </div>
      </div>
    );
  }

  const youtubeVideos = videos?.filter(v => 
    v.featured_video?.platform?.toLowerCase().includes('youtube')
  ) || [];
  
  const otherVideos = videos?.filter(v => 
    !v.featured_video?.platform?.toLowerCase().includes('youtube')
  ).slice(0, 3) || [];

  return (
    <div className="video-main-section">
      <div className="video-section-header">
        <h2 className="video-header-title">
          <span className="video-title-icon">📺</span>
          Daily Vaibe TV
        </h2>
        <div className="video-header-actions">
          {liveStream && (
            <button 
              className={`video-toggle-btn ${showLive ? 'active' : ''}`}
              onClick={toggleLive}
            >
              {showLive ? '🔴 Live ON' : '⚫ Live OFF'}
            </button>
          )}
          <button className="video-toggle-btn" onClick={toggleVideos}>
            Disable Videos
          </button>
          <button className="video-viewall-button" onClick={() => router.push('/client/videos')}>
            View All →
          </button>
        </div>
      </div>

      <div className="video-desktop-layout">
        {liveStream && showLive ? (
          <div className="video-featured-desktop video-live-container">
            <div className="video-live-badge">
              <span className="live-indicator"></span>
              LIVE NOW
            </div>
            {onLiveVideoClick && (
              <button 
                className="video-floating-btn"
                onClick={() => onLiveVideoClick(liveStream.stream_url)}
                title="Open in floating player"
              >
                ⬜
              </button>
            )}
            <VideoEmbed video={{ featured_video: { platform: 'youtube', post_url: liveStream.stream_url }, title: liveStream.title }} isFeatured />
            <div className="video-info-bar">
              <h3 className="video-title-text">{liveStream.title}</h3>
              <div className="video-stats-row">
                <div className="video-stat-item">
                  <span className="video-stat-icon">👁️</span>
                  {formatNumber(liveStream.current_viewers || 0)} watching
                </div>
              </div>
            </div>
          </div>
        ) : youtubeVideos.length > 0 ? (
          <div className="video-featured-desktop">
            <VideoEmbed video={youtubeVideos[0]} isFeatured />
            <div className="video-info-bar">
              <h3 className="video-title-text">{youtubeVideos[0].title}</h3>
              <div className="video-stats-row">
                <div className="video-stat-item">
                  <span className="video-stat-icon">👁️</span>
                  {formatNumber(youtubeVideos[0].views || 0)}
                </div>
                <div className="video-stat-item">
                  <span className="video-stat-icon">❤️</span>
                  {formatNumber(youtubeVideos[0].likes_count || 0)}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="video-items-grid">
          {otherVideos.map((video, idx) => (
            <div key={video.news_id || idx} className="video-single-item">
              <div className="video-platform-badge">
                <span className="platform-icon">
                  {video.featured_video?.platform?.toLowerCase().includes('facebook') ? '👥' :
                   video.featured_video?.platform?.toLowerCase().includes('twitter') ? '🐦' : '🎬'}
                </span>
                {video.featured_video?.platform?.toUpperCase()}
              </div>
              <VideoEmbed video={video} />
              <div className="video-info-bar">
                <h3 className="video-title-text">{video.title}</h3>
                <div className="video-stats-row">
                  <div className="video-stat-item">
                    <span className="video-stat-icon">👁️</span>
                    {formatNumber(video.views || 0)}
                  </div>
                  <div className="video-stat-item">
                    <span className="video-stat-icon">❤️</span>
                    {formatNumber(video.likes_count || 0)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
    FB?: {
      XFBML: {
        parse: (element?: HTMLElement) => void;
      };
    };
  }
}