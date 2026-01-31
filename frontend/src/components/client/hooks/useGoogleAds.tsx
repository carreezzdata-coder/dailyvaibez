// C:\Projects\DAILY VAIBE\frontend\src\components\client\hooks\useGoogleAds.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface GoogleAdSlot {
  slotId: string;
  format: 'auto' | 'rectangle' | 'vertical' | 'horizontal' | 'leaderboard' | 'mobile_banner' | 'half_page' | 'large_rectangle';
  position: 'header' | 'footer' | 'sidebar' | 'inline' | 'sticky';
  responsive?: boolean;
  enabled: boolean;
}

export interface UseGoogleAdsReturn {
  isLoaded: boolean;
  isEnabled: boolean;
  loadAd: (slotId: string) => void;
  refreshAds: () => void;
  enableAds: () => void;
  disableAds: () => void;
}

export function useGoogleAds(publisherId?: string): UseGoogleAdsReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const loadedSlotsRef = useRef<Set<string>>(new Set());
  const scriptLoadedRef = useRef(false);

  const initializeAdSense = useCallback(() => {
    if (typeof window === 'undefined' || scriptLoadedRef.current) return;

    try {
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }
      
      scriptLoadedRef.current = true;
      setIsLoaded(true);
    } catch (error) {
      console.error('AdSense initialization error:', error);
    }
  }, []);

  const loadAd = useCallback((slotId: string) => {
    if (!isEnabled || !isLoaded) return;
    if (loadedSlotsRef.current.has(slotId)) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      loadedSlotsRef.current.add(slotId);
    } catch (error) {
      console.error(`Error loading ad slot ${slotId}:`, error);
    }
  }, [isEnabled, isLoaded]);

  const refreshAds = useCallback(() => {
    loadedSlotsRef.current.clear();
    
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        window.adsbygoogle.forEach((ad: any) => {
          if (ad && typeof ad.push === 'function') {
            ad.push({});
          }
        });
      } catch (error) {
        console.error('Error refreshing ads:', error);
      }
    }
  }, []);

  const enableAds = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disableAds = useCallback(() => {
    setIsEnabled(false);
    loadedSlotsRef.current.clear();
  }, []);

  useEffect(() => {
    initializeAdSense();
  }, [initializeAdSense]);

  return {
    isLoaded,
    isEnabled,
    loadAd,
    refreshAds,
    enableAds,
    disableAds,
  };
}