import React, { useState, useEffect, useCallback } from 'react';

interface SessionStats {
  publicSessions: number;
  expiredPublic: number;
  adminSessions: number;
  expiredAdmin: number;
  sessionGeo: number;
  activeDevices: number;
  oldDevices: number;
  lastCleanup: string;
  autoCleanupEnabled: boolean;
  nextScheduledCleanup: string;
}

const SessionManagement: React.FC = () => {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cleaning, setCleaning] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-services/session-management/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching session stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runCleanup = async (type: 'public' | 'admin' | 'geo' | 'all') => {
    const count = type === 'public' ? stats?.expiredPublic : 
                  type === 'admin' ? stats?.expiredAdmin : 
                  type === 'geo' ? stats?.oldDevices : 
                  (stats?.expiredPublic || 0) + (stats?.expiredAdmin || 0) + (stats?.oldDevices || 0);
    
    if (!confirm(`Clean ${count || 0} expired ${type} sessions?`)) return;

    setCleaning(type);
    try {
      const response = await fetch('/api/admin/system-services/session-management/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
    } finally {
      setCleaning('');
    }
  };

  useEffect(() => {
    fetchStats();
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  if (isLoading) {
    return (
      <div className="geo-tracker-loading">
        <div className="loading-spinner">🔐</div>
        <p>Loading Session Management...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>🔐 Session Management</h2>
          <p>Automated session cleanup and monitoring</p>
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
        <div className="overview-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <span className="card-label">Public Sessions</span>
            <span className="card-value">{stats?.publicSessions?.toLocaleString() || 0}</span>
            <span className="card-sublabel">{stats?.expiredPublic || 0} expired</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">👨‍💼</div>
          <div className="card-content">
            <span className="card-label">Admin Sessions</span>
            <span className="card-value">{stats?.adminSessions?.toLocaleString() || 0}</span>
            <span className="card-sublabel">{stats?.expiredAdmin || 0} expired</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">📍</div>
          <div className="card-content">
            <span className="card-label">Geo Data</span>
            <span className="card-value">{stats?.sessionGeo?.toLocaleString() || 0}</span>
            <span className="card-sublabel">{stats?.oldDevices || 0} old devices</span>
          </div>
        </div>

        <div className="overview-card active">
          <div className="card-icon">🟢</div>
          <div className="card-content">
            <span className="card-label">Active Devices</span>
            <span className="card-value">{stats?.activeDevices?.toLocaleString() || 0}</span>
            <span className="card-sublabel">Last 7 days</span>
          </div>
        </div>
      </div>

      <div className="region-stats-section">
        <h3>📊 Cleanup Status</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">🔄</span>
              <span className="stat-county">Auto Cleanup</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Status</span>
                <span className="metric-value" style={{
                  color: stats?.autoCleanupEnabled ? 'var(--admin-primary)' : 'var(--status-warning)'
                }}>
                  {stats?.autoCleanupEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Last Run</span>
                <span className="metric-value" style={{ fontSize: '0.75rem' }}>
                  {stats?.lastCleanup || 'Never'}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">⏰</span>
              <span className="stat-county">Schedule</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Next Cleanup</span>
                <span className="metric-value" style={{ fontSize: '0.75rem' }}>
                  {stats?.nextScheduledCleanup || 'Not scheduled'}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Frequency</span>
                <span className="metric-value">24h</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">⚠️</span>
              <span className="stat-county">Pending Cleanup</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Expired</span>
                <span className="metric-value" style={{
                  color: ((stats?.expiredPublic || 0) + (stats?.expiredAdmin || 0)) > 100 ? 'var(--status-warning)' : 'var(--admin-primary)'
                }}>
                  {((stats?.expiredPublic || 0) + (stats?.expiredAdmin || 0)).toLocaleString()}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Old Devices</span>
                <span className="metric-value">{stats?.oldDevices || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tracker-filters-advanced">
        <div className="filters-header">
          <h3>🧹 Manual Cleanup Controls</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <button
            onClick={() => runCleanup('public')}
            disabled={!!cleaning}
            className="filter-apply-btn">
            {cleaning === 'public' ? '🔄 Cleaning...' : `👥 Public (${stats?.expiredPublic || 0})`}
          </button>

          <button
            onClick={() => runCleanup('admin')}
            disabled={!!cleaning}
            className="filter-apply-btn">
            {cleaning === 'admin' ? '🔄 Cleaning...' : `👨‍💼 Admin (${stats?.expiredAdmin || 0})`}
          </button>

          <button
            onClick={() => runCleanup('geo')}
            disabled={!!cleaning}
            className="filter-apply-btn">
            {cleaning === 'geo' ? '🔄 Cleaning...' : `📍 Geo (${stats?.oldDevices || 0})`}
          </button>

          <button
            onClick={() => runCleanup('all')}
            disabled={!!cleaning}
            className="filter-apply-btn">
            {cleaning === 'all' ? '🔄 Cleaning...' : '🧹 Clean All'}
          </button>
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>Auto-Cleanup:</strong> System automatically removes expired sessions daily. 
          Public sessions expire after 30 days, admin sessions after 7 days of inactivity. 
          Geographic data preserved, only stale device records cleaned (30+ days old).
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;