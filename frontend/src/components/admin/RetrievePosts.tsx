'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/includes/Session';
import { usePermissions } from './adminhooks/usePermissions';
import PostsTableHeader from './retrievers/PostsTableHeader';
import Customize from './retrievers/Customize';
import PostRow from './retrievers/PostRow';
import CategoryFilterDropdown from './retrievers/CategoryFilterDropdown';
import ApprovalModal from './retrievers/ApprovalModal';

interface NewsItem {
  news_id: number;
  title: string;
  excerpt: string;
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
  first_name: string;
  last_name: string;
  author_email: string;
  author_id: number;
  tags: string;
  priority: string;
  reading_time: number;
  featured: boolean;
  featured_tier: string;
  featured_until: string;
  featured_hours: number;
  breaking: boolean;
  breaking_level: string;
  breaking_until: string;
  breaking_hours: number;
  pinned: boolean;
  pin_type: string;
  pin_until: string;
  editor_pick: boolean;
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
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

interface StatsData {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  archived_posts: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
}

const formatNumber = (num: number) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const RetrievePosts: React.FC = () => {
  const router = useRouter();
  const { user, csrfToken } = useSession();
  const { canEditAny, canApprove, canDelete, isLoading: permissionsLoading } = usePermissions();

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
  
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'disapprove'>('approve');
  const [postToApprove, setPostToApprove] = useState<NewsItem | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [postToCustomize, setPostToCustomize] = useState<NewsItem | null>(null);

  const effectiveAuthorFilter = !canEditAny && user?.admin_id 
    ? user.admin_id.toString() 
    : authorFilter === 'mine' && user?.admin_id 
      ? user.admin_id.toString() 
      : '';

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
      console.error('[RetrievePosts] Error fetching categories:', error);
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
      if (effectiveAuthorFilter) {
        params.append('author_id', effectiveAuthorFilter);
      }

      const response = await fetch(`/api/admin/retrieveposts?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
        setStats(data.stats || null);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('[RetrievePosts] Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  }, [csrfToken, searchTerm, statusFilter, categoryFilter, sortOrder, effectiveAuthorFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categoryGroups.length > 0 && !permissionsLoading) {
      fetchNews();
    }
  }, [fetchNews, categoryGroups.length, permissionsLoading]);

  const handleApprovalClick = (post: NewsItem, action: 'approve' | 'disapprove') => {
    setPostToApprove(post);
    setApprovalAction(action);
    setApprovalComment('');
    setShowApprovalModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!postToApprove || !canApprove) return;

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
        alert(data.message);
      } else {
        alert(data.message || 'Failed to process approval');
      }
    } catch (error) {
      console.error('[RetrievePosts] Approval error:', error);
      alert('Network error occurred');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleCustomizeClick = (post: NewsItem) => {
    setPostToCustomize(post);
    setShowCustomizeModal(true);
  };

  const handleCustomizeSuccess = () => {
    fetchNews(pagination?.current_page || 1);
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

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setShowBulkModal(true);
  };

  const handleDelete = (postId: number) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/admin/delete/${postToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 
          'X-CSRF-Token': csrfToken || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          author_id: user?.admin_id,
          hard_delete: false
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchNews(pagination?.current_page || 1);
        setShowDeleteModal(false);
        setPostToDelete(null);
        alert(data.message);
      } else {
        alert(data.message || 'Failed to delete article');
      }
    } catch (error) {
      console.error('[RetrievePosts] Delete error:', error);
      alert('Network error: Failed to delete article');
    }
  };

  const confirmBulkAction = async () => {
    if (!bulkAction || selectedPosts.length === 0) return;
    
    try {
      if (bulkAction === 'delete') {
        let successCount = 0;
        let failCount = 0;

        for (const postId of selectedPosts) {
          try {
            const response = await fetch(`/api/admin/delete/${postId}`, {
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
            } else {
              failCount++;
            }
          } catch (error) {
            failCount++;
          }
        }

        if (failCount > 0) {
          alert(`Deleted ${successCount} articles. ${failCount} failed.`);
        } else {
          alert(`Successfully deleted ${successCount} articles`);
        }
      }
      
      await fetchNews(pagination?.current_page || 1);
      setSelectedPosts([]);
      setShowBulkModal(false);
      setBulkAction('');
    } catch (error) {
      console.error('[RetrievePosts] Bulk action error:', error);
      alert('Network error during bulk operation');
    }
  };

  const handleEditPost = (newsId: number) => {
    router.push(`/admin/posts/edit/${newsId}`);
  };

  if (isLoading || permissionsLoading) {
    return (
      <div className="retrieve-loading">
        <div className="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="retrieve-posts">
      <div className="retrieve-header">
        <div className="header-left">
          <h1>Manage Posts</h1>
          {!canEditAny && (
            <p className="moderator-notice">Viewing your own posts only</p>
          )}
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
            
            {canEditAny && (
              <select
                className="filter-select"
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value as 'all' | 'mine')}
              >
                <option value="all">All Authors</option>
                <option value="mine">My Posts Only</option>
              </select>
            )}
            
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
            >
              🔍 Search
            </button>
          </div>
          
          <a href="/admin/posts/new" className="new-post-btn">
            New Post
          </a>
        </div>
      </div>

      <CategoryFilterDropdown
        categoryGroups={categoryGroups}
        categoryFilter={categoryFilter}
        showDropdown={showCategoryDropdown}
        onToggleDropdown={() => setShowCategoryDropdown(!showCategoryDropdown)}
        onCategoryToggle={handleCategoryToggle}
        onClearFilters={clearCategoryFilters}
      />

      {selectedPosts.length > 0 && canDelete && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
          </div>
          <div className="bulk-buttons">
            <button className="bulk-btn delete" onClick={() => handleBulkAction('delete')}>
              Delete
            </button>
            <button className="clear-selection" onClick={() => setSelectedPosts([])}>
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="posts-table">
        <PostsTableHeader
          selectedCount={selectedPosts.length}
          totalCount={news.length}
          onSelectAll={handleSelectAll}
        />

        {news.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h3>No posts found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          news.map(item => (
            <PostRow
              key={item.news_id}
              item={item}
              isSelected={selectedPosts.includes(item.news_id)}
              currentUserId={user?.admin_id}
              canApproveArticles={canApprove}
              onSelectPost={handleSelectPost}
              onEdit={handleEditPost}
              onDelete={handleDelete}
              onApprovalClick={handleApprovalClick}
              onCustomizeClick={handleCustomizeClick}
            />
          ))
        )}
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => fetchNews(pagination.current_page - 1)}
            disabled={!pagination.has_prev}
          >
            Previous
          </button>
          <div className="page-info">
            Page {pagination.current_page} of {pagination.total_pages}
          </div>
          <button
            className="page-btn"
            onClick={() => fetchNews(pagination.current_page + 1)}
            disabled={!pagination.has_next}
          >
            Next
          </button>
        </div>
      )}

      {showApprovalModal && postToApprove && (
        <ApprovalModal
          post={postToApprove}
          action={approvalAction}
          comment={approvalComment}
          isSubmitting={isSubmittingApproval}
          onCommentChange={setApprovalComment}
          onConfirm={handleSubmitApproval}
          onClose={() => setShowApprovalModal(false)}
        />
      )}

      {showCustomizeModal && postToCustomize && (
        <Customize
          newsId={postToCustomize.news_id}
          onClose={() => setShowCustomizeModal(false)}
          onSuccess={handleCustomizeSuccess}
          csrfToken={csrfToken || ''}
        />
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to archive this post?</p>
              <div className="warning-message">
                The post will be moved to archived status.
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Archive Post
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
              <button className="close-btn" onClick={() => setShowBulkModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to {bulkAction} {selectedPosts.length} selected post
                {selectedPosts.length !== 1 ? 's' : ''}?
              </p>
              {bulkAction === 'delete' && (
                <div className="warning-message">
                  Posts will be archived.
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowBulkModal(false)}>
                Cancel
              </button>
              <button
                className={`confirm-btn ${bulkAction === 'delete' ? 'danger' : ''}`}
                onClick={confirmBulkAction}
              >
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