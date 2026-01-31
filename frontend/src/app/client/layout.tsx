import { ReactNode } from 'react';
import Script from 'next/script';
import '@/lib/contentProtection'; 
import '../../styles/Master.css';
import '../../styles/Standardformatting.css';
import '../../styles/zIndexSystem.css';
import '../../styles/components_styles/home/HeroSlider.css';
import '../../styles/components_styles/news/Cookies.css';
import '../../styles/components_styles/news/Horizontal.css';
import '../../styles/components_styles/news/SearchNotifications.css';
import '../../styles/components_styles/home/HomeLayout.css';
import '../../styles/components_styles/home/VideoSection.css';
import '../../styles/components_styles/home/HeadingsBar.css';
import '../../styles/components_styles/home/CategorySections.css';
import '../../styles/components_styles/home/SmallRibbon.css';
import '../../styles/components_styles/home/Enhanced.css';
import '../../styles/components_styles/home/Sidebar.css';
import '../../styles/components_styles/home/Quotes.css';
import '../../styles/components_styles/home/MobileVideo.css';
import '../../styles/components_styles/home/SpecialEffects.css';
import '../../styles/components_styles/home/variables.css';
import '../../styles/components_styles/home/Timeline.css';
import '../../styles/components_styles/home/Floatingvideo.css';
import '../../styles/components_styles/home/Headings.css';
import '../../styles/components_styles/home/Share.css';
import '../../styles/components_styles/header/HeaderCore.css';
import '../../styles/components_styles/header/StockTicker.css';
import '../../styles/components_styles/header/SearchComponent.css';
import '../../styles/components_styles/header/NotificationsComponent.css';
import '../../styles/components_styles/gallery/gallery.base.css';
import '../../styles/components_styles/gallery/gallery.navigation.css';
import '../../styles/components_styles/gallery/gallery.controls.css';
import '../../styles/components_styles/gallery/gallery.cards.css';
import '../../styles/components_styles/gallery/gallery.modal.css';
import '../../styles/components_styles/gallery/gallery.flash-reader.css';
import '../../styles/components_styles/gallery/gallery.animations.css';
import '../../styles/components_styles/gallery/gallery.responsive.css';
import '../../styles/components_styles/gallery/gallery.utils.css';
import '../../styles/components_styles/footer/Footer.base.css';
import '../../styles/components_styles/footer/Footer.marquee.css';
import '../../styles/components_styles/footer/Footer.categories.css';
import '../../styles/components_styles/footer/Footer.brand.css';
import '../../styles/components_styles/footer/Footer.mobile.css';
import '../../styles/components_styles/footer/Footer.actions.css';

import { ClientSessionProvider } from '@/components/client/hooks/ClientSessions';
import { ClientSessionInitializer } from '@/components/client/ClientSessionInitializer';
import { CookieConfigProvider } from '@/components/client/cookies/useCookieConfig';
import CookieBanner from '@/components/client/cookies/CookieBanner';
import CookieSettings from '@/components/client/cookies/CookieSettings';
import CookieControls from '@/components/client/cookies/CookieControls';
import GoogleAdSense from '@/components/client/advertisments/GoogleAdSense';

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "Daily Vaibe",
  "url": "https://dailyvaibe.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://dailyvaibe.com/logo.png",
    "width": 600,
    "height": 60
  },
  "description": "Breaking news from Kenya and Africa. Politics, Business, Sports, Entertainment.",
  "sameAs": [
    "https://twitter.com/dailyvaibe",
    "https://facebook.com/dailyvaibe"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Editorial",
    "email": "editorial@dailyvaibe.com"
  }
};

export default function ClientSectionLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <title>Daily Vaibe - Latest News, Politics, Business, Sports in Kenya</title>
        <meta name="description" content="Stay informed with the latest news, politics, business, Buzz, Sports and more from Daily Vaibe. Breaking news from Kenya and Africa." />
        <meta name="keywords" content="news, politics, business, technology, Kenya, Africa, breaking news, sports, entertainment" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dailyvaibe.com/" />
        <meta property="og:title" content="Daily Vaibe - Latest News in Kenya" />
        <meta property="og:description" content="Breaking news from Kenya and Africa. Politics, Business, Sports, Entertainment." />
        <meta property="og:image" content="https://dailyvaibe.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Daily Vaibe News" />
        <meta property="og:site_name" content="Daily Vaibe" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://dailyvaibe.com/" />
        <meta name="twitter:title" content="Daily Vaibe - Latest News in Kenya" />
        <meta name="twitter:description" content="Breaking news from Kenya and Africa" />
        <meta name="twitter:image" content="https://dailyvaibe.com/twitter-image.jpg" />
        <meta name="twitter:site" content="@dailyvaibe" />
        <meta name="twitter:creator" content="@dailyvaibe" />
        
        <meta name="google-news" content="publisher=DAILY_VAIBE_GOOGLE_NEWS_ID" />
        
        <link rel="canonical" href="https://dailyvaibe.com/" />
        
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <CookieConfigProvider>
          <ClientSessionProvider>
            <ClientSessionInitializer />
            
            <CookieBanner />
            <CookieSettings />
            <CookieControls />
            
            <GoogleAdSense />
            
            <div className="client-layout">
              {children}
            </div>
          </ClientSessionProvider>
        </CookieConfigProvider>
      </body>
    </html>
  );
}