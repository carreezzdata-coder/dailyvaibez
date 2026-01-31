import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCategoryIcon, isGroupCategory } from '@/lib/clientData';

interface Category {
  category_id: number;
  name: string;
  slug: string;
}

interface CategoryGroup {
  title: string;
  icon: string;
  mainSlug: string | null;
  categories: Category[];
}

interface FooterCategoriesProps {
  groups: CategoryGroup[];
  trackBehavior?: (action: string) => void;
  trackCategoryVisit: (slug: string) => void;
}

const GROUP_TO_CATEGORY_MAP: { [key: string]: string } = {
  'World': 'world',
  'Counties': 'counties',
  'Politics': 'politics',
  'Business': 'business',
  'Opinion': 'opinion',
  'Sports': 'sports',
  'Life & Style': 'lifestyle',
  'Entertainment': 'entertainment',
  'Technology': 'tech',
  'Other': 'other',
};

export default function FooterCategories({ groups, trackBehavior, trackCategoryVisit }: FooterCategoriesProps) {
  const router = useRouter();

  const handleSubCategoryClick = useCallback((slug: string) => {
    const isMainCategory = isGroupCategory(slug);
    if (trackBehavior) trackBehavior(slug);
    trackCategoryVisit(slug);
    if (isMainCategory) {
      router.push(`/client/categories/${slug}`);
    } else {
      router.push(`/client/sub-categories/${slug}`);
    }
  }, [router, trackBehavior, trackCategoryVisit]);

  const handleCategoryGroupClick = useCallback((groupTitle: string, mainSlug?: string | null) => {
    const categorySlug = mainSlug || GROUP_TO_CATEGORY_MAP[groupTitle];
    if (categorySlug) {
      if (trackBehavior) trackBehavior(categorySlug);
      trackCategoryVisit(categorySlug);
      router.push(`/client/categories/${categorySlug}`);
    }
  }, [router, trackBehavior, trackCategoryVisit]);

  if (!groups.length) return null;

  return (
    <div className="footer-categories-section">
      <div className="footer-mega-grid">
        {groups.map((group, idx) => (
          <div key={`${group.title}-${idx}`} className="footer-section">
            <button
              className="footer-section-header clickable"
              onClick={() => handleCategoryGroupClick(group.title, group.mainSlug)}
              type="button"
              aria-label={`Navigate to ${group.title} category`}
            >
              <span className="footer-icon" aria-hidden="true">
                {group.icon || getCategoryIcon(group.mainSlug || '')}
              </span>
              <h3 className="footer-section-title">{group.title}</h3>
              <span className="main-category-indicator" aria-hidden="true">→</span>
            </button>
            <ul className="footer-links-list">
              {group.categories.map((category) => (
                <li key={category.category_id}>
                  <button
                    onClick={() => handleSubCategoryClick(category.slug)}
                    className="footer-link-item"
                    type="button"
                    aria-label={`Navigate to ${category.name} sub-category`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-mobile-static-links">
        <nav className="footer-mobile-nav" aria-label="Footer navigation">
          <Link href="/static_pages/about" className="footer-mobile-link">
            About Us
          </Link>
          <Link href="/static_pages/contact" className="footer-mobile-link">
            Contact
          </Link>
          <Link href="/static_pages/privacy" className="footer-mobile-link">
            Privacy
          </Link>
          <Link href="/static_pages/terms" className="footer-mobile-link">
            Terms
          </Link>
          <Link href="/static_pages/careers" className="footer-mobile-link">
            Careers
          </Link>
        </nav>
      </div>
    </div>
  );
}