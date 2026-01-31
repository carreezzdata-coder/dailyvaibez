import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import PopulateMeta from './PopulateMeta';

interface ImageFile {
  id: string;
  file?: File;
  image_id?: number;
  preview: string;
  caption: string;
  order: number;
  isFeatured: boolean;
  isUploading?: boolean;
  hasWatermark?: boolean;
  isExisting?: boolean;
}

interface Stage2Data {
  content: string;
  excerpt: string;
  images: ImageFile[];
  autoGenerateMeta?: boolean;
  generatedMetadata?: {
    tags: string;
    meta_description: string;
    seo_keywords: string;
  } | null;
}

interface CreateStage2Props {
  initialData: Stage2Data;
  onSubmit: (data: Stage2Data) => void;
  onBack: () => void;
  onDirectSubmit?: (data: Stage2Data, actionType: 'draft' | 'publish') => void;
  maxImages: number;
  currentUserName: string;
  articleTitle?: string;
  canPublish?: boolean;
}

const CreateStage2: React.FC<CreateStage2Props> = ({ 
  initialData, 
  onSubmit, 
  onBack,
  onDirectSubmit,
  maxImages,
  currentUserName,
  articleTitle = '',
  canPublish = false
}) => {
  const [rawContent, setRawContent] = useState<string>(initialData.content || '');
  const [rawExcerpt, setRawExcerpt] = useState<string>(initialData.excerpt || '');
  const [images, setImages] = useState<ImageFile[]>(initialData.images || []);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showExcerptPreview, setShowExcerptPreview] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [autoGenerateMeta, setAutoGenerateMeta] = useState<boolean>(initialData.autoGenerateMeta || false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMetadata, setGeneratedMetadata] = useState(initialData.generatedMetadata || null);
  const [showDirectSubmitMenu, setShowDirectSubmitMenu] = useState(false);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const pasteZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItems: DataTransferItem[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          imageItems.push(items[i]);
        }
      }

      if (imageItems.length === 0) return;

      e.preventDefault();
      
      if (images.length + imageItems.length > maxImages) {
        showMessage('error', `Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
        return;
      }

      showMessage('success', `Processing ${imageItems.length} pasted image(s)...`, 2000);

      const newImages: ImageFile[] = [];
      
      for (const item of imageItems) {
        const blob = item.getAsFile();
        if (!blob) continue;

        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 9);
        const fileName = `pasted-image-${timestamp}-${randomId}.png`;
        
        const file = new File([blob], fileName, { type: blob.type });
        const preview = URL.createObjectURL(file);

        newImages.push({
          id: `paste-${timestamp}-${randomId}`,
          file,
          preview,
          caption: '',
          order: images.length + newImages.length,
          isFeatured: images.length === 0 && newImages.length === 0,
          isUploading: false,
          hasWatermark: false,
          isExisting: false
        });
      }

      setImages(prev => [...prev, ...newImages]);
      showMessage('success', `${newImages.length} image(s) added successfully!`);
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [images.length, maxImages]);

  const showMessage = useCallback((type: 'success' | 'error' | 'warning', text: string, duration = 3000) => {
    setMessage({ type, text });
    if (duration > 0) {
      setTimeout(() => setMessage(null), duration);
    }
  }, []);

  const insertTag = useCallback((openTag: string, closeTag: string, ref: React.RefObject<HTMLTextAreaElement>, content: string, setContent: (value: string) => void) => {
    const textarea = ref.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newContent =
      content.substring(0, start) +
      openTag +
      selectedText +
      closeTag +
      content.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selectedText.length + closeTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, []);

  const insertTemplate = useCallback((template: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newContent =
      rawContent.substring(0, start) +
      '\n\n' + template + '\n\n' +
      rawContent.substring(start);

    setRawContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + template.length + 4, start + template.length + 4);
    }, 0);
  }, [rawContent]);

  const renderInlineFormatting = useCallback((text: string, baseKey: number) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <br key={`${baseKey}-${idx}`} />;

      const processedLine: React.ReactNode[] = [];
      const highlightRegex = /\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/g;
      const boldRegex = /\[BOLD\](.*?)\[\/BOLD\]/g;
      const italicRegex = /\[ITALIC\](.*?)\[\/ITALIC\]/g;

      const inlineMatches: Array<{ type: string; match: RegExpExecArray }> = [];
      
      let match;
      while ((match = highlightRegex.exec(line)) !== null) {
        inlineMatches.push({ type: 'highlight', match });
      }
      while ((match = boldRegex.exec(line)) !== null) {
        inlineMatches.push({ type: 'bold', match });
      }
      while ((match = italicRegex.exec(line)) !== null) {
        inlineMatches.push({ type: 'italic', match });
      }

      inlineMatches.sort((a, b) => a.match.index - b.match.index);

      let currentPos = 0;
      let segmentKey = 0;
      inlineMatches.forEach(({ type, match }) => {
        if (match.index > currentPos) {
          processedLine.push(line.substring(currentPos, match.index));
        }

        if (type === 'highlight') {
          processedLine.push(<span key={segmentKey++} className="preview-highlight">{match[1]}</span>);
        } else if (type === 'bold') {
          processedLine.push(<strong key={segmentKey++}>{match[1]}</strong>);
        } else if (type === 'italic') {
          processedLine.push(<em key={segmentKey++}>{match[1]}</em>);
        }

        currentPos = match.index + match[0].length;
      });

      if (currentPos < line.length) {
        processedLine.push(line.substring(currentPos));
      }

      return <p key={`${baseKey}-${idx}`}>{processedLine.length > 0 ? processedLine : line}</p>;
    });
  }, []);

  const renderTimeline = useCallback((content: string, key: number) => {
    const lines = content.split('\n').filter(l => l.trim());
    const events = [];
    
    for (let i = 0; i < lines.length; i += 2) {
      const date = lines[i];
      const desc = lines[i + 1];
      if (date && desc) {
        events.push({ date, desc });
      }
    }

    return (
      <div key={key} className="preview-timeline">
        <div className="timeline-header">📅 Timeline</div>
        <div className="timeline-events">
          {events.map((event, idx) => (
            <div key={idx} className="timeline-event">
              <div className="timeline-date">
                <strong>{event.date}</strong>
              </div>
              <div className="timeline-desc">{event.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }, []);

  const renderTranscript = useCallback((content: string, key: number) => {
    const lines = content.split('\n').filter(l => l.trim());
    const pairs = [];
    
    for (let i = 0; i < lines.length; i += 2) {
      const question = lines[i];
      const answer = lines[i + 1];
      if (question && answer) {
        pairs.push({ question, answer });
      }
    }

    return (
      <div key={key} className="preview-interview">
        <div className="interview-header">💬 Interview Transcript</div>
        {pairs.map((pair, idx) => (
          <div key={idx} className="interview-pair">
            <div className="interview-q">
              <strong>Q:</strong> {pair.question}
            </div>
            <div className="interview-a">
              <strong>A:</strong> {pair.answer}
            </div>
          </div>
        ))}
      </div>
    );
  }, []);

  const renderPreview = useMemo(() => {
    if (!rawContent) return <p className="empty-preview-text">Start typing to see preview...</p>;

    const content = rawContent;
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let key = 0;

    const headingRegex = /\[HEADING\](.*?)\[\/HEADING\]/gs;
    const quoteRegex = /\[QUOTE\](.*?)\[\/QUOTE\]/gs;
    const timelineRegex = /\[TIMELINE\](.*?)\[\/TIMELINE\]/gs;
    const transcriptRegex = /\[TRANSCRIPT\](.*?)\[\/TRANSCRIPT\]/gs;

    const allMatches: Array<{ type: string; match: RegExpExecArray }> = [];

    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      allMatches.push({ type: 'heading', match });
    }
    while ((match = quoteRegex.exec(content)) !== null) {
      allMatches.push({ type: 'quote', match });
    }
    while ((match = timelineRegex.exec(content)) !== null) {
      allMatches.push({ type: 'timeline', match });
    }
    while ((match = transcriptRegex.exec(content)) !== null) {
      allMatches.push({ type: 'transcript', match });
    }

    allMatches.sort((a, b) => a.match.index - b.match.index);

    allMatches.forEach(({ type, match }) => {
      if (match.index > currentIndex) {
        const textBefore = content.substring(currentIndex, match.index);
        parts.push(renderInlineFormatting(textBefore, key++));
      }

      if (type === 'heading') {
        parts.push(
          <div key={key++} className="preview-heading">
            {renderInlineFormatting(match[1], key++)}
          </div>
        );
      } else if (type === 'quote') {
        parts.push(
          <blockquote key={key++} className="preview-quote">
            {renderInlineFormatting(match[1], key++)}
          </blockquote>
        );
      } else if (type === 'timeline') {
        parts.push(renderTimeline(match[1], key++));
      } else if (type === 'transcript') {
        parts.push(renderTranscript(match[1], key++));
      }

      currentIndex = match.index + match[0].length;
    });

    if (currentIndex < content.length) {
      const remaining = content.substring(currentIndex);
      parts.push(renderInlineFormatting(remaining, key++));
    }

    return <>{parts}</>;
  }, [rawContent, renderInlineFormatting, renderTimeline, renderTranscript]);

  const renderExcerptPreview = useMemo(() => {
    if (!rawExcerpt) return <p className="empty-preview-text">Start typing to see preview...</p>;
    return <>{renderInlineFormatting(rawExcerpt, 0)}</>;
  }, [rawExcerpt, renderInlineFormatting]);

  const validateAndPrepareData = useCallback((): Stage2Data | null => {
    if (!rawContent.trim()) {
      showMessage('error', 'Please write some content');
      return null;
    }

    if (!rawExcerpt.trim()) {
      showMessage('error', 'Please write an excerpt');
      return null;
    }

    return {
      content: rawContent,
      excerpt: rawExcerpt,
      images: images,
      autoGenerateMeta,
      generatedMetadata
    };
  }, [rawContent, rawExcerpt, images, autoGenerateMeta, generatedMetadata, showMessage]);

  const handleContinue = useCallback(() => {
    const data = validateAndPrepareData();
    if (data) {
      onSubmit(data);
    }
  }, [validateAndPrepareData, onSubmit]);

  const handleDirectSubmit = useCallback((actionType: 'draft' | 'publish') => {
    const data = validateAndPrepareData();
    if (data && onDirectSubmit) {
      if (!autoGenerateMeta || !generatedMetadata) {
        showMessage('warning', 'Consider enabling AI metadata generation for better SEO', 3000);
      }
      setShowDirectSubmitMenu(false);
      onDirectSubmit(data, actionType);
    }
  }, [validateAndPrepareData, onDirectSubmit, autoGenerateMeta, generatedMetadata, showMessage]);

  const handleMetadataGenerated = useCallback((metadata: {
    tags: string;
    meta_description: string;
    seo_keywords: string;
  }) => {
    setGeneratedMetadata(metadata);
    showMessage('success', '✨ Metadata generated successfully! It will be auto-filled in Stage 3.');
  }, [showMessage]);

  const timelineTemplate = `[TIMELINE]
January 15, 2024
First event description
January 20, 2024
Second event description
January 25, 2024
Third event description
[/TIMELINE]`;

  const transcriptTemplate = `[TRANSCRIPT]
What is your view on this topic?
I believe this is a significant development that will impact the industry.
Can you elaborate on that?
Certainly, the key factors include economic changes and technological advances.
[/TRANSCRIPT]`;

  return (
    <div className="admin-content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          ✍️ Create New Article - Stage 2
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Write your article content and add images
        </p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {autoGenerateMeta && (
        <PopulateMeta
          title={articleTitle}
          content={rawContent}
          excerpt={rawExcerpt}
          onMetadataGenerated={handleMetadataGenerated}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      )}

      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1.25rem', 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-primary)', 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          cursor: 'pointer',
          flex: 1
        }}>
          <input
            type="checkbox"
            checked={autoGenerateMeta}
            onChange={(e) => setAutoGenerateMeta(e.target.checked)}
            style={{ 
              width: '20px', 
              height: '20px', 
              cursor: 'pointer',
              accentColor: 'var(--vybez-primary)'
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
              🤖 Auto-Generate SEO Metadata with AI
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Generate tags, meta description, and keywords automatically in Stage 3
            </div>
          </div>
        </label>
      </div>

      <div 
        ref={pasteZoneRef}
        style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          border: '2px dashed rgba(59, 130, 246, 0.3)', 
          borderRadius: '12px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋✨</div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Paste Images Anywhere
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Copy any image and press Ctrl+V (Cmd+V on Mac) to add it instantly
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label style={{ fontWeight: 600, fontSize: '1rem' }}>
            📝 Article Excerpt <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowExcerptPreview(!showExcerptPreview)}
            className="toggle-preview-btn"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            {showExcerptPreview ? '🖊 Edit' : '👁️ Preview'}
          </button>
        </div>

        {!showExcerptPreview ? (
          <>
            <div className="content-editor-toolbar" style={{ marginBottom: '0.5rem' }}>
              <div className="toolbar-group">
                <button type="button" onClick={() => insertTag('[BOLD]', '[/BOLD]', excerptRef, rawExcerpt, setRawExcerpt)} className="toolbar-btn" title="Bold">
                  <strong>B</strong>
                </button>
                <button type="button" onClick={() => insertTag('[ITALIC]', '[/ITALIC]', excerptRef, rawExcerpt, setRawExcerpt)} className="toolbar-btn" title="Italic">
                  <em>I</em>
                </button>
                <button type="button" onClick={() => insertTag('[HIGHLIGHT]', '[/HIGHLIGHT]', excerptRef, rawExcerpt, setRawExcerpt)} className="toolbar-btn" title="Highlight">
                  <span style={{ background: 'linear-gradient(120deg, var(--vybez-primary) 0%, #00ff88 100%)', color: '#000', padding: '0.15rem 0.4rem', borderRadius: '3px', fontWeight: 700 }}>H</span>
                </button>
              </div>
            </div>
            <textarea
              ref={excerptRef}
              value={rawExcerpt}
              onChange={(e) => setRawExcerpt(e.target.value)}
              placeholder="Write a brief summary (2-3 sentences)..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                background: 'var(--bg-content)',
                color: 'var(--text-primary)',
                resize: 'vertical'
              }}
            />
          </>
        ) : (
          <div className="content-preview" style={{ minHeight: '80px' }}>
            <div className="preview-content">
              {renderExcerptPreview}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ fontWeight: 600, fontSize: '1rem' }}>
            📄 Article Content <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="toggle-preview-btn"
          >
            {showPreview ? '🖊 Edit' : '👁️ Preview'}
          </button>
        </div>

        {!showPreview ? (
          <>
            <div className="content-editor-toolbar">
              <div className="toolbar-group">
                <button type="button" onClick={() => insertTag('[BOLD]', '[/BOLD]', contentRef, rawContent, setRawContent)} className="toolbar-btn" title="Bold">
                  <strong>B</strong>
                </button>
                <button type="button" onClick={() => insertTag('[ITALIC]', '[/ITALIC]', contentRef, rawContent, setRawContent)} className="toolbar-btn" title="Italic">
                  <em>I</em>
                </button>
                <button type="button" onClick={() => insertTag('[HIGHLIGHT]', '[/HIGHLIGHT]', contentRef, rawContent, setRawContent)} className="toolbar-btn" title="Highlight">
                  <span style={{ background: 'linear-gradient(120deg, var(--vybez-primary) 0%, #00ff88 100%)', color: '#000', padding: '0.15rem 0.4rem', borderRadius: '3px', fontWeight: 700 }}>H</span>
                </button>
              </div>
              
              <div className="toolbar-divider"></div>
              
              <div className="toolbar-group">
                <button type="button" onClick={() => insertTag('[HEADING]', '[/HEADING]', contentRef, rawContent, setRawContent)} className="toolbar-btn" title="Heading">
                  H1
                </button>
                <button type="button" onClick={() => insertTag('[QUOTE]', '[/QUOTE]', contentRef, rawContent, setRawContent)} className="toolbar-btn" title="Quote">
                  "
                </button>
              </div>

              <div className="toolbar-divider"></div>
              
              <div className="toolbar-group">
                <button type="button" onClick={() => insertTemplate(timelineTemplate)} className="toolbar-btn" title="Insert Timeline">
                  📅
                </button>
                <button type="button" onClick={() => insertTemplate(transcriptTemplate)} className="toolbar-btn" title="Insert Interview">
                  💬
                </button>
              </div>
            </div>

            <textarea
              ref={contentRef}
              className="content-editor"
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Write your article here...

Use the toolbar above to format text:
- [BOLD]text[/BOLD] for bold
- [ITALIC]text[/ITALIC] for italic
- [HIGHLIGHT]text[/HIGHLIGHT] for highlighted text
- [HEADING]text[/HEADING] for headings
- [QUOTE]text[/QUOTE] for quotes
- [TIMELINE]...[/TIMELINE] for event timelines
- [TRANSCRIPT]...[/TRANSCRIPT] for interview transcripts"
            />
          </>
        ) : (
          <div className="content-preview">
            <div className="preview-header">
              <span>📄 Preview</span>
            </div>
            <div className="preview-content">
              {renderPreview}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <ImageUpload
          images={images}
          maxImages={maxImages}
          onImagesChange={setImages}
          onMessage={showMessage}
        />
      </div>

      <div className="pagination" style={{ position: 'relative' }}>
        <button type="button" onClick={onBack} className="page-btn">← Back</button>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {onDirectSubmit && (
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => setShowDirectSubmitMenu(!showDirectSubmitMenu)}
                className="page-btn"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ⚡ Quick Submit
                <span style={{ fontSize: '0.7rem' }}>▼</span>
              </button>
              
              {showDirectSubmitMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  marginBottom: '0.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  zIndex: 1000
                }}>
                  <button
                    type="button"
                    onClick={() => handleDirectSubmit('draft')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-primary)',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    💾 Save as Draft
                  </button>
                  {canPublish && (
                    <button
                      type="button"
                      onClick={() => handleDirectSubmit('publish')}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      ✅ Publish Now
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          <button type="button" onClick={handleContinue} className="new-post-btn">
            Continue to SEO & Social →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStage2;