import React, { useState, useEffect, useCallback } from 'react';

interface GeoStats {
  totalDevices: number;
  activeNow: number;
  byCategory: {
    category: string;
    totalSessions: number;
    totalCounties: number;
    totalTowns: number;
    activeNow: number;
  }[];
  topLocations: {
    county: string;
    category: string;
    total_devices: number;
    active_today: number;
    active_now: number;
  }[];
  cdnSync: {
    lastSync: string;
    totalRecords: number;
    cdnUrl: string | null;
  };
}

const GeographicAnalytics: React.FC = () => {
  const [stats, setStats] = useState<GeoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-services/geographic-analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching geo stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncToCDN = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/system-services/geographic-analytics/sync-cdn', {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error syncing to CDN:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'KENYA': return '🇰🇪';
      case 'EAST_AFRICA': return '🌍';
      case 'AFRICA': return '🌍';
      case 'GLOBAL': return '🌎';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="geo-tracker-loading">
        <div className="loading-spinner">🌍</div>
        <p>Loading Geographic Analytics...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>🌍 Geographic Analytics</h2>
          <p>Real-time location tracking and CDN distribution</p>
        </div>
        <div className="header-controls">
          <button
            className={`toggle-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? '🟢 Auto' : '⚪ Manual'}
          </button>
          <button className="refresh-btn" onClick={fetchStats}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="category-overview">
        <div className="overview-card active">
          <div className="card-icon">🟢</div>
          <div className="card-content">
            <span className="card-label">Active Now</span>
            <span className="card-value">{stats?.activeNow?.toLocaleString() || 0}</span>
            <span className="card-sublabel">Last 15 minutes</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">📱</div>
          <div className="card-content">
            <span className="card-label">Total Devices</span>
            <span className="card-value">{stats?.totalDevices?.toLocaleString() || 0}</span>
            <span className="card-sublabel">All-time registered</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🌐</div>
          <div className="card-content">
            <span className="card-label">CDN Records</span>
            <span className="card-value">{stats?.cdnSync?.totalRecords || 0}</span>
            <span className="card-sublabel">Synced data</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🔄</div>
          <div className="card-content">
            <span className="card-label">Last CDN Sync</span>
            <span className="card-value" style={{ fontSize: '0.85rem' }}>
              {stats?.cdnSync?.lastSync || 'Never'}
            </span>
            <span className="card-sublabel">Automatic</span>
          </div>
        </div>
      </div>

      <div className="region-stats-section">
        <h3>🗺️ Regional Distribution</h3>
        <div className="stats-grid">
          {stats?.byCategory?.map(cat => (
            <div key={cat.category} className="stat-card">
              <div className="stat-header">
                <span className="stat-category">{getCategoryIcon(cat.category)}</span>
                <span className="stat-county">{cat.category.replace('_', ' ')}</span>
              </div>
              <div className="stat-metrics">
                <div className="metric">
                  <span className="metric-label">Sessions</span>
                  <span className="metric-value">{cat.totalSessions?.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Regions</span>
                  <span className="metric-value">{cat.totalCounties}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Active</span>
                  <span className="metric-value">{cat.activeNow}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="region-stats-section">
        <h3>📍 Top Locations</h3>
        <div className="stats-grid">
          {stats?.topLocations?.slice(0, 12).map((loc, idx) => (
            <div key={`${loc.county}-${idx}`} className="stat-card">
              <div className="stat-header">
                <span className="stat-category">{getCategoryIcon(loc.category)}</span>
                <span className="stat-county">{loc.county}</span>
              </div>
              <div className="stat-metrics">
                <div className="metric">
                  <span className="metric-label">Total</span>
                  <span className="metric-value">{loc.total_devices?.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Today</span>
                  <span className="metric-value">{loc.active_today}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Now</span>
                  <span className="metric-value">{loc.active_now}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tracker-filters-advanced">
        <div className="filters-header">
          <h3>🌐 CDN Management</h3>
        </div>
        
        <button
          onClick={syncToCDN}
          disabled={syncing}
          className="filter-apply-btn"
          style={{ width: '100%' }}>
          {syncing ? '🔄 Syncing to CDN...' : '🌐 Sync to CDN'}
        </button>

        {stats?.cdnSync?.cdnUrl && (
          <div style={{ 
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(0, 255, 136, 0.1)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            wordBreak: 'break-all'
          }}>
            <strong>CDN URL:</strong> {stats.cdnSync.cdnUrl}
          </div>
        )}
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>Auto-Tracking:</strong> System automatically tracks visitor locations via CloudFlare headers, 
          categorizes by region, aggregates statistics, and syncs to CDN for global distribution.
        </div>
      </div>
    </div>
  );
};

export default GeographicAnalytics;