'use client';

import React, { useState, useEffect } from 'react';
import { useCookieConfig } from './useCookieConfig';

export default function CookieControls() {
  const { openSettings, hasConsent } = useCookieConfig();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [hasConsent]);

  if (!isVisible) return null;

  return (
    <>
      <button 
        className="cookie-settings-icon-fab"
        onClick={openSettings}
        aria-label="Cookie preferences"
        title="Manage cookie preferences"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2" />
        </svg>
      </button>

      <style jsx global>{`
        .cookie-settings-icon-fab {
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color, #dc2626);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: all 0.15s ease;
          z-index: 9998;
        }

        [data-theme="dark"] .cookie-settings-icon-fab {
          background: var(--primary-color, #00ffc6);
          color: var(--text-on-primary, #000000);
          box-shadow: 0 0 20px rgba(0, 255, 198, 0.4);
        }

        [data-theme="african"] .cookie-settings-icon-fab {
          background: var(--african-red, #dc2626);
          color: white;
        }

        [data-theme="mint"] .cookie-settings-icon-fab {
          background: var(--primary-color, #00d4aa);
          color: white;
        }

        .cookie-settings-icon-fab:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] .cookie-settings-icon-fab:hover {
          box-shadow: 0 0 25px rgba(0, 255, 198, 0.6);
        }

        .cookie-settings-icon-fab svg {
          width: 22px;
          height: 22px;
        }

        @media (max-width: 768px) {
          .cookie-settings-icon-fab {
            bottom: 16px;
            left: 16px;
            width: 44px;
            height: 44px;
          }

          .cookie-settings-icon-fab svg {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </>
  );
}