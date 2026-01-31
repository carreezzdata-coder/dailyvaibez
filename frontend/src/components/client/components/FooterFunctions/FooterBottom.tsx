// C:\Projects\DAILY VAIBE\frontend\src\components\client\components\FooterFunctions\FooterBottom.tsx
import React from 'react';
import Link from 'next/link';

interface FooterBottomProps {
  showBanner: boolean;
  openManageModal: () => void;
}

export default function FooterBottom({ showBanner, openManageModal }: FooterBottomProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer-bottom">
      <div className="footer-bottom-content">
        <div className="footer-bottom-left">
          <p className="footer-copyright">
            © {currentYear} Daily Vaibe. All rights reserved.
          </p>
        </div>

        <div className="footer-bottom-center">
          <nav className="footer-legal-links">
            <Link href="/static_pages/about">About</Link>
            <Link href="/static_pages/contact">Contact</Link>
            <Link href="/static_pages/careers">Careers</Link>
            <Link href="/static_pages/privacy">Privacy Policy</Link>
            <Link href="/static_pages/terms">Terms of Service</Link>
          </nav>
        </div>

        <div className="footer-bottom-right">
          {!showBanner && (
            <button 
              onClick={openManageModal}
              className="footer-cookie-settings"
              aria-label="Manage Cookie Settings"
            >
              Cookie Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}