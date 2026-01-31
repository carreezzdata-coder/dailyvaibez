import React from 'react';
import Link from 'next/link';
import StaticHeader from '@/components/staticpages/StaticHeader';
import StaticPageNav from '@/components/staticpages/StaticPageNav';
import StaticFooter from '@/components/staticpages/StaticFooter';
import ThemeToggle from '@/components/staticpages/ThemeToggle';
import '@/styles/Static.css';

export const metadata = {
  title: 'About Daily Vaibe - Premier African News Source | Nairobi, Kenya',
  description: 'Daily Vaibe is Kenya\'s leading digital news platform, headquartered in Kileleshwa, Nairobi. Delivering authentic African stories with integrity, innovation, and comprehensive journalism across politics, business, sports, culture, and lifestyle.',
  keywords: 'Daily Vaibe, African news, Kenya news, Nairobi journalism, Pan-African media, East African news, Kileleshwa Nairobi, digital journalism Kenya',
  openGraph: {
    title: 'About Daily Vaibe - Premier African News Source',
    description: 'Your trusted source for comprehensive African news, stories, and insights from Nairobi, Kenya',
    type: 'website',
    locale: 'en_KE',
    siteName: 'Daily Vaibe',
  },
  alternates: {
    canonical: 'https://www.dailyvaibe.com/static_pages/about'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function AboutPage() {
  const values = [
    {
      icon: '📰',
      title: 'Integrity',
      description: 'We uphold the highest standards of journalistic ethics and truthfulness in every story we tell.'
    },
    {
      icon: '🌍',
      title: 'Pan-African',
      description: 'We celebrate and represent the diversity of the African continent and its vibrant cultures.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'We embrace new technologies and creative approaches to modern storytelling and journalism.'
    },
    {
      icon: '🤝',
      title: 'Community',
      description: 'We build and nurture meaningful relationships with our readers and communities across Africa.'
    }
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsMediaOrganization",
          "name": "Daily Vaibe",
          "url": "https://www.dailyvaibe.com",
          "logo": "https://www.dailyvaibe.com/logo.png",
          "foundingDate": "2024",
          "description": "Kenya's leading digital news platform delivering authentic African stories",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Kileleshwa",
            "addressLocality": "Nairobi",
            "addressCountry": "KE"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+254-734-699-433",
            "contactType": "customer service",
            "areaServed": "KE",
            "availableLanguage": ["en"]
          },
          "sameAs": [
            "https://facebook.com/dailyvaibe",
            "https://twitter.com/dailyvaibe",
            "https://instagram.com/dailyvaibe",
            "https://linkedin.com/company/dailyvaibe"
          ]
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
                <div className="static-hero-icon">🏢</div>
                <h1 className="static-hero-title">About Daily Vaibe</h1>
                <p className="static-hero-subtitle">
                  Your trusted source for comprehensive African news, stories, and insights
                </p>
              </div>
            </div>
          </div>
        </section>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
          gap: 'var(--spacing-xl)',
          marginBottom: 'var(--spacing-3xl)'
        }}>
          <article className="static-card">
            <span className="static-card-badge">Our Story</span>
            <h2 className="static-card-title">From Kileleshwa to the World</h2>
            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-sm)', 
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}>
              <span>📅 Established 2024</span>
              <span>•</span>
              <span>📍 Nairobi, Kenya</span>
            </div>
            <div className="static-card-text">
              <p>
                Daily Vaibe was born in the heart of Kileleshwa, Nairobi, with a vision to revolutionize 
                how Africa consumes news. We believe in telling authentic African stories with integrity, 
                depth, and perspective that resonates with our diverse audience.
              </p>
              <p>
                Our team of dedicated journalists, editors, and storytellers work tirelessly to bring you 
                comprehensive coverage of politics, business, culture, sports, and lifestyle across the 
                African continent and beyond.
              </p>
            </div>
          </article>

          <article className="static-card">
            <span className="static-card-badge" style={{ background: 'var(--success-color)' }}>
              Our Mission
            </span>
            <h2 className="static-card-title">Empowering Through Information</h2>
            <div className="static-card-text">
              <p>We are committed to:</p>
              <ul>
                <li>Delivering accurate, timely, and unbiased news coverage</li>
                <li>Amplifying African voices and perspectives</li>
                <li>Fostering informed discussions and civic engagement</li>
                <li>Embracing innovation in digital journalism</li>
                <li>Building bridges across cultures and communities</li>
              </ul>
              <p>
                Daily Vaibe is more than a news platform; we are a movement dedicated to shaping the 
                narrative of Africa through responsible journalism and authentic storytelling.
              </p>
            </div>
          </article>
        </div>

        <section className="static-section">
          <div className="static-section-header">
            <h2 className="static-section-title">
              <span className="static-section-icon">🌟</span>
              Our Values
            </h2>
          </div>
          
          <div className="static-feature-grid">
            {values.map((value, index) => (
              <div key={index} className="static-feature-item">
                <span className="static-feature-icon">{value.icon}</span>
                <h3 className="static-feature-title">{value.title}</h3>
                <p className="static-feature-description">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="static-section">
          <div className="static-section-header">
            <h2 className="static-section-title">
              <span className="static-section-icon">👥</span>
              Our Leadership Team
            </h2>
          </div>
          
          <div className="static-feature-grid">
            {[
              { icon: '👨‍💼', role: 'Founder & CEO', name: 'Leadership Team' },
              { icon: '👩‍💼', role: 'Editor-in-Chief', name: 'Editorial Team' },
              { icon: '👨‍💻', role: 'CTO', name: 'Technology Team' },
              { icon: '👩‍💻', role: 'Head of Operations', name: 'Operations Team' }
            ].map((member, index) => (
              <div key={index} className="static-feature-item">
                <span className="static-feature-icon">{member.icon}</span>
                <h3 className="static-feature-title">{member.role}</h3>
                <p className="static-feature-description">{member.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="static-section">
          <div className="static-section-header">
            <h2 className="static-section-title">
              <span className="static-section-icon">📅</span>
              Our Journey
            </h2>
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-lg)'
          }}>
            {[
              { year: '2024 Q1', event: 'Daily Vaibe Founded', desc: 'Launched in Kileleshwa, Nairobi' },
              { year: '2024 Q2', event: 'Platform Launch', desc: 'Official website and mobile apps released' },
              { year: '2024 Q3', event: 'Team Expansion', desc: 'Grew to 50+ journalists and staff' },
              { year: '2024 Q4', event: 'Pan-African Reach', desc: 'Expanded coverage across 20+ countries' }
            ].map((milestone, index) => (
              <div key={index} className="static-process-step">
                <div className="static-process-number">{index + 1}</div>
                <h3 className="static-process-title">{milestone.year}</h3>
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '700', 
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--text-primary)'
                }}>
                  {milestone.event}
                </h4>
                <p className="static-process-description">{milestone.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="static-cta-section">
          <h2 className="static-cta-title">Get in Touch</h2>
          <p className="static-cta-text">
            Have a story tip? Want to work with us? We'd love to hear from you.
          </p>
          <div className="static-cta-buttons">
            <Link href="/static_pages/contact" className="static-btn-primary">
              Contact Us
            </Link>
            <Link href="/static_pages/careers" className="static-btn-secondary">
              Join Our Team
            </Link>
          </div>
        </section>
      </div>

      <StaticFooter />
    </>
  );
}