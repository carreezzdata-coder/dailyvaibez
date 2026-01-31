'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/includes/Session';
import { usePermissions } from './adminhooks/usePermissions';

interface PendingPost {
  news_id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category_name: string;
  category_slug: string;
  primary_category_name: string;
  category_ids: number[];
  image_url: string;
  status: string;
  workflow_status: string;
  views: number;
  likes_count: number;
  comments_count: number;
  share_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  first_name: string;
  last_name: string;
  author_email: string;
  author_id: number;
  featured: boolean;
  breaking: boolean;
  pinned: boolean;
  editor_pick: boolean;
  tags: string;
  priority: string;
  reading_time: number;
  review_count: number;
  rejection_reason?: string;
  word_count: number;
  author_role: string;
}

interface WriterStats {
  total_submissions: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  approval_rate: number;
  avg_review_time: number;
  total_views: number;
  total_engagement: number;
}

interface Category {
  category_id: number;
  name: string;
  slug: string;
  group?: string;
}

const PendingReview: React.FC = () => {
  const router = useRouter();
  const { user, csrfToken, isAuthenticated } = useSession();
  const { canApprove, isLoading: permissionsLoading } = usePermissions();

  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [authorFilter, setAuthorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number[]>([]);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState<'submitted' | 'priority' | 'author'>('submitted');
  
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_changes'>('approve');
  const [reviewComments, setReviewComments] = useState('');
  const [instructionsToWriter, setInstructionsToWriter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showWriterStats, setShowWriterStats] = useState(false);
  const [writerStats, setWriterStats] = useState<WriterStats | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const fetchControllerRef = useRef<AbortController | null>(null);
  const submitControllerRef = useRef<AbortController | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.groups) {
          const allCategories: Category[] = [];
          Object.entries(data.groups).forEach(([slug, group]: [string, any]) => {
            group.categories.forEach((cat: any) => {
              allCategories.push({ ...cat, group: slug });
            });
          });
          setCategories(allCategories);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [csrfToken]);

  const fetchPendingPosts = useCallback(async () => {
    if (!canApprove) return;
    
    setIsLoading(true);
    setError('');

    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    
    try {
      const params = new URLSearchParams({
        workflow_status: statusFilter
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (authorFilter) params.append('author_id', authorFilter);
      if (categoryFilter.length > 0) params.append('category_ids', categoryFilter.join(','));
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await fetch(`/api/admin/pending?${params.toString()}`, {
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
  }, [csrfToken, canApprove, searchTerm, statusFilter, authorFilter, categoryFilter, priorityFilter]);

  const fetchWriterStats = async (authorId: number) => {
    try {
      const response = await fetch(`/api/admin/pending/writer-stats/${authorId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWriterStats(data.stats);
        setSelectedAuthorId(authorId);
        setShowWriterStats(true);
      }
    } catch (error) {
      console.error('Error fetching writer stats:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0 && !permissionsLoading) {
      fetchPendingPosts();
    }
  }, [fetchPendingPosts, categories.length, permissionsLoading]);

  const handleReviewSubmit = async (newsId: number) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    submitControllerRef.current?.abort();
    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      if (reviewAction === 'reject' && !reviewComments.trim()) {
        setError('Rejection reason is required');
        setIsSubmitting(false);
        return;
      }

      if (reviewAction === 'request_changes' && !instructionsToWriter.trim()) {
        setError('Instructions to writer are required for requesting changes');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/admin/pending/review', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          news_id: newsId,
          action: reviewAction,
          comments: reviewComments,
          instructions_to_writer: instructionsToWriter
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      setSelectedPost(null);
      setReviewComments('');
      setInstructionsToWriter('');
      await fetchPendingPosts();
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        setError(error instanceof Error ? error.message : 'Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategoryFilter = (categoryId: number) => {
    setCategoryFilter(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getTimeDifference = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const priorityOrder: { [key: string]: number } = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
      }
      case 'author':
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      case 'submitted':
      default:
        return new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime();
    }
  });

  if (!isAuthenticated || permissionsLoading) {
    return <div className="pending-review-container loading">Loading...</div>;
  }

  if (!canApprove) {
    return (
      <div className="pending-review-container error">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="pending-review-container">
      <div className="header-section">
        <h1>📋 Pending Approvals</h1>
        <div className="header-stats">
          <span className="stat-badge">{posts.length} posts</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="pending_review">Pending Review</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All Statuses</option>
          </select>

          <div className="category-filter-wrapper">
            <button 
              className="filter-select category-filter-btn"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              {categoryFilter.length > 0 
                ? `${categoryFilter.length} Categories` 
                : 'All Categories'}
            </button>
            
            {showCategoryDropdown && (
              <div className="category-dropdown">
                <div className="category-dropdown-header">
                  <span>Select Categories</span>
                  <button onClick={() => setCategoryFilter([])}>Clear</button>
                </div>
                <div className="category-list">
                  {categories.map(cat => (
                    <label key={cat.category_id} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={categoryFilter.includes(cat.category_id)}
                        onChange={() => toggleCategoryFilter(cat.category_id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="submitted">Sort: Recent</option>
            <option value="priority">Sort: Priority</option>
            <option value="author">Sort: Author</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="empty-state">
          <p>📭 No posts found</p>
        </div>
      ) : (
        <div className="posts-table">
          {sortedPosts.map((post) => (
            <div key={post.news_id} className="post-row">
              <div className="column-content">
                <div className="post-image">
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      loading="lazy"
                    />
                  )}
                </div>
                
                <div className="post-details">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  
                  <div className="post-meta">
                    <div className="meta-badges">
                      {post.primary_category_name && (
                        <span className="category-tag">{post.primary_category_name}</span>
                      )}
                      <span className={`priority-badge priority-${post.priority}`}>
                        {post.priority}
                      </span>
                      {post.word_count > 0 && (
                        <span className="word-count-badge">{post.word_count} words</span>
                      )}
                    </div>
                    
                    <div className="author-info">
                      <span className="author">
                        By {post.first_name} {post.last_name}
                        <button 
                          className="view-stats-btn"
                          onClick={() => fetchWriterStats(post.author_id)}
                        >
                          📊
                        </button>
                      </span>
                      <span className="date">
                        Submitted {getTimeDifference(post.submitted_at || post.created_at)}
                      </span>
                    </div>

                    {post.rejection_reason && (
                      <div className="rejection-reason">
                        <strong>Previous rejection:</strong> {post.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="column-stats">
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{post.reading_time || 0}</span>
                    <span className="stat-label">Min Read</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{post.review_count || 0}</span>
                    <span className="stat-label">Reviews</span>
                  </div>
                </div>
              </div>
              
              <div className="column-actions">
                {selectedPost === post.news_id ? (
                  <div className="review-panel-inline">
                    <div className="review-actions-compact">
                      <label>
                        <input
                          type="radio"
                          value="approve"
                          checked={reviewAction === 'approve'}
                          onChange={() => setReviewAction('approve')}
                        />
                        <span>✅ Approve</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="request_changes"
                          checked={reviewAction === 'request_changes'}
                          onChange={() => setReviewAction('request_changes')}
                        />
                        <span>📝 Request Changes</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="reject"
                          checked={reviewAction === 'reject'}
                          onChange={() => setReviewAction('reject')}
                        />
                        <span>❌ Reject</span>
                      </label>
                    </div>

                    {reviewAction === 'request_changes' && (
                      <textarea
                        placeholder="Instructions to writer (required)..."
                        value={instructionsToWriter}
                        onChange={(e) => setInstructionsToWriter(e.target.value)}
                        rows={3}
                        className="instructions-textarea"
                      />
                    )}

                    <textarea
                      placeholder={reviewAction === 'reject' ? 'Rejection reason (required)...' : 'Optional comments...'}
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      rows={2}
                    />

                    <div className="review-buttons">
                      <button 
                        onClick={() => {
                          setSelectedPost(null);
                          setReviewComments('');
                          setInstructionsToWriter('');
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleReviewSubmit(post.news_id)}
                        disabled={isSubmitting}
                        className={`submit-review-btn ${reviewAction}`}
                      >
                        {isSubmitting ? '⏳ Submitting...' : `Submit ${reviewAction}`}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => router.push(`/admin/edit/${post.news_id}`)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="action-btn review-btn"
                      onClick={() => {
                        setSelectedPost(post.news_id);
                        setReviewAction('approve');
                      }}
                    >
                      📝 Review
                    </button>
                    <button
                      className="action-btn preview-btn"
                      onClick={() => window.open(`/client/articles/${post.slug}`, '_blank')}
                    >
                      👁️ View
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showWriterStats && writerStats && (
        <div className="modal-overlay" onClick={() => setShowWriterStats(false)}>
          <div className="modal-content writer-stats-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👤 Writer Statistics</h3>
              <button className="close-btn" onClick={() => setShowWriterStats(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="writer-stats-grid">
                <div className="writer-stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-value">{writerStats.total_submissions}</div>
                  <div className="stat-label">Total Submissions</div>
                </div>
                <div className="writer-stat-card success">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{writerStats.approved_count}</div>
                  <div className="stat-label">Approved</div>
                </div>
                <div className="writer-stat-card danger">
                  <div className="stat-icon">❌</div>
                  <div className="stat-value">{writerStats.rejected_count}</div>
                  <div className="stat-label">Rejected</div>
                </div>
                <div className="writer-stat-card warning">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-value">{writerStats.pending_count}</div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="writer-stat-card info">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{writerStats.approval_rate.toFixed(1)}%</div>
                  <div className="stat-label">Approval Rate</div>
                </div>
                <div className="writer-stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">{writerStats.avg_review_time.toFixed(1)}h</div>
                  <div className="stat-label">Avg Review Time</div>
                </div>
                <div className="writer-stat-card">
                  <div className="stat-icon">👁️</div>
                  <div className="stat-value">{formatNumber(writerStats.total_views)}</div>
                  <div className="stat-label">Total Views</div>
                </div>
                <div className="writer-stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-value">{formatNumber(writerStats.total_engagement)}</div>
                  <div className="stat-label">Total Engagement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingReview;