'use client';

import React from 'react';
import Image from 'next/image';

interface ImageSchemaProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  caption?: string;
  credit?: string;
}

export default function ImageSchema({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  caption,
  credit
}: ImageSchemaProps) {
  const imageSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": src,
    "url": src,
    "width": width,
    "height": height,
    "caption": caption || alt,
    "description": alt,
    "name": alt,
    "license": "https://dailyvaibe.com/license",
    "acquireLicensePage": "https://dailyvaibe.com/license",
    "creditText": credit || "Daily Vaibe",
    "creator": {
      "@type": "Organization",
      "name": "Daily Vaibe",
      "url": "https://dailyvaibe.com"
    },
    "copyrightNotice": "© Daily Vaibe",
    "copyrightYear": new Date().getFullYear(),
    "representativeOfPage": priority,
    "thumbnailUrl": `${src}?w=400&h=300&fit=crop&q=75`,
    "encodingFormat": "image/jpeg",
    "uploadDate": new Date().toISOString()
  };

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        quality={85}
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 1200px"
        placeholder="blur"
        blurDataURL={`${src}?w=10&h=10&blur=10`}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
      />
    </>
  );
}