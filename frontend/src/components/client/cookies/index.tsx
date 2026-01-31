// frontend/src/components/client/cookies/index.tsx
'use client';

import React from 'react';
import { CookieConfigProvider } from './useCookieConfig';
import CookieBanner from './CookieBanner';
import CookieSettings from './CookieSettings';
import CookieControls from './CookieControls';

// Export hooks and types for use in other components
export { useCookieConfig } from './useCookieConfig';
export { CookieConfigProvider } from './useCookieConfig';
export type { CookiePreferences, GeoLocation, UserBehavior } from './useCookieConfig';

interface CookieManagerProps {
  children?: React.ReactNode;
}

/**
 * CookieManager Component
 * 
 * Main cookie management system that provides:
 * - Initial cookie consent banner
 * - Settings modal for managing preferences
 * - Persistent settings access button (after consent)
 * 
 * Features:
 * - Secure preference management without full data reset
 * - Copy protection on sensitive data
 * - Detailed privacy information
 * - GDPR/CCPA compliant
 * 
 * Usage:
 * Wrap your app with CookieManager to enable cookie management:
 * 
 * <CookieManager>
 *   <YourApp />
 * </CookieManager>
 */
export default function CookieManager({ children }: CookieManagerProps) {
  return (
    <CookieConfigProvider>
      {/* Render app content */}
      {children}
      
      {/* Cookie management UI components */}
      <CookieBanner />
      <CookieSettings />
      <CookieControls />
    </CookieConfigProvider>
  );
}

/**
 * CookieManagerClient Component
 * 
 * Client-only version for use in client components
 * without wrapping children. Useful for layouts where
 * the provider is already set up higher in the tree.
 */
export function CookieManagerClient() {
  return (
    <>
      <CookieBanner />
      <CookieSettings />
      <CookieControls />
    </>
  );
}

/**
 * CookieConfigWrapper Component
 * 
 * Standalone context provider for cookie configuration.
 * Use this when you only need the cookie context without
 * the UI components.
 */
export function CookieConfigWrapper({ children }: { children: React.ReactNode }) {
  return <CookieConfigProvider>{children}</CookieConfigProvider>;
}