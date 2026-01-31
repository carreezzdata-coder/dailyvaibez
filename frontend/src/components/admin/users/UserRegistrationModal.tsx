'use client';

import React, { useState } from 'react';

interface CreateUserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableRoles: string[];
  csrfToken: string | null;
}

export const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableRoles,
  csrfToken
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState<CreateUserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'moderator'
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
    if (isSubmitting) return;

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForm({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          password: '',
          role: 'moderator'
        });
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error creating user: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    setForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      role: 'moderator'
    });
    onClose();
  };

  const formatRoleDisplay = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Admin User</h3>
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
              <label>First Name *</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({...form, first_name: e.target.value})}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-field">
              <label>Last Name *</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({...form, last_name: e.target.value})}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label>Password * (6+ chars, uppercase, lowercase, numbers)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                required
                minLength={6}
                disabled={isSubmitting}
                placeholder="Example: Pass123"
              />
            </div>

            <div className="form-field">
              <label>Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({...form, role: e.target.value})}
                required
                disabled={isSubmitting}
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {formatRoleDisplay(role)}
                  </option>
                ))}
              </select>
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
              aria-label="Create user">
              {isSubmitting ? 'Creating...' : '➕ Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};