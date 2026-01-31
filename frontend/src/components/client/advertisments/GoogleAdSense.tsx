// C:\Projects\DAILY VAIBE\frontend\src\components\client\advertisments\GoogleAdSense.tsx

'use client';

import { useEffect } from 'react';

export default function GoogleAdSense() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense initialization error:', error);
      }
    }
  }, []);

  return null;
}