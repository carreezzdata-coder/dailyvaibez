import React, { useState } from 'react';

interface MetadataResult {
  tags: string;
  meta_description: string;
  seo_keywords: string;
}

interface PopulateMetaProps {
  title: string;
  content: string;
  excerpt: string;
  onMetadataGenerated: (metadata: MetadataResult) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

const PopulateMeta: React.FC<PopulateMetaProps> = ({
  title,
  content,
  excerpt,
  onMetadataGenerated,
  isGenerating,
  setIsGenerating
}) => {
  const [error, setError] = useState<string | null>(null);

  const cleanContent = (text: string): string => {
    return text
      .replace(/\[HEADING\](.*?)\[\/HEADING\]/g, '$1')
      .replace(/\[BOLD\](.*?)\[\/BOLD\]/g, '$1')
      .replace(/\[ITALIC\](.*?)\[\/ITALIC\]/g, '$1')
      .replace(/\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/g, '$1')
      .replace(/\[QUOTE\](.*?)\[\/QUOTE\]/g, '$1')
      .replace(/\[TIMELINE\](.*?)\[\/TIMELINE\]/gs, '')
      .replace(/\[TRANSCRIPT\](.*?)\[\/TRANSCRIPT\]/gs, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const generateMetadata = async () => {
    if (!title || !content) {
      setError('Please complete title and content before generating metadata');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const cleanedContent = cleanContent(content);
      const contentPreview = cleanedContent.substring(0, 2000);
      
      const prompt = `You are an SEO expert. Based on this article, generate SEO metadata in JSON format only.

Article Title: ${title}
Article Excerpt: ${excerpt || 'Not provided'}
Article Content: ${contentPreview}${cleanedContent.length > 2000 ? '... (truncated)' : ''}

Generate:
1. tags: 5-10 relevant tags (comma-separated)
2. meta_description: 150-160 character SEO description
3. seo_keywords: 8-12 relevant keywords (comma-separated)

Respond ONLY with JSON in this exact format:
{
  "tags": "tag1, tag2, tag3",
  "meta_description": "description here",
  "seo_keywords": "keyword1, keyword2, keyword3"
}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      const textContent = data.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('');

      const cleanedText = textContent
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const metadata: MetadataResult = JSON.parse(cleanedText);

      onMetadataGenerated(metadata);
      setError(null);
    } catch (err) {
      console.error('Metadata generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate metadata');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ 
      marginBottom: '1.5rem', 
      padding: '1.5rem', 
      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      border: '2px solid rgba(168, 85, 247, 0.3)', 
      borderRadius: '12px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>✨</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            AI-Powered Metadata Generator
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Automatically generate SEO-optimized tags, description, and keywords from your content
          </div>
        </div>
        <button
          type="button"
          onClick={generateMetadata}
          disabled={isGenerating || !title || !content}
          style={{
            padding: '0.75rem 1.5rem',
            background: isGenerating 
              ? 'var(--border-primary)' 
              : 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: isGenerating || !title || !content ? 'not-allowed' : 'pointer',
            opacity: isGenerating || !title || !content ? 0.6 : 1,
            transition: 'all 0.2s ease',
            minWidth: '160px',
            fontSize: '0.9rem'
          }}
        >
          {isGenerating ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <span className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
              Generating...
            </span>
          ) : (
            '🤖 Generate Metadata'
          )}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '0.75rem', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          color: '#ef4444',
          fontSize: '0.85rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {!title || !content ? (
        <div style={{ 
          padding: '0.75rem', 
          background: 'rgba(251, 191, 36, 0.1)', 
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '6px',
          color: '#f59e0b',
          fontSize: '0.85rem'
        }}>
          💡 Complete the article title and content in previous steps to enable AI generation
        </div>
      ) : null}
    </div>
  );
};

export default PopulateMeta;