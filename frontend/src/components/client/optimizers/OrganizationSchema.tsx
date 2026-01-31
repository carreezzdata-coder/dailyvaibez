'use client';

import React from 'react';

interface OrganizationSchemaProps {
  type?: 'NewsMediaOrganization' | 'Organization';
}

export default function OrganizationSchema({ type = 'NewsMediaOrganization' }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    "name": "Daily Vaibe",
    "alternateName": "DailyVaibe",
    "url": "https://dailyvaibe.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://dailyvaibe.com/logo-news.png",
      "width": 600,
      "height": 60
    },
    "image": "https://dailyvaibe.com/og-image.jpg",
    "description": "Breaking news from Kenya and East Africa covering Politics, Business, Sports, Entertainment, Technology and Lifestyle",
    "masthead": "https://dailyvaibe.com/about/masthead",
    "missionCoveragePrioritiesPolicy": "https://dailyvaibe.com/about/mission",
    "ethicsPolicy": "https://dailyvaibe.com/about/ethics",
    "diversityPolicy": "https://dailyvaibe.com/about/diversity",
    "correctionsPolicy": "https://dailyvaibe.com/about/corrections",
    "unnamedSourcesPolicy": "https://dailyvaibe.com/about/sources",
    "actionableFeedbackPolicy": "https://dailyvaibe.com/contact/feedback",
    "ownershipFundingInfo": "https://dailyvaibe.com/about/ownership",
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "name": "Nairobi",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nairobi",
        "addressCountry": "KE"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Nairobi CBD",
      "addressLocality": "Nairobi",
      "addressRegion": "Nairobi County",
      "postalCode": "00100",
      "addressCountry": "KE"
    },
    "contactPoint": [{
      "@type": "ContactPoint",
      "telephone": "+254-734-699-433",
      "contactType": "customer service",
      "areaServed": "KE",
      "availableLanguage": ["en", "sw"]
    }],
    "sameAs": [
      "https://facebook.com/dailyvaibe",
      "https://twitter.com/dailyvaibe",
      "https://instagram.com/dailyvaibe",
      "https://linkedin.com/company/dailyvaibe",
      "https://youtube.com/@dailyvaibe"
    ],
    "publishingPrinciples": "https://dailyvaibe.com/about/principles",
    "slogan": "Your Daily Pulse of East Africa",
    "knowsAbout": [
      "Kenya Politics",
      "East African Business",
      "African Sports",
      "Technology in Africa",
      "Kenyan Entertainment",
      "African News"
    ],
    "areaServed": {
      "@type": "Place",
      "name": "East Africa",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -1.286389,
        "longitude": 36.817223
      }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "News Content",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Daily News Updates"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Breaking News Alerts"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      key="organization-schema"
    />
  );
}