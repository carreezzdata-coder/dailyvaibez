import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { GalleryShareProps } from './gallery.types';
import { captureScreenshot } from './gallery.utils';

const GalleryShare: React.FC<GalleryShareProps> = ({ article, themeColor, posterRef, onShare }) => {
  const handleShare = async (platform: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const articleUrl = `https://dailyvaibe.com/client/articles/${article.slug}`;
    const text = article.title;

    const screenshot = await captureScreenshot(posterRef);

    switch (platform) {
      case 'facebook':
        if (screenshot) {
          const blob = await (await fetch(screenshot)).blob();
          const file = new File([blob], `${article.slug}.png`, { type: 'image/png' });
          
          if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: text,
                text: text,
                url: articleUrl
              });
              return;
            } catch (err) {
              console.log('Web Share failed, falling back to FB dialog');
            }
          }
        }
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
        break;

      case 'twitter':
        if (screenshot && navigator.share) {
          const blob = await (await fetch(screenshot)).blob();
          const file = new File([blob], `${article.slug}.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: text,
                text: text,
                url: articleUrl
              });
              return;
            } catch (err) {
              console.log('Web Share failed, falling back to Twitter');
            }
          }
        }
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(text)}`, '_blank');
        break;

      case 'instagram':
        if (screenshot) {
          const link = document.createElement('a');
          link.download = `${article.slug}-dailyvaibe.png`;
          link.href = screenshot;
          link.click();
          alert('Image downloaded! Please share it to Instagram from your device.');
        } else {
          alert('Screenshot this image and share to Instagram!');
        }
        break;

      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + articleUrl)}`, '_blank');
        break;

      case 'vaiba':
        window.open(`https://vaiba.com/share?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
    }
    
    if (onShare) {
      onShare(platform, article, e);
    }
  };

  return (
    <div className="poster-social-bar no-screenshot">
      <button 
        className="poster-social-btn"
        onClick={(e) => handleShare('vaiba', e)} 
        title="Share on Vaiba"
        style={{ 
          background: themeColor,
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontWeight: 'bold',
          fontSize: '24px',
          letterSpacing: '-1px'
        }}
      >
        V
      </button>
      <button 
        className="poster-social-btn facebook" 
        onClick={(e) => handleShare('facebook', e)} 
        title="Share on Facebook"
        style={{ background: themeColor }}
      >
        <Facebook size={20} />
      </button>
      <button 
        className="poster-social-btn twitter" 
        onClick={(e) => handleShare('twitter', e)} 
        title="Share on Twitter"
        style={{ background: themeColor }}
      >
        <Twitter size={20} />
      </button>
      <button 
        className="poster-social-btn instagram" 
        onClick={(e) => handleShare('instagram', e)} 
        title="Share on Instagram"
        style={{ background: themeColor }}
      >
        <Instagram size={20} />
      </button>
    </div>
  );
};

export default GalleryShare;