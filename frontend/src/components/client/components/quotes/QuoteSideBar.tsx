import React from 'react';
import { Quote } from '../../hooks/useQuotes';

interface QuoteSidebarProps {
  quotes: Quote[];
  type: 'striking' | 'trending';
  onQuoteClick: (quote: Quote) => void;
}

const QuoteSidebar: React.FC<QuoteSidebarProps> = ({
  quotes,
  type,
  onQuoteClick,
}) => {
  const getImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://dailyvaibe.com${url}`;
  };

  const getInitials = (name: string): string => {
    if (!name) return 'DV';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const sidebarTitle = type === 'striking' ? 'Past Quotes' : 'Past Quotes';
  const sidebarIcon = type === 'striking' ? '⚡' : '🔥';

  return (
    <div className={`quotes-sidebar quotes-${type}-sidebar`}>
      <h3 className="quotes-sidebar-title">
        <span role="img" aria-label={type === 'striking' ? 'Lightning' : 'Fire'}>
          {sidebarIcon}
        </span>
        {sidebarTitle}
      </h3>
      <div className="quotes-sidebar-list">
        {quotes.map((quote) => (
          <button 
            key={quote.quote_id} 
            className={`quotes-sidebar-item ${type}`}
            onClick={() => onQuoteClick(quote)}
            aria-label={`View quote by ${quote.sayer_name}`}
            title={`${quote.sayer_name} - ${formatDate(quote.created_at)}`}
          >
            <div className="quotes-sidebar-thumbnail">
              {quote.sayer_image_url ? (
                <img 
                  src={getImageUrl(quote.sayer_image_url)} 
                  alt={quote.sayer_name}
                  loading="lazy"
                  width={60}
                  height={60}
                />
              ) : (
                <div className="quotes-sidebar-avatar-placeholder">
                  {getInitials(quote.sayer_name)}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuoteSidebar;