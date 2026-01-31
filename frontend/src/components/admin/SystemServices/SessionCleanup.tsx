'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface CleanupStats {
  publicSessions: number;
  expiredPublic: number;
  adminSessions: number;
  expiredAdmin: number;
  sessionGeo: number;
  activeDevices: number;
  oldDevices: number;
}

interface SchedulerStatus {
  isRunning: boolean;
  lastRun: string | null;
  nextRun: string | null;
  interval: string;
}

const SessionCleanup: React.FC = () => {
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsResponse, statusResponse] = await Promise.all([
        fetch('/api/admin/system-services/cleanup?action=stats', {
          credentials: 'include',
          cache: 'no-store'
        }),
        fetch('/api/admin/system-services/cleanup?action=status', {
          credentials: 'include',
          cache: 'no-store'
        })
      ]);

      if (!statsResponse.ok || !statusResponse.ok) {
        throw new Error(`HTTP Error: Stats ${statsResponse.status}, Status ${statusResponse.status}`);
      }

      const statsData = await statsResponse.json();
      const statusData = await statusResponse.json();

      if (statsData.success) {
        setStats(statsData.stats);
      } else {
        setError(statsData.message || 'Failed to load stats');
      }

      if (statusData.success) {
        setSchedulerStatus(statusData.status);
      }

      setError(null);
    } catch (error) {
      console.error('Error fetching cleanup data:', error);
      setError('Failed to load cleanup data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runManualCleanup = async (type: 'public' | 'admin') => {
    const sessionType = type === 'public' ? 'Public' : 'Admin';
    const expiredCount = type === 'public' ? stats?.expiredPublic : stats?.expiredAdmin;
    
    if (!confirm(`Clean ${expiredCount || 0} expired ${sessionType} sessions?`)) {
      return;
    }

    setCleanupLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/system-services/cleanup?action=run-now&type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Cleanup failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const deletedCount = type === 'public' ? data.results.publicSessions : data.results.adminSessions;
        alert(`${sessionType} Cleanup completed!\n\nDeleted: ${deletedCount} sessions\nTime: ${data.results.duration}ms`);
        await fetchData();
      } else {
        throw new Error(data.message || 'Cleanup failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Manual cleanup error:', error);
      setError(`Cleanup failed: ${errorMessage}`);
      alert(`Cleanup failed: ${errorMessage}`);
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="geo-tracker-loading">
        <div className="loading-spinner"></div>
        <p>Loading Session Cleanup...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>Session Cleanup Service</h2>
          <p>Automated management of sessions and cookies</p>
        </div>
        <div className="header-controls">
          <button className="refresh-btn" onClick={fetchData}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-banner-icon"></div>
          <div className="error-banner-content">{error}</div>
          <button className="error-banner-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="category-overview">
        <div className="overview-card">
          <div className="card-icon"></div>
          <div className="card-content">
            <span className="card-label">Public Sessions</span>
            <span className="card-value">{stats?.publicSessions?.toLocaleString() || 0}</span>
            <span className="card-sublabel">{stats?.expiredPublic || 0} expired</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon"></div>
          <div className="card-content">
            <span className="card-label">Admin Sessions</span>
            <span className="card-value">{stats?.adminSessions?.toLocaleString() || 0}</span>
            <span className="card-sublabel">{stats?.expiredAdmin || 0} expired</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon"></div>
          <div className="card-content">
            <span className="card-label">Geo Data</span>
            <span className="card-value">{stats?.sessionGeo?.toLocaleString() || 0}</span>
            <span className="card-sublabel">{stats?.oldDevices || 0} devices 30+ days old</span>
          </div>
        </div>

        <div className="overview-card active">
          <div className="card-icon"></div>
          <div className="card-content">
            <span className="card-label">Active Devices</span>
            <span className="card-value">{stats?.activeDevices?.toLocaleString() || 0}</span>
            <span className="card-sublabel">Last 7 days</span>
          </div>
        </div>
      </div>

      <div className="tracker-filters-advanced">
        <div className="filters-header">
          <h3>Cleanup Status</h3>
        </div>
        
        <div style={{ 
          padding: '1rem',
          background: 'var(--bg-content)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Expired Public Sessions
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stats?.expiredPublic ? 'var(--status-warning)' : 'var(--admin-primary)' }}>
                {stats?.expiredPublic || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Expired Admin Sessions
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stats?.expiredAdmin ? 'var(--status-warning)' : 'var(--admin-primary)' }}>
                {stats?.expiredAdmin || 0}
              </div>
            </div>
          </div>
          
          <div style={{ 
            padding: '0.75rem',
            background: 'rgba(0, 255, 136, 0.1)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <span className="status-indicator online" style={{ marginRight: '0.5rem' }} />
            {schedulerStatus?.lastRun 
              ? `Last run: ${new Date(schedulerStatus.lastRun).toLocaleString()}`
              : 'Ready for manual cleanup'}
          </div>
        </div>

        <div className="filters-header">
          <h3>Session Cleanup Controls</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button
            className="filter-apply-btn"
            onClick={() => runManualCleanup('public')}
            disabled={cleanupLoading}
            style={{ width: '100%' }}
          >
            {cleanupLoading ? 'Running...' : `Clean Public Sessions (${stats?.expiredPublic || 0})`}
          </button>

          <button
            className="filter-apply-btn"
            onClick={() => runManualCleanup('admin')}
            disabled={cleanupLoading}
            style={{ width: '100%' }}
          >
            {cleanupLoading ? 'Running...' : `Clean Admin Sessions (${stats?.expiredAdmin || 0})`}
          </button>
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon"></div>
        <div className="notice-content">
          <strong>About Session Cleanup:</strong> Two independent cleanup controls. Public sessions are from website visitors. Admin sessions are from admin panel users. Clean expired sessions separately as needed. Geographic tracking data is always preserved.
        </div>
      </div>
    </div>
  );
};

export default SessionCleanup;