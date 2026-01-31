'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SessionProvider, useSession } from '@/components/includes/Session';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: sessionLoading, logout } = useSession();

  useEffect(() => {
    if (sessionLoading) return;

    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    const authorizedRoles = ['admin', 'super_admin', 'editor', 'moderator'];
    if (!authorizedRoles.includes(user.role)) {
      router.push('/client');
      return;
    }

    setIsLoading(false);
  }, [sessionLoading, isAuthenticated, user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href);
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading Admin...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="admin-dashboard">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-brand">
          <h1>Daily Vaibe</h1>
          <span className="admin-badge-mobile">Admin</span>
        </div>
        <div className="mobile-controls">
          <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-brand">
            <h2>Daily Vaibe</h2>
            <span className="admin-badge">Admin</span>
          </div>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>

        <div className="admin-profile">
          <div className="profile-avatar">
            {user.first_name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h3>{`${user.first_name} ${user.last_name}`}</h3>
            <p>{user.role.replace('_', ' ')}</p>
          </div>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className={`nav-item ${isActive('/admin') && pathname === '/admin' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </Link>

          <Link href="/admin/analytics" className={`nav-item ${isActive('/admin/analytics') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📊</span>
            <span className="nav-label">Analytics</span>
          </Link>

          <div className="nav-section">
            <div className="nav-section-title">Posts</div>
            <Link href="/admin/posts" className={`nav-item ${isActive('/admin/posts') && pathname === '/admin/posts' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">📰</span>
              <span className="nav-label">All Posts</span>
            </Link>
            <Link href="/admin/posts/create" className={`nav-item ${isActive('/admin/posts/create') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">✏️</span>
              <span className="nav-label">Create Post</span>
            </Link>
            <Link href="/admin/posts/pending" className={`nav-item ${isActive('/admin/posts/pending') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">⏳</span>
              <span className="nav-label">Pending</span>
            </Link>
            <Link href="/admin/posts/share" className={`nav-item ${isActive('/admin/posts/share') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">📤</span>
              <span className="nav-label">Share</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Content</div>
            <Link href="/admin/quotes/create" className={`nav-item ${isActive('/admin/quotes') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">💬</span>
              <span className="nav-label">Quotes</span>
            </Link>
            <Link href="/admin/videos/create" className={`nav-item ${isActive('/admin/videos') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">🎥</span>
              <span className="nav-label">Videos</span>
            </Link>
          </div>

          <Link href="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">👥</span>
            <span className="nav-label">Users</span>
          </Link>

          <Link href="/admin/roles" className={`nav-item ${isActive('/admin/roles') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🔑</span>
            <span className="nav-label">Roles</span>
          </Link>

          <Link href="/admin/system" className={`nav-item ${isActive('/admin/system') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">System</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-action-btn logout-btn" onClick={handleLogout}>
            <span className="action-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}