'use client';

import React from 'react';

interface ArticleSchemaProps {
  article: {
    title: string;
    excerpt?: string;
    metaDescription?: string;
    imageUrl?: string;
    publishedAt: string;
    updatedAt?: string;
    firstName?: string;
    lastName?: string;
    authorSlug?: string;
    slug: string;
    categoryName?: string;
    tags?: string[];
    readingTime?: number;
    views?: number;
    likesCount?: number;
  };
}

export default function ArticleSchema({ article }: ArticleSchemaProps) {
  const baseUrl = 'https://dailyvaibe.com';
  
  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt || article.metaDescription || article.title,
    "image": article.imageUrl ? [
      article.imageUrl,
      `${article.imageUrl}?w=1200&h=630&fit=crop&q=85`,
      `${article.imageUrl}?w=800&h=600&fit=crop&q=85`,
      `${article.imageUrl}?w=400&h=300&fit=crop&q=85`
    ] : [`${baseUrl}/default-og.jpg`],
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": [{
      "@type": "Person",
      "name": `${article.firstName || 'Daily Vaibe'} ${article.lastName || 'Editor'}`,
      "url": `${baseUrl}/author/${article.authorSlug || 'staff'}`,
      "jobTitle": "Journalist",
      "worksFor": {
        "@type": "NewsMediaOrganization",
        "name": "Daily Vaibe"
      }
    }],
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Daily Vaibe",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo-news.png`,
        "width": 600,
        "height": 60
      },
      "sameAs": [
        "https://facebook.com/dailyvaibe",
        "https://twitter.com/dailyvaibe",
        "https://instagram.com/dailyvaibe",
        "https://linkedin.com/company/dailyvaibe"
      ]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/client/articles/${article.slug}`
    },
    "articleSection": article.categoryName || "News",
    "keywords": article.tags?.join(', ') || `${article.categoryName}, Kenya, East Africa, News`,
    "about": {
      "@type": "Thing",
      "name": article.categoryName || "News"
    },
    "spatialCoverage": {
      "@type": "Place",
      "name": "Kenya",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -1.286389,
        "longitude": 36.817223
      }
    },
    "inLanguage": "en-KE",
    "isAccessibleForFree": true,
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ReadAction",
        "userInteractionCount": article.views || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": article.likesCount || 0
      }
    ],
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".article-title", ".article-excerpt", ".article-content"]
    },
    "timeRequired": `PT${article.readingTime || 5}M`,
    "thumbnailUrl": article.imageUrl || `${baseUrl}/default-thumbnail.jpg`,
    "backstory": article.excerpt || article.metaDescription,
    "copyrightHolder": {
      "@type": "NewsMediaOrganization",
      "name": "Daily Vaibe"
    },
    "copyrightYear": new Date(article.publishedAt).getFullYear(),
    "creativeWorkStatus": "Published",
    "isFamilyFriendly": true
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      key="news-article-schema"
    />
  );
}