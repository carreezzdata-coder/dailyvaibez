// frontend/src/components/client/cookies/CookieBanner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useCookieConfig } from './useCookieConfig';

export default function CookieBanner() {
  const { hasConsent, acceptAll, openSettings } = useCookieConfig();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const timer = setTimeout(() => {
      if (!hasConsent) {
        setIsVisible(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasConsent]);

  const handleAccept = () => {
    acceptAll();
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || hasConsent) return null;

  return (
    <>
      <div className="cookie-banner-bar">
        <div className="banner-content-bar">
          <div className="banner-text-bar">
            <p>
              We use cookies to enhance your experience. By continuing, you accept our use of cookies.
            </p>
          </div>

          <div className="banner-actions-bar">
            <button onClick={handleAccept} className="btn-accept-bar">
              Accept
            </button>

            <button onClick={() => setIsExpanded(!isExpanded)} className="btn-expand-bar">
              {isExpanded ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>

            <button onClick={openSettings} className="btn-settings-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2" />
              </svg>
            </button>

            <button onClick={handleClose} className="btn-close-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="banner-expanded-bar">
            <div className="expanded-grid">
              <div className="expanded-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div>
                  <h4>Privacy First</h4>
                  <p>All data stays on your device</p>
                </div>
              </div>

              <div className="expanded-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                </svg>
                <div>
                  <h4>Personalized</h4>
                  <p>Content tailored to you</p>
                </div>
              </div>

              <div className="expanded-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <div>
                  <h4>Fast & Secure</h4>
                  <p>Optimized performance</p>
                </div>
              </div>

              <div className="expanded-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <div>
                  <h4>Full Control</h4>
                  <p>Manage all preferences</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .cookie-banner-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #1e293b;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
          animation: slideInUp 0.5s ease-out;
        }

        .banner-content-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          gap: 20px;
        }

        .banner-text-bar {
          flex: 1;
        }

        .banner-text-bar p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }

        .banner-actions-bar {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-accept-bar {
          padding: 10px 24px;
          background: #D32F2F;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-accept-bar:hover {
          background: #B71C1C;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(211, 47, 47, 0.4);
        }

        .btn-expand-bar,
        .btn-settings-bar,
        .btn-close-bar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-expand-bar:hover,
        .btn-settings-bar:hover,
        .btn-close-bar:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .btn-expand-bar svg,
        .btn-settings-bar svg,
        .btn-close-bar svg {
          width: 18px;
          height: 18px;
        }

        .banner-expanded-bar {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px 24px;
          background: rgba(0, 0, 0, 0.2);
          animation: expandDown 0.3s ease-out;
        }

        .expanded-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .expanded-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .expanded-item svg {
          width: 24px;
          height: 24px;
          color: #D32F2F;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .expanded-item h4 {
          color: white;
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px;
        }

        .expanded-item p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          margin: 0;
          line-height: 1.4;
        }

        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes expandDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 300px;
          }
        }

        @media (max-width: 768px) {
          .banner-content-bar {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
            gap: 12px;
          }

          .banner-text-bar {
            text-align: center;
          }

          .banner-actions-bar {
            justify-content: center;
          }

          .expanded-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}