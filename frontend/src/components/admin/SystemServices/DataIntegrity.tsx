import React, { useState, useEffect, useCallback } from 'react';

interface IntegrityStats {
  orphanedComments: number;
  orphanedReactions: number;
  invalidNewsCategories: number;
  brokenImageReferences: number;
  duplicateUsers: number;
  lastCheckDate: string;
  checksRun: number;
  issuesFixed: number;
}

const DataIntegrity: React.FC = () => {
  const [stats, setStats] = useState<IntegrityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-services/data-integrity', {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching integrity stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runIntegrityCheck = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/admin/system-services/data-integrity', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' })
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error running integrity check:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 120000);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  if (isLoading) {
    return (
      <div className="geo-tracker-loading">
        <div className="loading-spinner">🔍</div>
        <p>Loading Data Integrity...</p>
      </div>
    );
  }

  const totalIssues = (stats?.orphanedComments || 0) + 
                      (stats?.orphanedReactions || 0) + 
                      (stats?.invalidNewsCategories || 0) + 
                      (stats?.brokenImageReferences || 0) + 
                      (stats?.duplicateUsers || 0);

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>🔍 Data Integrity Checker</h2>
          <p>Validate database relationships and fix integrity issues</p>
        </div>
        <div className="header-controls">
          <button
            className={`toggle-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? '🟢 Auto' : '⚪ Manual'}
          </button>
          <button
            className="refresh-btn"
            onClick={runIntegrityCheck}
            disabled={checking}
          >
            {checking ? '🔄 Checking...' : '🔍 Run Check'}
          </button>
        </div>
      </div>

      <div className="category-overview">
        <div className={`overview-card ${totalIssues === 0 ? 'active' : ''}`}>
          <div className="card-icon">{totalIssues === 0 ? '✅' : '⚠️'}</div>
          <div className="card-content">
            <span className="card-label">Integrity Status</span>
            <span className="card-value">{totalIssues === 0 ? 'Pass' : 'Issues Found'}</span>
            <span className="card-sublabel">{totalIssues} total issues</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🔧</div>
          <div className="card-content">
            <span className="card-label">Checks Run</span>
            <span className="card-value">{stats?.checksRun || 0}</span>
            <span className="card-sublabel">Lifetime</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">✨</div>
          <div className="card-content">
            <span className="card-label">Issues Fixed</span>
            <span className="card-value">{stats?.issuesFixed || 0}</span>
            <span className="card-sublabel">Lifetime</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <span className="card-label">Last Check</span>
            <span className="card-value" style={{ fontSize: '1rem' }}>
              {stats?.lastCheckDate || 'Never'}
            </span>
            <span className="card-sublabel">Most recent scan</span>
          </div>
        </div>
      </div>

      <div className="region-stats-section">
        <h3>🚨 Detected Issues</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">💬</span>
              <span className="stat-county">Orphaned Comments</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Count</span>
                <span className="metric-value" style={{
                  color: (stats?.orphanedComments || 0) > 0 ? 'var(--status-danger)' : 'var(--status-success)'
                }}>
                  {stats?.orphanedComments || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">❤️</span>
              <span className="stat-county">Orphaned Reactions</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Count</span>
                <span className="metric-value" style={{
                  color: (stats?.orphanedReactions || 0) > 0 ? 'var(--status-danger)' : 'var(--status-success)'
                }}>
                  {stats?.orphanedReactions || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">🏷️</span>
              <span className="stat-county">Invalid Categories</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Count</span>
                <span className="metric-value" style={{
                  color: (stats?.invalidNewsCategories || 0) > 0 ? 'var(--status-danger)' : 'var(--status-success)'
                }}>
                  {stats?.invalidNewsCategories || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">🖼️</span>
              <span className="stat-county">Broken Images</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Count</span>
                <span className="metric-value" style={{
                  color: (stats?.brokenImageReferences || 0) > 0 ? 'var(--status-warning)' : 'var(--status-success)'
                }}>
                  {stats?.brokenImageReferences || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">👥</span>
              <span className="stat-county">Duplicate Users</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Count</span>
                <span className="metric-value" style={{
                  color: (stats?.duplicateUsers || 0) > 0 ? 'var(--status-danger)' : 'var(--status-success)'
                }}>
                  {stats?.duplicateUsers || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>About Data Integrity:</strong> This checker validates foreign key relationships, 
          identifies orphaned records, detects duplicate entries, and ensures database consistency 
          across all tables and relationships.
        </div>
      </div>
    </div>
  );
};

export default DataIntegrity;