'use client';

import React, { useState } from 'react';
import { useSession } from '@/components/includes/Session';
import { useRouter } from 'next/navigation';

interface QuoteFormData {
  quote_text: string;
  sayer_name: string;
  sayer_title: string;
  editor_pick: boolean;
  sayer_image: File | null;
}

const CreateQuotes: React.FC = () => {
  const { user, csrfToken, isAuthenticated, isLoading: sessionLoading } = useSession();
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

  const canCreateQuotes = user?.role && ['super_admin', 'admin', 'editor', 'moderator'].includes(user.role);
  const canAutoPublish = user?.role && ['super_admin', 'admin', 'editor'].includes(user.role);

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
    setFormData(prev => ({ ...prev, sayer_image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quote_text.trim()) {
      setAlert({ type: 'error', message: 'Quote text is required' });
      return;
    }
    
    if (!formData.sayer_name.trim()) {
      setAlert({ type: 'error', message: 'Sayer name is required' });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const submitData = new FormData();
      submitData.append('quote_text', formData.quote_text.trim());
      submitData.append('sayer_name', formData.sayer_name.trim());
      submitData.append('sayer_title', formData.sayer_title.trim());
      submitData.append('editor_pick', formData.editor_pick.toString());
      
      if (formData.sayer_image) {
        submitData.append('sayer_image', formData.sayer_image);
      }

      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || ''
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ 
          type: 'success', 
          message: canAutoPublish 
            ? 'Quote published successfully!' 
            : 'Quote submitted for approval'
        });
        
        setFormData({
          quote_text: '',
          sayer_name: '',
          sayer_title: '',
          editor_pick: false,
          sayer_image: null
        });
        setImagePreview(null);
        
        setTimeout(() => router.push('/admin/quotes/manage'), 2000);
      } else {
        setAlert({ 
          type: 'error', 
          message: data.message || 'Failed to create quote' 
        });
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

  if (sessionLoading) {
    return (
      <div className="quotes-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="error-container">
        <div className="error-icon">🔒</div>
        <h2>Authentication Required</h2>
        <p>Please log in to create quotes</p>
        <button className="btn btn-primary" onClick={() => router.push('/admin/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  if (!canCreateQuotes) {
    return (
      <div className="error-container">
        <div className="error-icon">🔒</div>
        <h2>Access Denied</h2>
        <p className="permission-info">
          You don't have permission to create quotes. Only Super Admins, Admins, Editors, and Moderators can create quotes.
        </p>
        <button className="btn btn-secondary" onClick={() => router.push('/admin/dashboard')}>
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
    <div className="create-quote-container">
      <div className="create-quote-header">
        <div className="header-left">
          <h1 className="page-title">Create New Quote</h1>
          <p className="page-description">
            Add inspirational quotes from notable figures to display on the platform
          </p>
        </div>
        
        <div className="header-right">
          <div className="user-badge">
            <span className="user-name">{user.name}</span>
            <span 
              className="role-badge" 
              style={{ backgroundColor: getRoleBadgeColor(user.role) }}
            >
              {user.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => router.push('/admin/quotes/manage')}
          >
            📋 Manage Quotes
          </button>
        </div>
      </div>

      {alert && (
        <div className={`quote-alert quote-alert-${alert.type}`}>
          <span className="alert-icon">{alert.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="alert-message">{alert.message}</span>
          <button className="alert-close" onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-group">
          <label className="form-label">
            Quote Text <span className="required">*</span>
          </label>
          <textarea
            name="quote_text"
            className="form-textarea"
            placeholder="Enter the quote text..."
            value={formData.quote_text}
            onChange={handleInputChange}
            required
            rows={5}
          />
          <p className="form-hint">The main quote text that will be displayed</p>
        </div>

        <div className="form-group">
          <label className="form-label">
            Sayer Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="sayer_name"
            className="form-input"
            placeholder="e.g., Albert Einstein"
            value={formData.sayer_name}
            onChange={handleInputChange}
            required
          />
          <p className="form-hint">Name of the person who said this quote</p>
        </div>

        <div className="form-group">
          <label className="form-label">Sayer Title</label>
          <input
            type="text"
            name="sayer_title"
            className="form-input"
            placeholder="e.g., Theoretical Physicist"
            value={formData.sayer_title}
            onChange={handleInputChange}
          />
          <p className="form-hint">Optional title or description of the person</p>
        </div>

        {canAutoPublish && (
          <div className="form-group">
            <label className="editor-pick-label">
              <input
                type="checkbox"
                name="editor_pick"
                className="editor-pick-checkbox"
                checked={formData.editor_pick}
                onChange={handleCheckboxChange}
              />
              <span className="editor-pick-text">⭐ Mark as Editor's Pick</span>
            </label>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Sayer Image</label>
          <div className="image-upload-area">
            {!imagePreview ? (
              <label className="image-upload-label">
                <div 
                  className={`upload-placeholder ${dragOver ? 'drag-over' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="upload-icon">📷</div>
                  <p className="upload-text">Click to upload or drag and drop</p>
                  <p className="upload-hint">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="image-input-hidden"
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
                <div className="image-actions">
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => router.push('/admin/quotes/manage')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : canAutoPublish ? '✨ Publish Quote' : '📤 Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuotes;