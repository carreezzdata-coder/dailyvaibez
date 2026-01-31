'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@/components/includes/Session';

interface PendingPost {
  news_id: number;
  title: string;
  excerpt: string;
  workflow_status: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  author_id: number;
  author_name: string;
  author_role: string;
  category_name: string;
  category_id: number;
  review_count: number;
}

const PendingApprovals: React.FC = () => {
  const { user, csrfToken, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAuthorRole, setFilterAuthorRole] = useState<string>('moderator');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'submitted' | 'created' | 'title'>('submitted');
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchControllerRef = useRef<AbortController | null>(null);
  const submitControllerRef = useRef<AbortController | null>(null);

  const canApprove = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'editor';
  const canView = canApprove;

  useEffect(() => {
    if (!sessionLoading && isAuthenticated && canView) {
      fetchPendingPosts();
    } else if (!sessionLoading && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [sessionLoading, isAuthenticated, canView]);

  const fetchPendingPosts = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    
    try {
      const response = await fetch('/api/admin/posts/pending', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        setError(error instanceof Error ? error.message : 'Network error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (newsId: number) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    submitControllerRef.current?.abort();
    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      const response = await fetch(`/api/admin/posts/${newsId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          action: reviewAction,
          comments: reviewComments.trim()
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const data = await response.json();

      if (data.success) {
        setSelectedPost(null);
        setReviewComments('');
        fetchPendingPosts();
      } else {
        throw new Error(data.message || 'Review submission failed');
      }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        setError(error instanceof Error ? error.message : 'Network error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAndSortedPosts = posts
    .filter(post => post.author_role === 'moderator')
    .filter(post => {
      const matchesRole = filterAuthorRole === 'all' || post.author_role === filterAuthorRole;
      const matchesSearch = searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'submitted') {
        return new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime();
      } else if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'super_admin': '#dc2626',
      'admin': '#2563eb',
      'editor': '#059669',
      'moderator': '#ea580c'
    };
    return colors[role] || '#6b7280';
  };

  const getTimeDifference = (date: string) => {
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diff = now - then;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (sessionLoading || (isLoading && posts.length === 0)) {
    return (
      <div className="pending-approvals-loading">
        <div className="loading-spinner"></div>
        <p>Loading pending posts...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="pending-approvals-container">
        <div className="access-denied">
          <div className="access-denied-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>Please log in to view pending approvals</p>
          <button 
            onClick={() => window.location.href = '/admin/login'}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--vybez-primary)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            aria-label="Go to login">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="pending-approvals-container">
        <div className="access-denied">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>You don't have permission to view pending approvals</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#6b7280' }}>
            Only Super Admins, Admins, and Editors can approve posts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-approvals-container">
      <div className="pending-header">
        <div className="header-content">
          <h1>📋 Pending Approvals</h1>
          <p className="header-subtitle">
            Review and approve posts from moderators (workflow_status = pending_review)
          </p>
        </div>
        <button 
          className="refresh-btn" 
          onClick={fetchPendingPosts}
          disabled={isLoading}
          aria-label="Refresh posts">
          {isLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Close error">✕</button>
        </div>
      )}

      <div className="pending-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select value={filterAuthorRole} onChange={(e) => setFilterAuthorRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="moderator">Moderators</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'submitted' | 'created' | 'title')}>
            <option value="submitted">Sort by Submitted</option>
            <option value="created">Sort by Created</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      <div className="pending-stats">
        <div className="stat-card">
          <div className="stat-value">{filteredAndSortedPosts.length}</div>
          <div className="stat-label">Total Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredAndSortedPosts.filter(p => p.review_count > 0).length}</div>
          <div className="stat-label">In Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredAndSortedPosts.filter(p => {
            const submitted = new Date(p.submitted_at || p.created_at);
            const now = new Date();
            return (now.getTime() - submitted.getTime()) > 86400000;
          }).length}</div>
          <div className="stat-label">Over 24h</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredAndSortedPosts.filter(p => {
            const submitted = new Date(p.submitted_at || p.created_at);
            const now = new Date();
            return (now.getTime() - submitted.getTime()) > 259200000;
          }).length}</div>
          <div className="stat-label">Over 3 days</div>
        </div>
      </div>

      {filteredAndSortedPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No Pending Posts</h3>
          <p>All moderator posts have been reviewed or no posts match your filters</p>
        </div>
      ) : (
        <div className="pending-posts-grid">
          {filteredAndSortedPosts.map(post => (
            <div 
              key={post.news_id} 
              className={`pending-post-card ${selectedPost === post.news_id ? 'reviewing' : ''}`}
            >
              <div className="post-card-header">
                <div className="post-title-section">
                  <h3 className="post-title">{post.title}</h3>
                  {post.review_count > 0 && (
                    <span className="review-badge">
                      👁️ {post.review_count} review{post.review_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span className="time-badge">
                  {getTimeDifference(post.submitted_at || post.created_at)}
                </span>
              </div>

              <p className="post-excerpt">
                {post.excerpt || post.title.substring(0, 150) + '...'}
              </p>

              <div className="post-card-meta">
                <div className="meta-row">
                  <div className="author-info">
                    <div className="author-avatar">
                      {post.author_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="author-details">
                      <span className="author-name">{post.author_name}</span>
                      <span 
                        className="author-role"
                        style={{ color: getRoleColor(post.author_role) }}
                      >
                        {post.author_role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {post.category_name && (
                    <span className="category-badge">
                      📂 {post.category_name}
                    </span>
                  )}
                </div>

                <div className="post-dates">
                  <div className="date-item">
                    <span className="date-label">Submitted:</span>
                    <span className="date-value">
                      {new Date(post.submitted_at || post.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedPost === post.news_id ? (
                <div className="review-panel">
                  <div className="review-actions">
                    <label>
                      <input
                        type="radio"
                        name={`action-${post.news_id}`}
                        value="approve"
                        checked={reviewAction === 'approve'}
                        onChange={() => setReviewAction('approve')}
                      />
                      <span>✅ Approve & Publish</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`action-${post.news_id}`}
                        value="reject"
                        checked={reviewAction === 'reject'}
                        onChange={() => setReviewAction('reject')}
                      />
                      <span>❌ Reject</span>
                    </label>
                  </div>
                  <textarea
                    placeholder="Optional comments..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    rows={3}
                  />
                  <div className="review-buttons">
                    <button 
                      onClick={() => setSelectedPost(null)}
                      disabled={isSubmitting}
                      aria-label="Cancel review">
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleReviewSubmit(post.news_id)}
                      disabled={isSubmitting}
                      className={reviewAction === 'approve' ? 'approve-btn' : 'reject-btn'}
                      aria-label={`Submit ${reviewAction}`}>
                      {isSubmitting ? 'Submitting...' : `Submit ${reviewAction}`}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="post-card-actions">
                  <button 
                    className="action-btn review-btn"
                    onClick={() => setSelectedPost(post.news_id)}
                    aria-label="Review post">
                    📝 Review & Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;