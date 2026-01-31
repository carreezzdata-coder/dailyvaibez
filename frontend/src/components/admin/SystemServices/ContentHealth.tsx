import React, { useState, useEffect, useCallback } from 'react';

interface ContentStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  archivedArticles: number;
  articlesWithoutImages: number;
  articlesWithoutCategories: number;
  brokenSocialEmbeds: number;
  orphanedComments: number;
}

const ContentHealth: React.FC = () => {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-services/content-health', {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching content health stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runHealthScan = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/admin/system-services/content-health', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' })
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error running health scan:', error);
    } finally {
      setScanning(false);
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
        <div className="loading-spinner">📰</div>
        <p>Loading Content Health...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>📰 Content Health Monitor</h2>
          <p>Monitor and maintain content integrity across the platform</p>
        </div>
        <div className="header-controls">
          <button
            className={`toggle-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? '🟢 Auto' : '⚪ Manual'}
          </button>
          <button
            className="refresh-btn"
            onClick={runHealthScan}
            disabled={scanning}
          >
            {scanning ? '🔄 Scanning...' : '🔍 Run Health Scan'}
          </button>
        </div>
      </div>

      <div className="category-overview">
        <div className="overview-card">
          <div className="card-icon">📝</div>
          <div className="card-content">
            <span className="card-label">Total Articles</span>
            <span className="card-value">{stats?.totalArticles || 0}</span>
            <span className="card-sublabel">All content items</span>
          </div>
        </div>

        <div className="overview-card active">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <span className="card-label">Published</span>
            <span className="card-value">{stats?.publishedArticles || 0}</span>
            <span className="card-sublabel">Live articles</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <span className="card-label">Drafts</span>
            <span className="card-value">{stats?.draftArticles || 0}</span>
            <span className="card-sublabel">Unpublished content</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🗃️</div>
          <div className="card-content">
            <span className="card-label">Archived</span>
            <span className="card-value">{stats?.archivedArticles || 0}</span>
            <span className="card-sublabel">Old content</span>
          </div>
        </div>
      </div>

      <div className="region-stats-section">
        <h3>🚨 Content Issues</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">🖼️</span>
              <span className="stat-county">Missing Images</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Count</span>
                <span className="metric-value">{stats?.articlesWithoutImages || 0}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Severity</span>
                <span className="metric-value" style={{
                  color: (stats?.articlesWithoutImages || 0) > 10 ? 'var(--status-warning)' : 'var(--status-success)'
                }}>
                  {(stats?.articlesWithoutImages || 0) > 10 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">🏷️</span>
              <span className="stat-county">Missing Categories</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Count</span>
                <span className="metric-value">{stats?.articlesWithoutCategories || 0}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Severity</span>
                <span className="metric-value" style={{
                  color: (stats?.articlesWithoutCategories || 0) > 5 ? 'var(--status-danger)' : 'var(--status-success)'
                }}>
                  {(stats?.articlesWithoutCategories || 0) > 5 ? 'High' : 'Low'}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">🔗</span>
              <span className="stat-county">Broken Social Embeds</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Count</span>
                <span className="metric-value">{stats?.brokenSocialEmbeds || 0}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Severity</span>
                <span className="metric-value" style={{
                  color: (stats?.brokenSocialEmbeds || 0) > 0 ? 'var(--status-warning)' : 'var(--status-success)'
                }}>
                  {(stats?.brokenSocialEmbeds || 0) > 0 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">💬</span>
              <span className="stat-county">Orphaned Comments</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Count</span>
                <span className="metric-value">{stats?.orphanedComments || 0}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Severity</span>
                <span className="metric-value" style={{
                  color: (stats?.orphanedComments || 0) > 0 ? 'var(--status-danger)' : 'var(--status-success)'
                }}>
                  {(stats?.orphanedComments || 0) > 0 ? 'High' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>About Content Health:</strong> This monitor validates your content structure, 
          identifies missing or broken elements, and helps maintain data quality across articles, 
          images, categories, and social media embeds.
        </div>
      </div>
    </div>
  );
};

export default ContentHealth;