'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface UserBehavior {
  categoryVisits: Record<string, number>;
  articleReads: Record<string, number>;
  lastVisit: string;
  totalVisits: number;
  preferredCategories: string[];
}

export interface GeoLocation {
  county: string | null;
  town: string | null;
  category: string;
}

const COOKIE_PREFERENCES_KEY = 'vt_cookie_preferences';
const COOKIE_CONSENT_KEY = 'vt_cookie_consent';
const USER_BEHAVIOR_KEY = 'vt_user_behavior';
const DEVICE_ID_KEY = 'vt_device_id';
const DEVICE_REGISTERED_KEY = 'vt_device_registered';
const GEO_LOCATION_KEY = 'vt_geo_location';

const DEFAULT_BEHAVIOR: UserBehavior = {
  categoryVisits: {},
  articleReads: {},
  lastVisit: new Date().toISOString(),
  totalVisits: 0,
  preferredCategories: [],
};

function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useCookies() {
  const [showBanner, setShowBanner] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [userBehavior, setUserBehavior] = useState<UserBehavior>(DEFAULT_BEHAVIOR);
  const [geoLocation, setGeoLocation] = useState<GeoLocation>({ 
    county: null, 
    town: null, 
    category: 'UNKNOWN' 
  });
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      loadStoredData();
    }

    initializeDevice();
  }, []);

  const loadStoredData = useCallback(() => {
    if (typeof window === 'undefined') return;

    const storedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (storedPrefs) {
      try {
        setPreferences(JSON.parse(storedPrefs));
      } catch (e) {
        console.error('Failed to parse preferences');
      }
    }

    const storedBehavior = localStorage.getItem(USER_BEHAVIOR_KEY);
    if (storedBehavior) {
      try {
        setUserBehavior(JSON.parse(storedBehavior));
      } catch (e) {
        console.error('Failed to parse behavior');
      }
    }

    const storedGeo = localStorage.getItem(GEO_LOCATION_KEY);
    if (storedGeo) {
      try {
        const parsed = JSON.parse(storedGeo);
        setGeoLocation(parsed.location || parsed);
      } catch (e) {
        console.error('Failed to parse geo');
      }
    }
  }, []);

  const initializeDevice = useCallback(async () => {
    if (typeof window === 'undefined') return;

    let devId = localStorage.getItem(DEVICE_ID_KEY);
    if (!devId) {
      devId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, devId);
    }
    setDeviceId(devId);

    const isRegistered = localStorage.getItem(DEVICE_REGISTERED_KEY);
    if (isRegistered) return;

    await detectGeoLocation();
    await registerDevice(devId);
  }, []);

  const detectGeoLocation = useCallback(async () => {
    try {
      const response = await fetch('/api/client/geo?action=current', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.location) {
          setGeoLocation(data.location);
          localStorage.setItem(GEO_LOCATION_KEY, JSON.stringify(data.location));
        }
      }
    } catch (error) {
      console.log('Location detection skipped');
    }
  }, []);

  const registerDevice = useCallback(async (devId: string) => {
    try {
      const storedGeo = localStorage.getItem(GEO_LOCATION_KEY);
      const geo = storedGeo ? JSON.parse(storedGeo) : { 
        county: 'Unknown', 
        town: 'Unknown', 
        category: 'UNKNOWN' 
      };

      const response = await fetch('/api/client/geo', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          deviceId: devId,
          county: geo.county || 'Unknown',
          town: geo.town || 'Unknown',
          category: geo.category || 'UNKNOWN',
        }),
      });

      if (response.ok) {
        localStorage.setItem(DEVICE_REGISTERED_KEY, 'true');
      }
    } catch (error) {
      console.log('Device registration skipped');
    }
  }, []);

  const saveBehavior = useCallback((behavior: UserBehavior) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_BEHAVIOR_KEY, JSON.stringify(behavior));
    setUserBehavior(behavior);
  }, []);

  const trackBehavior = useCallback((category: string, articleSlug?: string) => {
    setUserBehavior(prev => {
      const newBehavior = { ...prev };
      
      newBehavior.categoryVisits = {
        ...prev.categoryVisits,
        [category]: (prev.categoryVisits[category] || 0) + 1,
      };

      if (articleSlug) {
        newBehavior.articleReads = {
          ...prev.articleReads,
          [articleSlug]: (prev.articleReads[articleSlug] || 0) + 1,
        };
      }

      newBehavior.lastVisit = new Date().toISOString();
      newBehavior.totalVisits = prev.totalVisits + 1;

      const sortedCategories = Object.entries(newBehavior.categoryVisits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat]) => cat);
      
      newBehavior.preferredCategories = sortedCategories;

      saveBehavior(newBehavior);

      return newBehavior;
    });
  }, [saveBehavior]);

  const acceptAll = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const newPrefs: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(newPrefs);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPrefs));
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
    loadStoredData();
  }, [loadStoredData]);

  const rejectAll = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const newPrefs: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(newPrefs);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPrefs));
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
  }, []);

  const savePreferences = useCallback((newPrefs: CookiePreferences) => {
    if (typeof window === 'undefined') return;
    
    setPreferences(newPrefs);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPrefs));
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowManageModal(false);
    loadStoredData();
  }, [loadStoredData]);

  const openManageModal = useCallback(() => {
    setShowManageModal(true);
  }, []);

  const closeManageModal = useCallback(() => {
    setShowManageModal(false);
  }, []);

  const resetBehavior = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_BEHAVIOR_KEY);
    setUserBehavior(DEFAULT_BEHAVIOR);
  }, []);

  const resetDevice = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(DEVICE_REGISTERED_KEY);
    localStorage.removeItem(GEO_LOCATION_KEY);
    initializeDevice();
  }, [initializeDevice]);

  return {
    showBanner,
    showManageModal,
    preferences,
    userBehavior,
    geoLocation,
    deviceId,
    acceptAll,
    rejectAll,
    savePreferences,
    openManageModal,
    closeManageModal,
    trackBehavior,
    resetBehavior,
    resetDevice,
  };
}