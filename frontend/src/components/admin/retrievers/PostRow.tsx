'use client';

import React from 'react';

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
  author_id: number;
  tags: string;
  priority: string;
  reading_time: number;
}

interface PostRowProps {
  item: NewsItem;
  isSelected: boolean;
  currentUserId?: number;
  canApproveArticles: boolean;
  onSelectPost: (postId: number) => void;
  onEdit: (postId: number) => void;
  onDelete: (postId: number) => void;
  onApprovalClick: (post: NewsItem, action: 'approve' | 'disapprove') => void;
  onCustomizeClick: (post: NewsItem) => void;
}

const formatNumber = (num: number) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const PostRow: React.FC<PostRowProps> = ({
  item,
  isSelected,
  currentUserId,
  canApproveArticles,
  onSelectPost,
  onEdit,
  onDelete,
  onApprovalClick,
  onCustomizeClick
}) => {
  const isDraft = item.status === 'draft';
  const isPublished = item.status === 'published';
  const showApproveButton = canApproveArticles && isDraft;
  const showDisapproveButton = canApproveArticles && isPublished;

  return (
    <div className={`post-row ${isSelected ? 'selected' : ''}`}>
      <div className="column-select">
        <input
          type="checkbox"
          className="post-checkbox"
          checked={isSelected}
          onChange={() => onSelectPost(item.news_id)}
        />
      </div>
      
      <div className="column-content">
        <div className="post-image">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} />
          ) : (
            <div className="image-placeholder">📰</div>
          )}
          {item.featured && (
            <div className="featured-indicator" title={item.featured_tier || 'Featured'}>⭐</div>
          )}
          {item.editor_pick && (
            <div className="editor-pick-indicator">👑</div>
          )}
          {item.breaking && (
            <div className="breaking-indicator" title={item.breaking_level || 'Breaking'}>🔴</div>
          )}
          {item.pinned && (
            <div className="pinned-indicator" title={item.pin_type || 'Pinned'}>📌</div>
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
              {item.workflow_status && item.workflow_status !== item.status && (
                <span className="workflow-badge">
                  {item.workflow_status}
                </span>
              )}
              {item.primary_category_name && (
                <span className="category-tag">{item.primary_category_name}</span>
              )}
              {item.priority && item.priority !== 'medium' && (
                <span className={`priority-badge priority-${item.priority}`}>
                  {item.priority}
                </span>
              )}
            </div>
            
            <div className="author-info">
              {item.first_name && (
                <span className="author">
                  By {item.first_name} {item.last_name}
                  {currentUserId === item.author_id && (
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
              onClick={() => onApprovalClick(item, 'approve')}
              title="Approve & Publish"
            >
              ✅ Approve
            </button>
          )}
          {showDisapproveButton && (
            <button
              className="action-btn disapprove-btn"
              onClick={() => onApprovalClick(item, 'disapprove')}
              title="Move to Draft"
            >
              ⏸️ Disapprove
            </button>
          )}
          <button
            className="action-btn customize-btn"
            onClick={() => onCustomizeClick(item)}
            title="Customize Promotions"
          >
            ⚙️ Customize
          </button>
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(item.news_id)}
            title="Edit"
          >
            Edit
          </button>
          <button
            className="action-btn preview-btn"
            onClick={() => window.open(`/client/articles/${item.slug}`, '_blank')}
            title="View"
          >
            View
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(item.news_id)}
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostRow;