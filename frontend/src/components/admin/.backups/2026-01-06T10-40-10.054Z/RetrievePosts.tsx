'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/components/includes/Session';
import EditPosts from './EditPosts';

interface NewsItem {
  news_id: number;
  title: string;
  excerpt: string;
  slug: string;
  category_name: string;
  category_ids?: number[];
  image_url: string;
  status: string;
  workflow_status?: string;
  views: number;
  likes_count: number;
  comments_count: number;
  published_at: string;
  first_name?: string;
  last_name?: string;
  featured?: boolean;
  author_id?: number;
}

interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id?: number;
  group?: string;
}

interface CategoryGroup {
  title: string;
  icon: string;
  description?: string;
  mainSlug?: string;
  categories: Category[];
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_news: number;
  has_next: boolean;
  has_prev: boolean;
}

interface StatsData {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  archived_posts: number;
  featured_posts: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
}

const MAIN_CATEGORY_GROUPS: Record<string, { icon: string; color: string }> = {
  'live-world': { icon: '🌍', color: '#2563eb' },
  'counties': { icon: '🏛️', color: '#7c3aed' },
  'politics': { icon: '⚖️', color: '#dc2626' },
  'business': { icon: '💼', color: '#059669' },
  'opinion': { icon: '💭', color: '#ea580c' },
  'sports': { icon: '⚽', color: '#0891b2' },
  'lifestyle': { icon: '🌺', color: '#db2777' },
  'entertainment': { icon: '🎬', color: '#8b5cf6' },
  'tech': { icon: '💻', color: '#0284c7' },
  'other': { icon: '📌', color: '#0233df' }
};

const formatNumber = (num: number) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const RetrievePosts: React.FC = () => {
  const { user, csrfToken } = useSession();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState('DESC');
  const [authorFilter, setAuthorFilter] = useState<'all' | 'mine'>('all');
  
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  
  // Approval modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'disapprove'>('approve');
  const [postToApprove, setPostToApprove] = useState<NewsItem | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  // Check if user can approve/disapprove posts
  const canApproveArticles = user?.role === 'super_admin' || user?.role === 'admin' || user?.permissions?.approve_articles;

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        credentials: 'include',
        headers: { 
          'X-CSRF-Token': csrfToken || '',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.groups) {
          const groupsArray = Object.entries(data.groups).map(([slug, group]: [string, any]) => ({
            title: group.title || slug,
            icon: group.icon || '📰',
            description: group.description || '',
            mainSlug: slug,
            categories: group.categories.map((cat: any) => ({
              ...cat,
              group: slug
            }))
          }));
          setCategoryGroups(groupsArray);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [csrfToken]);

  const fetchNews = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        order: sortOrder
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter.length > 0) {
        params.append('category_ids', categoryFilter.join(','));
      }
      if (authorFilter === 'mine' && user?.admin_id) {
        params.append('author_id', user.admin_id.toString());
      }

      const response = await fetch(`/api/admin/retrieveposts?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
        setStats(data.stats || null);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  }, [csrfToken, searchTerm, statusFilter, categoryFilter, sortOrder, authorFilter, user?.admin_id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categoryGroups.length > 0) {
      fetchNews();
    }
  }, [fetchNews, categoryGroups.length]);

  const handleApprovalClick = (post: NewsItem, action: 'approve' | 'disapprove') => {
    setPostToApprove(post);
    setApprovalAction(action);
    setApprovalComment('');
    setShowApprovalModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!postToApprove || !canApproveArticles) return;

    setIsSubmittingApproval(true);
    try {
      const response = await fetch(`/api/admin/retrieveposts/${postToApprove.news_id}/approval`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          action: approvalAction,
          comments: approvalComment.trim(),
          admin_id: user?.admin_id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchNews(pagination?.current_page || 1);
        setShowApprovalModal(false);
        setPostToApprove(null);
        setApprovalComment('');
      } else {
        alert(data.message || 'Failed to process approval');
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('Network error occurred');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setCategoryFilter(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const clearCategoryFilters = () => {
    setCategoryFilter([]);
  };

  const handleSelectPost = (postId: number) => {
    setSelectedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === news.length && news.length > 0) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(news.map(item => item.news_id));
    }
  };

// Enhanced delete handlers for RetrievePosts.tsx
// Replace your existing handleDelete and confirmDelete functions with these:

const handleDelete = (postId: number) => {
  console.log('[RetrievePosts] Opening delete modal for post:', postId);
  setPostToDelete(postId);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  if (!postToDelete) {
    console.error('[RetrievePosts] No post selected for deletion');
    return;
  }
  
  console.log('[RetrievePosts] Starting delete request:', {
    postId: postToDelete,
    authorId: user?.admin_id
  });

  try {
    // Show loading state
    const deleteButton = document.querySelector('.confirm-delete-btn');
    if (deleteButton) {
      deleteButton.textContent = 'Deleting...';
      deleteButton.setAttribute('disabled', 'true');
    }

    const response = await fetch(`/api/admin/retrieveposts/${postToDelete}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 
        'X-CSRF-Token': csrfToken || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        author_id: user?.admin_id,
        hard_delete: false // Set to true for permanent deletion
      })
    });

    console.log('[RetrievePosts] Delete response:', {
      status: response.status,
      ok: response.ok
    });

    const data = await response.json();
    console.log('[RetrievePosts] Delete response data:', data);

    if (response.ok && data.success) {
      console.log('[RetrievePosts] Delete successful, refreshing list');
      
      // Refresh the news list
      await fetchNews(pagination?.current_page || 1);
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setPostToDelete(null);
      
      // Show success message (optional)
      alert(data.message || 'Article deleted successfully');
      
    } else {
      console.error('[RetrievePosts] Delete failed:', data.message);
      alert(data.message || 'Failed to delete article');
    }

  } catch (error) {
    console.error('[RetrievePosts] Delete error:', error);
    alert('Network error: Failed to delete article. Please try again.');
  } finally {
    // Reset button state
    const deleteButton = document.querySelector('.confirm-delete-btn');
    if (deleteButton) {
      deleteButton.textContent = 'Delete Post';
      deleteButton.removeAttribute('disabled');
    }
  }
};

// Enhanced bulk delete handler
const confirmBulkAction = async () => {
  if (!bulkAction || selectedPosts.length === 0) {
    console.error('[RetrievePosts] No bulk action or posts selected');
    return;
  }
  
  console.log('[RetrievePosts] Starting bulk action:', {
    action: bulkAction,
    postCount: selectedPosts.length,
    postIds: selectedPosts
  });
  
  try {
    if (bulkAction === 'delete') {
      let successCount = 0;
      let failCount = 0;

      for (const postId of selectedPosts) {
        try {
          const response = await fetch(`/api/admin/retrieveposts/${postId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 
              'X-CSRF-Token': csrfToken || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ author_id: user?.admin_id })
          });

          if (response.ok) {
            successCount++;
            console.log(`[RetrievePosts] Deleted post ${postId}`);
          } else {
            failCount++;
            console.error(`[RetrievePosts] Failed to delete post ${postId}`);
          }
        } catch (error) {
          failCount++;
          console.error(`[RetrievePosts] Error deleting post ${postId}:`, error);
        }
      }

      console.log('[RetrievePosts] Bulk delete completed:', {
        success: successCount,
        failed: failCount,
        total: selectedPosts.length
      });

      if (failCount > 0) {
        alert(`Deleted ${successCount} articles. ${failCount} failed.`);
      } else {
        alert(`Successfully deleted ${successCount} articles`);
      }
    }
    
    // Refresh the list
    await fetchNews(pagination?.current_page || 1);
    
    // Clear selections and close modal
    setSelectedPosts([]);
    setShowBulkModal(false);
    setBulkAction('');
    
  } catch (error) {
    console.error('[RetrievePosts] Bulk action error:', error);
    alert('Network error during bulk operation');
  }
};

  const handleEditPost = (newsId: number) => {
    setEditingPostId(newsId);
  };

  const handleBackFromEdit = () => {
    setEditingPostId(null);
    fetchNews(pagination?.current_page || 1);
  };

  if (isLoading) {
    return (
      <div className="retrieve-loading">
        <div className="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (editingPostId) {
    return <EditPosts newsId={editingPostId} onBack={handleBackFromEdit} />;
  }

  return (
    <div className="retrieve-posts">
      <div className="retrieve-header">
        <div className="header-left">
          <h1>Manage Posts</h1>
          {stats && (
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-value">{formatNumber(stats.total_posts)}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatNumber(stats.published_posts)}</span>
                <span className="stat-label">Published</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatNumber(stats.draft_posts)}</span>
                <span className="stat-label">Drafts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatNumber(stats.total_views)}</span>
                <span className="stat-label">Views</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatNumber(stats.total_likes)}</span>
                <span className="stat-label">Likes</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <div className="filters">
            <input
              type="text"
              placeholder="Search by title..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchNews(1); }}
            />
            
            <select
              className="filter-select"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value as 'all' | 'mine')}
            >
              <option value="all">All Authors</option>
              <option value="mine">My Posts Only</option>
            </select>
            
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="DESC">Latest First</option>
              <option value="ASC">Oldest First</option>
            </select>
            
            <button 
              onClick={() => fetchNews(1)} 
              className="apply-filters-btn"
              title="Apply filters"
             aria-label="Action button">
              🔍 Search
            </button>
          </div>
          
          <a href="/admin/posts/new" className="new-post-btn">
            New Post
          </a>
        </div>
      </div>

      <div className="category-filter-dropdown">
        <div className="filter-header-compact">
          <div className="filter-title-row">
            <h3>📂 Filter by Categories</h3>
            <button 
              className="toggle-categories-btn"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
             aria-label="Action button">
              {showCategoryDropdown ? '▲ Hide Filters' : '▼ Show Filters'}
            </button>
          </div>
          
          <div className="filter-stats-row">
            <span className="count-badge">
              {categoryFilter.length} categor{categoryFilter.length === 1 ? 'y' : 'ies'} selected
            </span>
            {categoryFilter.length > 0 && (
              <button 
                onClick={clearCategoryFilters} 
                className="clear-btn"
               aria-label="Action button">
                Clear All
              </button>
            )}
          </div>
        </div>

        {showCategoryDropdown && (
          <div className="category-dropdown-content">
            <div className="category-groups-container">
              {categoryGroups.map(group => {
                const selectedCount = group.categories.filter(cat => 
                  categoryFilter.includes(cat.category_id)
                ).length;

                const groupConfig = MAIN_CATEGORY_GROUPS[group.mainSlug || 'other'];

                return (
                  <div key={group.mainSlug} className="category-group">
                    <div 
                      className="category-group-header"
                      style={{ borderLeftColor: groupConfig?.color }}
                    >
                      <span className="group-icon">{groupConfig?.icon || group.icon}</span>
                      <span className="group-name">{group.title}</span>
                      {selectedCount > 0 && (
                        <span className="group-selected-count">{selectedCount} selected</span>
                      )}
                    </div>
                    
                    <div className="category-checkboxes">
                      {group.categories.map(category => {
                        const isSelected = categoryFilter.includes(category.category_id);
                        return (
                          <label 
                            key={category.category_id} 
                            className={`category-checkbox-item ${isSelected ? 'selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCategoryToggle(category.category_id)}
                            />
                            <span>{category.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedPosts.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
          </div>
          <div className="bulk-buttons">
            <button className="bulk-btn publish" onClick={() => handleBulkAction('publish')} aria-label="Action button">
              Publish
            </button>
            <button className="bulk-btn draft" onClick={() => handleBulkAction('draft')} aria-label="Action button">
              Draft
            </button>
            <button className="bulk-btn archive" onClick={() => handleBulkAction('archive')} aria-label="Action button">
              Archive
            </button>
            <button className="bulk-btn delete" onClick={() => handleBulkAction('delete')} aria-label="Action button">
              Delete
            </button>
            <button className="clear-selection" onClick={() => setSelectedPosts([])} aria-label="Action button">
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="posts-table">
        <div className="table-header">
          <div className="column-select">
            <input
              type="checkbox"
              className="select-all-checkbox"
              checked={selectedPosts.length === news.length && news.length > 0}
              onChange={handleSelectAll}
            />
          </div>
          <div className="column-content">Post Details</div>
          <div className="column-stats">Engagement Stats</div>
          <div className="column-actions">Actions</div>
        </div>

        {news.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h3>No posts found</h3>
            <p>
              {authorFilter === 'mine' 
                ? "You haven't created any posts yet matching these filters" 
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        ) : (
          news.map(item => {
            const isDraft = item.status === 'draft';
            const isPublished = item.status === 'published';
            const showApproveButton = canApproveArticles && isDraft;
            const showDisapproveButton = canApproveArticles && isPublished;

            return (
              <div
                key={item.news_id}
                className={`post-row ${selectedPosts.includes(item.news_id) ? 'selected' : ''}`}
              >
                <div className="column-select">
                  <input
                    type="checkbox"
                    className="post-checkbox"
                    checked={selectedPosts.includes(item.news_id)}
                    onChange={() => handleSelectPost(item.news_id)}
                  />
                </div>
                
                <div className="column-content">
                  <div className="post-image">
                    {item.image_url ? (
                      <img src={`http://localhost:5000${item.image_url}`} alt={item.title} />
                    ) : (
                      <div className="image-placeholder">📰</div>
                    )}
                    {item.featured && (
                      <div className="featured-indicator">⭐</div>
                    )}
                  </div>
                  
                  <div className="post-details">
                    <h3 className="post-title">{item.title}</h3>
                    {item.excerpt && <p className="post-excerpt">{item.excerpt}</p>}
                    
                    <div className="post-meta">
                      <div className="badges">
                        <span className={`status-badge status-${item.status}`}>
                          {item.status}
                        </span>
                        {item.category_name && (
                          <span className="category-tag">{item.category_name}</span>
                        )}
                      </div>
                      
                      <div className="author-info">
                        {item.first_name && (
                          <span className="author">
                            By {item.first_name} {item.last_name}
                            {authorFilter === 'all' && user?.admin_id === item.author_id && (
                              <span className="author-badge"> (You)</span>
                            )}
                          </span>
                        )}
                        <span className="date">
                          {new Date(item.published_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="column-stats">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{formatNumber(item.views)}</span>
                      <span className="stat-label">Views</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{formatNumber(item.likes_count)}</span>
                      <span className="stat-label">Likes</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{formatNumber(item.comments_count)}</span>
                      <span className="stat-label">Comments</span>
                    </div>
                  </div>
                </div>
                
                <div className="column-actions">
                  <div className="action-buttons">
                    {showApproveButton && (
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleApprovalClick(item, 'approve')}
                        title="Approve & Publish Article"
                       aria-label="Action button">
                        ✅ Approve
                      </button>
                    )}
                    {showDisapproveButton && (
                      <button
                        className="action-btn disapprove-btn"
                        onClick={() => handleApprovalClick(item, 'disapprove')}
                        title="Move back to Draft"
                       aria-label="Action button">
                        ⏸️ Disapprove
                      </button>
                    )}
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditPost(item.news_id)}
                      title="Edit Post"
                     aria-label="Action button">
                      Edit
                    </button>
                    <button
                      className="action-btn preview-btn"
                      onClick={() => window.open(`/client/articles/${item.slug}`, '_blank')}
                      title="View Article"
                     aria-label="Action button">
                      View
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(item.news_id)}
                      title="Delete Post"
                     aria-label="Action button">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => fetchNews(pagination.current_page - 1)}
            disabled={!pagination.has_prev}
           aria-label="Action button">
            Previous
          </button>
          <div className="page-info">
            Page {pagination.current_page} of {pagination.total_pages}
          </div>
          <button
            className="page-btn"
            onClick={() => fetchNews(pagination.current_page + 1)}
            disabled={!pagination.has_next}
           aria-label="Action button">
            Next
          </button>
        </div>
      )}

      {/* Approval/Disapproval Modal */}
      {showApprovalModal && postToApprove && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {approvalAction === 'approve' ? '✅ Approve Article' : '⏸️ Disapprove Article'}
              </h3>
              <button className="close-btn" onClick={() => setShowApprovalModal(false)} aria-label="Action button">×</button>
            </div>
            <div className="modal-body">
              <div className="approval-post-info">
                <h4>{postToApprove.title}</h4>
                <p className="approval-post-meta">
                  By {postToApprove.first_name} {postToApprove.last_name} • 
                  Current Status: <span className={`status-badge status-${postToApprove.status}`}>
                    {postToApprove.status}
                  </span>
                </p>
              </div>

              <div className="approval-description">
                {approvalAction === 'approve' ? (
                  <p>
                    This will change the article status from <strong>draft</strong> to <strong>published</strong> 
                    and make it visible to all users on the website.
                  </p>
                ) : (
                  <p>
                    This will change the article status from <strong>published</strong> back to <strong>draft</strong>. 
                    The article will no longer be visible to users until it is approved again.
                  </p>
                )}
              </div>

              <div className="approval-comment-section">
                <label htmlFor="approval-comment">
                  {approvalAction === 'approve' ? 'Approval Comments (Optional)' : 'Reason for Disapproval (Optional)'}
                </label>
                <textarea
                  id="approval-comment"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder={
                    approvalAction === 'approve' 
                      ? 'Add any comments for the author...' 
                      : 'Explain why this article is being moved back to draft...'
                  }
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowApprovalModal(false)}
                disabled={isSubmittingApproval}
               aria-label="Action button">
                Cancel
              </button>
              <button
                className={`confirm-btn ${approvalAction === 'approve' ? 'approve' : 'disapprove'}`}
                onClick={handleSubmitApproval}
                disabled={isSubmittingApproval}
               aria-label="Action button">
                {isSubmittingApproval 
                  ? '⏳ Processing...' 
                  : approvalAction === 'approve' 
                    ? '✅ Approve & Publish' 
                    : '⏸️ Move to Draft'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)} aria-label="Action button">×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="warning-message">
                This will permanently remove the post and all associated data.
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)} aria-label="Action button">
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete} aria-label="Action button">
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Bulk Action</h3>
              <button className="close-btn" onClick={() => setShowBulkModal(false)} aria-label="Action button">×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to {bulkAction} {selectedPosts.length} selected post
                {selectedPosts.length !== 1 ? 's' : ''}?
              </p>
              {bulkAction === 'delete' && (
                <div className="warning-message">
                  This action will permanently delete the selected posts and cannot be undone.
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowBulkModal(false)} aria-label="Action button">
                Cancel
              </button>
              <button
                className={`confirm-btn ${bulkAction === 'delete' ? 'danger' : ''}`}
                onClick={confirmBulkAction}
               aria-label="Action button">
                Confirm {bulkAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetrievePosts;