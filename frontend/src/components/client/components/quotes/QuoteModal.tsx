import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  MessageCircle,
  Copy,
  Check,
  Download,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageSquare,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Quote } from '../../hooks/useQuotes';
import { getInitials } from './QuotesUtils';

interface QuoteModalProps {
  selectedQuote: Quote | null;
  currentIndex: number;
  totalQuotes: number;
  themeColor: string;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  posterRef: React.RefObject<HTMLDivElement>;
}

const QuoteModal: React.FC<QuoteModalProps> = ({
  selectedQuote,
  currentIndex,
  totalQuotes,
  themeColor,
  onClose,
  onNavigate,
  posterRef,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!selectedQuote) return null;

  const formatDate = (date: string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://dailyvaibe.com${url}`;
  };

  const getShareText = () => {
    const quoteText = selectedQuote.quote_text.length > 100 
      ? selectedQuote.quote_text.substring(0, 100) + '...'
      : selectedQuote.quote_text;
    
    return `"${quoteText}" - ${selectedQuote.sayer_name}\n\nRead more quotes at Daily Vaibe: `;
  };

  const shareToSocial = (platform: string) => {
    const shareText = getShareText();
    const pageUrl = window.location.href.split('?')[0];
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(pageUrl);
    
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'instagram':
        copyToClipboard(`${shareText}${pageUrl}`);
        alert('Quote copied! You can now paste it on Instagram');
        return;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Check out this quote from Daily Vaibe&body=${encodeURIComponent(shareText + pageUrl)}`;
        window.location.href = shareUrl;
        return;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  const copyToClipboard = async (text?: string) => {
    const shareText = text || `${getShareText()}${window.location.href.split('?')[0]}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
      }
      
      document.body.removeChild(textArea);
    }
  };

  const downloadAsText = () => {
    const shareText = getShareText();
    const pageUrl = window.location.href.split('?')[0];
    const content = `${shareText}${pageUrl}\n\nShared from Daily Vaibe`;
    
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `quote-${selectedQuote.sayer_name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const ShareMenu = () => (
    <div className="share-menu-overlay" onClick={() => setShowShareMenu(false)}>
      <div className="share-menu" onClick={(e) => e.stopPropagation()}>
        <div className="share-menu-header">
          <h3>Share this inspiring quote</h3>
          <button className="share-menu-close" onClick={() => setShowShareMenu(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="share-quote-preview">
          <div className="share-quote-text">"{selectedQuote.quote_text.substring(0, 80)}..."</div>
          <div className="share-quote-author">— {selectedQuote.sayer_name}</div>
        </div>
        
        <div className="share-platforms-grid">
          <button 
            className="share-platform-btn twitter"
            onClick={() => shareToSocial('twitter')}
            title="Share on Twitter"
          >
            <Twitter size={24} />
            <span>Twitter</span>
          </button>
          
          <button 
            className="share-platform-btn facebook"
            onClick={() => shareToSocial('facebook')}
            title="Share on Facebook"
          >
            <Facebook size={24} />
            <span>Facebook</span>
          </button>
          
          <button 
            className="share-platform-btn whatsapp"
            onClick={() => shareToSocial('whatsapp')}
            title="Share on WhatsApp"
          >
            <MessageCircle size={24} />
            <span>WhatsApp</span>
          </button>
          
          <button 
            className="share-platform-btn linkedin"
            onClick={() => shareToSocial('linkedin')}
            title="Share on LinkedIn"
          >
            <Linkedin size={24} />
            <span>LinkedIn</span>
          </button>
          
          <button 
            className="share-platform-btn telegram"
            onClick={() => shareToSocial('telegram')}
            title="Share on Telegram"
          >
            <MessageSquare size={24} />
            <span>Telegram</span>
          </button>
          
          <button 
            className="share-platform-btn instagram"
            onClick={() => shareToSocial('instagram')}
            title="Copy for Instagram"
          >
            <Instagram size={24} />
            <span>Instagram</span>
          </button>
          
          <button 
            className="share-platform-btn email"
            onClick={() => shareToSocial('email')}
            title="Share via Email"
          >
            <Mail size={24} />
            <span>Email</span>
          </button>
          
          <button 
            className="share-platform-btn reddit"
            onClick={() => shareToSocial('reddit')}
            title="Share on Reddit"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-6.07-1.72.08-1.1.4-3.05 1.52-3.7.72-.4 1.73-.24 2 .34.21.43.13.9-.1 1.27-.22.37-.46.67-.67 1.07-.35.64-.18 1.49.38 2 .56.52 1.37.62 2.05.27 1.12-.58 1.98-1.78 2.2-3.02.14-.8-.16-1.46-.5-2.18-.36-.75-.82-1.69-1.73-2.08C14.55.15 13.79 0 13 0c-2.8 0-4.9 2.27-5.17 5.21-2.42.08-4.5.72-6.2 1.72C1.86 6.98.96 6.5 0 6.5c-1.65 0-3 1.35-3 3 0 1.32.84 2.44 2.05 2.84-.03.22-.05.44-.05.66 0 3.86 4.5 7 10 7s10-3.14 10-7c0-.22-.02-.44-.05-.66 1.2-.4 2.05-1.54 2.05-2.84zM6.92 13.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10.15 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
            <span>Reddit</span>
          </button>
        </div>
        
        <div className="share-actions">
          <button 
            className="share-action-btn copy-btn"
            onClick={() => copyToClipboard()}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            <span>{copied ? 'Copied!' : 'Copy Quote'}</span>
          </button>
          
          <button 
            className="share-action-btn download-btn"
            onClick={downloadAsText}
          >
            <Download size={20} />
            <span>Save as Text</span>
          </button>
          
          <button 
            className="share-action-btn link-btn"
            onClick={() => window.open(window.location.href.split('?')[0], '_blank')}
          >
            <ExternalLink size={20} />
            <span>Open Page</span>
          </button>
        </div>
        
        <div className="share-footer">
          <p>Share this quote and inspire others! ✨</p>
          <small>All shares include a link back to Daily Vaibe</small>
        </div>
      </div>
    </div>
  );

  return (
    <div className="quote-modal-overlay" onClick={onClose}>
      {currentIndex > 0 && (
        <button 
          className="quote-nav-btn quote-nav-prev" 
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('prev');
          }}
          aria-label="Previous quote"
        >
          <ChevronLeft size={32} />
        </button>
      )}
      
      {currentIndex < totalQuotes - 1 && (
        <button 
          className="quote-nav-btn quote-nav-next" 
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('next');
          }}
          aria-label="Next quote"
        >
          <ChevronRight size={32} />
        </button>
      )}

      <div 
        className="quote-modal-poster" 
        onClick={(e) => e.stopPropagation()} 
        ref={posterRef}
      >
        <button 
          className="quote-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="quote-modal-image-container">
          <div className="quote-modal-image-wrapper">
            {selectedQuote.sayer_image_url ? (
              <img 
                src={getImageUrl(selectedQuote.sayer_image_url)} 
                alt={selectedQuote.sayer_name}
                className="quote-modal-background-image"
                loading="lazy"
              />
            ) : (
              <div 
                className="quote-modal-background-image placeholder" 
                style={{ 
                  backgroundColor: themeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {getInitials(selectedQuote.sayer_name)}
              </div>
            )}
            <div className="quote-modal-gradient-overlay"></div>
          </div>

          <div className="quote-modal-watermark-large">
            <div className="quote-modal-watermark-text">DV</div>
          </div>

          <div className="quote-modal-brand">Daily Vaibe</div>

          <div className="quote-modal-text-overlay">
            <div className="quote-modal-text-box">
              <div className="quote-modal-text-content">
                <span className="quote-modal-opening-quote">"</span>
                <p className="quote-modal-text">
                  {selectedQuote.quote_text}
                </p>
                <span className="quote-modal-closing-quote">"</span>
              </div>
              
              <div className="quote-modal-attribution">
                <div className="quote-modal-author-info">
                  <div className="quote-modal-author-name">
                    {selectedQuote.sayer_name}
                  </div>
                  {selectedQuote.sayer_title && (
                    <div className="quote-modal-author-title">
                      {selectedQuote.sayer_title}
                    </div>
                  )}
                  <div className="quote-modal-date">
                    {formatDate(selectedQuote.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="quote-modal-social-bar">
            <button 
              className="quote-modal-social-btn share-main-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowShareMenu(true);
              }}
              title="Share this quote"
              aria-label="Share this quote"
            >
              <Share2 size={22} />
            </button>
          </div>
        </div>
      </div>

      {showShareMenu && <ShareMenu />}
    </div>
  );
};

export default QuoteModal;