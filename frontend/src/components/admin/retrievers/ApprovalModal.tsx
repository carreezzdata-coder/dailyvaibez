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
  breaking: boolean;
  breaking_level: string;
  breaking_until: string;
  pinned: boolean;
  pin_type: string;
  pin_until: string;
  editor_pick: boolean;
  author_id: number;
  tags: string;
  priority: string;
  reading_time: number;
}

interface ApprovalModalProps {
  post: NewsItem;
  action: 'approve' | 'disapprove';
  comment: string;
  isSubmitting: boolean;
  onCommentChange: (comment: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  post,
  action,
  comment,
  isSubmitting,
  onCommentChange,
  onConfirm,
  onClose
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            {action === 'approve' ? '✅ Approve Article' : '⏸️ Disapprove Article'}
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="approval-post-info">
            <h4>{post.title}</h4>
            <p className="approval-post-meta">
              By {post.first_name} {post.last_name} • 
              Status: <span className={`status-badge status-${post.status}`}>
                {post.status}
              </span>
            </p>
          </div>

          <div className="approval-description">
            {action === 'approve' ? (
              <p>This will publish the article and make it visible to all users.</p>
            ) : (
              <p>This will move the article back to draft status.</p>
            )}
          </div>

          <div className="approval-comment-section">
            <label htmlFor="approval-comment">
              {action === 'approve' ? 'Comments (Optional)' : 'Reason (Optional)'}
            </label>
            <textarea
              id="approval-comment"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder={action === 'approve' ? 'Add comments...' : 'Reason for disapproval...'}
              rows={4}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={`confirm-btn ${action === 'approve' ? 'approve' : 'disapprove'}`}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? '⏳ Processing...' 
              : action === 'approve' 
                ? '✅ Approve' 
                : '⏸️ Disapprove'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;