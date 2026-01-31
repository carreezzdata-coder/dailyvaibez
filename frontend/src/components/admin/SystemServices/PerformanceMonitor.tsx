import React, { useState, useEffect, useCallback } from 'react';

interface PerformanceStats {
  avgQueryTime: string;
  slowQueries: number;
  totalQueries: number;
  cacheHitRate: string;
  indexUsage: string;
  tableScans: number;
  connectionPoolUsage: string;
  activeConnections: number;
}

const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-services/performance-monitor', {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching performance stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        <div className="loading-spinner">⚡</div>
        <p>Loading Performance Monitor...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>⚡ Performance Monitor</h2>
          <p>Real-time database and query performance metrics</p>
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
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <span className="card-label">Avg Query Time</span>
            <span className="card-value">{stats?.avgQueryTime || '0ms'}</span>
            <span className="card-sublabel">Response time</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🐌</div>
          <div className="card-content">
            <span className="card-label">Slow Queries</span>
            <span className="card-value">{stats?.slowQueries || 0}</span>
            <span className="card-sublabel">{stats?.totalQueries || 0} total</span>
          </div>
        </div>

        <div className="overview-card active">
          <div className="card-icon">💾</div>
          <div className="card-content">
            <span className="card-label">Cache Hit Rate</span>
            <span className="card-value">{stats?.cacheHitRate || '0%'}</span>
            <span className="card-sublabel">Cache efficiency</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🔗</div>
          <div className="card-content">
            <span className="card-label">Connections</span>
            <span className="card-value">{stats?.activeConnections || 0}</span>
            <span className="card-sublabel">{stats?.connectionPoolUsage || '0%'} pool</span>
          </div>
        </div>
      </div>

      <div className="region-stats-section">
        <h3>📊 Query Performance</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">📇</span>
              <span className="stat-county">Index Usage</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Usage Rate</span>
                <span className="metric-value">{stats?.indexUsage || '0%'}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Table Scans</span>
                <span className="metric-value">{stats?.tableScans || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>About Performance Monitoring:</strong> Track query execution times, identify 
          slow queries, monitor cache efficiency, and optimize database performance for better 
          application responsiveness.
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;