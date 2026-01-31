import React, { useState, useEffect, useCallback } from 'react';

interface MediaStats {
  totalImages: number;
  cloudflareImages: number;
  localImages: number;
  orphanedFiles: number;
  totalStorageUsed: string;
  unusedVariants: number;
  duplicateImages: number;
}

const MediaOptimizer: React.FC = () => {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-services/media-optimizer', {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching media stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const optimizeStorage = async (type: string) => {
    setOptimizing(true);
    try {
      const response = await fetch('/api/admin/system-services/media-optimizer', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: type })
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error optimizing storage:', error);
    } finally {
      setOptimizing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  if (isLoading) {
    return (
      <div className="geo-tracker-loading">
        <div className="loading-spinner">🖼️</div>
        <p>Loading Media Optimizer...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>🖼️ Media Storage Optimizer</h2>
          <p>Manage images, variants, and storage across the platform</p>
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
          <div className="card-icon">📊</div>
          <div className="card-content">
            <span className="card-label">Total Images</span>
            <span className="card-value">{stats?.totalImages || 0}</span>
            <span className="card-sublabel">All images</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">☁️</div>
          <div className="card-content">
            <span className="card-label">Cloudflare</span>
            <span className="card-value">{stats?.cloudflareImages || 0}</span>
            <span className="card-sublabel">CDN images</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">💾</div>
          <div className="card-content">
            <span className="card-label">Local Storage</span>
            <span className="card-value">{stats?.localImages || 0}</span>
            <span className="card-sublabel">Server images</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <span className="card-label">Storage Used</span>
            <span className="card-value">{stats?.totalStorageUsed || '0 GB'}</span>
            <span className="card-sublabel">Total size</span>
          </div>
        </div>
      </div>

      <div className="tracker-filters-advanced">
        <div className="filters-header">
          <h3>🔧 Optimization Actions</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => optimizeStorage('orphaned')}
            disabled={optimizing}
            className="filter-apply-btn"
          >
            {optimizing ? '🔄 Processing...' : `🗑️ Clean Orphaned Files (${stats?.orphanedFiles || 0})`}
          </button>

          <button
            onClick={() => optimizeStorage('duplicates')}
            disabled={optimizing}
            className="filter-apply-btn"
          >
            {optimizing ? '🔄 Processing...' : `🔍 Remove Duplicates (${stats?.duplicateImages || 0})`}
          </button>

          <button
            onClick={() => optimizeStorage('variants')}
            disabled={optimizing}
            className="filter-apply-btn"
          >
            {optimizing ? '🔄 Processing...' : `🔍 Clean Unused Variants (${stats?.unusedVariants || 0})`}
          </button>
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>About Media Optimization:</strong> This tool helps manage image storage, 
          removes orphaned files, identifies duplicates, and optimizes Cloudflare image variants 
          to reduce storage costs and improve performance.
        </div>
      </div>
    </div>
  );
};

export default MediaOptimizer;