//C:\Projects\Daily Vaibe\frontend\src\components\client\components\articles\ArticleHeader.tsx

'use client';

import React from 'react';

interface ArticleHeaderProps {
  title: string;
  categoryName: string;
  categoryColor?: string;
}

export default function ArticleHeader({ title, categoryName, categoryColor }: ArticleHeaderProps) {
  return (
    <div className="article-header-top">
      <div 
        className="article-category-badge" 
        style={{ background: categoryColor || 'var(--primary-color)' }}
      >
        {categoryName}
      </div>
      <h1 className="article-title-main" itemProp="headline">
        {title}
      </h1>
    </div>
  );
}