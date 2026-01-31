'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface EngagementStats {
  activeUsers: number;
  totalUsers: number;
  volunteers: number;
  activeVolunteers: number;
  pendingReferrals: number;
  completedReferrals: number;
  unreadNotifications: number;
  totalBookmarks: number;
  avgReadingTime: string;
}

const UserEngagement: React.FC = () => {
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-services/user-engagement/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching engagement stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="geo-tracker-loading">
        <div className="loading-spinner">👥</div>
        <p>Loading User Engagement...</p>
      </div>
    );
  }

  return (
    <div className="geo-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>👥 User Engagement Tracker</h2>
          <p>Monitor user activity, volunteers, and platform engagement</p>
        </div>
        <div className="header-controls">
          <button className="refresh-btn" onClick={fetchStats}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="category-overview">
        <div className="overview-card active">
          <div className="card-icon">👤</div>
          <div className="card-content">
            <span className="card-label">Active Users</span>
            <span className="card-value">{stats?.activeUsers || 0}</span>
            <span className="card-sublabel">Last 30 days</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🙋</div>
          <div className="card-content">
            <span className="card-label">Total Users</span>
            <span className="card-value">{stats?.totalUsers || 0}</span>
            <span className="card-sublabel">All registered</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🤝</div>
          <div className="card-content">
            <span className="card-label">Volunteers</span>
            <span className="card-value">{stats?.volunteers || 0}</span>
            <span className="card-sublabel">{stats?.activeVolunteers || 0} active</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🎁</div>
          <div className="card-content">
            <span className="card-label">Referrals</span>
            <span className="card-value">{stats?.completedReferrals || 0}</span>
            <span className="card-sublabel">{stats?.pendingReferrals || 0} pending</span>
          </div>
        </div>
      </div>

      <div className="region-stats-section">
        <h3>📊 Engagement Metrics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">📖</span>
              <span className="stat-county">Reading Activity</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Bookmarks</span>
                <span className="metric-value">{stats?.totalBookmarks || 0}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Avg Time</span>
                <span className="metric-value">{stats?.avgReadingTime || '0m'}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-category">🔔</span>
              <span className="stat-county">Notifications</span>
            </div>
            <div className="stat-metrics">
              <div className="metric">
                <span className="metric-label">Unread</span>
                <span className="metric-value">{stats?.unreadNotifications || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cleanup-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <strong>About User Engagement:</strong> Track user activity patterns, volunteer 
          participation, referral programs, and overall platform engagement metrics to understand 
          user behavior and optimize content delivery.
        </div>
      </div>
    </div>
  );
};

export default UserEngagement;