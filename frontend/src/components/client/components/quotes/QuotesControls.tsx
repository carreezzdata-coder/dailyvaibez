import React from 'react';

interface QuotesControlsProps {
  viewMode: string;
  itemsPerPage: number;
  onViewModeChange: (mode: string) => void;
  onItemsPerPageChange: (count: number) => void;
}

const QuotesControls: React.FC<QuotesControlsProps> = ({
  viewMode,
  itemsPerPage,
  onViewModeChange,
  onItemsPerPageChange,
}) => {
  return (
    <div className="quotes-controls-bar">
      <div className="quotes-controls-row">
        <select 
          value={viewMode} 
          onChange={(e) => onViewModeChange(e.target.value)} 
          className="quotes-control-select"
          aria-label="Select view mode"
        >
          <option value="masonry">🎨 Masonry View</option>
          <option value="grid">📱 Grid View</option>
          <option value="list">📋 List View</option>
        </select>

        <select 
          value={itemsPerPage} 
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))} 
          className="quotes-control-select"
          aria-label="Select number of items per page"
        >
          <option value={12}>Show 12</option>
          <option value={24}>Show 24</option>
          <option value={36}>Show 36</option>
          <option value={48}>Show 48</option>
          <option value={72}>Show 72</option>
        </select>
      </div>
    </div>
  );
};

export default QuotesControls;