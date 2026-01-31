// C:\Projects\DAILY VAIBE\frontend\src\components\client\advertisments\StickyAd.tsx

'use client';

import React, { useState, useEffect } from 'react';

interface StickyAdProps {
  publisherId?: string;
  slotId?: string;
  enabled?: boolean;
}

export default function StickyAd({ 
  publisherId = 'ca-pub-YOUR_PUBLISHER_ID',
  slotId = 'STICKY_AD_SLOT',
  enabled = false 
}: StickyAdProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  useEffect(() => {
    if (isVisible && enabled && typeof window !== 'undefined') {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (error) {
        console.error('Sticky ad load error:', error);
      }
    }
  }, [isVisible, enabled]);

  if (!enabled || !isVisible) return null;

  return (
    <div className="mobile-sticky-ad" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: '#fff',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
    }}>
      <div className="ad-label" style={{
        fontSize: '10px',
        color: '#999',
        textAlign: 'center',
        padding: '2px'
      }}>Advertisement</div>
      <ins 
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '100%', height: '60px' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
      />
    </div>
  );
}