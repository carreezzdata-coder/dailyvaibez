import { notFound } from 'next/navigation';
import { fetchSubCategoryContent, fetchPinnedData } from '@/lib/serverData';
import SubCategoryPageClient from '@/components/client/pages/SubCategoryPageClient';
import SEOMetaTags from '@/components/client/optimizers/SEOMetaTags';
import BreadcrumbSchema from '@/components/client/optimizers/BreadcrumbSchema';

interface SubCategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }: SubCategoryPageProps) {
  const { slug } = await params;

  try {
    const subCategoryContent = await fetchSubCategoryContent(slug, 1, 20);

    if (!subCategoryContent?.category) {
      return {
        title: 'Sub-Category Not Found - Daily Vaibe',
        description: 'The requested sub-category could not be found.'
      };
    }

    const category = subCategoryContent.category;
    
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
      title: 'Sub-Category Not Found - Daily Vaibe',
      description: 'The requested sub-category could not be found.'
    };
  }
}

export default async function SubCategoryPage({ params, searchParams }: SubCategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

  const currentPage = page ? parseInt(page) : 1;

  try {
    const subCategoryContent = await fetchSubCategoryContent(slug, currentPage, 20);

    if (!subCategoryContent?.category || !subCategoryContent.category.parent_id) {
      notFound();
    }

    const pinnedData = await fetchPinnedData(1, 10, slug);

    const enhancedData = {
      ...subCategoryContent,
      pinnedNews: pinnedData?.news || []
    };

    const breadcrumbItems = [
      { name: 'Home', url: 'https://dailyvaibe.com' },
      { 
        name: subCategoryContent.category.parent_name || 'Categories', 
        url: `https://dailyvaibe.com/client/categories/${subCategoryContent.category.parent_slug || 'all'}` 
      },
      { 
        name: subCategoryContent.category.name, 
        url: `https://dailyvaibe.com/client/categories/${slug}` 
      }
    ];

    return (
      <>
        <SEOMetaTags
          title={`${subCategoryContent.category.name} - Daily Vaibe`}
          description={subCategoryContent.category.description || `Latest ${subCategoryContent.category.name} news from Kenya and Africa`}
          keywords={`${subCategoryContent.category.name}, Kenya news, Africa news`}
          url={`https://dailyvaibe.com/client/categories/${slug}`}
          type="website"
        />
        <BreadcrumbSchema items={breadcrumbItems} />
        <SubCategoryPageClient initialData={enhancedData} slug={slug} />
      </>
    );
  } catch (error) {
    notFound();
  }
}