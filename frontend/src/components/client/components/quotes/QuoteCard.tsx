import React from 'react';
import { Quote } from '../../hooks/useQuotes';
import { getInitials } from './QuotesUtils';

interface QuoteCardProps {
  quote: Quote;
  index: number;
  tier: string;
  themeColor: string;
  onCardClick: (quote: Quote, index: number) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  index,
  tier,
  themeColor,
  onCardClick,
}) => {
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://dailyvaibe.com${url}`;
  };

  return (
    <article
      className={`quote-card ${tier}`}
      onClick={() => onCardClick(quote, index)}
    >
      <div className="quote-card-image-wrapper">
        <div className="quote-card-image">
          {quote.sayer_image_url ? (
            <img 
              src={getImageUrl(quote.sayer_image_url)} 
              alt={quote.sayer_name}
              loading="lazy"
              width={300}
              height={300}
            />
          ) : (
            <div className="quote-avatar-placeholder" style={{ width: '100%', height: '100%', fontSize: '4rem' }}>
              {getInitials(quote.sayer_name)}
            </div>
          )}
        </div>

        <div className="quote-image-overlay"></div>

        <div className="quote-watermark">
          <div className="quote-watermark-text">DV</div>
        </div>

        <div className="quote-brand-badge">DAILY VAIBE</div>

        <div className="quote-card-content">
          <div className="quote-icon">"</div>
          <p className="quote-text">{quote.quote_text}</p>
          
          <div className="quote-footer">
            <div className="quote-avatar">
              {quote.sayer_image_url ? (
                <img 
                  src={getImageUrl(quote.sayer_image_url)} 
                  alt={quote.sayer_name}
                  loading="lazy"
                  width={48}
                  height={48}
                />
              ) : (
                <div className="quote-avatar-placeholder">
                  {getInitials(quote.sayer_name)}
                </div>
              )}
            </div>
            <div className="quote-attribution">
              <div className="quote-sayer-name">{quote.sayer_name}</div>
              {quote.sayer_title && (
                <div className="quote-sayer-title">{quote.sayer_title}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default QuoteCard;