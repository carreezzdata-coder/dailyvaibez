// C:\Projects\DAILY VAIBE\frontend\src\app\client\trending\page.tsx

import TrendingPageClient from '@/components/client/pages/TrendingPageClient';
import { fetchBreakingData, fetchTrendingData } from '@/lib/serverData';
import SEOMetaTags from '@/components/client/optimizers/SEOMetaTags';
import BreadcrumbSchema from '@/components/client/optimizers/BreadcrumbSchema';

export const metadata = {
  title: 'Trending Now - Daily Vaibe',
  description: 'Most trending and viral stories from Daily Vaibe. See what everyone is talking about in Kenya and across Africa.',
  keywords: 'trending news, viral stories, popular news, Kenya trending, Africa viral content',
  openGraph: {
    title: 'Trending Now - Daily Vaibe',
    description: 'Most trending and viral stories from Kenya and Africa',
    url: 'https://dailyvaibe.com/client/trending',
    siteName: 'Daily Vaibe',
    images: [
      {
        url: 'https://dailyvaibe.com/trending-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Trending Now - Daily Vaibe',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending Now - Daily Vaibe',
    description: 'Most trending and viral stories from Kenya and Africa',
    images: ['https://dailyvaibe.com/trending-twitter.jpg'],
    site: '@dailyvaibe',
  },
};

export default async function TrendingPage() {
  const [breakingData, trendingData] = await Promise.all([
    fetchBreakingData(1, 30),
    fetchTrendingData(1, 50)
  ]);
  
  const initialData = {
    breaking: breakingData.news,
    trending: trendingData.news,
    lastUpdate: new Date().toISOString()
  };
  
  const breadcrumbItems = [
    { name: 'Home', url: 'https://dailyvaibe.com' },
    { name: 'Trending Now', url: 'https://dailyvaibe.com/client/trending' }
  ];
  
  return (
    <>
      <SEOMetaTags
        title="Trending Now - Daily Vaibe"
        description="Most trending and viral stories from Daily Vaibe. See what everyone is talking about in Kenya and across Africa."
        keywords="trending news, viral stories, popular news, Kenya trending, Africa viral content"
        url="https://dailyvaibe.com/client/trending"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <TrendingPageClient initialData={initialData} />
    </>
  );
}

export const revalidate = 30;
export const dynamic = 'force-dynamic';