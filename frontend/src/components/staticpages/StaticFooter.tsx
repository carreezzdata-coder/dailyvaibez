// C:\Projects\DAILY VAIBE\frontend\src\components\staticpages\StaticFooter.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export default function StaticFooter() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/static_pages/about' },
    { name: 'Careers', href: '/static_pages/careers' },
    { name: 'Contact', href: '/static_pages/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/static_pages/privacy' },
    { name: 'Terms of Service', href: '/static_pages/terms' },
    { name: 'Cookie Policy', href: '/static_pages/privacy#cookies' },
    { name: 'Sitemap', href: '/sitemap' },
  ];

  const categories = [
    { name: 'Politics', href: '/category/politics' },
    { name: 'Business', href: '/category/business' },
    { name: 'Sports', href: '/category/sports' },
    { name: 'Technology', href: '/category/technology' },
  ];

  return (
    <footer className="site-footer">
      <div className="main-container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-heading">Daily Vaibe</h3>
            <p className="footer-desc">
              Your trusted source for comprehensive African news, stories, and insights. 
              Bringing you the latest from politics, business, sports, culture, and more.
            </p>
            <div className="footer-socials">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="Facebook"
              >
                <span style={{ color: 'var(--primary-color)' }}>f</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="Twitter"
              >
                <span style={{ color: 'var(--primary-color)' }}>𝕏</span>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="Instagram"
              >
                <span style={{ color: 'var(--primary-color)' }}>📷</span>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="LinkedIn"
              >
                <span style={{ color: 'var(--primary-color)' }}>in</span>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
                aria-label="YouTube"
              >
                <span style={{ color: 'var(--primary-color)' }}>▶</span>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-list">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Categories</h3>
            <ul className="footer-list">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link href={category.href} className="footer-link">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Newsletter</h3>
            <p className="newsletter-text">
              Stay updated with our latest news and exclusive content.
            </p>
            <form 
              className="newsletter-box"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing!');
              }}
            >
              <input
                type="email"
                placeholder="Your email"
                className="newsletter-input"
                required
                aria-label="Email address"
              />
              <button 
                type="submit" 
                className="newsletter-button"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 'var(--spacing-lg)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: 'var(--spacing-xl) 0',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          margin: 'var(--spacing-xl) 0'
        }}>
          {legalLinks.map((link, index) => (
            <React.Fragment key={link.href}>
              <Link 
                href={link.href}
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {link.name}
              </Link>
              {index < legalLinks.length - 1 && (
                <span style={{ color: 'var(--text-muted)' }}>•</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {currentYear} Daily Vaibe. All rights reserved.
          </p>
          <p className="made-with-love">
            Made with ❤️ in Kileleshwa, Nairobi
          </p>
        </div>
      </div>
    </footer>
  );
}