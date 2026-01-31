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

interface SocialPostEmbedProps {
  post: ArticleMedia;
}

const loadScript = (src: string, check: () => boolean) => {
  if (check()) return;
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.charset = 'utf-8';
  document.body.appendChild(script);
};

export default function SocialPostEmbed({ post }: SocialPostEmbedProps) {
  const { platform, video_url, embed_code, author_name, author_handle, caption } = post;
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

    if (platformLower.includes('instagram') || platformLower.includes('ig')) {
      loadScript('https://www.instagram.com/embed.js', () => !!window.instgrm);
      const timer = setTimeout(() => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    if (platformLower.includes('linkedin')) {
      loadScript('https://platform.linkedin.com/in.js', () => false);
    }
  }, [platformLower]);

  if (embed_code) {
    return (
      <div 
        ref={containerRef}
        className="social-post-embed-custom"
        dangerouslySetInnerHTML={{ __html: embed_code }} 
      />
    );
  }

  if (platformLower.includes('facebook') || platformLower.includes('fb')) {
    return (
      <div className="fb-post-wrapper">
        <iframe
          src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(video_url)}&width=500&show_text=true&appId`}
          title={caption || 'Facebook post'}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
        {caption && <p className="social-caption">{caption}</p>}
      </div>
    );
  }

  if (platformLower.includes('twitter') || platformLower === 'x') {
    return (
      <div className="twitter-post-wrapper" ref={containerRef}>
        <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true">
          <a href={video_url}>View Tweet</a>
        </blockquote>
        {caption && <p className="social-caption">{caption}</p>}
      </div>
    );
  }

  if (platformLower.includes('instagram') || platformLower.includes('ig')) {
    const cleanUrl = video_url.replace(/\/$/, '');
    return (
      <div className="instagram-post-wrapper" ref={containerRef}>
        <blockquote 
          className="instagram-media" 
          data-instgrm-permalink={`${cleanUrl}/?utm_source=ig_embed&utm_campaign=loading`}
          data-instgrm-version="14"
        >
          <a href={cleanUrl} target="_blank" rel="noopener noreferrer">View this post on Instagram</a>
        </blockquote>
        {caption && <p className="social-caption">{caption}</p>}
      </div>
    );
  }

  if (platformLower.includes('linkedin')) {
    return (
      <div className="linkedin-post-wrapper" ref={containerRef}>
        <iframe
          src={`https://www.linkedin.com/embed/feed/update/${video_url.split('/').pop()}`}
          title={caption || 'LinkedIn post'}
          loading="lazy"
          allowFullScreen
        />
        {caption && <p className="social-caption">{caption}</p>}
      </div>
    );
  }

  if (platformLower.includes('threads')) {
    return (
      <div className="threads-post-wrapper">
        <blockquote className="threads-post">
          <a href={video_url} target="_blank" rel="noopener noreferrer">
            View post on Threads
          </a>
          {author_name && <p className="author">By {author_name}</p>}
          {caption && <p className="caption">{caption}</p>}
        </blockquote>
      </div>
    );
  }

  return (
    <div className="social-post-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">💬</div>
        <p className="fallback-text">View this post on {platform}</p>
        <a 
          href={video_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fallback-link"
        >
          Open Post
        </a>
        {author_name && (
          <p className="fallback-author">
            By {author_name} {author_handle && `(@${author_handle})`}
          </p>
        )}
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