'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCookieConfig } from '../cookies/useCookieConfig';

export interface Advert {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  link?: string;
  position: 'top' | 'bottom' | 'sidebar' | 'inline';
  priority: number;
  targetAudience?: string[];
  startDate?: string;
  endDate?: string;
  clickCount: number;
  impressionCount: number;
  active: boolean;
}

export interface AdvertResponse {
  success: boolean;
  topAds: Advert[];
  bottomAds: Advert[];
  sidebarAds: Advert[];
  inlineAds: Advert[];
  totalAds: number;
  message?: string;
}

export interface UseAdvertsReturn {
  topAds: Advert[];
  bottomAds: Advert[];
  sidebarAds: Advert[];
  inlineAds: Advert[];
  allAds: Advert[];
  isLoading: boolean;
  error: string | null;
  canShowAds: boolean;
  refreshAds: () => Promise<void>;
  trackImpression: (adId: string) => Promise<void>;
  trackClick: (adId: string) => Promise<void>;
}

export function useAdverts(): UseAdvertsReturn {
  const {
    deviceId,
    geoLocation,
    userBehavior,
    preferences,
    hasConsent,
  } = useCookieConfig();

  const [topAds, setTopAds] = useState<Advert[]>([]);
  const [bottomAds, setBottomAds] = useState<Advert[]>([]);
  const [sidebarAds, setSidebarAds] = useState<Advert[]>([]);
  const [inlineAds, setInlineAds] = useState<Advert[]>([]);
  const [allAds, setAllAds] = useState<Advert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const impressionTrackedRef = useRef<Set<string>>(new Set());

  const canShowAds = hasConsent && preferences.marketing;

  const getSessionData = useCallback(() => {
    if (typeof window === 'undefined') {
      return {
        deviceId: 'server-side',
        deviceType: 'desktop',
        language: 'en',
        location: 'KE',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      deviceId: deviceId || 'unknown',
      userPreferences: preferences.personalization ? userBehavior.preferredCategories : [],
      location: geoLocation.county || 'KE',
      county: geoLocation.county,
      town: geoLocation.town,
      category: geoLocation.category,
      deviceType: getDeviceType(),
      language: navigator.language || 'en',
      timestamp: new Date().toISOString(),
      canPersonalize: preferences.personalization,
      canTrack: preferences.analytics,
    };
  }, [deviceId, geoLocation, userBehavior, preferences]);

  const getDeviceType = () => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const fetchAds = useCallback(async () => {
    if (!canShowAds) {
      setTopAds([]);
      setBottomAds([]);
      setSidebarAds([]);
      setInlineAds([]);
      setAllAds([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const sessionData = getSessionData();
      
      const response = await fetch('/api/adverts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionData,
          requestedPositions: ['top', 'bottom', 'sidebar', 'inline'],
          limit: {
            top: 12,
            bottom: 10,
            sidebar: 5,
            inline: 8,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ads: ${response.statusText}`);
      }

      const data: AdvertResponse = await response.json();

      if (data.success) {
        const filterAndSort = (ads: Advert[]) => 
          ads
            .filter(ad => ad.active && isAdValid(ad))
            .sort((a, b) => b.priority - a.priority);

        setTopAds(filterAndSort(data.topAds || []));
        setBottomAds(filterAndSort(data.bottomAds || []));
        setSidebarAds(filterAndSort(data.sidebarAds || []));
        setInlineAds(filterAndSort(data.inlineAds || []));
        
        const all = [
          ...(data.topAds || []),
          ...(data.bottomAds || []),
          ...(data.sidebarAds || []),
          ...(data.inlineAds || []),
        ];
        setAllAds(filterAndSort(all));
      } else {
        setError(data.message || 'Failed to load advertisements');
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError(err instanceof Error ? err.message : 'Failed to load advertisements');
      
      setTopAds([]);
      setBottomAds([]);
      setSidebarAds([]);
      setInlineAds([]);
      setAllAds([]);
    } finally {
      setIsLoading(false);
    }
  }, [canShowAds, getSessionData]);

  const isAdValid = (ad: Advert): boolean => {
    const now = new Date();
    
    if (ad.startDate && new Date(ad.startDate) > now) {
      return false;
    }
    
    if (ad.endDate && new Date(ad.endDate) < now) {
      return false;
    }
    
    return true;
  };

  const trackImpression = useCallback(async (adId: string) => {
    if (!canShowAds || !preferences.analytics) return;
    if (impressionTrackedRef.current.has(adId)) return;

    impressionTrackedRef.current.add(adId);

    try {
      const sessionData = getSessionData();
      
      await fetch('/api/adverts/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          adId,
          type: 'impression',
          sessionData,
          timestamp: new Date().toISOString(),
        }),
      });

      const updateAdStats = (ads: Advert[]) =>
        ads.map(ad =>
          ad.id === adId
            ? { ...ad, impressionCount: ad.impressionCount + 1 }
            : ad
        );

      setTopAds(prev => updateAdStats(prev));
      setBottomAds(prev => updateAdStats(prev));
      setSidebarAds(prev => updateAdStats(prev));
      setInlineAds(prev => updateAdStats(prev));
      setAllAds(prev => updateAdStats(prev));
    } catch (err) {
      console.error('Error tracking impression:', err);
    }
  }, [canShowAds, preferences.analytics, getSessionData]);

  const trackClick = useCallback(async (adId: string) => {
    if (!canShowAds) return;

    try {
      const sessionData = getSessionData();
      
      await fetch('/api/adverts/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          adId,
          type: 'click',
          sessionData,
          timestamp: new Date().toISOString(),
        }),
      });

      const updateAdStats = (ads: Advert[]) =>
        ads.map(ad =>
          ad.id === adId
            ? { ...ad, clickCount: ad.clickCount + 1 }
            : ad
        );

      setTopAds(prev => updateAdStats(prev));
      setBottomAds(prev => updateAdStats(prev));
      setSidebarAds(prev => updateAdStats(prev));
      setInlineAds(prev => updateAdStats(prev));
      setAllAds(prev => updateAdStats(prev));

      const ad = allAds.find(a => a.id === adId);
      if (ad?.link) {
        window.open(ad.link, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  }, [canShowAds, getSessionData, allAds]);

  const refreshAds = useCallback(async () => {
    impressionTrackedRef.current.clear();
    await fetchAds();
  }, [fetchAds]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  useEffect(() => {
    if (!canShowAds) return;

    const interval = setInterval(() => {
      fetchAds();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [canShowAds, fetchAds]);

  return {
    topAds,
    bottomAds,
    sidebarAds,
    inlineAds,
    allAds,
    isLoading,
    error,
    canShowAds,
    refreshAds,
    trackImpression,
    trackClick,
  };
}

export function getAdsByPosition(ads: Advert[], position: Advert['position']): Advert[] {
  return ads.filter(ad => ad.position === position && ad.active);
}

export function getRandomAds(ads: Advert[], count: number): Advert[] {
  const shuffled = [...ads].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function calculateAdPerformance(ad: Advert): number {
  if (ad.impressionCount === 0) return 0;
  return (ad.clickCount / ad.impressionCount) * 100;
}