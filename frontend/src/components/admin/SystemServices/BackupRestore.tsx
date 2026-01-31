import React, { useState, useEffect, useCallback } from 'react';

interface BackupStats {
  lastBackupDate: string;
  backupSize: string;
  totalBackups: number;
  autoBackupEnabled: boolean;
  nextScheduledBackup: string;
}

const BackupRestore: React.FC = () => {
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-services/backup-restore', {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching backup stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBackup = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/admin/system-services/backup-restore', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setCreating(false);
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
        <div className="loading-spinner">💾</div>
        <p>Loading Backup & Restore...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>💾 Backup & Restore</h2>
          <p>Database backup management and restore points</p>
        </div>
        <div className="header-controls">
          <button
            className={`toggle-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? '🟢 Auto' : '⚪ Manual'}
          </button>
          <button
            className="refresh-btn"
            onClick={createBackup}
            disabled={creating}
          >
            {creating ? '🔄 Creating...' : '💾 Create Backup'}
          </button>
        </div>
      </div>

      <div className="category-overview">
        <div className="overview-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <span className="card-label">Last Backup</span>
            <span className="card-value" style={{ fontSize: '0.9rem' }}>
              {stats?.lastBackupDate || 'Never'}
            </span>
            <span className="card-sublabel">Most recent</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <span className="card-label">Backup Size</span>
            <span className="card-value">{stats?.backupSize || '0 GB'}</span>
            <span className="card-sublabel">Last backup</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <span className="card-label">Total Backups</span>
            <span className="card-value">{stats?.totalBackups || 0}</span>
            <span className="card-sublabel">Available</span>
          </div>
        </div>

        <div className={`overview-card ${stats?.autoBackupEnabled ? 'active' : ''}`}>
          <div className="card-icon">{stats?.autoBackupEnabled ? '✅' : '⚠️'}</div>
          <div className="card-content">
            <span className="card-label">Auto Backup</span>
            <span className="card-value">{stats?.autoBackupEnabled ? 'On' : 'Off'}</span>
            <span className="card-sublabel">
              {stats?.autoBackupEnabled ? stats?.nextScheduledBackup : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>About Backups:</strong> Regular database backups protect your data. 
          Enable automatic backups for scheduled protection, or create manual backups 
          before major changes. Store backups securely and test restore procedures regularly.
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;