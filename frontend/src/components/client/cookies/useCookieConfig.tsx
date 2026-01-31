'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface GeoLocation {
  county: string | null;
  town: string | null;
  category: string;
}

export interface UserBehavior {
  categoryVisits: Record<string, number>;
  articleReads: Record<string, number>;
  lastVisit: string;
  totalVisits: number;
  preferredCategories: string[];
}

interface CookieConfigContextType {
  hasConsent: boolean;
  showSettings: boolean;
  preferences: CookiePreferences;
  deviceId: string;
  geoLocation: GeoLocation;
  userBehavior: UserBehavior;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: CookiePreferences) => void;
  openSettings: () => void;
  closeSettings: () => void;
  trackBehavior: (category: string, articleSlug?: string) => void;
  updateGeoLocation: (location: GeoLocation) => void;
  resetAll: () => void;
}

const CookieConfigContext = createContext<CookieConfigContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONSENT: 'vt_cookie_consent',
  PREFERENCES: 'vt_cookie_preferences',
  DEVICE_ID: 'vt_device_id',
  GEO_LOCATION: 'vt_geo_location',
  USER_BEHAVIOR: 'vt_user_behavior',
  STATS_SYNCED: 'vt_stats_synced',
};

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  personalization: false,
};

const DEFAULT_BEHAVIOR: UserBehavior = {
  categoryVisits: {},
  articleReads: {},
  lastVisit: new Date().toISOString(),
  totalVisits: 0,
  preferredCategories: [],
};

const DEFAULT_GEO: GeoLocation = {
  county: null,
  town: null,
  category: 'UNKNOWN',
};

const DEFAULT_CONTEXT: CookieConfigContextType = {
  hasConsent: false,
  showSettings: false,
  preferences: DEFAULT_PREFERENCES,
  deviceId: '',
  geoLocation: DEFAULT_GEO,
  userBehavior: DEFAULT_BEHAVIOR,
  acceptAll: () => {},
  rejectAll: () => {},
  savePreferences: () => {},
  openSettings: () => {},
  closeSettings: () => {},
  trackBehavior: () => {},
  updateGeoLocation: () => {},
  resetAll: () => {},
};

function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function CookieConfigProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [deviceId, setDeviceId] = useState<string>('');
  const [geoLocation, setGeoLocation] = useState<GeoLocation>(DEFAULT_GEO);
  const [userBehavior, setUserBehavior] = useState<UserBehavior>(DEFAULT_BEHAVIOR);

  const loadStorage = useCallback((key: string, fallback: any) => {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  const saveStorage = useCallback((key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage error for ${key}:`, error);
    }
  }, []);

  const detectGeo = useCallback(async () => {
    try {
      const response = await fetch('/api/client/geo/current', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.location) {
          setGeoLocation(data.location);
          saveStorage(STORAGE_KEYS.GEO_LOCATION, data.location);
        }
      }
    } catch (error) {
      console.error('Geo detection failed:', error);
    }
  }, [saveStorage]);

  const syncStats = useCallback(async (consent: boolean, prefs: CookiePreferences) => {
    try {
      const lastSync = loadStorage(STORAGE_KEYS.STATS_SYNCED, null);
      const today = new Date().toISOString().split('T')[0];
      
      if (lastSync === today) return;

      const response = await fetch('/api/client/cookies/track', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent,
          preferences: prefs,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        saveStorage(STORAGE_KEYS.STATS_SYNCED, today);
      }
    } catch (error) {
      console.error('Stats sync failed:', error);
    }
  }, [loadStorage, saveStorage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const consent = loadStorage(STORAGE_KEYS.CONSENT, null);
    const hasConsentValue = consent === 'true';
    setHasConsent(hasConsentValue);

    if (hasConsentValue) {
      setPreferences(loadStorage(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES));
      setUserBehavior(loadStorage(STORAGE_KEYS.USER_BEHAVIOR, DEFAULT_BEHAVIOR));
      setGeoLocation(loadStorage(STORAGE_KEYS.GEO_LOCATION, DEFAULT_GEO));
    }

    let devId = loadStorage(STORAGE_KEYS.DEVICE_ID, null);
    if (!devId) {
      devId = generateDeviceId();
      saveStorage(STORAGE_KEYS.DEVICE_ID, devId);
    }
    setDeviceId(devId);

    detectGeo();
  }, [mounted, loadStorage, saveStorage, detectGeo]);

  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    
    setPreferences(allAccepted);
    setHasConsent(true);
    saveStorage(STORAGE_KEYS.CONSENT, 'true');
    saveStorage(STORAGE_KEYS.PREFERENCES, allAccepted);
    syncStats(true, allAccepted);
  }, [saveStorage, syncStats]);

  const rejectAll = useCallback(() => {
    const rejected: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    
    setPreferences(rejected);
    setHasConsent(true);
    saveStorage(STORAGE_KEYS.CONSENT, 'true');
    saveStorage(STORAGE_KEYS.PREFERENCES, rejected);
    syncStats(false, rejected);
  }, [saveStorage, syncStats]);

  const savePreferences = useCallback((prefs: CookiePreferences) => {
    setPreferences(prefs);
    setHasConsent(true);
    saveStorage(STORAGE_KEYS.CONSENT, 'true');
    saveStorage(STORAGE_KEYS.PREFERENCES, prefs);
    setShowSettings(false);

    const hasAnyTrue = prefs.functional || prefs.analytics || prefs.marketing || prefs.personalization;
    syncStats(hasAnyTrue, prefs);
  }, [saveStorage, syncStats]);

  const trackBehavior = useCallback((category: string, articleSlug?: string) => {
    if (!preferences.analytics && !preferences.personalization) return;

    setUserBehavior(prev => {
      const updated: UserBehavior = {
        categoryVisits: {
          ...prev.categoryVisits,
          [category]: (prev.categoryVisits[category] || 0) + 1,
        },
        articleReads: articleSlug ? {
          ...prev.articleReads,
          [articleSlug]: (prev.articleReads[articleSlug] || 0) + 1,
        } : prev.articleReads,
        lastVisit: new Date().toISOString(),
        totalVisits: prev.totalVisits + 1,
        preferredCategories: Object.entries({
          ...prev.categoryVisits,
          [category]: (prev.categoryVisits[category] || 0) + 1,
        })
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([cat]) => cat),
      };

      saveStorage(STORAGE_KEYS.USER_BEHAVIOR, updated);
      return updated;
    });
  }, [preferences.analytics, preferences.personalization, saveStorage]);

  const updateGeoLocation = useCallback((location: GeoLocation) => {
    setGeoLocation(location);
    saveStorage(STORAGE_KEYS.GEO_LOCATION, location);
  }, [saveStorage]);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);

  const resetAll = useCallback(() => {
    if (typeof window === 'undefined') return;

    Object.values(STORAGE_KEYS).forEach(key => {
      window.localStorage.removeItem(key);
    });

    setHasConsent(false);
    setPreferences(DEFAULT_PREFERENCES);
    setUserBehavior(DEFAULT_BEHAVIOR);
    setGeoLocation(DEFAULT_GEO);
    setShowSettings(false);

    const newDeviceId = generateDeviceId();
    setDeviceId(newDeviceId);
    saveStorage(STORAGE_KEYS.DEVICE_ID, newDeviceId);

    window.location.reload();
  }, [saveStorage]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CookieConfigContext.Provider value={{
      hasConsent,
      showSettings,
      preferences,
      deviceId,
      geoLocation,
      userBehavior,
      acceptAll,
      rejectAll,
      savePreferences,
      openSettings,
      closeSettings,
      trackBehavior,
      updateGeoLocation,
      resetAll,
    }}>
      {children}
    </CookieConfigContext.Provider>
  );
}

export function useCookieConfig() {
  const context = useContext(CookieConfigContext);
  if (!context) return DEFAULT_CONTEXT;
  return context;
}

export { CookieConfigContext };