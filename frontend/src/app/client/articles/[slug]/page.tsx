import { notFound } from 'next/navigation';
import { fetchArticleContent } from '@/lib/serverData';
import ArticlePageClient from '@/components/client/pages/ArticlePageClient';
import ArticleSchema from '@/components/client/optimizers/ArticleSchema';
import SEOMetaTags from '@/components/client/optimizers/SEOMetaTags';
import BreadcrumbSchema from '@/components/client/optimizers/BreadcrumbSchema';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  try {
    const articleContent = await fetchArticleContent(slug);
    
    if (!articleContent) {
      return {
        title: 'Article Not Found - Daily Vaibe',
        description: 'The requested article could not be found.'
      };
    }

    const article = articleContent.article;
    
    return {
      title: `${article.title} - Daily Vaibe`,
      description: article.excerpt || article.metaDescription || article.title,
      keywords: article.tags?.join(', ') || `${article.categoryName}, Kenya, Africa, news`,
      openGraph: {
        title: article.title,
        description: article.excerpt || article.metaDescription || article.title,
        url: `https://dailyvaibe.com/client/articles/${article.slug}`,
        siteName: 'Daily Vaibe',
        images: [
          {
            url: article.imageUrl || 'https://dailyvaibe.com/og-image.jpg',
            width: 1200,
            height: 630,
            alt: article.title,
          }
        ],
        type: 'article',
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt || article.publishedAt,
        authors: [`${article.firstName || 'Daily Vaibe'} ${article.lastName || 'Editor'}`],
        section: article.categoryName,
        tags: article.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt || article.metaDescription || article.title,
        images: [article.imageUrl || 'https://dailyvaibe.com/twitter-image.jpg'],
        site: '@dailyvaibe',
        creator: '@dailyvaibe',
      },
    };
  } catch (error) {
    return {
      title: 'Article Not Found - Daily Vaibe',
      description: 'The requested article could not be found.'
    };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  try {
    const articleContent = await fetchArticleContent(slug);

    if (!articleContent) {
      notFound();
    }

    const article = articleContent.article;
    
    const breadcrumbItems = [
      { name: 'Home', url: 'https://dailyvaibe.com' },
      { name: article.categoryName || 'News', url: `https://dailyvaibe.com/client/categories/${article.categorySlug}` },
      { name: article.title, url: `https://dailyvaibe.com/client/articles/${article.slug}` }
    ];

    return (
      <>
        <SEOMetaTags
          title={article.title}
          description={article.excerpt || article.metaDescription || article.title}
          keywords={article.tags?.join(', ') || `${article.categoryName}, Kenya, Africa, news`}
          image={article.imageUrl || 'https://dailyvaibe.com/og-image.jpg'}
          url={`https://dailyvaibe.com/client/articles/${article.slug}`}
          type="article"
          publishedTime={article.publishedAt}
          modifiedTime={article.updatedAt || article.publishedAt}
          author={`${article.firstName || 'Daily Vaibe'} ${article.lastName || 'Editor'}`}
          section={article.categoryName}
          tags={article.tags || []}
        />
        <ArticleSchema article={article} />
        <BreadcrumbSchema items={breadcrumbItems} />
        <ArticlePageClient initialData={articleContent} />
      </>
    );
  } catch (error) {
    console.error(`Error loading article page for ${slug}:`, error);
    notFound();
  }
}