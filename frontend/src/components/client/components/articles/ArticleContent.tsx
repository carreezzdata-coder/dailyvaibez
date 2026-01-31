import React from 'react';
import { getImageUrl } from '../../../../lib/clientData';
import MediaRenderer from './MediaRenderer';

interface ArticleImage {
  image_url: string;
  image_caption?: string;
  alt_text?: string;
  position?: number;
}

interface ArticleMedia {
  kind: 'video' | 'post';
  video_url: string;
  platform: string;
  embed_code?: string;
  caption?: string;
  position: number;
  thumbnail_url?: string;
  author_name?: string;
  author_handle?: string;
}

interface RelatedArticle {
  news_id: number;
  title: string;
  slug: string;
  image_url?: string;
  first_name: string;
  last_name: string;
  published_at: string;
}

interface ArticleContentProps {
  content: string;
  allImages: ArticleImage[];
  media: ArticleMedia[];
  onImageClick: (index: number) => void;
  relatedArticles?: RelatedArticle[];
  onArticleClick?: (article: RelatedArticle) => void;
}

export default function ArticleContent({ 
  content, 
  allImages, 
  media, 
  onImageClick,
  relatedArticles = [],
  onArticleClick
}: ArticleContentProps) {
  if (!content || content.trim() === '') {
    return (
      <div className="article-body-content">
        <p className="article-paragraph">Content is being updated. Please check back soon.</p>
      </div>
    );
  }

  // Get all inline images (position 1 and above)
  const inlineImages = allImages.filter(
    img => typeof img.position === 'number' && img.position >= 1
  );

  const normalizeBlocks = (text: string) => {
    return text
      .replace(/\[HEADING\]/g, '\n\n[HEADING]')
      .replace(/\[\/HEADING\]/g, '[/HEADING]\n\n')
      .replace(/\[QUOTE\]/g, '\n\n[QUOTE]')
      .replace(/\[\/QUOTE\]/g, '[/QUOTE]\n\n');
  };

  const processContent = (text: string) => {
    const normalized = normalizeBlocks(text);
    
    const blocks = normalized
      .split(/\n\s*\n/)
      .map(b => b.trim())
      .filter(Boolean);

    const elements: JSX.Element[] = [];
    let blockCounter = 0;
    let relatedInserted = false;

    blocks.forEach((block, idx) => {
      if (/^\[HEADING\][\s\S]*?\[\/HEADING\]$/.test(block)) {
        const headingText = block.replace(/\[\/?HEADING\]/g, '').trim();
        elements.push(
          <h2 key={`heading-${idx}`} className="article-subheading">
            {headingText}
          </h2>
        );
        return;
      }

      if (/^\[QUOTE\][\s\S]*?\[\/QUOTE\]$/.test(block)) {
        const quoteText = block.replace(/\[\/?QUOTE\]/g, '').trim();
        elements.push(
          <blockquote key={`quote-${idx}`} className="article-quote">
            {quoteText}
          </blockquote>
        );
        return;
      }

      blockCounter++;

      const html = block
        .replace(/\[HIGHLIGHT\]([\s\S]*?)\[\/HIGHLIGHT\]/g,
          '<span class="article-highlight">$1</span>'
        )
        .replace(/\[BOLD\]([\s\S]*?)\[\/BOLD\]/g,
          '<strong class="article-bold">$1</strong>'
        )
        .replace(/\[ITALIC\]([\s\S]*?)\[\/ITALIC\]/g,
          '<em class="article-italic">$1</em>'
        )
        .replace(/\n/g, '<br />');

      elements.push(
        <p
          key={`para-${idx}`}
          className="article-text-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );

      // Insert media at specific positions
      const mediaAtPos = media.find(m => m.position === blockCounter);
      if (mediaAtPos) {
        elements.push(
          <div className="article-inline-media" key={`media-${blockCounter}`}>
            <MediaRenderer media={mediaAtPos} />
          </div>
        );
      }

      // Insert images at specific positions - FIXED LOGIC
      const imageAtPos = inlineImages.find(img => img.position === blockCounter);
      if (imageAtPos) {
        const globalImageIndex = allImages.findIndex(img => img.image_url === imageAtPos.image_url);
        const imageUrl = getImageUrl(imageAtPos.image_url);
        
        elements.push(
          <figure className="article-inline-image" key={`img-${blockCounter}`}>
            <img
              src={imageUrl || ''}
              alt={imageAtPos.alt_text || imageAtPos.image_caption || 'Article image'}
              loading="lazy"
              onClick={() => onImageClick(globalImageIndex >= 0 ? globalImageIndex : 0)}
              style={{ 
                cursor: 'pointer', 
                width: '100%', 
                height: 'auto',
                maxWidth: '100%',
                borderRadius: '4px'
              }}
            />
            {imageAtPos.image_caption && (
              <figcaption className="article-image-caption">
                {imageAtPos.image_caption}
              </figcaption>
            )}
          </figure>
        );
      }

      // Insert related articles after 3rd paragraph
      if (blockCounter === 3 && !relatedInserted && relatedArticles.length >= 2 && onArticleClick) {
        elements.push(
          <div className="inline-related-articles" key="inline-related">
            <h3 className="inline-related-title">Continue Reading</h3>
            <div className="inline-related-grid">
              {relatedArticles.slice(0, 2).map((article) => (
                <div 
                  key={article.news_id}
                  className="inline-related-card"
                  onClick={() => onArticleClick(article)}
                >
                  {article.image_url && (
                    <div className="inline-related-image">
                      <img 
                        src={getImageUrl(article.image_url) || ''} 
                        alt={article.title}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <h4 className="inline-related-card-title">{article.title}</h4>
                </div>
              ))}
            </div>
          </div>
        );
        relatedInserted = true;
      }
    });

    return elements;
  };

  return (
    <div className="article-body-content">
      {processContent(content)}
    </div>
  );
}