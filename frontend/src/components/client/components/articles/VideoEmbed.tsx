import React, { useEffect, useRef } from 'react';

interface ArticleMedia {
  kind: 'video' | 'post';
  video_url: string;
  platform: string;
  embed_code?: string;
  caption?: string;
  position: number;
  thumbnail_url?: string;
  author_name?: string;
  author_handle?: string;
}

interface VideoEmbedProps {
  video: ArticleMedia;
}

const loadScript = (src: string, check: () => boolean) => {
  if (check()) return;
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.charset = 'utf-8';
  document.body.appendChild(script);
};

export default function VideoEmbed({ video }: VideoEmbedProps) {
  const { platform, video_url, embed_code, caption } = video;
  const containerRef = useRef<HTMLDivElement>(null);
  const platformLower = platform?.toLowerCase() || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (platformLower.includes('twitter') || platformLower === 'x') {
      loadScript('https://platform.twitter.com/widgets.js', () => !!window.twttr);
      const timer = setTimeout(() => {
        if (window.twttr && containerRef.current) {
          window.twttr.widgets.load(containerRef.current);
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    if (platformLower.includes('tiktok')) {
      loadScript('https://www.tiktok.com/embed.js', () => false);
    }

    if (platformLower.includes('instagram') || platformLower.includes('ig')) {
      loadScript('https://www.instagram.com/embed.js', () => !!window.instgrm);
      const timer = setTimeout(() => {
        if (window.instgrm && containerRef.current) {
          window.instgrm.Embeds.process();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [platformLower]);

  if (embed_code) {
    return (
      <div 
        ref={containerRef}
        className="video-embed-custom"
        dangerouslySetInnerHTML={{ __html: embed_code }} 
      />
    );
  }

  if (platformLower.includes('youtube')) {
    const videoId = video_url.match(/[?&]v=([^&]+)/)?.[1] ||
                    video_url.match(/youtu\.be\/([^?&]+)/)?.[1] ||
                    video_url.match(/youtube\.com\/embed\/([^?&]+)/)?.[1] ||
                    video_url.match(/youtube\.com\/v\/([^?&]+)/)?.[1];
    
    if (videoId) {
      return (
        <div className="media-video-container">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
            title={caption || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
          {caption && <p className="video-caption">{caption}</p>}
        </div>
      );
    }
  }

  if (platformLower.includes('facebook') || platformLower.includes('fb')) {
    return (
      <div className="media-video-container">
        <iframe
          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video_url)}&width=500&show_text=false&appId`}
          title={caption || 'Facebook video'}
          allowFullScreen
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
        {caption && <p className="video-caption">{caption}</p>}
      </div>
    );
  }

  if (platformLower.includes('twitter') || platformLower === 'x') {
    return (
      <div className="twitter-embed-wrapper" ref={containerRef}>
        <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true">
          <a href={video_url}>View Tweet</a>
        </blockquote>
        {caption && <p className="video-caption">{caption}</p>}
      </div>
    );
  }

  if (platformLower.includes('instagram') || platformLower.includes('ig')) {
    const cleanUrl = video_url.replace(/\/$/, '');
    return (
      <div className="instagram-embed-wrapper" ref={containerRef}>
        <blockquote 
          className="instagram-media" 
          data-instgrm-permalink={`${cleanUrl}/?utm_source=ig_embed&utm_campaign=loading`}
          data-instgrm-version="14"
        >
          <a href={cleanUrl} target="_blank" rel="noopener noreferrer">View this post on Instagram</a>
        </blockquote>
        {caption && <p className="video-caption">{caption}</p>}
      </div>
    );
  }

  if (platformLower.includes('tiktok')) {
    return (
      <div className="tiktok-embed-wrapper" ref={containerRef}>
        <blockquote 
          className="tiktok-embed" 
          cite={video_url}
          data-video-id={video_url.split('/').pop()?.split('?')[0]}
        >
          <section>
            <a href={video_url} target="_blank" rel="noopener noreferrer">View TikTok</a>
          </section>
        </blockquote>
        {caption && <p className="video-caption">{caption}</p>}
      </div>
    );
  }

  if (platformLower.includes('vimeo')) {
    const videoId = video_url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) {
      return (
        <div className="media-video-container">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
            title={caption || 'Vimeo video'}
            allowFullScreen
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
          />
          {caption && <p className="video-caption">{caption}</p>}
        </div>
      );
    }
  }

  if (platformLower.includes('dailymotion')) {
    const videoId = video_url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/)?.[1];
    if (videoId) {
      return (
        <div className="media-video-container">
          <iframe
            src={`https://www.dailymotion.com/embed/video/${videoId}`}
            title={caption || 'Dailymotion video'}
            allowFullScreen
            loading="lazy"
            allow="autoplay; fullscreen"
          />
          {caption && <p className="video-caption">{caption}</p>}
        </div>
      );
    }
  }

  return (
    <div className="video-embed-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">🎥</div>
        <p className="fallback-text">Watch this video on {platform || 'external site'}</p>
        <a 
          href={video_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fallback-link"
        >
          Open Video
        </a>
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
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}