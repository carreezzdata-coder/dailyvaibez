'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StaticHeader from '@/components/staticpages/StaticHeader';
import StaticPageNav from '@/components/staticpages/StaticPageNav';
import StaticFooter from '@/components/staticpages/StaticFooter';
import ThemeToggle from '@/components/staticpages/ThemeToggle';
import '@/styles/Static.css';

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const jobOpenings = [
    {
      id: 1,
      title: 'Senior Journalist',
      department: 'Editorial',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      description: 'We are seeking an experienced journalist with a passion for African stories and investigative reporting.',
      requirements: [
        '5+ years of journalism experience',
        'Strong writing and editing skills',
        'Experience in digital media',
        'Knowledge of African politics and culture',
        'Bachelor\'s degree in Journalism or related field'
      ]
    },
    {
      id: 2,
      title: 'Full-Stack Developer',
      department: 'Technology',
      location: 'Nairobi, Kenya / Remote',
      type: 'Full-time',
      description: 'Join our tech team to build and maintain our digital platform and create innovative features for our readers.',
      requirements: [
        '3+ years of full-stack development experience',
        'Proficiency in React, Node.js, and PostgreSQL',
        'Experience with Next.js and TypeScript',
        'Strong problem-solving skills',
        'Experience with cloud platforms (AWS, Azure)'
      ]
    },
    {
      id: 3,
      title: 'Social Media Manager',
      department: 'Marketing',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      description: 'Lead our social media strategy and engage with our growing community across multiple platforms.',
      requirements: [
        '3+ years of social media management experience',
        'Proven track record of growing social media presence',
        'Excellent communication skills',
        'Knowledge of social media analytics tools',
        'Creative content creation skills'
      ]
    },
    {
      id: 4,
      title: 'Video Producer',
      department: 'Multimedia',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      description: 'Create compelling video content that tells African stories in innovative and engaging ways.',
      requirements: [
        '2+ years of video production experience',
        'Proficiency in video editing software (Premiere Pro, Final Cut)',
        'Strong storytelling abilities',
        'Experience with camera operation and lighting',
        'Portfolio of previous work required'
      ]
    },
    {
      id: 5,
      title: 'Business Reporter',
      department: 'Editorial',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      description: 'Cover business, economy, and finance news across Africa with depth and analysis.',
      requirements: [
        '3+ years of business journalism experience',
        'Strong understanding of economics and finance',
        'Ability to explain complex topics clearly',
        'Network of business sources',
        'Bachelor\'s degree in Journalism, Economics, or Business'
      ]
    },
    {
      id: 6,
      title: 'Intern - Editorial',
      department: 'Editorial',
      location: 'Nairobi, Kenya',
      type: 'Internship',
      description: 'Learn from experienced journalists while contributing to our daily news coverage.',
      requirements: [
        'Currently pursuing or recently completed degree in Journalism',
        'Strong writing skills',
        'Passion for news and storytelling',
        'Ability to work under deadlines',
        'Familiarity with social media platforms'
      ]
    }
  ];

  const benefits = [
    { icon: '💰', text: 'Competitive Salary' },
    { icon: '🏥', text: 'Health Insurance' },
    { icon: '🏖️', text: 'Paid Time Off' },
    { icon: '💻', text: 'Remote Work Options' },
    { icon: '📚', text: 'Learning Budget' },
    { icon: '☕', text: 'Free Meals & Snacks' },
    { icon: '🎉', text: 'Team Events' },
    { icon: '🚴', text: 'Wellness Programs' }
  ];

  const whyJoinUs = [
    {
      icon: '🚀',
      title: 'Impact',
      description: 'Tell stories that matter and influence millions across Africa and beyond.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Work with cutting-edge technology and innovative storytelling formats.'
    },
    {
      icon: '🤝',
      title: 'Collaboration',
      description: 'Join a diverse, talented team of journalists, developers, and creatives.'
    },
    {
      icon: '📈',
      title: 'Growth',
      description: 'Continuous learning opportunities and clear career advancement paths.'
    }
  ];

  const applicationProcess = [
    {
      step: '1',
      title: 'Submit Application',
      description: 'Send us your resume, cover letter, and any relevant portfolio materials.'
    },
    {
      step: '2',
      title: 'Initial Screening',
      description: 'Our team reviews applications and shortlists candidates for interviews.'
    },
    {
      step: '3',
      title: 'Interview Process',
      description: 'Participate in interviews with our team members to showcase your skills and fit.'
    },
    {
      step: '4',
      title: 'Offer & Onboarding',
      description: 'Successful candidates receive offers and join our comprehensive onboarding program.'
    }
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "hiringOrganization": {
            "@type": "NewsMediaOrganization",
            "name": "Daily Vaibe",
            "sameAs": "https://www.dailyvaibe.com"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Nairobi",
              "addressCountry": "KE"
            }
          },
          "employmentType": "FULL_TIME"
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
                <div className="static-hero-icon">💼</div>
                <h1 className="static-hero-title">Join Our Team</h1>
                <p className="static-hero-subtitle">
                  Be part of a dynamic team shaping the future of African journalism. 
                  We're always looking for talented individuals who share our passion for storytelling.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="static-section">
          <div className="static-section-header">
            <h2 className="static-section-title">
              <span className="static-section-icon">✨</span>
              Why Daily Vaibe?
            </h2>
          </div>
          
          <div className="static-feature-grid">
            {whyJoinUs.map((benefit, index) => (
              <div key={index} className="static-feature-item">
                <span className="static-feature-icon">{benefit.icon}</span>
                <h3 className="static-feature-title">{benefit.title}</h3>
                <p className="static-feature-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="static-cta-section" style={{ textAlign: 'left' }}>
          <h2 className="static-cta-title" style={{ textAlign: 'center' }}>Benefits & Perks</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-xl)'
          }}>
            {benefits.map((benefit, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-md)',
                background: 'var(--background-primary)',
                borderRadius: 'var(--border-radius-md)',
                border: '2px solid var(--border-color)',
                transition: 'var(--transition-fast)',
                cursor: 'default'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <span style={{ fontSize: '1.8rem' }}>{benefit.icon}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem' }}>
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="static-section">
          <div className="static-section-header">
            <h2 className="static-section-title">
              <span className="static-section-icon">📋</span>
              Open Positions
            </h2>
          </div>
          
          <div className="static-job-list">
            {jobOpenings.map((job) => (
              <article 
                key={job.id} 
                className={`static-job-item ${selectedJob === job.id ? 'expanded' : ''}`}
                onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
              >
                <div className="static-job-header">
                  <div className="static-job-info">
                    <h3 className="static-job-title">{job.title}</h3>
                    <div className="static-job-badges">
                      <span className="static-job-badge department">{job.department}</span>
                      <span className="static-job-badge type">{job.type}</span>
                      <span className="static-job-location">📍 {job.location}</span>
                    </div>
                  </div>
                  <button 
                    className="static-btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = 'mailto:procompetentwriter@gmail.com?subject=Application: ' + job.title;
                    }}
                  >
                    Apply Now
                  </button>
                </div>

                <p className="static-job-description">{job.description}</p>

                {selectedJob === job.id && (
                  <div className="static-job-details">
                    <h4 className="static-job-requirements-title">Requirements:</h4>
                    <ul className="static-job-requirements">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                    <div className="static-job-actions">
                      <button 
                        className="static-btn-primary"
                        onClick={() => window.location.href = 'mailto:procompetentwriter@gmail.com?subject=Application: ' + job.title}
                      >
                        Submit Application
                      </button>
                      <button 
                        className="static-btn-secondary"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: job.title + ' - Daily Vaibe',
                              text: job.description,
                              url: window.location.href
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                          }
                        }}
                      >
                        Share Position
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="static-section">
          <div className="static-section-header">
            <h2 className="static-section-title">
              <span className="static-section-icon">📄</span>
              Application Process
            </h2>
          </div>
          
          <div className="static-process-grid">
            {applicationProcess.map((step) => (
              <div key={step.step} className="static-process-step">
                <div className="static-process-number">{step.step}</div>
                <h3 className="static-process-title">{step.title}</h3>
                <p className="static-process-description">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="static-cta-section">
          <h2 className="static-cta-title">Don't See a Perfect Fit?</h2>
          <p className="static-cta-text">
            We're always looking for talented individuals. Send us your resume and tell us how you can contribute to Daily Vaibe.
          </p>
          <div className="static-cta-buttons">
            <Link href="/static_pages/contact" className="static-btn-primary">
              Get In Touch
            </Link>
            <a 
              href="mailto:procompetentwriter@gmail.com" 
              className="static-btn-secondary"
            >
              careers@dailyvaibe.com
            </a>
          </div>
        </section>
      </div>

      <StaticFooter />
    </>
  );
}