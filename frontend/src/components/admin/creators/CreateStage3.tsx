import React, { useState, useCallback } from 'react';
import PopulateMeta from './PopulateMeta';

interface SocialMediaLink {
  platform: 'youtube_video' | 'youtube_short' | 'twitter_post' | 'twitter_video' | 
            'instagram_post' | 'instagram_reel' | 'instagram_video' | 'facebook_post' | 
            'facebook_video' | 'facebook_reel' | 'tiktok_video' | 'tiktok_reel' | 
            'linkedin_post' | 'threads_post' | 'x_post' | 'x_video';
  post_type: 'post' | 'reel' | 'video' | 'short' | 'story' | 'status';
  post_url: string;
  display_order: number;
  auto_embed?: boolean;
  show_full_embed?: boolean;
  is_featured?: boolean;
  caption?: string;
}

interface Stage3Data {
  tags: string;
  meta_description: string;
  seo_keywords: string;
  social_media_links: SocialMediaLink[];
}

interface CreateStage3Props {
  initialData: Stage3Data;
  onSubmit: (data: Stage3Data, actionType: 'draft' | 'publish') => void;
  onBack: () => void;
  maxSocialLinks: number;
  canPublish: boolean;
  requiresApproval: boolean;
  isSubmitting: boolean;
  generatedMetadata?: {
    tags: string;
    meta_description: string;
    seo_keywords: string;
  } | null;
}

const detectPlatform = (url: string): { platform: SocialMediaLink['platform'], post_type: SocialMediaLink['post_type'] } => {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    if (lowerUrl.includes('shorts/')) {
      return { platform: 'youtube_short', post_type: 'short' };
    }
    return { platform: 'youtube_video', post_type: 'video' };
  }
  
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    if (lowerUrl.includes('/video/')) {
      return { platform: 'twitter_video', post_type: 'video' };
    }
    return { platform: 'twitter_post', post_type: 'post' };
  }
  
  if (lowerUrl.includes('instagram.com')) {
    if (lowerUrl.includes('/reel/')) {
      return { platform: 'instagram_reel', post_type: 'reel' };
    }
    if (lowerUrl.includes('/stories/')) {
      return { platform: 'instagram_post', post_type: 'story' };
    }
    if (lowerUrl.includes('/p/') || lowerUrl.includes('/tv/')) {
      return { platform: 'instagram_post', post_type: 'post' };
    }
  }
  
  if (lowerUrl.includes('tiktok.com')) {
    return { platform: 'tiktok_video', post_type: 'video' };
  }
  
  if (lowerUrl.includes('facebook.com')) {
    if (lowerUrl.includes('/reel/') || lowerUrl.includes('/watch/')) {
      return { platform: 'facebook_video', post_type: 'video' };
    }
    return { platform: 'facebook_post', post_type: 'post' };
  }
  
  return { platform: 'youtube_video', post_type: 'video' };
};

const CreateStage3: React.FC<CreateStage3Props> = ({ 
  initialData, 
  onSubmit, 
  onBack, 
  maxSocialLinks, 
  canPublish, 
  requiresApproval,
  isSubmitting,
  generatedMetadata = null
}) => {
  const [formData, setFormData] = useState<Stage3Data>(() => {
    if (generatedMetadata) {
      return {
        ...initialData,
        tags: generatedMetadata.tags || initialData.tags,
        meta_description: generatedMetadata.meta_description || initialData.meta_description,
        seo_keywords: generatedMetadata.seo_keywords || initialData.seo_keywords
      };
    }
    return initialData;
  });

  const addSocialMediaLink = useCallback(() => {
    try {
      if (formData.social_media_links.length >= maxSocialLinks) {
        alert(`Maximum ${maxSocialLinks} social media links allowed`);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        social_media_links: [...prev.social_media_links, { 
          platform: 'youtube_video', 
          post_type: 'video',
          post_url: '',
          display_order: Math.max(2, prev.social_media_links.length + 2),
          auto_embed: true,
          show_full_embed: true,
          is_featured: prev.social_media_links.length === 0,
          caption: ''
        }]
      }));
    } catch (error) {
      console.error('Error adding social link:', error);
      alert('Failed to add social link. Please try again.');
    }
  }, [formData.social_media_links.length, maxSocialLinks]);

  const updateSocialMediaLink = useCallback((index: number, field: keyof SocialMediaLink, value: string | boolean | number) => {
    try {
      setFormData(prev => {
        const newLinks = [...prev.social_media_links];
        
        if (field === 'post_url' && typeof value === 'string') {
          const detected = detectPlatform(value);
          newLinks[index] = { 
            ...newLinks[index], 
            platform: detected.platform, 
            post_type: detected.post_type,
            post_url: value 
          };
        } else if (field === 'display_order' && typeof value === 'number') {
          const minOrder = 2;
          newLinks[index] = { 
            ...newLinks[index], 
            display_order: Math.max(minOrder, value)
          };
        } else {
          newLinks[index] = { ...newLinks[index], [field]: value as any };
        }
        
        return { ...prev, social_media_links: newLinks };
      });
    } catch (error) {
      console.error('Error updating social link:', error);
      alert('Failed to update social link. Please try again.');
    }
  }, []);

  const removeSocialMediaLink = useCallback((index: number) => {
    try {
      setFormData(prev => ({
        ...prev,
        social_media_links: prev.social_media_links.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing social link:', error);
      alert('Failed to remove social link. Please try again.');
    }
  }, []);

  const handleSubmit = (actionType: 'draft' | 'publish') => {
    try {
      const validatedLinks = formData.social_media_links.map(link => ({
        ...link,
        display_order: Math.max(2, link.display_order || 2)
      }));

      onSubmit({
        ...formData,
        social_media_links: validatedLinks
      }, actionType);
    } catch (error) {
      console.error('Error submitting stage 3:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const publishButtonText = canPublish ? 'Publish Now' : 'Submit for Approval';
  const publishingText = canPublish ? 'Publishing...' : 'Submitting...';

  return (
    <div className="retrieve-posts">
      <div className="retrieve-header">
        <div className="header-left">
          <h1>Create Article - Step 3: SEO & Social</h1>
          <p className="header-description">Add metadata and social media links</p>
        </div>
      </div>

      <div className="admin-content" style={{ marginTop: '1.5rem' }}>
        <div className="retrieve-container">
          {generatedMetadata && (
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1.25rem', 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '2rem' }}>✅</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: '#059669', marginBottom: '0.25rem' }}>
                  AI Metadata Generated Successfully
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Your SEO metadata has been auto-populated. You can edit the fields below if needed.
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                🏷️ Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  background: 'var(--bg-content)',
                  color: 'var(--text-primary)'
                }}
                aria-label="Article tags"
              />
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Separate tags with commas
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                📝 Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="Brief description for search engines..."
                rows={3}
                disabled={isSubmitting}
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
                aria-label="Meta description"
              />
              <div style={{ 
                marginTop: '0.5rem', 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.85rem', 
                color: 'var(--text-muted)' 
              }}>
                <span>Recommended: 150-160 characters</span>
                <span style={{ 
                  color: formData.meta_description.length > 160 ? '#ef4444' : 
                         formData.meta_description.length >= 150 ? '#10b981' : 
                         'var(--text-muted)'
                }}>
                  {formData.meta_description.length}/160
                </span>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                🔍 SEO Keywords
              </label>
              <input
                type="text"
                value={formData.seo_keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                placeholder="keyword1, keyword2, keyword3"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  background: 'var(--bg-content)',
                  color: 'var(--text-primary)'
                }}
                aria-label="SEO keywords"
              />
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Separate keywords with commas
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  🔗 Social Media Links
                </label>
                {formData.social_media_links.length < maxSocialLinks && (
                  <button
                    type="button"
                    onClick={addSocialMediaLink}
                    className="new-post-btn"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    disabled={isSubmitting}
                    aria-label="Add social media link"
                  >
                    + Add
                  </button>
                )}
              </div>

              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', fontSize: '0.85rem', color: '#3b82f6' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>💡 Display Order:</div>
                <div>Social embeds appear at paragraph 2+ (minimum). Lower numbers = earlier in article.</div>
              </div>

              {formData.social_media_links.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <p>No links added. YouTube, Twitter, TikTok, Instagram supported.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.social_media_links.map((link, index) => (
                    <div key={index} style={{ background: 'var(--bg-content)', border: '1px solid var(--border-primary)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <select
                          value={link.platform}
                          onChange={(e) => updateSocialMediaLink(index, 'platform', e.target.value as any)}
                          style={{ padding: '0.5rem', border: '1px solid var(--border-primary)', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                          disabled={isSubmitting}
                          aria-label="Select platform"
                        >
                          <option value="youtube_video">YouTube Video</option>
                          <option value="youtube_short">YouTube Short</option>
                          <option value="twitter_post">Twitter Post</option>
                          <option value="twitter_video">Twitter Video</option>
                          <option value="x_post">X Post</option>
                          <option value="x_video">X Video</option>
                          <option value="instagram_post">Instagram Post</option>
                          <option value="instagram_reel">Instagram Reel</option>
                          <option value="facebook_post">Facebook Post</option>
                          <option value="facebook_video">Facebook Video</option>
                          <option value="tiktok_video">TikTok Video</option>
                          <option value="tiktok_reel">TikTok Reel</option>
                          <option value="linkedin_post">LinkedIn Post</option>
                          <option value="threads_post">Threads Post</option>
                        </select>
                        
                        <input
                          type="url"
                          value={link.post_url}
                          onChange={(e) => updateSocialMediaLink(index, 'post_url', e.target.value)}
                          placeholder="Post URL..."
                          className="search-input"
                          style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}
                          disabled={isSubmitting}
                          aria-label="Post URL"
                        />
                        
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            type="button"
                            onClick={() => updateSocialMediaLink(index, 'is_featured', !link.is_featured)}
                            title={link.is_featured ? 'Featured' : 'Set as featured'}
                            style={{ 
                              padding: '0.4rem', borderRadius: '4px', cursor: 'pointer',
                              background: link.is_featured ? 'var(--vybez-primary)' : 'transparent',
                              border: `1px solid ${link.is_featured ? 'var(--vybez-primary)' : 'var(--border-primary)'}`,
                              color: link.is_featured ? 'var(--bg-dark)' : 'var(--text-muted)'
                            }}
                            disabled={isSubmitting}
                            aria-label={link.is_featured ? 'Remove featured status' : 'Mark as featured'}
                          >
                            ⭐
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSocialMediaLink(index)}
                            style={{ padding: '0.4rem', background: 'transparent', border: '1px solid var(--status-danger)', color: 'var(--status-danger)', borderRadius: '4px', width: '32px', height: '32px' }}
                            disabled={isSubmitting}
                            aria-label="Remove social link"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 80px 1fr', gap: '0.75rem', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                          <input 
                            type="checkbox" 
                            checked={link.auto_embed} 
                            onChange={(e) => updateSocialMediaLink(index, 'auto_embed', e.target.checked)} 
                            disabled={isSubmitting}
                            aria-label="Auto embed"
                          />
                          Embed
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                          <input 
                            type="checkbox" 
                            checked={link.show_full_embed} 
                            onChange={(e) => updateSocialMediaLink(index, 'show_full_embed', e.target.checked)} 
                            disabled={isSubmitting}
                            aria-label="Show full embed"
                          />
                          Full
                        </label>
                        <input
                          type="number"
                          value={link.display_order}
                          onChange={(e) => updateSocialMediaLink(index, 'display_order', parseInt(e.target.value) || 2)}
                          min="2"
                          placeholder="Order"
                          style={{ 
                            padding: '0.4rem', 
                            border: '1px solid var(--border-primary)', 
                            borderRadius: '4px', 
                            fontSize: '0.8rem', 
                            background: 'var(--bg-card)', 
                            color: 'var(--text-primary)',
                            width: '100%'
                          }}
                          disabled={isSubmitting}
                          aria-label="Display order"
                        />
                        <input
                          type="text"
                          value={link.caption || ''}
                          onChange={(e) => updateSocialMediaLink(index, 'caption', e.target.value)}
                          placeholder="Caption (optional)..."
                          style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border-primary)', borderRadius: '4px', fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                          disabled={isSubmitting}
                          aria-label="Caption"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pagination" style={{ borderTop: '2px solid var(--border-primary)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <button 
            type="button" 
            onClick={onBack} 
            disabled={isSubmitting} 
            className="page-btn"
            aria-label="Go back to previous stage"
          >
            ← Back
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className="page-btn"
              style={{ minWidth: '150px' }}
              aria-label="Save as draft"
            >
              {isSubmitting ? '💾 Saving...' : '💾 Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('publish')}
              disabled={isSubmitting}
              className="new-post-btn"
              style={{ minWidth: '180px' }}
              aria-label={publishButtonText}
            >
              {isSubmitting ? publishingText : `✨ ${publishButtonText}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStage3;