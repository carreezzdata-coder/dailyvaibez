import { notFound } from 'next/navigation';
import { fetchCategoryContent, fetchGroupContent, fetchPinnedData } from '@/lib/serverData';
import CategoryPageClient from '@/components/client/pages/CategoryPageClient';
import SEOMetaTags from '@/components/client/optimizers/SEOMetaTags';
import BreadcrumbSchema from '@/components/client/optimizers/BreadcrumbSchema';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const GROUP_SLUGS = [
  'world',
  'counties',
  'politics',
  'business',
  'opinion',
  'sports',
  'lifestyle',
  'entertainment',
  'tech',
  'other'
];

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const isGroup = GROUP_SLUGS.includes(slug);

  try {
    const categoryContent = isGroup
      ? await fetchGroupContent(slug, 1, 20)
      : await fetchCategoryContent(slug, 1, 20);

    if (!categoryContent?.category) {
      return {
        title: 'Category Not Found - Daily Vaibe',
        description: 'The requested category could not be found.'
      };
    }

    const category = categoryContent.category;
    
    return {
      title: `${category.name} - Daily Vaibe`,
      description: category.description || `Latest ${category.name} news from Daily Vaibe. Stay informed with breaking news from Kenya and Africa.`,
      keywords: `${category.name}, Kenya news, Africa news, ${slug}`,
      openGraph: {
        title: `${category.name} - Daily Vaibe`,
        description: category.description || `Latest ${category.name} news from Kenya and Africa`,
        url: `https://dailyvaibe.com/client/categories/${slug}`,
        siteName: 'Daily Vaibe',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${category.name} - Daily Vaibe`,
        description: category.description || `Latest ${category.name} news from Kenya and Africa`,
        site: '@dailyvaibe',
      },
    };
  } catch (error) {
    return {
      title: 'Category Not Found - Daily Vaibe',
      description: 'The requested category could not be found.'
    };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

  const currentPage = page ? parseInt(page) : 1;
  const isGroup = GROUP_SLUGS.includes(slug);

  try {
    const categoryContent = isGroup
      ? await fetchGroupContent(slug, currentPage, 20)
      : await fetchCategoryContent(slug, currentPage, 20);

    if (!categoryContent?.category) {
      notFound();
    }

    const pinnedData = await fetchPinnedData(1, 10, slug);

    const enhancedData = {
      ...categoryContent,
      pinnedNews: pinnedData?.news || []
    };

    const breadcrumbItems = [
      { name: 'Home', url: 'https://dailyvaibe.com' },
      { name: categoryContent.category?.name || slug, url: `https://dailyvaibe.com/client/categories/${slug}` }
    ];

    return (
      <>
        <SEOMetaTags
          title={`${categoryContent.category?.name || slug} - Daily Vaibe`}
          description={categoryContent.category?.description || `Latest ${categoryContent.category?.name || slug} news from Kenya and Africa`}
          keywords={`${categoryContent.category?.name || slug}, Kenya news, Africa news`}
          url={`https://dailyvaibe.com/client/categories/${slug}`}
          type="website"
        />
        <BreadcrumbSchema items={breadcrumbItems} />
        <CategoryPageClient initialData={enhancedData} slug={slug} />
      </>
    );
  } catch (error) {
    console.error('Category page error:', error);
    notFound();
  }
}