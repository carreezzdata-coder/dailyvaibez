// C:\Projects\DAILY VAIBE\frontend\src\app\client\articles\[slug]\layout.tsx

import { ReactNode } from 'react';
import '@/lib/contentProtection'; 
import '../../../../styles/Ribbon.css';
import '../../../../styles/Standardformatting.css';
import '../../../../styles/zIndexSystem.css';
import '../../../../styles/components_styles/news/Cookies.css';
import '../../../../styles/components_styles/news/Horizontal.css';
import '../../../../styles/components_styles/news/dailyvaibe.css';
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
import '../../../../styles/components_styles/articles/ArticleLayout.css';
import '../../../../styles/components_styles/articles/ArticleHeader.css';
import '../../../../styles/components_styles/articles/ArticleContent.css';
import '../../../../styles/components_styles/articles/ArticleMedia.css';
import '../../../../styles/components_styles/articles/ArticleSidebar.css';
import '../../../../styles/components_styles/articles/RelatedArticles.css';
import '../../../../styles/components_styles/articles/Lightbox.css';
import '../../../../styles/components_styles/articles/ArticleUtilities.css';

import { API_CONFIG } from '@/lib/api-config';

export const dynamicParams = true;

export async function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_SKIP_STATIC_GENERATION === 'true') {
    console.log('Skipping static generation for articles');
    return [];
  }

  try {
    const apiUrl = API_CONFIG.getBackendUrl();
    
    console.log(`Fetching article slugs from: ${apiUrl}/api/articles/slugs`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${apiUrl}/api/articles/slugs`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Failed to fetch article slugs: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const slugs = Array.isArray(data) ? data : data.slugs || [];
    
    console.log(`Generated ${slugs.length} article paths`);
    
    return slugs.map((item: any) => ({
      slug: typeof item === 'string' ? item : item.slug,
    }));
    
  } catch (error) {
    console.warn('Failed to generate static article params:', error);
    return [];
  }
}

export default function ArticleLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}