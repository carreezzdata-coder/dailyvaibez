import React, { useState, useEffect } from 'react';

interface ServiceConfig {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface SystemOverviewProps {
  services: ServiceConfig[];
  setActiveService: (service: any) => void;
}

interface OverviewStats {
  cacheHitRate: string;
  totalSessions: number;
  activeSessions: number;
  geoDevices: number;
  lastOptimization: string;
  systemHealth: string;
}

const SystemOverview: React.FC<SystemOverviewProps> = ({ services, setActiveService }) => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/system-services/overview');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching overview stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="geo-tracker-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading System Overview...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>🎛️ System Services Dashboard</h2>
          <p>Auto-optimizing platform management</p>
        </div>
        <div className="header-controls">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(0, 255, 136, 0.15)',
            border: '2px solid var(--admin-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--admin-primary)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <span className="status-indicator online"></span>
            <span>{stats?.systemHealth || 'Operational'}</span>
          </div>
        </div>
      </div>

      <div className="category-overview">
        <div className="overview-card active">
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <span className="card-label">Cache Hit Rate</span>
            <span className="card-value">{stats?.cacheHitRate || '0%'}</span>
            <span className="card-sublabel">Performance</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🔐</div>
          <div className="card-content">
            <span className="card-label">Active Sessions</span>
            <span className="card-value">{stats?.activeSessions || 0}</span>
            <span className="card-sublabel">{stats?.totalSessions || 0} total</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🌍</div>
          <div className="card-content">
            <span className="card-label">Tracked Devices</span>
            <span className="card-value">{stats?.geoDevices || 0}</span>
            <span className="card-sublabel">Geographic data</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🔄</div>
          <div className="card-content">
            <span className="card-label">Last Optimization</span>
            <span className="card-value" style={{ fontSize: '0.9rem' }}>
              {stats?.lastOptimization || 'Never'}
            </span>
            <span className="card-sublabel">Automatic</span>
          </div>
        </div>
      </div>

      <div className="region-stats-section">
        <h3>📊 Service Modules</h3>
        <div className="stats-grid">
          {services.map(service => (
            <button
              key={service.id}
              onClick={() => setActiveService(service.id)}
              className="stat-card"
              style={{ cursor: 'pointer', border: '2px solid var(--border-primary)' }}>
              <div className="stat-header">
                <span className="stat-category">{service.icon}</span>
                <span className="stat-county">{service.label}</span>
              </div>
              <div className="stat-metrics">
                <div className="metric">
                  <span className="metric-label">{service.description}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>Auto-Optimization:</strong> System automatically hydrates cache, manages sessions, 
          syncs geographic data, and optimizes database performance. Manual intervention rarely needed.
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;