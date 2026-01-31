// C:\Projects\DAILY VAIBE\frontend\src\app\client\quotes\page.tsx

import QuotesPageClient from '@/components/client/pages/QuotesPageClient';
import { fetchQuotesData } from '@/lib/serverData';
import SEOMetaTags from '@/components/client/optimizers/SEOMetaTags';
import BreadcrumbSchema from '@/components/client/optimizers/BreadcrumbSchema';

export const metadata = {
  title: 'Quotes & Wisdom - Daily Vaibe',
  description: 'Inspiring quotes and wisdom from leaders, thinkers, and newsmakers. Daily Vaibe brings you thoughtful perspectives from Kenya and Africa.',
  keywords: 'quotes, wisdom, inspiration, Kenya quotes, African wisdom, leadership quotes',
  openGraph: {
    title: 'Quotes & Wisdom - Daily Vaibe',
    description: 'Inspiring quotes and wisdom from leaders, thinkers, and newsmakers',
    url: 'https://dailyvaibe.com/client/quotes',
    siteName: 'Daily Vaibe',
    images: [
      {
        url: 'https://dailyvaibe.com/quotes-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Quotes & Wisdom - Daily Vaibe',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quotes & Wisdom - Daily Vaibe',
    description: 'Inspiring quotes and wisdom from leaders and thinkers',
    images: ['https://dailyvaibe.com/quotes-twitter.jpg'],
    site: '@dailyvaibe',
  },
};

export default async function QuotesPage() {
  const rawData = await fetchQuotesData();
  
  const initialData = {
    quotes: rawData.quotes.map(quote => ({
      ...quote,
      sayer_image_url: quote.sayer_image_url ?? undefined
    })),
    strikingQuotes: rawData.strikingQuotes.map(quote => ({
      ...quote,
      sayer_image_url: quote.sayer_image_url ?? undefined
    })),
    trendingQuotes: rawData.trendingQuotes.map(quote => ({
      ...quote,
      sayer_image_url: quote.sayer_image_url ?? undefined
    }))
  };
  
  const breadcrumbItems = [
    { name: 'Home', url: 'https://dailyvaibe.com' },
    { name: 'Quotes & Wisdom', url: 'https://dailyvaibe.com/client/quotes' }
  ];
  
  return (
    <>
      <SEOMetaTags
        title="Quotes & Wisdom - Daily Vaibe"
        description="Inspiring quotes and wisdom from leaders, thinkers, and newsmakers. Daily Vaibe brings you thoughtful perspectives from Kenya and Africa."
        keywords="quotes, wisdom, inspiration, Kenya quotes, African wisdom, leadership quotes"
        url="https://dailyvaibe.com/client/quotes"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <QuotesPageClient initialData={initialData} />
    </>
  );
}

export const revalidate = 30;
export const dynamic = 'force-dynamic';