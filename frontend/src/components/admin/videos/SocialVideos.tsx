'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/includes/Session';

interface VideoFormData {
  title: string;
  description: string;
  video_url: string;
  video_type: 'live' | 'recorded' | 'premiere' | 'short' | 'reel' | 'story';
  is_live: boolean;
  platform: string;
}

const addWatermark = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      const maxSize = 800;
      let width = img.width;
      let height = img.height;
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        const watermarkSize = Math.min(width, height) * 0.12;
        ctx.font = `bold ${watermarkSize}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText('DV', 0, 0);
        ctx.restore();
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
          } else {
            reject(new Error('Failed to create watermarked image'));
          }
        }, file.type, 0.92);
      } else {
        reject(new Error('Canvas context not available'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

const SocialVideos: React.FC = () => {
  const { user, csrfToken, isAuthenticated, isLoading: sessionLoading } = useSession();
  
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    video_url: '',
    video_type: 'recorded',
    is_live: false,
    platform: 'youtube',
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [charCount, setCharCount] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteZoneRef = useRef<HTMLDivElement>(null);
  const maxChars = 2000;

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      if (name === 'description') {
        setCharCount(value.length);
        if (value.length > maxChars) return;
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addImageFile = useCallback(async (file: File, isPasted: boolean = false) => {
    if (thumbnailFile) {
      setMessage({ type: 'error', text: 'Only one thumbnail allowed. Remove existing thumbnail first.' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Only image files are allowed' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    try {
      const watermarkedFile = await addWatermark(file);
      const preview = URL.createObjectURL(watermarkedFile);
      
      setThumbnailFile(watermarkedFile);
      setThumbnailPreview(preview);

      if (isPasted) {
        setMessage({ type: 'success', text: '✓ Thumbnail pasted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process image' });
    }
  }, [thumbnailFile]);

  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find(item => item.type.startsWith('image/'));
      if (!imageItem) return;

      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        await addImageFile(file, true);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, [addImageFile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await addImageFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      await addImageFile(file);
    }
    if (pasteZoneRef.current) {
      pasteZoneRef.current.classList.remove('dv-drag-over');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (pasteZoneRef.current) {
      pasteZoneRef.current.classList.add('dv-drag-over');
    }
  };

  const handleDragLeave = () => {
    if (pasteZoneRef.current) {
      pasteZoneRef.current.classList.remove('dv-drag-over');
    }
  };

  const removeImage = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      video_type: 'recorded',
      is_live: false,
      platform: 'youtube',
    });
    removeImage();
    setCharCount(0);
    setMessage(null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.video_url.trim()) {
      setMessage({ type: 'error', text: 'Title and video URL are required' });
      return;
    }

    if (!user) {
      setMessage({ type: 'error', text: 'User authentication required' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('video_url', formData.video_url.trim());
      submitData.append('video_type', formData.video_type);
      submitData.append('is_live', formData.is_live.toString());
      submitData.append('platform', formData.platform);
      submitData.append('admin_id', user.admin_id.toString());

      if (thumbnailFile) {
        submitData.append('thumbnail', thumbnailFile);
      }

      const response = await fetch('/api/admin/socialvideos', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || '',
        },
        body: submitData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Video created successfully!' });
        resetForm();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create video' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="dv-loading">
        <div className="dv-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="dv-error-container">
        <div className="dv-error-icon">🔒</div>
        <h2>Authentication Required</h2>
        <p>Please log in to create videos</p>
        <Link href="/admin/login" className="dv-btn dv-btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  const currentRole = {
    display: user.role.replace('_', ' ').toUpperCase(),
    color: user.role === 'super_admin' ? '#dc2626' : '#2563eb',
    icon: user.role === 'super_admin' ? '🔥' : '⚡'
  };

  return (
    <>
      {message && (
        <div className={`dv-alert dv-alert-${message.type}`}>
          <span className="dv-alert-icon">{message.type === 'success' ? '✅' : '❌'}</span>
          <span className="dv-alert-message">{message.text}</span>
          <button className="dv-alert-close" onClick={() => setMessage(null)}>
            ×
          </button>
        </div>
      )}

      <div className="dv-container">
        <div className="dv-header">
          <div className="dv-header-left">
            <h1 className="dv-page-title">📺 Create Social Video</h1>
            <p className="dv-page-description">
              Add videos from YouTube, Facebook, Instagram, TikTok, and more
            </p>
          </div>
          <div className="dv-header-right">
            <Link 
              href="/admin/videos/manage"
              className="dv-toggle-link"
            >
              📋 Manage Videos →
            </Link>
            <div className="dv-user-badge">
              <span className="dv-user-name">{user.first_name} {user.last_name}</span>
              <span 
                className="dv-role-badge" 
                style={{ backgroundColor: currentRole.color }}
              >
                {currentRole.icon} {currentRole.display}
              </span>
            </div>
          </div>
        </div>

        <div className="dv-form-section">
          <div className="dv-form-group">
            <label htmlFor="title" className="dv-form-label">
              Title <span className="dv-required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter video title..."
              className="dv-form-input"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="dv-form-group">
            <label htmlFor="description" className="dv-form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              placeholder="Enter video description (max 400 words / 2000 characters)..."
              className="dv-form-textarea"
              disabled={isSubmitting}
            />
            <p className="dv-form-hint">
              {charCount} / {maxChars} characters
            </p>
          </div>
          
          <div className="dv-form-group">
            <label htmlFor="video_url" className="dv-form-label">
              Video URL <span className="dv-required">*</span>
            </label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              placeholder="https://youtube.com/watch?v=..."
              className="dv-form-input"
              disabled={isSubmitting}
            />
            <p className="dv-form-hint">
              Supported: YouTube, Facebook, Instagram, Twitter/X, TikTok, Twitch
            </p>
          </div>
          
          <div className="dv-form-grid">
            <div className="dv-form-group">
              <label htmlFor="platform" className="dv-form-label">
                Platform
              </label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="dv-form-select"
                disabled={isSubmitting}
              >
                <option value="youtube">YouTube</option>
                <option value="youtube_live">YouTube Live</option>
                <option value="facebook">Facebook</option>
                <option value="facebook_live">Facebook Live</option>
                <option value="instagram">Instagram</option>
                <option value="instagram_live">Instagram Live</option>
                <option value="twitter">Twitter/X</option>
                <option value="tiktok">TikTok</option>
                <option value="twitch">Twitch</option>
              </select>
            </div>
            
            <div className="dv-form-group">
              <label htmlFor="video_type" className="dv-form-label">
                Video Type
              </label>
              <select
                id="video_type"
                name="video_type"
                value={formData.video_type}
                onChange={handleInputChange}
                className="dv-form-select"
                disabled={isSubmitting}
              >
                <option value="recorded">Recorded</option>
                <option value="live">Live</option>
                <option value="premiere">Premiere</option>
                <option value="short">Short</option>
                <option value="reel">Reel</option>
                <option value="story">Story</option>
              </select>
            </div>
          </div>
          
          <div className="dv-form-group">
            <label className="dv-checkbox-label">
              <input
                type="checkbox"
                name="is_live"
                checked={formData.is_live}
                onChange={handleInputChange}
                className="dv-form-checkbox"
                disabled={isSubmitting}
              />
              <span>🔴 Mark as Live Broadcasting</span>
            </label>
          </div>
          
          <div className="dv-form-group">
            <label className="dv-form-label">
              Thumbnail (Optional)
            </label>
            <p className="dv-form-hint">Paste with Ctrl+V anywhere on this page!</p>
            
            {!thumbnailPreview ? (
              <div className="dv-image-upload-area">
                <label className="dv-image-upload-label">
                  <div 
                    className="dv-upload-placeholder"
                    ref={pasteZoneRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    tabIndex={0}
                    onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  >
                    <div className="dv-upload-icon">🖼️</div>
                    <p className="dv-upload-text">
                      Click, drag & drop, or paste image
                    </p>
                    <p className="dv-upload-hint">
                      Press Ctrl+V anywhere • Right-click and paste<br />
                      Up to 5MB • JPG, PNG, WebP • 16:9 recommended
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="dv-image-input-hidden"
                      disabled={isSubmitting}
                    />
                  </div>
                </label>
              </div>
            ) : (
              <div className="dv-image-preview-container">
                <div className="dv-image-preview">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail Preview"
                  />
                </div>
                <div className="dv-image-actions">
                  <button 
                    type="button" 
                    onClick={removeImage}
                    className="dv-remove-image-btn"
                    disabled={isSubmitting}
                  >
                    🗑️ Remove Thumbnail
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="dv-form-actions">
            <button 
              type="button"
              className="dv-cancel-btn"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              🔄 Reset Form
            </button>
            <button 
              type="button"
              className="dv-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.video_url}
            >
              {isSubmitting ? (
                <>
                  <span className="dv-spinner"></span>
                  <span>Creating Video...</span>
                </>
              ) : (
                <>💾 Create Video</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialVideos;