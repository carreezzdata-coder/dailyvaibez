'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/components/includes/Session';
import { usePermissions } from './adminhooks/usePermissions';
import { useRouter } from 'next/navigation';

interface QuoteFormData {
  quote_text: string;
  sayer_name: string;
  sayer_title: string;
  editor_pick: boolean;
  sayer_image: File | null;
}

const CreateQuote: React.FC = () => {
  const { user, csrfToken, isAuthenticated, isLoading: sessionLoading } = useSession();
  const { canCreateQuotes, canPublish, isLoading: permissionsLoading } = usePermissions();
  const router = useRouter();
  
  const [formData, setFormData] = useState<QuoteFormData>({
    quote_text: '',
    sayer_name: '',
    sayer_title: '',
    editor_pick: false,
    sayer_image: null
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            processImageFile(blob);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, editor_pick: e.target.checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, sayer_image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setAlert({ type: 'error', message: 'Please select a valid image file' });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setFormData(prev => ({ ...prev, sayer_image: null }));
    setImagePreview(null);
  };

  const navigateToManageQuotes = () => {
    router.push('/admin/quotes/manage');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedQuoteText = formData.quote_text.trim();
    const trimmedSayerName = formData.sayer_name.trim();
    
    if (!trimmedQuoteText) {
      setAlert({ type: 'error', message: 'Quote text is required' });
      return;
    }
    
    if (!trimmedSayerName) {
      setAlert({ type: 'error', message: 'Sayer name is required' });
      return;
    }

    if (!csrfToken) {
      setAlert({ type: 'error', message: 'Session error. Please refresh the page.' });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const submitData = new FormData();
      submitData.append('quote_text', trimmedQuoteText);
      submitData.append('sayer_name', trimmedSayerName);
      submitData.append('sayer_title', formData.sayer_title.trim());
      submitData.append('editor_pick', formData.editor_pick.toString());
      
      if (formData.sayer_image) {
        submitData.append('sayer_image', formData.sayer_image);
      }

      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          success: false, 
          message: 'Server error occurred' 
        }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAlert({ 
          type: 'success', 
          message: canPublish
            ? 'Quote published successfully! Redirecting...' 
            : 'Quote submitted for approval! Redirecting...'
        });
        
        setFormData({
          quote_text: '',
          sayer_name: '',
          sayer_title: '',
          editor_pick: false,
          sayer_image: null
        });
        setImagePreview(null);
        
        setTimeout(() => {
          navigateToManageQuotes();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to create quote');
      }
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Network error occurred' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionLoading || permissionsLoading) {
    return (
      <div className="cq-loading">
        <div className="cq-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="cq-error">
        <div className="cq-error-icon">🔒</div>
        <h2>Authentication Required</h2>
        <p>Please log in to create quotes</p>
        <button className="cq-btn cq-btn-primary" onClick={() => router.push('/admin/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  if (!canCreateQuotes) {
    return (
      <div className="cq-error">
        <div className="cq-error-icon">🚫</div>
        <h2>Access Denied</h2>
        <p className="cq-permission">
          You don't have permission to create quotes. Only Super Admins, Admins, Editors, and Moderators can create quotes.
        </p>
        <button className="cq-btn cq-btn-secondary" onClick={() => router.push('/admin/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'super_admin': '#dc2626',
      'admin': '#2563eb',
      'editor': '#059669',
      'moderator': '#ea580c'
    };
    return colors[role] || '#6b7280';
  };

  return (
    <div className="cq-wrapper">
      <div className="cq-header">
        <div className="cq-header-left">
          <h1 className="cq-title">Create New Quote</h1>
          <p className="cq-subtitle">
            Add inspirational quotes from notable figures to display on the platform
          </p>
        </div>
        
        <div className="cq-header-right">
          <div className="cq-user-badge">
            <span className="cq-user-name">{user.first_name} {user.last_name}</span>
            <span 
              className="cq-role-badge" 
              style={{ backgroundColor: getRoleBadgeColor(user.role) }}
            >
              {user.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <button 
            className="cq-btn cq-btn-secondary" 
            onClick={navigateToManageQuotes}
            type="button"
          >
            📋 Manage Quotes
          </button>
        </div>
      </div>

      {alert && (
        <div className={`cq-alert cq-alert-${alert.type}`}>
          <span className="cq-alert-icon">{alert.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="cq-alert-message">{alert.message}</span>
          <button className="cq-alert-close" onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="cq-form">
        <div className="cq-field">
          <label className="cq-label" htmlFor="quote_text">
            Quote Text <span className="cq-required">*</span>
          </label>
          <textarea
            id="quote_text"
            name="quote_text"
            className="cq-textarea"
            placeholder="Enter the quote text..."
            value={formData.quote_text}
            onChange={handleInputChange}
            required
            rows={5}
            disabled={isSubmitting}
          />
          <p className="cq-hint">The main quote text that will be displayed</p>
        </div>

        <div className="cq-field">
          <label className="cq-label" htmlFor="sayer_name">
            Sayer Name <span className="cq-required">*</span>
          </label>
          <input
            type="text"
            id="sayer_name"
            name="sayer_name"
            className="cq-input"
            placeholder="e.g., Albert Einstein"
            value={formData.sayer_name}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
          <p className="cq-hint">Name of the person who said this quote</p>
        </div>

        <div className="cq-field">
          <label className="cq-label" htmlFor="sayer_title">
            Sayer Title
          </label>
          <input
            type="text"
            id="sayer_title"
            name="sayer_title"
            className="cq-input"
            placeholder="e.g., Theoretical Physicist"
            value={formData.sayer_title}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          <p className="cq-hint">Optional title or description of the person</p>
        </div>

        {canPublish && (
          <div className="cq-field">
            <label className="cq-checkbox-label">
              <input
                type="checkbox"
                name="editor_pick"
                className="cq-checkbox"
                checked={formData.editor_pick}
                onChange={handleCheckboxChange}
                disabled={isSubmitting}
              />
              <span className="cq-checkbox-text">⭐ Mark as Editor's Pick</span>
            </label>
          </div>
        )}

        <div className="cq-field">
          <label className="cq-label">Sayer Image</label>
          <div className="cq-upload-area">
            {!imagePreview ? (
              <label className="cq-upload-label">
                <div 
                  className={`cq-upload-box ${dragOver ? 'cq-drag-over' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="cq-upload-icon">📷</div>
                  <p className="cq-upload-text">Click to upload or drag and drop</p>
                  <p className="cq-upload-hint">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input
                  type="file"
                  name="sayer_image"
                  accept="image/*"
                  className="cq-file-input"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </label>
            ) : (
              <div className="cq-preview-container">
                <div className="cq-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
                <div className="cq-preview-actions">
                  <button 
                    type="button" 
                    className="cq-btn cq-btn-danger"
                    onClick={removeImage}
                    disabled={isSubmitting}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="cq-actions">
          <button 
            type="button" 
            className="cq-btn cq-btn-cancel"
            onClick={navigateToManageQuotes}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="cq-btn cq-btn-submit"
            disabled={isSubmitting || !formData.quote_text.trim() || !formData.sayer_name.trim()}
          >
            {isSubmitting ? 'Creating...' : canPublish ? '✨ Publish Quote' : '📤 Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuote;