// C:\Projects\DAILY VAIBE\frontend\src\components\staticpages\StaticPageNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StaticPageNav() {
  const pathname = usePathname();

  const staticPages = [
    { name: 'About Us', href: '/static_pages/about', icon: 'ℹ️' },
    { name: 'Careers', href: '/static_pages/careers', icon: '💼' },
    { name: 'Contact', href: '/static_pages/contact', icon: '📧' },
    { name: 'Privacy Policy', href: '/static_pages/privacy', icon: '🔒' },
    { name: 'Terms of Service', href: '/static_pages/terms', icon: '📜' },
  ];

  return (
    <nav className="static-nav-bar">
      <div className="static-nav-container">
        <ul className="static-nav-list">
          {staticPages.map((page) => (
            <li key={page.href} className="static-nav-item">
              <Link
                href={page.href}
                className={`static-nav-link ${pathname === page.href ? 'active' : ''}`}
              >
                <span style={{ marginRight: '6px' }}>{page.icon}</span>
                {page.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}