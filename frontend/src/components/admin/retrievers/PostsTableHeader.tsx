'use client';

import React from 'react';

interface PostsTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
}

const PostsTableHeader: React.FC<PostsTableHeaderProps> = ({
  selectedCount,
  totalCount,
  onSelectAll
}) => {
  return (
    <div className="table-header">
      <div className="column-select">
        <input
          type="checkbox"
          className="select-all-checkbox"
          checked={selectedCount === totalCount && totalCount > 0}
          onChange={onSelectAll}
        />
      </div>
      <div className="column-content">Post Details</div>
      <div className="column-stats">Engagement</div>
      <div className="column-actions">Actions</div>
    </div>
  );
};

export default PostsTableHeader;