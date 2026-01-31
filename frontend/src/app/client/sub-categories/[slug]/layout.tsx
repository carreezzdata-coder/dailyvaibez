import { ReactNode } from 'react';
import '@/lib/contentProtection'; 
import '../../../../styles/SubCategory.css'; // CRITICAL: Import SubCategory.css, NOT Categories.css
import '../../../../styles/Ribbon.css';
import '../../../../styles/Standardformatting.css';
import '../../../../styles/zIndexSystem.css';
import '../../../../styles/components_styles/news/Cookies.css';
import '../../../../styles/components_styles/news/Horizontal.css';
import '../../../../styles/components_styles/news/SearchNotifications.css';
import '../../../../styles/components_styles/header/HeaderCore.css';
import '../../../../styles/components_styles/header/StockTicker.css';
import '../../../../styles/components_styles/header/SearchComponent.css';
import '../../../../styles/components_styles/header/NotificationsComponent.css';
import '../../../../styles/components_styles/gallery/gallery.base.css';
import '../../../../styles/components_styles/gallery/gallery.navigation.css';
import '../../../../styles/components_styles/gallery/gallery.controls.css';
import '../../../../styles/components_styles/gallery/gallery.cards.css';
import '../../../../styles/components_styles/gallery/gallery.modal.css';
import '../../../../styles/components_styles/gallery/gallery.flash-reader.css';
import '../../../../styles/components_styles/gallery/gallery.animations.css';
import '../../../../styles/components_styles/gallery/gallery.responsive.css';
import '../../../../styles/components_styles/gallery/gallery.utils.css';
import '../../../../styles/components_styles/footer/Footer.base.css';
import '../../../../styles/components_styles/footer/Footer.marquee.css';
import '../../../../styles/components_styles/footer/Footer.categories.css';
import '../../../../styles/components_styles/footer/Footer.brand.css';
import '../../../../styles/components_styles/footer/Footer.mobile.css';
import '../../../../styles/components_styles/footer/Footer.actions.css';

export default function SubCategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://api.dailyvaibe.com'
      : 'http://localhost:5000';

    const [categoriesRes, groupsRes] = await Promise.all([
      fetch(`${apiUrl}/api/categories/slugs`, { next: { revalidate: 86400 } }).catch(() => null),
      fetch(`${apiUrl}/api/category-groups/slugs`, { next: { revalidate: 86400 } }).catch(() => null)
    ]);

    const allSlugs = [];

    if (categoriesRes?.ok) {
      const categoriesData = await categoriesRes.json();
      if (categoriesData.slugs) {
        allSlugs.push(...categoriesData.slugs);
      }
    }

    if (groupsRes?.ok) {
      const groupsData = await groupsRes.json();
      if (groupsData.slugs) {
        allSlugs.push(...groupsData.slugs);
      }
    }

    if (allSlugs.length > 0) {
      return allSlugs.map((slug) => ({ slug }));
    }

    return [
      'world',
      'counties',
      'politics',
      'business',
      'opinion',
      'sports',
      'lifestyle',
      'entertainment',
      'tech',
      'other',
      'national',
      'east-africa',
      'africa',
      'international'
    ].map(slug => ({ slug }));
  } catch (error) {
    console.error('Failed to fetch category slugs:', error);
    return [
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
    ].map(slug => ({ slug }));
  }
}