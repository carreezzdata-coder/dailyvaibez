import React from 'react';
import StaticHeader from '@/components/staticpages/StaticHeader';
import StaticPageNav from '@/components/staticpages/StaticPageNav';
import StaticFooter from '@/components/staticpages/StaticFooter';
import ThemeToggle from '@/components/staticpages/ThemeToggle';
import '@/styles/Static.css';

export const metadata = {
  title: 'Privacy Policy - Daily Vaibe | Data Protection & User Privacy',
  description: 'Read Daily Vaibe\'s comprehensive privacy policy. Learn how we collect, use, and protect your personal information in compliance with Kenya data protection laws.',
  keywords: 'privacy policy, data protection, user privacy, Daily Vaibe privacy, Kenya data protection, GDPR compliance',
  openGraph: {
    title: 'Privacy Policy - Daily Vaibe',
    description: 'How Daily Vaibe protects your privacy and personal data',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dailyvaibe.com/static_pages/privacy'
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Privacy Policy",
          "publisher": {
            "@type": "NewsMediaOrganization",
            "name": "Daily Vaibe",
            "url": "https://www.dailyvaibe.com"
          },
          "dateModified": "2024-11-20"
        })
      }} />

      <StaticHeader />
      <StaticPageNav />
      <ThemeToggle />
      
      <div className="static-content-wrapper no-select">
        <section className="static-hero-section">
          <div className="static-hero-wrapper">
            <div className="static-hero-gradient">
              <div className="static-hero-content">
                <div className="static-hero-icon">🔒</div>
                <h1 className="static-hero-title">Privacy Policy</h1>
                <p className="static-hero-subtitle">
                  Last Updated: November 20, 2024
                </p>
              </div>
            </div>
          </div>
        </section>

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <article className="static-card">
            
            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Introduction
              </h2>
              <div className="static-card-text">
                <p>
                  Daily Vaibe ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
                <p>
                  By accessing or using Daily Vaibe, you agree to the terms outlined in this Privacy Policy. If you do not agree with our 
                  policies and practices, please do not use our services.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Information We Collect
              </h2>
              
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                Personal Information
              </h3>
              <div className="static-card-text">
                <p>We may collect personal information that you voluntarily provide to us, including:</p>
                <ul>
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Newsletter subscription preferences</li>
                  <li>Comments and feedback on articles</li>
                  <li>Account credentials (if you create an account)</li>
                  <li>Any other information you choose to provide</li>
                </ul>

                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                  Automatically Collected Information
                </h3>
                <p>When you visit our website, we automatically collect certain information about your device and usage, including:</p>
                <ul>
                  <li>IP address and browser type</li>
                  <li>Operating system and device information</li>
                  <li>Pages viewed and time spent on pages</li>
                  <li>Referring website and search terms</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                How We Use Your Information
              </h2>
              <div className="static-card-text">
                <p>We use the information we collect for various purposes, including:</p>
                <ul>
                  <li>Providing, maintaining, and improving our services</li>
                  <li>Sending newsletters and promotional communications (with your consent)</li>
                  <li>Responding to your inquiries and customer service requests</li>
                  <li>Analyzing website usage and trends to enhance user experience</li>
                  <li>Detecting and preventing fraud or security issues</li>
                  <li>Complying with legal obligations</li>
                  <li>Personalizing content and recommendations</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Cookies and Tracking Technologies
              </h2>
              <div className="static-card-text">
                <p>
                  We use cookies and similar tracking technologies to collect and store information about your interaction with our website. 
                  Cookies help us:
                </p>
                <ul>
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our website</li>
                  <li>Improve website functionality and performance</li>
                  <li>Deliver relevant advertisements</li>
                </ul>
                <p>
                  You can control cookie preferences through your browser settings. However, disabling cookies may limit your ability 
                  to use certain features of our website.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Sharing Your Information
              </h2>
              <div className="static-card-text">
                <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                <ul>
                  <li><strong>Service Providers:</strong> With third-party vendors who help us operate our website and services</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Data Security
              </h2>
              <div className="static-card-text">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized 
                  access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage 
                  is 100% secure.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Your Rights
              </h2>
              <div className="static-card-text">
                <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                <ul>
                  <li>Access and obtain a copy of your personal data</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Withdraw consent at any time</li>
                  <li>Data portability</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at <a href="mailto:procompetentwriter@gmail.com">privacy@dailyvaibe.com</a>
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Children's Privacy
              </h2>
              <div className="static-card-text">
                <p>
                  Our services are not intended for children under the age of 13. We do not knowingly collect personal information from 
                  children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Changes to This Privacy Policy
              </h2>
              <div className="static-card-text">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new 
                  Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy 
                  periodically.
                </p>
              </div>
            </section>

            <section>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Contact Us
              </h2>
              <div className="static-card-text">
                <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
              </div>
              <div style={{ 
                padding: 'var(--spacing-lg)', 
                background: 'var(--background-secondary)', 
                borderRadius: 'var(--border-radius-md)',
                marginTop: 'var(--spacing-md)'
              }}>
                <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)', fontWeight: '700' }}>
                  Daily Vaibe
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Kileleshwa, Nairobi, Kenya
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Email: <a href="mailto:procompetentwriter@gmail.com">privacy@dailyvaibe.com</a>
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Phone: <a href="tel:+254734699433">+254 734 699 433</a>
                </p>
              </div>
            </section>

          </article>
        </div>
      </div>

      <StaticFooter />
    </>
  );
}