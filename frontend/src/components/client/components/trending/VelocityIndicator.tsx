'use client';

import React from 'react';

interface VelocityIndicatorProps {
  delta: number;
  position: 'hero' | 'mini' | 'card';
}

export default function VelocityIndicator({ delta, position }: VelocityIndicatorProps) {
  const speed = delta > 12000 ? 'fast' : delta > 5000 ? 'medium' : 'slow';

  return (
    <div className={`velocity-stream velocity-${position}`} data-speed={speed}>
      <div className="velocity-trail" />
      <div className="velocity-trail" />
      <div className="velocity-trail" />
    </div>
  );
}