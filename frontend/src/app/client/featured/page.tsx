// C:\Projects\DAILY VAIBE\frontend\src\app\client\featured\page.tsx

import FeaturedPageClient from '@/components/client/pages/FeaturedPageClient';
import { fetchFeaturedData } from '@/lib/serverData';
import SEOMetaTags from '@/components/client/optimizers/SEOMetaTags';
import BreadcrumbSchema from '@/components/client/optimizers/BreadcrumbSchema';

export const metadata = {
  title: 'Featured Stories - Daily Vaibe',
  description: 'Handpicked featured stories and top news from Daily Vaibe. The best journalism from Kenya and Africa.',
  keywords: 'featured news, top stories, Kenya journalism, Africa news, curated content',
  openGraph: {
    title: 'Featured Stories - Daily Vaibe',
    description: 'Handpicked featured stories and top news from Kenya and Africa',
    url: 'https://dailyvaibe.com/client/featured',
    siteName: 'Daily Vaibe',
    images: [
      {
        url: 'https://dailyvaibe.com/featured-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Featured Stories - Daily Vaibe',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Featured Stories - Daily Vaibe',
    description: 'Handpicked featured stories and top news from Kenya and Africa',
    images: ['https://dailyvaibe.com/featured-twitter.jpg'],
    site: '@dailyvaibe',
  },
};

export default async function FeaturedPage() {
  const initialData = await fetchFeaturedData(1, 50);
  
  const breadcrumbItems = [
    { name: 'Home', url: 'https://dailyvaibe.com' },
    { name: 'Featured Stories', url: 'https://dailyvaibe.com/client/featured' }
  ];
  
  return (
    <>
      <SEOMetaTags
        title="Featured Stories - Daily Vaibe"
        description="Handpicked featured stories and top news from Daily Vaibe. The best journalism from Kenya and Africa."
        keywords="featured news, top stories, Kenya journalism, Africa news, curated content"
        url="https://dailyvaibe.com/client/featured"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <FeaturedPageClient initialData={initialData} />
    </>
  );
}

export const revalidate = 30;
export const dynamic = 'force-dynamic';