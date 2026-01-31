// C:\Projects\DAILY VAIBE\frontend\src\app\static_pages\contact\page.tsx
'use client';

import React from 'react';
import StaticHeader from '@/components/staticpages/StaticHeader';
import StaticPageNav from '@/components/staticpages/StaticPageNav';
import StaticFooter from '@/components/staticpages/StaticFooter';
import ThemeToggle from '@/components/staticpages/ThemeToggle';

export default function ContactPage() {
  return (
    <>
      <StaticHeader />
      
      <div className="static-content-wrapper">
        <div className="static-hero-gradient">
          <span className="static-hero-icon">📧</span>
          <h1 className="static-hero-title">Get In Touch</h1>
          <p className="static-hero-subtitle">
            We'd love to hear from you. Reach out to us through any of the channels below.
          </p>
        </div>

        <section className="static-section">
          <div className="static-section-header">
            <span className="static-section-icon">💬</span>
            <h2 className="static-section-title">Contact Information</h2>
            <p className="static-section-description">
              Choose your preferred method of communication
            </p>
          </div>

          <div className="static-feature-grid">
            <div className="static-contact-item">
              <div className="static-contact-icon-box">📧</div>
              <div className="static-contact-content">
                <h3>Email Us</h3>
                <p>For general inquiries and support</p>
                <a href="mailto:procompetentwriter@gmail.com">procompetentwriter@gmail.com</a>
              </div>
            </div>

            <div className="static-contact-item">
              <div className="static-contact-icon-box">📞</div>
              <div className="static-contact-content">
                <h3>Call Us</h3>
                <p>Monday to Friday, 9am to 5pm EAT</p>
                <a href="tel:+254734699433">+254 734 699 433</a>
              </div>
            </div>

            <div className="static-contact-item">
              <div className="static-contact-icon-box">📍</div>
              <div className="static-contact-content">
                <h3>Visit Us</h3>
                <p>Our headquarters in Nairobi</p>
                <p>Kileleshwa, Nairobi, Kenya</p>
              </div>
            </div>
          </div>
        </section>

        <section className="static-section">
          <div className="static-section-header">
            <span className="static-section-icon">🌐</span>
            <h2 className="static-section-title">Connect With Us</h2>
            <p className="static-section-description">
              Follow us on social media for the latest updates
            </p>
          </div>

          <div className="static-social-links">
            <a href="https://facebook.com/dailyvaibe" target="_blank" rel="noopener noreferrer" className="static-social-link">
              Facebook
            </a>
            <a href="https://twitter.com/dailyvaibe" target="_blank" rel="noopener noreferrer" className="static-social-link">
              Twitter
            </a>
            <a href="https://instagram.com/dailyvaibe" target="_blank" rel="noopener noreferrer" className="static-social-link">
              Instagram
            </a>
            <a href="https://linkedin.com/company/dailyvaibe" target="_blank" rel="noopener noreferrer" className="static-social-link">
              LinkedIn
            </a>
            <a href="https://youtube.com/@dailyvaibe" target="_blank" rel="noopener noreferrer" className="static-social-link">
              YouTube
            </a>
          </div>
        </section>

        <div className="static-cta-section">
          <h2 className="static-cta-title">Need Immediate Assistance?</h2>
          <p className="static-cta-description">
            Our team is ready to help you with any questions or concerns
          </p>
          <div className="static-cta-buttons">
            <a href="mailto:procompetentwriter@gmail.com" className="static-btn-primary">
              Send Email
            </a>
            <a href="tel:+254734699433" className="static-btn-secondary">
              Call Now
            </a>
          </div>
        </div>
      </div>

      <StaticFooter />
    </>
  );
}