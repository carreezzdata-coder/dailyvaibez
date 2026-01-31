'use client';

import { useState, useEffect } from 'react';

interface FeaturedVideo {
  platform: string;
  post_url: string;
  embed_code?: string;
  thumbnail_url?: string;
  caption?: string;
  views_count?: number;
}

interface VideoArticle {
  news_id: number;
  title: string;
  slug: string;
  views: number;
  likes_count: number;
  featured_video: FeaturedVideo;
}

interface LiveStream {
  stream_id: number;
  title: string;
  stream_url: string;
  is_active: boolean;
  current_viewers?: number;
  started_at: string;
}

interface UseHomeVideoReturn {
  videos: VideoArticle[];
  liveStream: LiveStream | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function loadVideoScripts(videos: VideoArticle[]): void {
  if (typeof window === 'undefined') return;

  const platforms = new Set(videos.map(v => v.featured_video?.platform?.toLowerCase()));

  if (platforms.has('twitter') || platforms.has('x')) {
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  if (platforms.has('facebook')) {
    if (!window.FB) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  if (platforms.has('instagram')) {
    if (!window.instgrm) {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }
}

export function useHomeVideo(): UseHomeVideoReturn {
  const [videos, setVideos] = useState<VideoArticle[]>([]);
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [videosRes, liveRes] = await Promise.all([
        fetch('/api/client/videos?featured=true&limit=4&_t=' + Date.now(), {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        }),
        fetch('/api/client/live-stream?_t=' + Date.now(), {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        })
      ]);

      if (videosRes.ok) {
        const videosData = await videosRes.json();
        if (videosData.success && Array.isArray(videosData.videos)) {
          setVideos(videosData.videos);
          loadVideoScripts(videosData.videos);
        }
      }

      if (liveRes.ok) {
        const liveData = await liveRes.json();
        if (liveData.success && liveData.stream && liveData.stream.is_active) {
          setLiveStream(liveData.stream);
        }
      }

    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchVideos();
  };

  useEffect(() => {
    fetchVideos();

    const interval = setInterval(() => {
      if (liveStream) {
        refresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    videos,
    liveStream,
    loading,
    error,
    refresh,
  };
}

export function useMobileVideo() {
  const [video, setVideo] = useState<VideoArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/client/videos?featured=true&limit=1&_t=' + Date.now(), {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.videos && data.videos.length > 0) {
            setVideo(data.videos[0]);
            if (data.videos[0]) {
              loadVideoScripts([data.videos[0]]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching mobile video:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, []);

  return { video, loading, error };
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
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}