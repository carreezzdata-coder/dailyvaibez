import React, { useState, useEffect, useCallback } from 'react';

interface CacheStats {
  redis: {
    connected: boolean;
    keys: number;
    memory: string;
    hitRate: string;
    uptime: string;
  };
  cdn: {
    enabled: boolean;
    zones: number;
    bandwidth: string;
    cacheHitRatio: string;
  };
  memory: {
    size: string;
    entries: number;
    maxSize: string;
  };
  database: {
    cacheHitRatio: string;
    avgQueryTime: string;
    slowQueries: number;
    indexUsage: string;
  };
  performance: {
    averageResponseTime: string;
    cacheEfficiency: string;
    memoryUsage: string;
  };
}

const CacheOptimization: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purging, setPurging] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-services/cache-optimization/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purgeCache = async (type: string) => {
    setPurging(type);
    try {
      const response = await fetch('/api/admin/system-services/cache-optimization/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error purging cache:', error);
    } finally {
      setPurging('');
    }
  };

  const optimizeDatabase = async () => {
    setPurging('database');
    try {
      const response = await fetch('/api/admin/system-services/cache-optimization/optimize-db', {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error optimizing database:', error);
    } finally {
      setPurging('');
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
        <div className="loading-spinner">⚡</div>
        <p>Loading Cache & Optimization...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>⚡ Cache & Optimization Hub</h2>
          <p>Auto-hydrating system performance</p>
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
        <div className={`overview-card ${stats?.redis.connected ? 'active' : ''}`}>
          <div className="card-icon">🔴</div>
          <div className="card-content">
            <span className="card-label">Redis Cache</span>
            <span className="card-value">{stats?.redis.keys || 0}</span>
            <span className="card-sublabel">{stats?.redis.hitRate || '0%'} hit rate</span>
          </div>
        </div>

        <div className={`overview-card ${stats?.cdn.enabled ? 'active' : ''}`}>
          <div className="card-icon">🌐</div>
          <div className="card-content">
            <span className="card-label">CDN Cache</span>
            <span className="card-value">{stats?.cdn.zones || 0}</span>
            <span className="card-sublabel">{stats?.cdn.cacheHitRatio || '0%'} efficiency</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">💾</div>
          <div className="card-content">
            <span className="card-label">Memory Cache</span>
            <span className="card-value">{stats?.memory.entries || 0}</span>
            <span className="card-sublabel">{stats?.memory.size || '0 MB'}</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🗄️</div>
          <div className="card-content">
            <span className="card-label">Database</span>
            <span className="card-value">{stats?.database.avgQueryTime || '0ms'}</span>
            <span className="card-sublabel">{stats?.database.cacheHitRatio || '0%'} cache</span>
          </div>
        </div>
      </div>

      <div className="region-stats-section">
        <h3>📊 Performance Metrics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">🚀</span>
              <span className="stat-county">Response Time</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Average</span>
                <span className="metric-value">{stats?.performance?.averageResponseTime || '0ms'}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Efficiency</span>
                <span className="metric-value">{stats?.performance?.cacheEfficiency || '0%'}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">📈</span>
              <span className="stat-county">Database Performance</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Slow Queries</span>
                <span className="metric-value">{stats?.database.slowQueries || 0}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Index Usage</span>
                <span className="metric-value">{stats?.database.indexUsage || '0%'}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">💻</span>
              <span className="stat-county">Memory Status</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Usage</span>
                <span className="metric-value">{stats?.performance?.memoryUsage || '0%'}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Redis</span>
                <span className="metric-value">{stats?.redis.memory || '0 MB'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tracker-filters-advanced">
        <div className="filters-header">
          <h3>🔧 Cache Controls</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <button
            onClick={() => purgeCache('redis')}
            disabled={!!purging}
            className="filter-apply-btn">
            {purging === 'redis' ? '🔄 Purging...' : '🔴 Flush Redis'}
          </button>

          <button
            onClick={() => purgeCache('cdn')}
            disabled={!!purging}
            className="filter-apply-btn">
            {purging === 'cdn' ? '🔄 Purging...' : '🌐 Purge CDN'}
          </button>

          <button
            onClick={() => purgeCache('memory')}
            disabled={!!purging}
            className="filter-apply-btn">
            {purging === 'memory' ? '🔄 Clearing...' : '💾 Clear Memory'}
          </button>

          <button
            onClick={optimizeDatabase}
            disabled={!!purging}
            className="filter-apply-btn">
            {purging === 'database' ? '🔄 Optimizing...' : '🗄️ Optimize DB'}
          </button>
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>Auto-Optimization:</strong> System automatically manages cache invalidation, 
          database optimization, and memory cleanup. Manual controls available for immediate purge needs.
        </div>
      </div>
    </div>
  );
};

export default CacheOptimization;