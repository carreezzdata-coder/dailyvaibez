'use client';

import React, { useEffect, useState } from 'react';

interface Quote {
  quote_id: number;
  quote_text: string;
  sayer_name: string;
  sayer_title: string;
  sayer_image_url?: string;
  active: boolean;
}

interface QuotesSidebarProps {
  onQuoteClick?: (quote: Quote) => void;
}

export default function QuotesSidebar({ onQuoteClick }: QuotesSidebarProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/client/quotes', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }

        const data = await response.json();

        if (data.success && data.quotes) {
          setQuotes(data.quotes.slice(0, 5));
        }
      } catch (err) {
        console.error('[QuotesSidebar] Error fetching quotes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quotes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const handleQuoteClick = (quote: Quote) => {
    if (onQuoteClick) {
      onQuoteClick(quote);
    }
  };

  return (
    <div className="quotes-sidebar-container">
      <div className="quotes-header">
        <span className="quotes-header-icon">💬</span>
        <h2 className="quotes-header-title">Quotes</h2>
      </div>

      <div className="quotes-list">
        {isLoading ? (
          <div className="quotes-loading-state">
            <p>Loading quotes...</p>
          </div>
        ) : error ? (
          <div className="quotes-error-state">
            <p>Failed to load quotes</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="quotes-empty-state">
            <p>No quotes available at the moment</p>
          </div>
        ) : (
          quotes.map((quote) => (
            <div
              key={quote.quote_id}
              className="quote-card"
              onClick={() => handleQuoteClick(quote)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleQuoteClick(quote);
                }
              }}
            >
              <div className="quote-content">
                <p className="quote-text">{quote.quote_text}</p>
                <div className="quote-author-info">
                  <span className="quote-sayer-name">{quote.sayer_name}</span>
                  {quote.sayer_title && (
                    <span className="quote-sayer-title">{quote.sayer_title}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}