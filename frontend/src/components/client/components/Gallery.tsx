import React from 'react';
import { useRouter } from 'next/navigation';
import type { GalleryProps, NewsArticle } from './gallery/gallery.types';
import { useGallery } from './gallery/useGallery';
import { getThemeColor } from './gallery/gallery.utils';
import GalleryNav from './gallery/GalleryNav';
import GalleryControls from './gallery/GalleryControls';
import GalleryGrid from './gallery/GalleryGrid';
import GalleryModal from './gallery/GalleryModal';
import GalleryFlashReader from './gallery/GalleryFlashReader';

const Gallery: React.FC<GalleryProps> = ({ 
  allNews = [], 
  onArticleClick,
  currentTheme = 'white',
  onClose,
  returnPath
}) => {
  const router = useRouter();
  const themeColor = getThemeColor(currentTheme);

  const {
    galleryRef,
    flashReaderRef,
    posterRef,
    filteredItems,
    selectedCategory,
    expandedCategory,
    categoryGroups,
    viewMode,
    itemsPerPage,
    selectedItem,
    currentModalIndex,
    sortBy,
    isVisible,
    isLoadingCategories,
    imageLoadStates,
    flashArticle,
    isHovering,
    setSelectedCategory,
    setExpandedCategory,
    setViewMode,
    setItemsPerPage,
    setSortBy,
    setIsHovering,
    handleReturn,
    handleCategoryClick,
    handleSubcategoryClick,
    handleImageLoad,
    handleImageError,
    handleCardClick,
    handleModalClose,
    handleModalNavigation,
    handleReadMore,
    handleCloseFlash,
    handleLoadMore,
  } = useGallery(allNews, onClose, returnPath);

  const handleShare = async (platform: string, article: NewsArticle, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = window.location.origin + `/client/articles/${article.slug}`;
    const shareText = article.title;

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    }
  };

  if (allNews.length === 0) {
    return (
      <div className="gallery-empty-state">
        <div className="empty-icon">📸</div>
        <h3>No Images Available</h3>
        <p>Check back later for new visual content.</p>
      </div>
    );
  }

  return (
    <div className="gallery-component" ref={galleryRef}>
      <GalleryFlashReader
        article={flashArticle}
        themeColor={themeColor}
        onClose={handleCloseFlash}
        onFullArticle={(slug) => router.push(`/client/articles/${slug}`)}
        flashReaderRef={flashReaderRef}
      />

      <button 
        className="gallery-floating-btn" 
        onClick={handleReturn}
        aria-label="Return to previous page"
        style={{ borderColor: themeColor }}
      >
        <span className="floating-btn-icon">←</span>
        <span className="floating-btn-text">Return</span>
      </button>

      <div className="gallery-header-section">
        <h1 className="gallery-main-title">Catch up with more visual Vaibes</h1>
      </div>

      <GalleryNav
        selectedCategory={selectedCategory}
        expandedCategory={expandedCategory}
        categoryGroups={categoryGroups}
        isLoadingCategories={isLoadingCategories}
        themeColor={themeColor}
        onCategorySelect={setSelectedCategory}
        onCategoryExpand={setExpandedCategory}
        onCategoryClick={handleCategoryClick}
        onSubcategoryClick={handleSubcategoryClick}
      />

      <GalleryControls
        sortBy={sortBy}
        viewMode={viewMode}
        itemsPerPage={itemsPerPage}
        onSortChange={setSortBy}
        onViewModeChange={setViewMode}
        onItemsPerPageChange={setItemsPerPage}
      />

      <GalleryGrid
        items={filteredItems}
        viewMode={viewMode}
        isVisible={isVisible}
        themeColor={themeColor}
        imageLoadStates={imageLoadStates}
        onCardClick={handleCardClick}
        onImageLoad={handleImageLoad}
        onImageError={handleImageError}
        onReadMore={handleReadMore}
        onHoverChange={setIsHovering}
      />

      {filteredItems.length < allNews.filter(item => item.image_url).length && (
        <div className="gallery-load-more">
          <button 
            onClick={handleLoadMore}
            className="load-more-btn"
            style={{ background: themeColor }}
          >
            Load More Stories
          </button>
        </div>
      )}

      <GalleryModal
        selectedItem={selectedItem}
        currentIndex={currentModalIndex}
        totalItems={filteredItems.length}
        themeColor={themeColor}
        onClose={handleModalClose}
        onNavigate={handleModalNavigation}
        onReadMore={handleReadMore}
        onShare={handleShare}
        posterRef={posterRef}
      />
    </div>
  );
};

export default Gallery;