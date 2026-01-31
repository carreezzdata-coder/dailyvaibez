import React from 'react';

interface FooterMobileTriggerProps {
  onClick: () => void;
}

export default function FooterMobileTrigger({ onClick }: FooterMobileTriggerProps) {
  return (
    <button 
      className="mobile-footer-trigger" 
      onClick={onClick}
      aria-label="Open footer menu"
      type="button"
    >
      <svg className="trigger-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="1"/>
        <circle cx="19" cy="12" r="1"/>
        <circle cx="5" cy="12" r="1"/>
      </svg>
      <span className="trigger-text">More</span>
      <svg className="trigger-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
  );
}