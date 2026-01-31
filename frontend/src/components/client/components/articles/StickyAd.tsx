// StickyAd.tsx
'use client';

import React from 'react';

export default function StickyAd() {
  return (
    <div className="mobile-sticky-ad">
      <div className="ad-label">Space</div>
      <ins className="adsbygoogle"
        style={{ display: 'inline-block', width: '100%', height: '60px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="AAAAAAAAAA"></ins>
    </div>
  );
}