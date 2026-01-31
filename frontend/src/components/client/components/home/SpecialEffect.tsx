'use client';

import React from 'react';
import './SpecialEffects.css';

interface SpecialEffectsProps {
  showFire?: boolean;
  showHotBadge?: boolean;
  showShimmer?: boolean;
}

export default function SpecialEffects({ 
  showFire = true, 
  showHotBadge = true,
  showShimmer = false 
}: SpecialEffectsProps) {
  return (
    <>
      {showFire && (
        <div className="fire-effect">
          <div className="fire-particle"></div>
          <div className="fire-particle"></div>
          <div className="fire-particle"></div>
          <div className="fire-particle"></div>
          <div className="fire-particle"></div>
          <div className="fire-particle"></div>
        </div>
      )}
      
      {showHotBadge && (
        <div className="hot-badge">
          <span className="hot-badge-icon">🔥</span>
          <span>HOT</span>
        </div>
      )}
      
      {showShimmer && <div className="shimmer-effect"></div>}
    </>
  );
}