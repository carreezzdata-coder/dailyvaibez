import React from 'react';
import StaticHeader from '@/components/staticpages/StaticHeader';
import StaticPageNav from '@/components/staticpages/StaticPageNav';
import StaticFooter from '@/components/staticpages/StaticFooter';
import ThemeToggle from '@/components/staticpages/ThemeToggle';
import '@/styles/Static.css';

export const metadata = {
  title: 'Terms of Service - Daily Vaibe | User Agreement & Guidelines',
  description: 'Read Daily Vaibe\'s terms of service. Understand the rules, guidelines, and legal agreements for using our news platform and services.',
  keywords: 'terms of service, user agreement, terms and conditions, Daily Vaibe terms, legal terms, service guidelines',
  openGraph: {
    title: 'Terms of Service - Daily Vaibe',
    description: 'Terms and conditions for using Daily Vaibe services',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dailyvaibe.com/static_pages/terms'
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Terms of Service",
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
                <div className="static-hero-icon">📜</div>
                <h1 className="static-hero-title">Terms of Service</h1>
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
                Agreement to Terms
              </h2>
              <div className="static-card-text">
                <p>
                  These Terms of Service ("Terms") govern your access to and use of Daily Vaibe's website, mobile applications, and 
                  related services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
                </p>
                <p>
                  If you do not agree to these Terms, you may not access or use our Services.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Use of Services
              </h2>
              
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                Eligibility
              </h3>
              <div className="static-card-text">
                <p>
                  You must be at least 13 years old to use our Services. By using our Services, you represent and warrant that you meet 
                  this age requirement.
                </p>

                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                  License
                </h3>
                <p>
                  Subject to your compliance with these Terms, Daily Vaibe grants you a limited, non-exclusive, non-transferable, 
                  and revocable license to access and use our Services for personal, non-commercial purposes.
                </p>

                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                  Prohibited Activities
                </h3>
                <p>You agree not to:</p>
                <ul>
                  <li>Use the Services for any illegal purpose or in violation of any local, national, or international law</li>
                  <li>Violate or infringe upon the rights of others, including intellectual property rights</li>
                  <li>Transmit any harmful, offensive, or objectionable content</li>
                  <li>Attempt to gain unauthorized access to our systems or networks</li>
                  <li>Interfere with or disrupt the Services or servers</li>
                  <li>Use automated systems to access the Services without permission</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation</li>
                  <li>Collect or harvest information about other users</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                User Content
              </h2>
              
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                Your Responsibility
              </h3>
              <div className="static-card-text">
                <p>
                  You are solely responsible for any content you submit, post, or transmit through our Services ("User Content"). 
                  You retain ownership of your User Content, but by submitting it, you grant Daily Vaibe a worldwide, non-exclusive, 
                  royalty-free license to use, reproduce, modify, adapt, publish, and distribute your User Content in connection with 
                  our Services.
                </p>

                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                  Content Standards
                </h3>
                <p>User Content must not:</p>
                <ul>
                  <li>Contain false, misleading, or defamatory information</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property or privacy rights</li>
                  <li>Contain hate speech, harassment, or discriminatory content</li>
                  <li>Include spam, advertisements, or promotional material</li>
                  <li>Contain viruses, malware, or other harmful code</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Intellectual Property
              </h2>
              <div className="static-card-text">
                <p>
                  All content on Daily Vaibe, including text, graphics, logos, images, audio, video, and software, is the property of 
                  Daily Vaibe or its licensors and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  You may not reproduce, distribute, modify, create derivative works, publicly display, or exploit any content from 
                  our Services without our prior written consent, except for personal, non-commercial use as permitted by these Terms.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Third-Party Links and Services
              </h2>
              <div className="static-card-text">
                <p>
                  Our Services may contain links to third-party websites, services, or resources. We do not control, endorse, or assume 
                  responsibility for any third-party content or services. Your use of third-party services is at your own risk and subject 
                  to their terms and policies.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Disclaimers and Limitations of Liability
              </h2>
              
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                No Warranties
              </h3>
              <div className="static-card-text">
                <p>
                  Our Services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do 
                  not warrant that the Services will be uninterrupted, error-free, or secure.
                </p>

                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
                  Limitation of Liability
                </h3>
                <p>
                  To the fullest extent permitted by law, Daily Vaibe shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
                  or any loss of data, use, goodwill, or other intangible losses resulting from:
                </p>
                <ul>
                  <li>Your access to or use of (or inability to access or use) the Services</li>
                  <li>Any conduct or content of any third party on the Services</li>
                  <li>Unauthorized access, use, or alteration of your content</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Indemnification
              </h2>
              <div className="static-card-text">
                <p>
                  You agree to indemnify, defend, and hold harmless Daily Vaibe and its officers, directors, employees, and agents from 
                  any claims, liabilities, damages, losses, and expenses, including reasonable attorney fees, arising out of or related to 
                  your use of the Services, your violation of these Terms, or your violation of any rights of another.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Termination
              </h2>
              <div className="static-card-text">
                <p>
                  We reserve the right to suspend or terminate your access to the Services at any time, with or without notice, for any 
                  reason, including if we believe you have violated these Terms.
                </p>
                <p>
                  Upon termination, your right to use the Services will immediately cease. Provisions of these Terms that by their nature 
                  should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Governing Law and Dispute Resolution
              </h2>
              <div className="static-card-text">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict 
                  of law principles.
                </p>
                <p>
                  Any disputes arising out of or relating to these Terms or the Services shall be resolved through good-faith negotiations. 
                  If a resolution cannot be reached, disputes shall be submitted to the exclusive jurisdiction of the courts of Kenya.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Changes to Terms
              </h2>
              <div className="static-card-text">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated 
                  Terms on this page and updating the "Last Updated" date. Your continued use of the Services after any changes constitutes 
                  your acceptance of the new Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="static-card-title" style={{ fontSize: 'var(--text-xl)' }}>
                Contact Us
              </h2>
              <div className="static-card-text">
                <p>If you have questions about these Terms of Service, please contact us:</p>
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
                  Email: <a href="mailto:procompetentwriter@gmail.com">legal@dailyvaibe.com</a>
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