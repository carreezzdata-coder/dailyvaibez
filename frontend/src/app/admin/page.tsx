'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/includes/Session';
import { usePermissions } from '@/components/admin/adminhooks/usePermissions';

interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  archived_posts: number;
  pending_approvals: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_users: number;
  user_role: string;
  is_global_stats: boolean;
}

export default function AdminDashboard() {
  const { user, csrfToken } = useSession();
  const { canApprove, canManageUsers } = usePermissions();
  
  const [stats, setStats] = useState<DashboardStats>({
    total_posts: 0,
    published_posts: 0,
    draft_posts: 0,
    archived_posts: 0,
    pending_approvals: 0,
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    total_users: 0,
    user_role: 'moderator',
    is_global_stats: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchUnreadMessages();
    
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [csrfToken]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/admin?endpoint=stats', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch('/api/admin/adminmessages?endpoint=unread-count', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadMessages(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'role-badge-super-admin';
      case 'admin':
        return 'role-badge-admin';
      case 'editor':
        return 'role-badge-editor';
      case 'moderator':
        return 'role-badge-moderator';
      default:
        return 'role-badge-default';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'editor':
        return 'Editor';
      case 'moderator':
        return 'Moderator';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            {getCurrentGreeting()}, {user?.first_name}! 👋
          </h1>
          <p className="hero-subtitle">
            Welcome back to your Daily Vaibe Admin Dashboard
          </p>
          <div className="hero-meta">
            <span className={`role-badge ${getRoleBadgeColor(stats.user_role)}`}>
              {getRoleDisplayName(stats.user_role)}
            </span>
            {stats.is_global_stats && (
              <span className="stats-scope-badge">Global Stats</span>
            )}
            {!stats.is_global_stats && (
              <span className="stats-scope-badge personal">Your Stats</span>
            )}
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card dashboard-stat-card-primary">
          <div className="dashboard-stat-icon">📰</div>
          <div className="dashboard-stat-content">
            <h3 className="dashboard-stat-value">{formatNumber(stats.total_posts)}</h3>
            <p className="dashboard-stat-label">Total Articles</p>
          </div>
        </div>

        <div className="dashboard-stat-card dashboard-stat-card-success">
          <div className="dashboard-stat-icon">✅</div>
          <div className="dashboard-stat-content">
            <h3 className="dashboard-stat-value">{formatNumber(stats.published_posts)}</h3>
            <p className="dashboard-stat-label">Published</p>
          </div>
        </div>

        <div className="dashboard-stat-card dashboard-stat-card-warning">
          <div className="dashboard-stat-icon">📝</div>
          <div className="dashboard-stat-content">
            <h3 className="dashboard-stat-value">{formatNumber(stats.draft_posts)}</h3>
            <p className="dashboard-stat-label">Drafts</p>
          </div>
        </div>

        <div className="dashboard-stat-card dashboard-stat-card-info">
          <div className="dashboard-stat-icon">👁️</div>
          <div className="dashboard-stat-content">
            <h3 className="dashboard-stat-value">{formatNumber(stats.total_views)}</h3>
            <p className="dashboard-stat-label">Total Views</p>
          </div>
        </div>

        <div className="dashboard-stat-card dashboard-stat-card-danger">
          <div className="dashboard-stat-icon">❤️</div>
          <div className="dashboard-stat-content">
            <h3 className="dashboard-stat-value">{formatNumber(stats.total_likes)}</h3>
            <p className="dashboard-stat-label">Total Likes</p>
          </div>
        </div>

        <div className="dashboard-stat-card dashboard-stat-card-purple">
          <div className="dashboard-stat-icon">💬</div>
          <div className="dashboard-stat-content">
            <h3 className="dashboard-stat-value">{formatNumber(stats.total_comments)}</h3>
            <p className="dashboard-stat-label">Comments</p>
          </div>
        </div>

        {canApprove && (
          <div className="dashboard-stat-card dashboard-stat-card-orange">
            <div className="dashboard-stat-icon">⏳</div>
            <div className="dashboard-stat-content">
              <h3 className="dashboard-stat-value">{stats.pending_approvals}</h3>
              <p className="dashboard-stat-label">Pending</p>
            </div>
          </div>
        )}

        {canManageUsers && (
          <div className="dashboard-stat-card dashboard-stat-card-cyan">
            <div className="dashboard-stat-icon">👥</div>
            <div className="dashboard-stat-content">
              <h3 className="dashboard-stat-value">{formatNumber(stats.total_users)}</h3>
              <p className="dashboard-stat-label">Total Users</p>
            </div>
          </div>
        )}
      </div>

      <section className="dashboard-quick-actions">
        <h2 className="dashboard-section-title">
          <span className="dashboard-title-icon">⚡</span>
          Quick Actions
        </h2>
        <div className="dashboard-actions-grid">
          <Link href="/admin/posts/create" className="dashboard-action-card">
            <div className="dashboard-icon-tile">
              <div className="dashboard-action-icon">✏️</div>
            </div>
            <h3>Create Post</h3>
            <p>Write a new article</p>
            <div className="dashboard-action-arrow">→</div>
          </Link>

          <Link href="/admin/posts" className="dashboard-action-card">
            <div className="dashboard-icon-tile">
              <div className="dashboard-action-icon">📋</div>
            </div>
            <h3>Manage Posts</h3>
            <p>View all articles</p>
            <div className="dashboard-action-arrow">→</div>
          </Link>

          {canApprove && (
            <Link href="/admin/posts/pending" className="dashboard-action-card">
              <div className="dashboard-icon-tile">
                <div className="dashboard-action-icon">✅</div>
              </div>
              <h3>Approvals</h3>
              <p>Review pending posts</p>
              <div className="dashboard-action-arrow">→</div>
            </Link>
          )}

          <Link href="/admin/analytics" className="dashboard-action-card">
            <div className="dashboard-icon-tile">
              <div className="dashboard-action-icon">📊</div>
            </div>
            <h3>Analytics</h3>
            <p>View insights</p>
            <div className="dashboard-action-arrow">→</div>
          </Link>

          <Link href="/admin/quotes/create" className="dashboard-action-card">
            <div className="dashboard-icon-tile">
              <div className="dashboard-action-icon">💬</div>
            </div>
            <h3>Add Quote</h3>
            <p>Create new quote</p>
            <div className="dashboard-action-arrow">→</div>
          </Link>

          {canManageUsers && (
            <Link href="/admin/users" className="dashboard-action-card">
              <div className="dashboard-icon-tile">
                <div className="dashboard-action-icon">👥</div>
              </div>
              <h3>Manage Users</h3>
              <p>User management</p>
              <div className="dashboard-action-arrow">→</div>
            </Link>
          )}

          <Link href="/admin/videos/create" className="dashboard-action-card">
            <div className="dashboard-icon-tile">
              <div className="dashboard-action-icon">🎥</div>
            </div>
            <h3>Add Video</h3>
            <p>Upload social video</p>
            <div className="dashboard-action-arrow">→</div>
          </Link>

          <Link href="/admin/messages" className="dashboard-action-card">
            <div className="dashboard-icon-tile">
              <div className="dashboard-action-icon">💬</div>
              {unreadMessages > 0 && (
                <span className="notification-badge">{unreadMessages}</span>
              )}
            </div>
            <h3>Messages</h3>
            <p>Admin communications</p>
            <div className="dashboard-action-arrow">→</div>
          </Link>

          {user && ['super_admin', 'admin'].includes(user.role) && (
            <Link href="/admin/system" className="dashboard-action-card">
              <div className="dashboard-icon-tile">
                <div className="dashboard-action-icon">⚙️</div>
              </div>
              <h3>System</h3>
              <p>Admin settings</p>
              <div className="dashboard-action-arrow">→</div>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}