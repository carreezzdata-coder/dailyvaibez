import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCategoryIcon, isGroupCategory, getImageUrl, formatNumber } from '@/lib/clientData';

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

interface FooterArticle {
  slug: string;
  title: string;
  views: number;
  image_url: string;
  category_name?: string;
}

interface FooterMobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  groups: CategoryGroup[];
  marqueeArticles: FooterArticle[];
  trackBehavior?: (action: string) => void;
  trackCategoryVisit: (slug: string) => void;
  openManageModal: () => void;
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

export default function FooterMobileOverlay({
  isOpen,
  onClose,
  groups,
  marqueeArticles,
  trackBehavior,
  trackCategoryVisit,
  openManageModal
}: FooterMobileOverlayProps) {
  const router = useRouter();

  const handleSubCategoryClick = useCallback((slug: string) => {
    const isMainCategory = isGroupCategory(slug);
    if (trackBehavior) trackBehavior(slug);
    trackCategoryVisit(slug);
    onClose();
    if (isMainCategory) {
      router.push(`/client/categories/${slug}`);
    } else {
      router.push(`/client/sub-categories/${slug}`);
    }
  }, [router, trackBehavior, trackCategoryVisit, onClose]);

  const handleCategoryGroupClick = useCallback((groupTitle: string, mainSlug?: string | null) => {
    const categorySlug = mainSlug || GROUP_TO_CATEGORY_MAP[groupTitle];
    if (categorySlug) {
      if (trackBehavior) trackBehavior(categorySlug);
      trackCategoryVisit(categorySlug);
      onClose();
      router.push(`/client/categories/${categorySlug}`);
    }
  }, [router, trackBehavior, trackCategoryVisit, onClose]);

  const handleArticleClick = useCallback((slug: string) => {
    if (trackBehavior) trackBehavior('footer_article_click');
    onClose();
    router.push(`/client/articles/${slug}`);
  }, [router, trackBehavior, onClose]);

  const navigate = useCallback((path: string) => {
    onClose();
    router.push(path);
  }, [router, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="ftr-overlay-backdrop active" onClick={onClose} />
      <div className="ftr-overlay-panel active">
        <div className="ftr-panel-header">
          <button onClick={onClose} className="ftr-panel-close" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <span className="ftr-panel-title">More</span>
        </div>

        <div className="ftr-panel-content">
          <div className="ftr-marquee-section">
            <div className="ftr-marquee-track">
              {marqueeArticles.map((article, index) => {
                const imageUrl = getImageUrl(article.image_url);
                return (
                  <div
                    key={`ftr-marquee-${article.slug}-${index}`}
                    className="ftr-marquee-card"
                    onClick={() => handleArticleClick(article.slug)}
                    style={{
                      backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="ftr-marquee-overlay">
                      {article.category_name && (
                        <span className="ftr-marquee-category">{article.category_name}</span>
                      )}
                      <span className="ftr-marquee-views">👁️ {formatNumber(article.views)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ftr-categories-grid">
            {groups.map((group, idx) => (
              <div key={`ftr-cat-${group.title}-${idx}`} className="ftr-category-section">
                <button
                  className="ftr-category-header"
                  onClick={() => handleCategoryGroupClick(group.title, group.mainSlug)}
                >
                  <span className="ftr-category-icon">
                    {group.icon || getCategoryIcon(group.mainSlug || '')}
                  </span>
                  <span className="ftr-category-title">{group.title}</span>
                </button>
                <div className="ftr-subcategories">
                  {group.categories.map((category) => (
                    <button
                      key={category.category_id}
                      onClick={() => handleSubCategoryClick(category.slug)}
                      className="ftr-subcategory-btn"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="ftr-actions-grid">
            <button onClick={() => navigate('/privacy')} className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </button>
            <button onClick={() => navigate('/terms')} className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </button>
            <button onClick={() => navigate('/contact')} className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button onClick={() => navigate('/about')} className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
            <button onClick={() => navigate('/careers')} className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </button>
            <button onClick={openManageModal} className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/>
              </svg>
            </button>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <button onClick={() => navigate('/client/settings')} className="ftr-action-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.636 5.636l4.243 4.243m4.242 4.242l4.243 4.243M1 12h6m6 0h6M5.636 18.364l4.243-4.243m4.242-4.242l4.243-4.243"/>
              </svg>
            </button>
          </div>

          <div className="ftr-download-strip">
            <a href="#" className="ftr-download-icon" aria-label="Android App">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.341c-.537-.586-.944-1.173-1.146-1.759-.223-.626-.335-1.429-.335-2.409s.112-1.783.335-2.409c.202-.586.609-1.173 1.146-1.759 1.163-1.268 1.163-2.05 0-2.346-.761-.193-1.522-.29-2.283-.29h-.05c-.76 0-1.522.097-2.282.29-1.163.296-1.163 1.078 0 2.346.537.586.944 1.173 1.146 1.759.223.626.335 1.429.335 2.409s-.112 1.783-.335 2.409c-.202.586-.609 1.173-1.146 1.759-1.163 1.268-1.163 2.05 0 2.346.76.193 1.521.29 2.282.29h.05c.761 0 1.522-.097 2.283-.29 1.163-.296 1.163-1.078 0-2.346zm-5.046-4.168c0-.98-.112-1.783-.335-2.409-.202-.586-.609-1.173-1.146-1.759-1.163-1.268-1.163-2.05 0-2.346.76-.193 1.522-.29 2.283-.29h.05c.76 0 1.521.097 2.282.29 1.163.296 1.163 1.078 0 2.346-.537.586-.944 1.173-1.146 1.759-.223.626-.335 1.429-.335 2.409s.112 1.783.335 2.409c.202.586.609 1.173 1.146 1.759 1.163 1.268 1.163 2.05 0 2.346-.761.193-1.522.29-2.282.29h-.05c-.761 0-1.523-.097-2.283-.29-1.163-.296-1.163-1.078 0-2.346.537-.586.944-1.173 1.146-1.759.223-.626.335-1.429.335-2.409z"/>
              </svg>
            </a>
            <a href="#" className="ftr-download-icon" aria-label="iOS App">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </a>
            <a href="#" className="ftr-download-icon" aria-label="Web App">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </a>
          </div>

          <div className="ftr-panel-credits">
            <p>© {new Date().getFullYear()} Daily Vaibe</p>
            <p>For Africa 🌍 with ❤️</p>
          </div>
        </div>
      </div>
    </>
  );
}