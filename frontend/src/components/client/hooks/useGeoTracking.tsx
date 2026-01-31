'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeoLocation {
  county: string | null;
  town: string | null;
  category: string;
}

const GEO_STORAGE_KEY = 'vt_geo_location';
const GEO_CACHE_DURATION = 24 * 60 * 60 * 1000;

export function useGeoTracking() {
  const [location, setLocation] = useState<GeoLocation>({ 
    county: null, 
    town: null, 
    category: 'UNKNOWN' 
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetected, setLastDetected] = useState<number | null>(null);

  const detectLocation = useCallback(async () => {
    if (isDetecting) return;
    
    setIsDetecting(true);
    try {
      const response = await fetch('/api/client/geo?action=current', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.location) {
          const timestamp = Date.now();
          setLocation(data.location);
          setLastDetected(timestamp);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify({
              location: data.location,
              timestamp
            }));
          }
          return;
        }
      }

      const defaultLocation: GeoLocation = { 
        county: 'Unknown', 
        town: 'Unknown', 
        category: 'UNKNOWN' 
      };
      
      const timestamp = Date.now();
      setLocation(defaultLocation);
      setLastDetected(timestamp);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify({
          location: defaultLocation,
          timestamp
        }));
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      setLocation({ county: 'Unknown', town: 'Unknown', category: 'UNKNOWN' });
    } finally {
      setIsDetecting(false);
    }
  }, [isDetecting]);

  const clearLocation = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GEO_STORAGE_KEY);
    }
    setLocation({ county: null, town: null, category: 'UNKNOWN' });
    setLastDetected(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(GEO_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.timestamp && Date.now() - parsed.timestamp < GEO_CACHE_DURATION) {
          setLocation(parsed.location);
          setLastDetected(parsed.timestamp);
          return;
        }
      } catch (error) {
        console.error('Failed to parse stored location:', error);
      }
    }
    
    detectLocation();
  }, [detectLocation]);

  return {
    location,
    isDetecting,
    lastDetected,
    detectLocation,
    clearLocation,
  };
}