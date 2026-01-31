// frontend/src/lib/geoTracker.ts

import { useState, useEffect, useCallback, useRef } from 'react';

interface GeoLocation {
  county: string | null;
  town: string | null;
  category: string;
}

interface GeoSession {
  sessionId: string;
  location: GeoLocation;
  visitCount: number;
  firstSeen: string;
  lastSeen: string;
}

interface GeoTrackerConfig {
  updateInterval?: number;
  persistInterval?: number;
  endpoint?: string;
  autoDetect?: boolean;
}

const DEFAULT_CONFIG: Required<GeoTrackerConfig> = {
  updateInterval: 30000,
  persistInterval: 120000,
  endpoint: '/api/client/geo/track',
  autoDetect: true,
};

const GEO_STORAGE_KEY = 'vt_geo_session';
const SESSION_ID_KEY = 'vt_session_id';

export class GeoTracker {
  private config: Required<GeoTrackerConfig>;
  private sessionId: string;
  private location: GeoLocation;
  private visitCount: number = 0;
  private firstSeen: string;
  private lastSeen: string;
  private updateTimer: NodeJS.Timeout | null = null;
  private persistTimer: NodeJS.Timeout | null = null;
  private isTracking: boolean = false;
  private pendingUpdate: boolean = false;

  constructor(config?: GeoTrackerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.getOrCreateSessionId();
    this.location = { county: null, town: null, category: 'UNKNOWN' };
    this.firstSeen = new Date().toISOString();
    this.lastSeen = this.firstSeen;
    
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return `server_${Date.now()}`;
    
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(GEO_STORAGE_KEY);
      if (stored) {
        const data: GeoSession = JSON.parse(stored);
        this.location = data.location;
        this.visitCount = data.visitCount;
        this.firstSeen = data.firstSeen;
        this.lastSeen = data.lastSeen;
      }
    } catch (e) {
      console.error('Failed to load geo session:', e);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const session: GeoSession = {
        sessionId: this.sessionId,
        location: this.location,
        visitCount: this.visitCount,
        firstSeen: this.firstSeen,
        lastSeen: this.lastSeen,
      };
      localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save geo session:', e);
    }
  }

  async start(): Promise<void> {
    if (this.isTracking) return;
    
    this.isTracking = true;
    
    if (this.config.autoDetect && !this.location.county) {
      await this.detectLocation();
    }

    await this.syncToServer();

    this.updateTimer = setInterval(() => {
      this.updateActivity();
    }, this.config.updateInterval);

    this.persistTimer = setInterval(() => {
      if (this.pendingUpdate) {
        this.syncToServer();
      }
    }, this.config.persistInterval);
  }

  stop(): void {
    if (this.updateTimer) clearInterval(this.updateTimer);
    if (this.persistTimer) clearInterval(this.persistTimer);
    this.isTracking = false;
    
    if (this.pendingUpdate) {
      this.syncToServer();
    }
  }

  private updateActivity(): void {
    this.visitCount++;
    this.lastSeen = new Date().toISOString();
    this.pendingUpdate = true;
    this.saveToStorage();
  }

  private async detectLocation(): Promise<void> {
    try {
      const response = await fetch('/api/client/geo/current', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.location) {
          this.location = data.location;
          this.saveToStorage();
        }
      }
    } catch (error) {
      console.error('Failed to detect location:', error);
    }
  }

  private async syncToServer(): Promise<void> {
    if (!this.pendingUpdate) return;
    
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          location: this.location,
          visitCount: this.visitCount,
          firstSeen: this.firstSeen,
          lastSeen: this.lastSeen,
        }),
      });

      if (response.ok) {
        this.pendingUpdate = false;
      }
    } catch (error) {
      console.error('Failed to sync geo data:', error);
    }
  }

  async updateLocation(newLocation: Partial<GeoLocation>): Promise<void> {
    this.location = { ...this.location, ...newLocation };
    this.pendingUpdate = true;
    this.saveToStorage();
    await this.syncToServer();
  }

  getLocation(): GeoLocation {
    return { ...this.location };
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getStats(): GeoSession {
    return {
      sessionId: this.sessionId,
      location: this.location,
      visitCount: this.visitCount,
      firstSeen: this.firstSeen,
      lastSeen: this.lastSeen,
    };
  }
}

export function useGeoTracker(config?: GeoTrackerConfig) {
  const trackerRef = useRef<GeoTracker | null>(null);
  const [location, setLocation] = useState<GeoLocation>({ 
    county: null, 
    town: null, 
    category: 'UNKNOWN' 
  });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    trackerRef.current = new GeoTracker(config);
    setLocation(trackerRef.current.getLocation());

    trackerRef.current.start().then(() => {
      setIsActive(true);
      setLocation(trackerRef.current!.getLocation());
    });

    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
      }
    };
  }, []);

  const updateLocation = useCallback(async (newLocation: Partial<GeoLocation>) => {
    if (trackerRef.current) {
      await trackerRef.current.updateLocation(newLocation);
      setLocation(trackerRef.current.getLocation());
    }
  }, []);

  const getStats = useCallback(() => {
    return trackerRef.current?.getStats() || null;
  }, []);

  return {
    location,
    isActive,
    updateLocation,
    getStats,
  };
}