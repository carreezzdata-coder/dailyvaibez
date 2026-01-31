'use client';

import { useState, useEffect } from 'react';

export interface SocialVideo {
  id: string;
  type: 'youtube' | 'tiktok' | 'vaiba';
  url: string;
  thumbnail: string;
  title: string;
  views?: number;
  likes?: number;
}

export function useSocial() {
  const [videos, setVideos] = useState<SocialVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    videos,
    isLoading,
  };
}