'use client';

import React from 'react';

interface SEOMetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: string;
}

export default function SEOMetaTags({
  title,
  description,
  keywords = 'Kenya news, East Africa news, breaking news, politics, business, sports, entertainment, technology',
  image = 'https://dailyvaibe.com/og-image.jpg',
  url = 'https://dailyvaibe.com',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  locale = 'en_KE'
}: SEOMetaTagsProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="referrer" content="origin-when-cross-origin" />
      <meta name="format-detection" content="telephone=no" />
      
      <meta property="og:locale" content={locale} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:site_name" content="Daily Vaibe" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@dailyvaibe" />
      <meta name="twitter:creator" content="@dailyvaibe" />
      <meta name="twitter:label1" content="Written by" />
      <meta name="twitter:data1" content={author || "Daily Vaibe"} />
      <meta name="twitter:label2" content="Est. reading time" />
      <meta name="twitter:data2" content="5 minutes" />
      
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="og:updated_time" content={modifiedTime || publishedTime} />
        </>
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      <meta name="geo.region" content="KE-110" />
      <meta name="geo.placename" content="Nairobi" />
      <meta name="geo.position" content="-1.286389;36.817223" />
      <meta name="ICBM" content="-1.286389, 36.817223" />
      
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="en-ke" href={url} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
    </>
  );
}