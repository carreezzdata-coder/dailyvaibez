import React, { useState, useEffect } from 'react';
import CacheOptimization from './SystemServices/CacheOptimization';
import GeographicAnalytics from './SystemServices/GeographicAnalytics';
import SessionManagement from './SystemServices/SessionManagement';
import SystemOverview from './SystemServices/SystemOverview';
import BackupRestore from './SystemServices/BackupRestore';
import ContentHealth from './SystemServices/ContentHealth';
import DataIntegrity from './SystemServices/DataIntegrity';
import MediaOptimizer from './SystemServices/MediaOptimizer';
import PerformanceMonitor from './SystemServices/PerformanceMonitor';

type ServiceModule = 
  | 'overview'
  | 'cache-optimization'
  | 'geographic-analytics'
  | 'session-management'
  | 'backup-restore'
  | 'content-health'
  | 'data-integrity'
  | 'media-optimizer'
  | 'performance-monitor';

interface ServiceConfig {
  id: ServiceModule;
  label: string;
  description: string;
  icon: string;
  component?: React.ComponentType;
}

const SystemServices: React.FC = () => {
  const [activeService, setActiveService] = useState<ServiceModule>('overview');
  const [navOpen, setNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const services: ServiceConfig[] = [
    {
      id: 'cache-optimization',
      label: 'Cache & Optimization',
      description: 'Redis, CDN, database optimization, memory management',
      icon: '⚡',
      component: CacheOptimization
    },
    {
      id: 'geographic-analytics',
      label: 'Geographic Analytics',
      description: 'Location tracking, CDN sync, regional statistics',
      icon: '🌍',
      component: GeographicAnalytics
    },
    {
      id: 'session-management',
      label: 'Session Management',
      description: 'Automated cleanup, session monitoring, device tracking',
      icon: '🔒',
      component: SessionManagement
    },
    {
      id: 'backup-restore',
      label: 'Backup & Restore',
      description: 'Database backups, restore points, recovery management',
      icon: '💾',
      component: BackupRestore
    },
    {
      id: 'content-health',
      label: 'Content Health',
      description: 'Monitor content integrity, missing elements, broken links',
      icon: '📰',
      component: ContentHealth
    },
    {
      id: 'data-integrity',
      label: 'Data Integrity',
      description: 'Validate relationships, orphaned records, duplicates',
      icon: '🔍',
      component: DataIntegrity
    },
    {
      id: 'media-optimizer',
      label: 'Media Optimizer',
      description: 'Image storage, Cloudflare variants, duplicate detection',
      icon: '🖼️',
      component: MediaOptimizer
    },
    {
      id: 'performance-monitor',
      label: 'Performance Monitor',
      description: 'Query times, cache efficiency, database performance',
      icon: '⚡',
      component: PerformanceMonitor
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [activeService]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && navOpen) setNavOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [navOpen]);

  const activeServiceConfig = services.find(s => s.id === activeService);
  const ActiveComponent = activeServiceConfig?.component;

  if (isLoading) {
    return (
      <div className="geo-tracker-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading System Services...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--bg-content)',
      color: 'var(--text-primary)'
    }}>
      <header style={{
        padding: '1rem 1.5rem',
        background: 'var(--bg-card)',
        borderBottom: '2px solid var(--border-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            System Services
          </h1>
          <p style={{ 
            margin: '0.25rem 0 0 0',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            Auto-optimizing system management
          </p>
        </div>
        
        <button 
          onClick={() => setNavOpen(!navOpen)}
          className="tracker-mobile-menu-btn"
          style={{ display: navOpen ? 'none' : 'flex' }}
          aria-label="Menu">
          ☰
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <nav className={`tracker-mobile-menu ${navOpen ? 'open' : ''}`}>
          <div className="tracker-menu-header">
            <h3>Navigation</h3>
            <button className="tracker-menu-close" onClick={() => setNavOpen(false)} aria-label="Close">
              ×
            </button>
          </div>

          <div className="tracker-menu-content">
            <div className="tracker-menu-section">
              <h4 className="tracker-menu-section-title">Services</h4>
              <div className="tracker-menu-actions">
                <button
                  onClick={() => setActiveService('overview')}
                  className={`tracker-menu-btn ${activeService === 'overview' ? 'active' : ''}`}
                  aria-label="Overview">
                  <span className="tracker-menu-btn-icon">🎛️</span>
                  <span>Overview</span>
                </button>
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => setActiveService(service.id)}
                    className={`tracker-menu-btn ${activeService === service.id ? 'active' : ''}`}
                    aria-label={service.label}>
                    <span className="tracker-menu-btn-icon">{service.icon}</span>
                    <span>{service.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <main style={{ 
          flex: 1,
          padding: '0',
          minHeight: '100vh'
        }}>
          {activeService === 'overview' && <SystemOverview services={services} setActiveService={setActiveService} />}
          
          {ActiveComponent && activeService !== 'overview' && (
            <React.Suspense fallback={
              <div className="geo-tracker-loading">
                <div className="loading-spinner">🔄</div>
                <p>Loading {activeServiceConfig?.label}...</p>
              </div>
            }>
              <ActiveComponent />
            </React.Suspense>
          )}
        </main>
      </div>

      {navOpen && (
        <div 
          className="tracker-menu-overlay active"
          onClick={() => setNavOpen(false)}
        />
      )}
    </div>
  );
};

export default SystemServices;