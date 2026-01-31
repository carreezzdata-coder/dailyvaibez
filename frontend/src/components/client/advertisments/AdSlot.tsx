// C:\Projects\DAILY VAIBE\frontend\src\components\client\advertisments\AdSlot.tsx

'use client';

import { useEffect, useState, useRef } from 'react';

interface AdSlotProps {
  slotId: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal' | 'leaderboard' | 'mobile_banner' | 'half_page' | 'large_rectangle';
  responsive?: boolean;
  className?: string;
  publisherId?: string;
}

export default function AdSlot({
  slotId,
  format = 'auto',
  responsive = true,
  className = '',
  publisherId = 'ca-pub-YOUR_PUBLISHER_ID'
}: AdSlotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            loadAd();
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current);
      }
    };
  }, []);

  const loadAd = () => {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({});
      } catch (error) {
        console.error('Ad load error:', error);
      }
    }
  };

  const getMinHeight = () => {
    switch (format) {
      case 'leaderboard': return '90px';
      case 'rectangle': return '250px';
      case 'large_rectangle': return '280px';
      case 'half_page': return '600px';
      case 'mobile_banner': return '50px';
      default: return '250px';
    }
  };

  return (
    <div 
      ref={adRef}
      className={`ad-slot ${className}`}
      data-ad-slot={slotId}
    >
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          textAlign: 'center',
          minHeight: getMinHeight()
        }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}