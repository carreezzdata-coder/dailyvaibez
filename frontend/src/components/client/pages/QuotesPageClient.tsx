'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, getImageUrl } from '../../../lib/clientData';
import { useQuotes, type Quote } from '../hooks/useQuotes';
import Header from '../components/Header';
import Horizontal from '../components/Horizontal';
import Footer from '../components/Footer';
import QuotesGallery from '../components/quotes/QuotesGallery';
import QuoteModal from '../components/quotes/QuoteModal';
import { getThemeColor } from '../components/quotes/QuotesUtils';

interface QuotesPageClientProps {
  initialData: {
    quotes: Quote[];
    strikingQuotes: Quote[];
    trendingQuotes: Quote[];
  };
}

function QuoteFlash({
  currentFlash,
  onClick,
}: {
  currentFlash: Quote | undefined;
  onClick: (quote: Quote) => void;
}) {
  if (!currentFlash) return null;

  const handleButtonKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div className="quote-flash-banner">
      <div className="quote-flash-container">
        <div className="quote-flash-left">
          <span className="quote-flash-icon" aria-hidden="true">💬</span>
          <span className="quote-flash-label">QUOTE OF THE MOMENT</span>
        </div>
        
        <button 
          className="quote-flash-content"
          onClick={() => onClick(currentFlash)}
          onKeyDown={(e) => handleButtonKeyDown(e, () => onClick(currentFlash))}
          aria-label={`View quote by ${currentFlash.sayer_name}`}
        >
          {currentFlash.sayer_image_url && (
            <div className="quote-flash-avatar">
              <img src={getImageUrl(currentFlash.sayer_image_url)} alt={currentFlash.sayer_name} />
            </div>
          )}
          <div className="quote-flash-quote-mark">"</div>
          <div className="quote-flash-text-wrapper">
            <span className="quote-flash-text">{currentFlash.quote_text}</span>
            <span className="quote-flash-author">— {currentFlash.sayer_name}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function QuotesPageClient({ initialData }: QuotesPageClientProps) {
  const router = useRouter();
  const { 
    quotes, 
    strikingQuotes, 
    trendingQuotes, 
    isLoading, 
    error, 
    refresh,
    totalAvailable 
  } = useQuotes(initialData?.quotes);

  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('white');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [flashIndex, setFlashIndex] = useState(0);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const posterRef = React.useRef<HTMLDivElement>(null);
  
  const flashQuotes = quotes.slice(0, Math.min(5, quotes.length));
  const currentFlash = flashQuotes[flashIndex];
  const themeColor = getThemeColor(currentTheme);
  
  useEffect(() => {
    console.log('[QuotesPageClient] Data state:', {
      quotesCount: quotes.length,
      strikingCount: strikingQuotes.length,
      trendingCount: trendingQuotes.length,
      totalAvailable,
      isLoading,
      hasError: !!error,
      initialDataProvided: !!initialData?.quotes,
      initialDataCount: initialData?.quotes?.length || 0
    });
  }, [quotes.length, strikingQuotes.length, trendingQuotes.length, totalAvailable, isLoading, error, initialData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (flashQuotes.length === 0) return;
    
    const interval = setInterval(() => {
      setFlashIndex((prev) => (prev + 1) % flashQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [flashQuotes.length]);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vybes-theme', theme);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('vybes-theme') || 'white';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted, lastScrollY]);

  const handleQuoteClick = (quote: Quote, index?: number) => {
    const quoteIndex = index !== undefined ? index : quotes.findIndex(q => q.quote_id === quote.quote_id);
    setSelectedQuote(quote);
    setCurrentIndex(quoteIndex !== -1 ? quoteIndex : 0);
  };

  const handleCloseModal = () => {
    setSelectedQuote(null);
  };

  const handleModalNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentIndex < quotes.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedQuote(quotes[newIndex]);
    } else if (direction === 'prev' && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedQuote(quotes[newIndex]);
    }
  };

  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (selectedQuote && e.key === 'Escape') {
        handleCloseModal();
      } else if (selectedQuote && e.key === 'ArrowLeft') {
        handleModalNavigation('prev');
      } else if (selectedQuote && e.key === 'ArrowRight') {
        handleModalNavigation('next');
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [selectedQuote, currentIndex, quotes]);

  if (!mounted) {
    return (
      <div className="quotes-page">
        <div className={`header-wrapper ${isHeaderVisible ? 'visible' : 'hidden'}`}>
          <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        </div>
        <Horizontal activeCategory="quotes" />
        <main className="quotes-main-container">
          <div className="quotes-page-layout">
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p>Loading quotes...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading && quotes.length === 0) {
    return (
      <div className="quotes-page">
        <div className={`header-wrapper ${isHeaderVisible ? 'visible' : 'hidden'}`}>
          <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        </div>
        <Horizontal activeCategory="quotes" />
        <main className="quotes-main-container">
          <div className="quotes-page-layout">
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div className="loading-spinner"></div>
              <p>Loading quotes...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && quotes.length === 0) {
    return (
      <div className="quotes-page">
        <div className={`header-wrapper ${isHeaderVisible ? 'visible' : 'hidden'}`}>
          <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        </div>
        <Horizontal activeCategory="quotes" />
        <main className="quotes-main-container">
          <div className="quotes-page-layout">
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h2>Failed to load quotes</h2>
              <p style={{ color: '#666', marginTop: '1rem' }}>{error}</p>
              <button 
                onClick={refresh}
                style={{
                  marginTop: '2rem',
                  padding: '0.75rem 2rem',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="quotes-page">
        <div className={`header-wrapper ${isHeaderVisible ? 'visible' : 'hidden'}`}>
          <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
        </div>
        <Horizontal activeCategory="quotes" />
        <main className="quotes-main-container">
          <div className="quotes-page-layout">
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h2>No quotes available</h2>
              <p>Please check back later or contact support if this issue persists.</p>
              <button 
                onClick={refresh}
                style={{
                  marginTop: '2rem',
                  padding: '0.75rem 2rem',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Refresh Quotes
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="quotes-page">
      <div className={`header-wrapper ${isHeaderVisible ? 'visible' : 'hidden'}`}>
        <Header currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      </div>
      <Horizontal activeCategory="quotes" />

      {mounted && currentFlash && (
        <QuoteFlash
          currentFlash={currentFlash}
          onClick={handleQuoteClick}
        />
      )}

      <main className="quotes-main-container">
        <div className="quotes-page-layout">
          <QuotesGallery
            allQuotes={quotes}
            currentTheme={currentTheme}
            onQuoteClick={handleQuoteClick}
          />
        </div>
      </main>

      {selectedQuote && (
        <QuoteModal
          selectedQuote={selectedQuote}
          currentIndex={currentIndex}
          totalQuotes={quotes.length}
          themeColor={themeColor}
          onClose={handleCloseModal}
          onNavigate={handleModalNavigation}
          posterRef={posterRef}
        />
      )}

      <Footer />
    </div>
  );
}