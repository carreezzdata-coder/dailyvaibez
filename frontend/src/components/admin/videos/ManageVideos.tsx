'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/includes/Session';

interface VideoItem {
  video_id: number;
  title: string;
  description: string;
  video_url: string;
  platform: string;
  video_type: string;
  is_live: boolean;
  status: string;
  visibility: string;
  featured: boolean;
  thumbnail_url: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  channel_name: string;
  created_at: string;
  updated_at: string;
}

interface StatsData {
  total_videos: number;
  published_videos: number;
  draft_videos: number;
  live_videos: number;
  featured_videos: number;
  total_views: number;
  total_likes: number;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_videos: number;
  has_next: boolean;
  has_prev: boolean;
}

const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'youtube_live', label: 'YouTube Live', icon: '🔴' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'facebook_live', label: 'Facebook Live', icon: '📘' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'instagram_live', label: 'Instagram Live', icon: '📷' },
  { value: 'twitter', label: 'Twitter/X', icon: '🦅' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'twitch', label: 'Twitch', icon: '👾' },
];

const formatNumber = (num: number) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const ManageVideos: React.FC = () => {
  const { user, csrfToken, isAuthenticated, isLoading: sessionLoading } = useSession();
  
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [isLiveFilter, setIsLiveFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState('DESC');
  
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  const canGoLive = user && ['super_admin', 'admin'].includes(user.role);
  const canDelete = user && ['super_admin', 'admin', 'editor'].includes(user.role);
  const canEditAny = user && ['super_admin', 'admin', 'editor'].includes(user.role);

  const fetchVideos = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        order: sortOrder
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (platformFilters.length > 0) {
        params.append('platforms', platformFilters.join(','));
      }
      if (isLiveFilter) params.append('is_live', isLiveFilter);

      const response = await fetch(`/api/admin/retrievesocialvideos?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
        setStats(data.stats || null);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [csrfToken, searchTerm, statusFilter, platformFilters, isLiveFilter, sortOrder]);

  useEffect(() => {
    if (!sessionLoading && isAuthenticated) {
      fetchVideos();
    }
  }, [sessionLoading, isAuthenticated, fetchVideos]);

  const handlePlatformToggle = (platform: string) => {
    setPlatformFilters(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const clearPlatformFilters = () => {
    setPlatformFilters([]);
  };

  const handleSelectVideo = (videoId: number) => {
    setSelectedVideos(prev =>
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVideos.length === videos.length && videos.length > 0) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(v => v.video_id));
    }
  };

  const handleToggleLive = async (videoId: number) => {
    if (!user || !canGoLive) return;

    try {
      const response = await fetch(`/api/admin/toggle-live/${videoId}/toggle-live`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({ admin_id: user.admin_id })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchVideos(pagination?.current_page || 1);
      }
    } catch (error) {
      console.error('Toggle live error:', error);
    }
  };

  const handleDelete = (videoId: number) => {
    if (!canDelete && !canEditAny) return;
    setVideoToDelete(videoId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!videoToDelete || !user) return;

    try {
      const response = await fetch(`/api/admin/socialvideosdelete/${videoToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 
          'X-CSRF-Token': csrfToken || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ admin_id: user.admin_id })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchVideos(pagination?.current_page || 1);
        setShowDeleteModal(false);
        setVideoToDelete(null);
      } else {
        alert(data.message || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Network error: Failed to delete video');
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedVideos.length === 0) return;
    if (action === 'delete' && !canDelete && !canEditAny) return;
    setBulkAction(action);
    setShowBulkModal(true);
  };

  const confirmBulkAction = async () => {
    if (!bulkAction || selectedVideos.length === 0 || !user) return;

    try {
      if (bulkAction === 'delete') {
        for (const videoId of selectedVideos) {
          await fetch(`/api/admin/socialvideosdelete/${videoId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 
              'X-CSRF-Token': csrfToken || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ admin_id: user.admin_id })
          });
        }
      } else {
        const updateData: any = { admin_id: user.admin_id };
        
        if (bulkAction === 'publish') updateData.status = 'published';
        if (bulkAction === 'draft') updateData.status = 'draft';
        if (bulkAction === 'featured') updateData.featured = true;

        for (const videoId of selectedVideos) {
          await fetch(`/api/admin/editvideos/${videoId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 
              'X-CSRF-Token': csrfToken || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ video_id: videoId, ...updateData })
          });
        }
      }

      await fetchVideos(pagination?.current_page || 1);
      setSelectedVideos([]);
      setShowBulkModal(false);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Failed to complete bulk action');
    }
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="retrieve-loading">
        <div className="loading-spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="dv-error-container">
        <div className="dv-error-icon">🔒</div>
        <h2>Authentication Required</h2>
        <p>Please log in to manage videos</p>
        <Link href="/admin/login" className="dv-btn dv-btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  const currentRole = {
    display: user.role.replace('_', ' ').toUpperCase(),
    color: user.role === 'super_admin' ? '#dc2626' : '#2563eb',
    icon: user.role === 'super_admin' ? '🔥' : '⚡'
  };

  return (
    <div className="retrieve-videos">
      <div className="retrieve-header">
        <div className="header-left">
          <h1>📺 Manage Social Videos</h1>
          <p className="dv-page-description">View and manage all social media videos</p>
          {stats && (
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-value">{stats.total_videos}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.live_videos}</span>
                <span className="stat-label">Live</span>
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
          <Link 
            href="/admin/videos/create"
            className="dv-toggle-link"
          >
            ➕ Create New Video
          </Link>
          <div className="dv-user-badge">
            <span className="dv-user-name">{user.first_name} {user.last_name}</span>
            <span 
              className="dv-role-badge" 
              style={{ backgroundColor: currentRole.color }}
            >
              {currentRole.icon} {currentRole.display}
            </span>
          </div>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <select 
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select 
            className="status-filter"
            value={isLiveFilter}
            onChange={(e) => setIsLiveFilter(e.target.value)}
          >
            <option value="">All Videos</option>
            <option value="true">Live Only</option>
            <option value="false">Not Live</option>
          </select>

          <select 
            className="status-filter"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>

          <button 
            className="select-all-btn"
            onClick={handleSelectAll}
            type="button"
          >
            {selectedVideos.length === videos.length && videos.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      <div className="platform-filters">
        <div className="platform-header">
          <span>Filter by Platform:</span>
          {platformFilters.length > 0 && (
            <button className="clear-filters-btn" onClick={clearPlatformFilters} type="button">
              Clear Filters
            </button>
          )}
        </div>
        <div className="platform-chips">
          {PLATFORMS.map(platform => (
            <button
              key={platform.value}
              className={`platform-chip ${platformFilters.includes(platform.value) ? 'selected' : ''}`}
              onClick={() => handlePlatformToggle(platform.value)}
              type="button"
            >
              {platform.icon} {platform.label}
            </button>
          ))}
        </div>
      </div>

      {selectedVideos.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''} selected
          </div>
          <div className="bulk-buttons">
            {canEditAny && (
              <>
                <button className="bulk-btn publish" onClick={() => handleBulkAction('publish')} type="button">
                  Publish
                </button>
                <button className="bulk-btn draft" onClick={() => handleBulkAction('draft')} type="button">
                  Draft
                </button>
                <button className="bulk-btn featured" onClick={() => handleBulkAction('featured')} type="button">
                  Feature
                </button>
              </>
            )}
            {(canDelete || canEditAny) && (
              <button className="bulk-btn delete" onClick={() => handleBulkAction('delete')} type="button">
                Delete
              </button>
            )}
            <button className="clear-selection" onClick={() => setSelectedVideos([])} type="button">
              Clear
            </button>
          </div>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📺</div>
          <h3>No videos found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map(video => (
            <div
              key={video.video_id}
              className={`video-card ${selectedVideos.includes(video.video_id) ? 'selected' : ''}`}
            >
              <div className="video-thumbnail-container">
                {video.thumbnail_url ? (
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title}
                    className="video-thumbnail"
                  />
                ) : (
                  <div className="thumbnail-placeholder">📺</div>
                )}
                <input
                  type="checkbox"
                  className="video-select-checkbox"
                  checked={selectedVideos.includes(video.video_id)}
                  onChange={() => handleSelectVideo(video.video_id)}
                />
                <div className="video-badges">
                  {video.is_live && (
                    <span className="live-badge">🔴 LIVE</span>
                  )}
                  {video.featured && (
                    <span className="featured-badge">⭐ FEATURED</span>
                  )}
                </div>
              </div>

              <div className="video-content">
                <div className="video-header">
                  <h3 className="video-title">{video.title}</h3>
                </div>

                <div className="video-meta">
                  <span className={`status-badge status-${video.status}`}>
                    {video.status}
                  </span>
                  <span className="platform-badge">
                    {PLATFORMS.find(p => p.value === video.platform)?.icon} {video.platform}
                  </span>
                </div>

                {video.channel_name && (
                  <div className="video-channel">
                    <span>📺 {video.channel_name}</span>
                  </div>
                )}

                <div className="video-stats">
                  <div className="video-stat">
                    <span className="video-stat-value">{formatNumber(video.views_count)}</span>
                    <span className="video-stat-label">Views</span>
                  </div>
                  <div className="video-stat">
                    <span className="video-stat-value">{formatNumber(video.likes_count)}</span>
                    <span className="video-stat-label">Likes</span>
                  </div>
                  <div className="video-stat">
                    <span className="video-stat-value">{formatNumber(video.comments_count)}</span>
                    <span className="video-stat-label">Comments</span>
                  </div>
                </div>

                <div className="video-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => window.open(video.video_url, '_blank')}
                    title="View Original"
                    type="button"
                  >
                    View
                  </button>
                  {canGoLive && (
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleToggleLive(video.video_id)}
                      title={video.is_live ? 'Mark as Not Live' : 'Mark as Live'}
                      type="button"
                    >
                      {video.is_live ? '⏸️' : '▶️'}
                    </button>
                  )}
                  {(canDelete || canEditAny) && (
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(video.video_id)}
                      title="Delete Video"
                      type="button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => fetchVideos(pagination.current_page - 1)}
            disabled={!pagination.has_prev}
            type="button"
          >
            Previous
          </button>
          <div className="page-info">
            Page {pagination.current_page} of {pagination.total_pages}
          </div>
          <button
            className="page-btn"
            onClick={() => fetchVideos(pagination.current_page + 1)}
            disabled={!pagination.has_next}
            type="button"
          >
            Next
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)} type="button">×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this video? This action cannot be undone.</p>
              <div className="warning-message">
                This will permanently remove the video and all associated data.
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)} type="button">
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete} type="button">
                Delete Video
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
              <button className="close-btn" onClick={() => setShowBulkModal(false)} type="button">×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to {bulkAction} {selectedVideos.length} selected video
                {selectedVideos.length !== 1 ? 's' : ''}?
              </p>
              {bulkAction === 'delete' && (
                <div className="warning-message">
                  This action will permanently delete the selected videos and cannot be undone.
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowBulkModal(false)} type="button">
                Cancel
              </button>
              <button
                className={`confirm-btn ${bulkAction === 'delete' ? 'danger' : ''}`}
                onClick={confirmBulkAction}
                type="button"
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

export default ManageVideos;