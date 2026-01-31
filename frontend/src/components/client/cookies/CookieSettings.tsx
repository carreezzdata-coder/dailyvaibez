// frontend/src/components/client/cookies/CookieSettings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useCookieConfig } from './useCookieConfig';
import type { CookiePreferences } from './useCookieConfig';

export default function CookieSettings() {
  const { 
    showSettings, 
    preferences, 
    closeSettings, 
    savePreferences,
    deviceId,
    geoLocation,
    userBehavior
  } = useCookieConfig();

  const [localPrefs, setLocalPrefs] = useState<CookiePreferences>(preferences);
  const [activeTab, setActiveTab] = useState<'preferences' | 'privacy' | 'data' | 'about'>('preferences');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalPrefs(preferences);
    setHasChanges(false);
  }, [preferences]);

  useEffect(() => {
    const changed = JSON.stringify(localPrefs) !== JSON.stringify(preferences);
    setHasChanges(changed);
  }, [localPrefs, preferences]);

  // Prevent text selection in sensitive areas
  useEffect(() => {
    if (showSettings) {
      document.body.style.userSelect = 'none';
      return () => {
        document.body.style.userSelect = '';
      };
    }
  }, [showSettings]);

  if (!showSettings) return null;

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setLocalPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    savePreferences(localPrefs);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    savePreferences(allAccepted);
  };

  const handleRejectOptional = () => {
    const rejected: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    savePreferences(rejected);
  };

  const getStoredDataSize = () => {
    if (typeof window === 'undefined') return '0 KB';
    
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  };

  const handleExportData = () => {
    const data = {
      deviceId,
      geoLocation,
      userBehavior,
      preferences: localPrefs,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dailyvaibe-preferences-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cookie-settings-overlay" onClick={closeSettings} role="button" tabIndex={0}>
      <div className="cookie-settings-modal no-select" onClick={(e) => e.stopPropagation()} role="button" tabIndex={0}>
        {/* Header */}
        <div className="settings-header">
          <div className="header-content">
            <div className="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2>Privacy & Cookie Settings</h2>
              <p>Control how we use cookies and protect your privacy</p>
            </div>
          </div>
          <button className="close-btn" onClick={closeSettings} aria-label="Close settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button 
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            Cookie Preferences
          </button>
          <button 
            className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Privacy Policy
          </button>
          <button 
            className={`tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
            Your Data
          </button>
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4m0-4h.01" />
            </svg>
            About Cookies
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {activeTab === 'preferences' && (
            <div className="preferences-panel">
              <div className="info-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4m0-4h.01" />
                </svg>
                <div>
                  <strong>Important:</strong> Your privacy preferences are stored locally on your device. 
                  We respect your choices and never share your personal data without consent.
                </div>
              </div>

              {/* Necessary Cookies */}
              <div className="cookie-item">
                <div className="cookie-info">
                  <div className="cookie-header">
                    <h3>Strictly Necessary Cookies</h3>
                    <span className="badge required">Always Active</span>
                  </div>
                  <p>These cookies are essential for the website to function properly. They enable basic features like page navigation, secure access, and remembering your cookie preferences. The website cannot function properly without these cookies.</p>
                  <div className="cookie-details">
                    <details>
                      <summary>What data do we collect?</summary>
                      <ul>
                        <li><strong>Session ID:</strong> Maintains your browsing session</li>
                        <li><strong>Security tokens:</strong> Protects against malicious attacks</li>
                        <li><strong>Cookie consent:</strong> Remembers your cookie choices</li>
                      </ul>
                    </details>
                  </div>
                  <div className="cookie-examples">
                    <span>Session management</span>
                    <span>Security</span>
                    <span>Load balancing</span>
                  </div>
                </div>
                <div className="toggle-switch disabled">
                  <input 
                    type="checkbox" 
                    id="necessary" 
                    checked 
                    disabled 
                    onChange={() => {}} 
                  />
                  <label htmlFor="necessary" className="slider"></label>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="cookie-item">
                <div className="cookie-info">
                  <div className="cookie-header">
                    <h3>Functional Cookies</h3>
                    <span className={`badge ${localPrefs.functional ? 'active' : 'inactive'}`}>
                      {localPrefs.functional ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p>These cookies enable enhanced functionality and personalization, such as remembering your language preference, theme settings, and layout choices. They improve your browsing experience but aren't essential for the site to work.</p>
                  <div className="cookie-details">
                    <details>
                      <summary>What data do we collect?</summary>
                      <ul>
                        <li><strong>Language preference:</strong> Your chosen display language</li>
                        <li><strong>Theme selection:</strong> Light/dark mode preference</li>
                        <li><strong>Layout settings:</strong> Customized view options</li>
                        <li><strong>Region settings:</strong> Local content preferences</li>
                      </ul>
                    </details>
                  </div>
                  <div className="cookie-examples">
                    <span>Language preference</span>
                    <span>Theme settings</span>
                    <span>Layout choices</span>
                  </div>
                </div>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="functional"
                    checked={localPrefs.functional}
                    onChange={() => handleToggle('functional')}
                  />
                  <label htmlFor="functional" className="slider"></label>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="cookie-item">
                <div className="cookie-info">
                  <div className="cookie-header">
                    <h3>Performance & Analytics Cookies</h3>
                    <span className={`badge ${localPrefs.analytics ? 'active' : 'inactive'}`}>
                      {localPrefs.analytics ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p>These cookies help us understand how visitors interact with our website by collecting and reporting anonymous information. This helps us improve our content and user experience based on real usage patterns.</p>
                  <div className="cookie-details">
                    <details>
                      <summary>What data do we collect?</summary>
                      <ul>
                        <li><strong>Page views:</strong> Which pages you visit</li>
                        <li><strong>Time on site:</strong> How long you spend reading</li>
                        <li><strong>Navigation patterns:</strong> How you move through our site</li>
                        <li><strong>Device information:</strong> Browser type, screen size (no personal ID)</li>
                        <li><strong>Geographic region:</strong> County-level location only</li>
                      </ul>
                    </details>
                  </div>
                  <div className="cookie-examples">
                    <span>Page analytics</span>
                    <span>Usage statistics</span>
                    <span>Performance monitoring</span>
                  </div>
                  <div className="privacy-note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    All analytics data is aggregated and anonymized. We never track individual users or sell your data.
                  </div>
                </div>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="analytics"
                    checked={localPrefs.analytics}
                    onChange={() => handleToggle('analytics')}
                  />
                  <label htmlFor="analytics" className="slider"></label>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="cookie-item">
                <div className="cookie-info">
                  <div className="cookie-header">
                    <h3>Marketing & Advertising Cookies</h3>
                    <span className={`badge ${localPrefs.marketing ? 'active' : 'inactive'}`}>
                      {localPrefs.marketing ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p>These cookies are used to show you advertisements that are relevant to your interests. They may be set by our advertising partners to build a profile of your interests and show you relevant ads on other websites.</p>
                  <div className="cookie-details">
                    <details>
                      <summary>What data do we collect?</summary>
                      <ul>
                        <li><strong>Ad interaction:</strong> Which ads you click or view</li>
                        <li><strong>Interest categories:</strong> Topics you engage with</li>
                        <li><strong>Cross-site activity:</strong> Your behavior across partner sites</li>
                      </ul>
                    </details>
                  </div>
                  <div className="cookie-examples">
                    <span>Targeted ads</span>
                    <span>Sponsored content</span>
                    <span>Ad measurement</span>
                  </div>
                </div>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="marketing"
                    checked={localPrefs.marketing}
                    onChange={() => handleToggle('marketing')}
                  />
                  <label htmlFor="marketing" className="slider"></label>
                </div>
              </div>

              {/* Personalization Cookies */}
              <div className="cookie-item">
                <div className="cookie-info">
                  <div className="cookie-header">
                    <h3>Personalization Cookies</h3>
                    <span className={`badge ${localPrefs.personalization ? 'active' : 'inactive'}`}>
                      {localPrefs.personalization ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p>These cookies allow us to customize content and recommendations based on your reading habits and preferences. They help us show you news and articles that match your interests.</p>
                  <div className="cookie-details">
                    <details>
                      <summary>What data do we collect?</summary>
                      <ul>
                        <li><strong>Reading history:</strong> Articles you've read (stored locally)</li>
                        <li><strong>Category preferences:</strong> Topics you engage with most</li>
                        <li><strong>Content recommendations:</strong> Personalized article suggestions</li>
                        <li><strong>Saved articles:</strong> Bookmarks and reading lists</li>
                      </ul>
                    </details>
                  </div>
                  <div className="cookie-examples">
                    <span>Content recommendations</span>
                    <span>Reading preferences</span>
                    <span>Personalized feed</span>
                  </div>
                  <div className="privacy-note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Your reading preferences are stored locally and never leave your device unless you explicitly share them.
                  </div>
                </div>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="personalization"
                    checked={localPrefs.personalization}
                    onChange={() => handleToggle('personalization')}
                  />
                  <label htmlFor="personalization" className="slider"></label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="privacy-panel">
              <div className="info-section">
                <h3>🔒 Your Privacy Matters to Us</h3>
                <p>At DailyVaibe, we are committed to protecting your privacy and being transparent about how we collect, use, and share your data. This policy explains our practices in detail.</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h4>Data Protection & Storage</h4>
                  <p><strong>Local-First Approach:</strong> All your personal data, including reading history, preferences, and behavior patterns, is stored exclusively on your device using secure browser storage (localStorage). We don't automatically sync this data to our servers.</p>
                  <p><strong>Server Storage:</strong> Only anonymized, aggregated statistics are sent to our servers for analytics purposes. This includes:</p>
                  <ul>
                    <li>Regional statistics (county-level, not personal addresses)</li>
                    <li>Total consent counts across all users</li>
                    <li>Overall preference trends and popular content categories</li>
                    <li>Technical performance metrics</li>
                  </ul>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <div>
                  <h4>What Information We Collect</h4>
                  <p><strong>Automatically Collected:</strong></p>
                  <ul>
                    <li>IP address (for regional statistics only, not stored long-term)</li>
                    <li>Browser type and version</li>
                    <li>Device type and screen resolution</li>
                    <li>Operating system</li>
                    <li>Pages visited and time spent</li>
                    <li>Referral source</li>
                  </ul>
                  <p><strong>With Your Consent:</strong></p>
                  <ul>
                    <li>Reading preferences and article interactions</li>
                    <li>Category engagement patterns</li>
                    <li>Personalization data for content recommendations</li>
                    <li>Marketing preferences for targeted advertising</li>
                  </ul>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                </div>
                <div>
                  <h4>What We NEVER Do</h4>
                  <ul>
                    <li><strong>Sell your data:</strong> We will never sell your personal information to third parties</li>
                    <li><strong>Track without consent:</strong> Optional cookies require your explicit permission</li>
                    <li><strong>Store sensitive data:</strong> We don't collect passwords, financial information, or government IDs</li>
                    <li><strong>Share personally identifiable information:</strong> Your device ID, specific articles read, and personal browsing habits are never shared</li>
                    <li><strong>Use dark patterns:</strong> We make it easy to opt-out and manage your preferences</li>
                  </ul>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h4>Your Rights & Control</h4>
                  <p>Under data protection regulations (GDPR, CCPA, etc.), you have the right to:</p>
                  <ul>
                    <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
                    <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                    <li><strong>Correction:</strong> Update inaccurate or incomplete data</li>
                    <li><strong>Deletion:</strong> Clear all locally stored data at any time</li>
                    <li><strong>Objection:</strong> Opt-out of any non-essential data processing</li>
                    <li><strong>Restriction:</strong> Limit how we process your data</li>
                    <li><strong>Withdrawal:</strong> Change your cookie preferences at any time</li>
                  </ul>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4>Data Retention Policy</h4>
                  <ul>
                    <li><strong>Local data:</strong> Persists on your device until you clear it manually</li>
                    <li><strong>Aggregated statistics:</strong> Kept for 90 days for analytics, then automatically deleted</li>
                    <li><strong>Necessary cookies:</strong> Session-based, deleted when you close your browser (unless you have "Remember me" enabled)</li>
                    <li><strong>Preference cookies:</strong> Stored for up to 12 months, renewable with continued use</li>
                  </ul>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <h4>Third-Party Services</h4>
                  <p>We work with trusted partners who help us operate our website:</p>
                  <ul>
                    <li><strong>Analytics providers:</strong> Google Analytics (with IP anonymization)</li>
                    <li><strong>Advertising networks:</strong> Only if marketing cookies are enabled</li>
                    <li><strong>Content delivery:</strong> Cloudflare CDN for fast, secure content delivery</li>
                  </ul>
                  <p>These partners have their own privacy policies and are contractually obligated to protect your data.</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4>Contact Us</h4>
                  <p>If you have questions about this privacy policy or want to exercise your rights, contact us at:</p>
                  <ul>
                    <li><strong>Email:</strong> privacy@dailyvaibe.com</li>
                    <li><strong>Response time:</strong> Within 30 days of your request</li>
                  </ul>
                  <p>We take your privacy concerns seriously and will work with you to resolve any issues.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="data-panel">
              <div className="data-summary">
                <h3>Your Personal Data Dashboard</h3>
                <p>All this data is stored <strong>only on your device</strong> and never leaves without your explicit permission.</p>
              </div>

              <div className="data-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Storage Used</span>
                    <span className="stat-value">{getStoredDataSize()}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Visits</span>
                    <span className="stat-value">{userBehavior.totalVisits}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Categories Tracked</span>
                    <span className="stat-value">{Object.keys(userBehavior.categoryVisits).length}</span>
                  </div>
                </div>
              </div>

              <div className="data-details">
                <h4>Stored Information</h4>
                
                <div className="detail-item">
                  <strong>Device Identifier (Local Only):</strong>
                  <div className="detail-value no-copy">
                    {deviceId || 'Not set'}
                  </div>
                  <span className="detail-note">This ID never leaves your device and is used only for local session management.</span>
                </div>

                <div className="detail-item">
                  <strong>Approximate Location:</strong>
                  <div className="detail-value">
                    {geoLocation.county || 'Unknown'}, {geoLocation.town || 'Unknown'}
                  </div>
                  <span className="detail-note">We only store county-level location data, never your exact address.</span>
                </div>

                <div className="detail-item">
                  <strong>Last Visit:</strong>
                  <div className="detail-value">
                    {new Date(userBehavior.lastVisit).toLocaleString()}
                  </div>
                </div>

                <div className="detail-item">
                  <strong>Your Top Categories:</strong>
                  <div className="category-tags">
                    {userBehavior.preferredCategories.length > 0 ? (
                      userBehavior.preferredCategories.map(cat => (
                        <span key={cat} className="category-tag">{cat}</span>
                      ))
                    ) : (
                      <span className="no-data">No reading history yet - start exploring to see personalized recommendations!</span>
                    )}
                  </div>
                  <span className="detail-note">Based on your reading patterns, stored locally on this device.</span>
                </div>
              </div>

              <div className="data-actions">
                <button className="action-btn secondary" onClick={handleExportData}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3" />
                  </svg>
                  Export My Data
                </button>
              </div>

              <div className="data-info-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4m0-4h.01" />
                </svg>
                <div>
                  <strong>Why can't I delete all my data?</strong>
                  <p>To maintain accurate analytics and prevent abuse, we don't offer a complete data reset. However, you can:</p>
                  <ul>
                    <li>Change your cookie preferences at any time</li>
                    <li>Disable optional cookies to stop future data collection</li>
                    <li>Export your data to see exactly what we store</li>
                    <li>Clear your browser data manually to remove local storage</li>
                  </ul>
                  <p>This approach, used by major news sites like BBC, Sky Sports, and Premier League clubs, ensures we can provide accurate insights while respecting your privacy choices.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-panel">
              <div className="info-section">
                <h3>🍪 Understanding Cookies</h3>
                <p>Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences, understand how you use the site, and provide a personalized experience.</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4m0-4h.01" />
                  </svg>
                </div>
                <div>
                  <h4>How Cookies Work</h4>
                  <p>When you visit DailyVaibe, we may place cookies on your device. These cookies contain information like:</p>
                  <ul>
                    <li>Your cookie preferences</li>
                    <li>Session identifiers for security</li>
                    <li>Your language and display preferences</li>
                    <li>Anonymous analytics data</li>
                  </ul>
                  <p>Cookies don't contain viruses or malware, and they can't access other files on your device.</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h4>First-Party vs Third-Party Cookies</h4>
                  <p><strong>First-party cookies</strong> are set directly by DailyVaibe and used to improve your experience on our site. We have full control over these cookies.</p>
                  <p><strong>Third-party cookies</strong> are set by external services (like advertising networks or analytics providers). These require your consent and can be disabled in your preferences.</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4>Session vs Persistent Cookies</h4>
                  <p><strong>Session cookies</strong> are temporary and deleted when you close your browser. They're essential for basic website functionality.</p>
                  <p><strong>Persistent cookies</strong> remain on your device for a set period (days, months, or until you delete them). They remember your preferences across visits.</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4>Cookie Duration on DailyVaibe</h4>
                  <ul>
                    <li><strong>Necessary cookies:</strong> Session-based (deleted on browser close)</li>
                    <li><strong>Preference cookies:</strong> 12 months</li>
                    <li><strong>Analytics cookies:</strong> 90 days</li>
                    <li><strong>Marketing cookies:</strong> Varies by provider (30-365 days)</li>
                  </ul>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4>Managing Cookies in Your Browser</h4>
                  <p>You can manage cookies through your browser settings:</p>
                  <ul>
                    <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                    <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                    <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
                  </ul>
                  <p>Note: Blocking all cookies may affect website functionality.</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4>Best Practices We Follow</h4>
                  <p>DailyVaibe adheres to international best practices for cookie usage:</p>
                  <ul>
                    <li>✓ Clear, transparent cookie notice before setting non-essential cookies</li>
                    <li>✓ Granular control over different cookie categories</li>
                    <li>✓ Easy-to-access preference management</li>
                    <li>✓ No pre-checked boxes for optional cookies</li>
                    <li>✓ Respect for "Do Not Track" browser settings</li>
                    <li>✓ Regular audits of cookie usage and third-party partners</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="settings-footer">
          <div className="footer-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4m0-4h.01" />
            </svg>
            <span>{hasChanges ? 'You have unsaved changes' : 'All changes saved'}</span>
          </div>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={handleRejectOptional}>
              Reject Optional
            </button>
            <button className="btn-secondary" onClick={handleAcceptAll}>
              Accept All
            </button>
            <button 
              className={`btn-primary ${!hasChanges ? 'disabled' : ''}`}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}