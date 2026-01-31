import React from 'react';

interface ArticleExcerptProps {
  excerpt: string;
}

export default function ArticleExcerpt({ excerpt }: ArticleExcerptProps) {
  if (!excerpt || excerpt.trim() === '') {
    return null;
  }

  const processExcerpt = (text: string) => {
    const highlightColors = [
      'linear-gradient(120deg, #FF6B6B 0%, #FF8E53 100%)',
      'linear-gradient(120deg, #4ECDC4 0%, #44A08D 100%)',
      'linear-gradient(120deg, #FFD93D 0%, #FFA500 100%)',
      'linear-gradient(120deg, #A8E6CF 0%, #56AB91 100%)',
      'linear-gradient(120deg, #FF9FF3 0%, #FECA57 100%)',
      'linear-gradient(120deg, #54A0FF 0%, #2E86DE 100%)'
    ];

    let colorIndex = 0;

    const processedText = text
      .replace(/\[HIGHLIGHT\]([\s\S]*?)\[\/HIGHLIGHT\]/g, (match, content) => {
        const color = highlightColors[colorIndex % highlightColors.length];
        colorIndex++;
        return `<span class="excerpt-highlight" style="background: ${color}">${content}</span>`;
      })
      .replace(/\[BOLD\]([\s\S]*?)\[\/BOLD\]/g, '<strong class="excerpt-bold">$1</strong>')
      .replace(/\[ITALIC\]([\s\S]*?)\[\/ITALIC\]/g, '<em class="excerpt-italic">$1</em>');

    return processedText;
  };

  return (
    <div className="article-excerpt">
      <p
        className="excerpt-text"
        dangerouslySetInnerHTML={{ __html: processExcerpt(excerpt) }}
      />
    </div>
  );
}