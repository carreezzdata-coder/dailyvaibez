// C:\Projects\DAILY VAIBE\frontend\src\components\staticpages\StaticHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StaticHeader() {
  const [theme, setTheme] = useState<'white' | 'dark' | 'african'>('white');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'white' | 'dark' | 'african' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: 'white' | 'dark' | 'african') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="site-header">
        <div className="header-top-bar">
          <div className="main-container">
            <div className="header-top-content">
              <div className="breaking-ticker">
                📰 Your trusted source for African news
              </div>
              
              <div className="theme-switcher desktop-only">
                <button
                  onClick={() => handleThemeChange('white')}
                  className={`theme-btn theme-white ${theme === 'white' ? 'active' : ''}`}
                  aria-label="White Theme"
                  title="White Theme"
                />
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`theme-btn theme-dark ${theme === 'dark' ? 'active' : ''}`}
                  aria-label="Dark Theme"
                  title="Dark Theme"
                />
                <button
                  onClick={() => handleThemeChange('african')}
                  className={`theme-btn theme-african ${theme === 'african' ? 'active' : ''}`}
                  aria-label="African Theme"
                  title="African Theme"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="main-container">
          <div className="header-main">
            <Link href="/" className="logo-section">
              <h1 className="site-title">Daily Vaibe</h1>
              <p className="site-tagline">African News, Global Perspective</p>
            </Link>

            <nav className="desktop-only" style={{ marginLeft: 'auto' }}>
              <div style={{ 
                display: 'flex', 
                gap: 'var(--spacing-lg)', 
                alignItems: 'center' 
              }}>
                <Link 
                  href="/"
                  style={{
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                >
                  Home
                </Link>
                <Link 
                  href="/static_pages/about"
                  style={{
                    color: isActive('/static_pages/about') ? 'var(--primary-color)' : 'var(--text-primary)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseOut={(e) => !isActive('/static_pages/about') && (e.currentTarget.style.color = 'var(--text-primary)')}
                >
                  About
                </Link>
                <Link 
                  href="/static_pages/contact"
                  style={{
                    color: isActive('/static_pages/contact') ? 'var(--primary-color)' : 'var(--text-primary)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseOut={(e) => !isActive('/static_pages/contact') && (e.currentTarget.style.color = 'var(--text-primary)')}
                >
                  Contact
                </Link>
              </div>
            </nav>

            <button
              className="mobile-menu-btn mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-fullscreen-menu mobile-only">
          <div className="mobile-menu-content">
            <button
              className="mobile-sidebar-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px'
              }}
            >
              ×
            </button>

            <div style={{ marginBottom: 'var(--spacing-2xl)', textAlign: 'center' }}>
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <h2 className="site-title" style={{ fontSize: 'var(--text-3xl)' }}>
                  Daily Vaibe
                </h2>
              </Link>
            </div>

            <div className="mobile-categories">
              <Link 
                href="/"
                className="mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link 
                href="/static_pages/about"
                className={`mobile-nav-item ${isActive('/static_pages/about') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                ℹ️ About Us
              </Link>
              <Link 
                href="/static_pages/careers"
                className={`mobile-nav-item ${isActive('/static_pages/careers') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                💼 Careers
              </Link>
              <Link 
                href="/static_pages/contact"
                className={`mobile-nav-item ${isActive('/static_pages/contact') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                📧 Contact
              </Link>
              <Link 
                href="/static_pages/privacy"
                className={`mobile-nav-item ${isActive('/static_pages/privacy') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                🔒 Privacy Policy
              </Link>
              <Link 
                href="/static_pages/terms"
                className={`mobile-nav-item ${isActive('/static_pages/terms') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                📜 Terms of Service
              </Link>
            </div>

            <div className="mobile-theme-section">
              <h3>Choose Theme</h3>
              <div className="mobile-theme-switcher">
                <button
                  className={`mobile-theme-btn ${theme === 'white' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('white')}
                >
                  <div className="theme-indicator theme-white"></div>
                  <span>White Theme</span>
                </button>
                <button
                  className={`mobile-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <div className="theme-indicator theme-dark"></div>
                  <span>Dark Theme</span>
                </button>
                <button
                  className={`mobile-theme-btn ${theme === 'african' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('african')}
                >
                  <div className="theme-indicator theme-african"></div>
                  <span>African Theme</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}