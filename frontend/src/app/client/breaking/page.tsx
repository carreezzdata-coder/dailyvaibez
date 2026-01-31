// C:\Projects\DAILY VAIBE\frontend\src\app\client\breaking\page.tsx

import BreakingPageClient from '@/components/client/pages/BreakingPageClient';
import { fetchBreakingData } from '@/lib/serverData';
import SEOMetaTags from '@/components/client/optimizers/SEOMetaTags';
import BreadcrumbSchema from '@/components/client/optimizers/BreadcrumbSchema';

export const metadata = {
  title: 'Breaking News - Daily Vaibe',
  description: 'Latest breaking news and updates from Daily Vaibe. Stay informed with real-time news from Kenya and Africa.',
  keywords: 'breaking news, latest news, Kenya news, Africa news, real-time updates',
  openGraph: {
    title: 'Breaking News - Daily Vaibe',
    description: 'Latest breaking news and updates from Kenya and Africa',
    url: 'https://dailyvaibe.com/client/breaking',
    siteName: 'Daily Vaibe',
    images: [
      {
        url: 'https://dailyvaibe.com/breaking-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Breaking News - Daily Vaibe',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breaking News - Daily Vaibe',
    description: 'Latest breaking news and updates from Kenya and Africa',
    images: ['https://dailyvaibe.com/breaking-twitter.jpg'],
    site: '@dailyvaibe',
  },
};

export default async function BreakingPage() {
  const initialData = await fetchBreakingData(1, 50);
  
  const breadcrumbItems = [
    { name: 'Home', url: 'https://dailyvaibe.com' },
    { name: 'Breaking News', url: 'https://dailyvaibe.com/client/breaking' }
  ];
  
  return (
    <>
      <SEOMetaTags
        title="Breaking News - Daily Vaibe"
        description="Latest breaking news and updates from Daily Vaibe. Stay informed with real-time news from Kenya and Africa."
        keywords="breaking news, latest news, Kenya news, Africa news, real-time updates"
        url="https://dailyvaibe.com/client/breaking"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <BreakingPageClient initialData={initialData} />
    </>
  );
}

export const revalidate = 30;
export const dynamic = 'force-dynamic';