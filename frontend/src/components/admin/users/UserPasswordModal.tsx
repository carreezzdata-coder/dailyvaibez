'use client';

import React, { useState } from 'react';

interface AdminUser {
  admin_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'editor' | 'moderator';
  posts_count: number;
  status: string;
  created_at: string;
  last_login?: string;
}

interface ResetPasswordFormData {
  new_password: string;
  confirm_password: string;
}

interface UserPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: AdminUser | null;
  csrfToken: string | null;
}

export const UserPasswordModal: React.FC<UserPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  csrfToken
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState<ResetPasswordFormData>({
    new_password: '',
    confirm_password: ''
  });

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain lowercase letters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain uppercase letters';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain numbers';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !user) return;

    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(form.new_password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users/password?action=reset', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          user_id: user.admin_id,
          new_password: form.new_password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForm({ new_password: '', confirm_password: '' });
        setError('');
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error resetting password: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    setForm({ new_password: '', confirm_password: '' });
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reset Password for {user.first_name} {user.last_name}</h3>
          <button 
            className="close-btn"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close modal">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>New Password * (6+ chars, uppercase, lowercase, numbers)</label>
              <input
                type="password"
                value={form.new_password}
                onChange={(e) => setForm({...form, new_password: e.target.value})}
                required
                minLength={6}
                disabled={isSubmitting}
                placeholder="Example: NewPass123"
              />
            </div>
            
            <div className="form-field">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={(e) => setForm({...form, confirm_password: e.target.value})}
                required
                minLength={6}
                disabled={isSubmitting}
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {error && (
            <div className="warning-message">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Cancel">
              Cancel
            </button>
            <button 
              type="submit"
              className="confirm-btn"
              disabled={isSubmitting}
              aria-label="Reset password">
              {isSubmitting ? 'Resetting...' : '🔑 Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};