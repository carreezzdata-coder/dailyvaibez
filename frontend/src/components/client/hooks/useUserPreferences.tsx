// src/components/client/hooks/useUserPreferences.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

// Types export
export interface CategoryVisit {
  slug: string;
  count: number;
  lastVisit: string;
}

export interface UserPreferences {
  favoriteCategories: string[];
  visitHistory: CategoryVisit[];
  contentType: 'breaking' | 'politics' | 'entertainment' | 'business' | 'sports' | 'tech' | 'lifestyle' | 'counties' | 'opinion' | 'mixed';
  lastVisit: string;
  totalVisits: number;
}

export interface GeoLocation {
  county: string | null;
  town: string | null;
  category?: string;
}

const PREFERENCES_KEY = 'vt_user_preferences';
const GEO_KEY = 'vt_geo_location';
const COOKIE_CONSENT_KEY = 'vt_cookie_consent';

const DEFAULT_PREFS: UserPreferences = {
  favoriteCategories: [],
  visitHistory: [],
  contentType: 'mixed',
  lastVisit: new Date().toISOString(),
  totalVisits: 0,
};

const CATEGORY_WEIGHTS = {
  'breaking': ['breaking', 'urgent', 'live', 'world'],
  'counties': ['counties', 'local', 'nairobi', 'mombasa'],
  'politics': ['politics', 'government', 'elections'],
  'business': ['business', 'economy', 'markets', 'finance'],
  'opinion': ['opinion', 'editorial', 'analysis'],
  'sports': ['sports', 'football', 'athletics', 'rugby'],
  'lifestyle': ['lifestyle', 'fashion', 'health', 'wellness'],
  'entertainment': ['entertainment', 'celebrity', 'gossip', 'music'],
  'tech': ['tech', 'technology', 'innovation', 'startups'],
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);
  const [geoLocation, setGeoLocation] = useState<GeoLocation>({ county: null, town: null });
  const [cookieConsent, setCookieConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // FIXED: Mark hydration complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // FIXED: Safe localStorage access - only after hydration
  const loadFromStorage = useCallback((key: string, fallback: any = null) => {
    if (!isHydrated || typeof window === 'undefined') return fallback;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.error(`Failed to load ${key}:`, e);
      return fallback;
    }
  }, [isHydrated]);

  // FIXED: Safe localStorage save
  const saveToStorage = useCallback((key: string, value: any) => {
    if (!isHydrated || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
    }
  }, [isHydrated]);

  // FIXED: Only load data after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const loadAllData = async () => {
      try {
        setIsLoading(true);

        // Load cookie consent
        const consent = loadFromStorage(COOKIE_CONSENT_KEY) === 'true';
        setCookieConsent(consent);

        // Load preferences
        const storedPrefs = loadFromStorage(PREFERENCES_KEY, DEFAULT_PREFS);
        setPreferences(storedPrefs);

        // Load geo location
        const storedGeo = loadFromStorage(GEO_KEY, { county: null, town: null });
        
        // Handle nested location object
        const geoData = storedGeo?.location || storedGeo;
        setGeoLocation(geoData);

        // Detect geo if not already stored
        if (!geoData.county && !geoData.town) {
          detectGeoLocation();
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isHydrated, loadFromStorage]);

  const detectGeoLocation = useCallback(async () => {
    try {
      const response = await fetch('/api/client/geo?action=current', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.location) {
          const loc = data.location;
          setGeoLocation(loc);
          saveToStorage(GEO_KEY, loc);
        }
      }
    } catch (error) {
      console.error('Failed to detect location:', error);
    }
  }, [saveToStorage]);

  const savePreferences = useCallback((prefs: UserPreferences) => {
    saveToStorage(PREFERENCES_KEY, prefs);
    setPreferences(prefs);
  }, [saveToStorage]);

  const trackCategoryVisit = useCallback((categorySlug: string) => {
    setPreferences(prev => {
      const existingVisit = prev.visitHistory.find(v => v.slug === categorySlug);
      
      let newVisitHistory: CategoryVisit[];
      if (existingVisit) {
        newVisitHistory = prev.visitHistory.map(v =>
          v.slug === categorySlug
            ? { ...v, count: v.count + 1, lastVisit: new Date().toISOString() }
            : v
        );
      } else {
        newVisitHistory = [
          ...prev.visitHistory,
          { slug: categorySlug, count: 1, lastVisit: new Date().toISOString() }
        ];
      }

      // Sort by count and keep top 20
      newVisitHistory.sort((a, b) => b.count - a.count);
      if (newVisitHistory.length > 20) {
        newVisitHistory = newVisitHistory.slice(0, 20);
      }

      const topCategories = newVisitHistory.slice(0, 5).map(v => v.slug);
      const contentType = determineContentType(newVisitHistory);

      const updated: UserPreferences = {
        ...prev,
        visitHistory: newVisitHistory,
        favoriteCategories: topCategories,
        contentType,
        lastVisit: new Date().toISOString(),
        totalVisits: prev.totalVisits + 1,
      };

      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const determineContentType = (visitHistory: CategoryVisit[]): UserPreferences['contentType'] => {
    if (visitHistory.length === 0) return 'mixed';

    const totalVisits = visitHistory.reduce((sum, v) => sum + v.count, 0);
    const categoryScores: Record<string, number> = {};

    visitHistory.forEach(visit => {
      const percentage = (visit.count / totalVisits) * 100;
      const visitSlug = visit.slug.toLowerCase();
      
      Object.entries(CATEGORY_WEIGHTS).forEach(([mainCategory, keywords]) => {
        if (keywords.some(keyword => visitSlug.includes(keyword))) {
          categoryScores[mainCategory] = (categoryScores[mainCategory] || 0) + percentage;
        }
      });
    });

    const maxCategory = Object.entries(categoryScores).reduce((max, [cat, score]) => 
      score > max.score ? { category: cat as UserPreferences['contentType'], score } : max,
      { category: 'mixed' as UserPreferences['contentType'], score: 0 }
    );

    return maxCategory.score > 25 ? maxCategory.category : 'mixed';
  };

  const trackArticleRead = useCallback((categorySlug: string, articleSlug: string, timeSpent: number) => {
    trackCategoryVisit(categorySlug);
  }, [trackCategoryVisit]);

  const getPrioritizedCategories = useCallback((): string[] => {
    const { favoriteCategories, contentType } = preferences;

    if (favoriteCategories.length === 0) {
      return ['breaking', 'politics', 'business', 'sports', 'tech', 'entertainment'];
    }

    const baseOrder = ['breaking'];
    
    // Add user's top category first
    if (contentType !== 'mixed' && contentType !== 'breaking') {
      baseOrder.push(contentType);
    }

    // Add remaining favorites
    const remaining = favoriteCategories.filter(c => !baseOrder.includes(c));
    
    return [...baseOrder, ...remaining].slice(0, 6);
  }, [preferences]);

  const resetPreferences = useCallback(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(PREFERENCES_KEY);
      localStorage.removeItem(GEO_KEY);
      setPreferences(DEFAULT_PREFS);
      setGeoLocation({ county: null, town: null });
    } catch (e) {
      console.error('Failed to reset preferences:', e);
    }
  }, [isHydrated]);

  const refreshData = useCallback(() => {
    if (!isHydrated) return;
    
    const storedPrefs = loadFromStorage(PREFERENCES_KEY, DEFAULT_PREFS);
    setPreferences(storedPrefs);
    
    const storedGeo = loadFromStorage(GEO_KEY, { county: null, town: null });
    const geoData = storedGeo?.location || storedGeo;
    setGeoLocation(geoData);
  }, [isHydrated, loadFromStorage]);

  return {
    preferences,
    geoLocation,
    cookieConsent,
    isLoading: isLoading || !isHydrated,
    isHydrated,
    trackCategoryVisit,
    trackArticleRead,
    getPrioritizedCategories,
    resetPreferences,
    refreshData,
  };
}