'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@/components/includes/Session';
import { usePermissions } from './adminhooks/usePermissions';
import { useRouter } from 'next/navigation';

interface Quote {
  quote_id: number;
  quote_text: string;
  sayer_name: string;
  sayer_title: string;
  image_url: string | null;
  active: boolean;
  editor_pick: boolean;
  created_at: string;
  updated_at: string;
}

const ManageQuotes: React.FC = () => {
  const { user, csrfToken, isAuthenticated, isLoading: sessionLoading } = useSession();
  const { canCreateQuotes, canPublish, isLoading: permissionsLoading } = usePermissions();
  const router = useRouter();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterEditorPick, setFilterEditorPick] = useState<'all' | 'picks' | 'regular'>('all');
  
  const [deleteModal, setDeleteModal] = useState<{ show: boolean, quote: Quote | null }>({ show: false, quote: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fetchControllerRef = useRef<AbortController | null>(null);

  const navigateToCreateQuote = () => {
    router.push('/admin/quotes/create');
  };

  useEffect(() => {
    if (!sessionLoading && !permissionsLoading && isAuthenticated && canCreateQuotes) {
      fetchQuotes();
    } else if (!sessionLoading && !permissionsLoading && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [sessionLoading, permissionsLoading, isAuthenticated, canCreateQuotes]);

  const fetchQuotes = async () => {
    setIsLoading(true);
    setError('');

    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    try {
      const response = await fetch('/api/admin/quotes', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch quotes');
      }

      const data = await response.json();
      setQuotes(data.quotes || []);
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        setError(error instanceof Error ? error.message : 'Network error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuoteStatus = async (quoteId: number, currentStatus: boolean) => {
    if (!canPublish) {
      setAlert({ type: 'error', message: 'You do not have permission to change quote status' });
      return;
    }

    try {
      const response = await fetch(`/api/admin/quotes?quote_id=${quoteId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({ active: !currentStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQuotes(prev => prev.map(q => 
          q.quote_id === quoteId ? { ...q, active: !currentStatus } : q
        ));
        setAlert({ 
          type: 'success', 
          message: `Quote ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
        });
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to update quote status' });
      }
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Network error occurred' 
      });
    }
  };

  const toggleEditorPick = async (quoteId: number, currentValue: boolean) => {
    if (!canPublish) {
      setAlert({ type: 'error', message: 'You do not have permission to set Editor Picks' });
      return;
    }

    try {
      const response = await fetch(`/api/admin/quotes?quote_id=${quoteId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({ editor_pick: !currentValue })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQuotes(prev => prev.map(q => 
          q.quote_id === quoteId ? { ...q, editor_pick: !currentValue } : q
        ));
        setAlert({ 
          type: 'success', 
          message: `Editor pick ${!currentValue ? 'added' : 'removed'}` 
        });
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to update editor pick' });
      }
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Network error occurred' 
      });
    }
  };

  const openDeleteModal = (quote: Quote) => {
    setDeleteModal({ show: true, quote });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, quote: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.quote) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/quotes?quote_id=${deleteModal.quote.quote_id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQuotes(prev => prev.filter(q => q.quote_id !== deleteModal.quote?.quote_id));
        setAlert({ type: 'success', message: 'Quote deleted successfully' });
        closeDeleteModal();
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to delete quote' });
      }
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Network error occurred' 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchTerm === '' ||
      quote.quote_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.sayer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.sayer_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && quote.active) ||
      (filterStatus === 'inactive' && !quote.active);
    
    const matchesEditorPick = filterEditorPick === 'all' ||
      (filterEditorPick === 'picks' && quote.editor_pick) ||
      (filterEditorPick === 'regular' && !quote.editor_pick);
    
    return matchesSearch && matchesStatus && matchesEditorPick;
  });

  const stats = {
    total: quotes.length,
    active: quotes.filter(q => q.active).length,
    inactive: quotes.filter(q => !q.active).length,
    editorPicks: quotes.filter(q => q.editor_pick).length
  };

  if (sessionLoading || permissionsLoading || (isLoading && quotes.length === 0)) {
    return (
      <div className="quotes-loading">
        <div className="loading-spinner"></div>
        <p>Loading quotes...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="error-container">
        <div className="error-icon">🔒</div>
        <h2>Authentication Required</h2>
        <p>Please log in to manage quotes</p>
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
          You don't have permission to manage quotes.
        </p>
        <button className="btn btn-secondary" onClick={() => router.push('/admin/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="manage-quotes-container">
      <div className="quotes-header">
        <div className="header-left">
          <h1 className="quotes-page-title">Manage Quotes</h1>
          <p className="quotes-page-description">
            View, edit, and manage all quotes on the platform
          </p>
          <div className="quotes-stats">
            <div className="stat-badge">Total: {stats.total}</div>
            <div className="stat-badge">Active: {stats.active}</div>
            <div className="stat-badge">Inactive: {stats.inactive}</div>
            <div className="stat-badge">⭐ Picks: {stats.editorPicks}</div>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="new-quote-btn"
            onClick={navigateToCreateQuote}
            type="button"
          >
            ➕ Create New Quote
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

      {error && (
        <div className="quote-alert quote-alert-error">
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">{error}</span>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="quotes-filters">
        <div className="filter-row">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="filter-select"
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          
          <select 
            className="filter-select"
            value={filterEditorPick} 
            onChange={(e) => setFilterEditorPick(e.target.value as 'all' | 'picks' | 'regular')}
          >
            <option value="all">All Quotes</option>
            <option value="picks">Editor Picks</option>
            <option value="regular">Regular</option>
          </select>
        </div>
      </div>

      {filteredQuotes.length === 0 ? (
        <div className="quotes-empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Quotes Found</h3>
          <p>
            {searchTerm || filterStatus !== 'all' || filterEditorPick !== 'all'
              ? 'No quotes match your filters. Try adjusting your search criteria.'
              : 'Get started by creating your first quote!'}
          </p>
          {quotes.length === 0 && (
            <button 
              className="empty-action-btn"
              onClick={navigateToCreateQuote}
              type="button"
            >
              Create First Quote
            </button>
          )}
        </div>
      ) : (
        <div className="quotes-grid">
          {filteredQuotes.map(quote => (
            <div 
              key={quote.quote_id} 
              className={`quote-card ${!quote.active ? 'inactive' : ''}`}
            >
              {quote.image_url ? (
                <div className="quote-image">
                  {!quote.active && <div className="inactive-overlay">Inactive</div>}
                  <img src={quote.image_url} alt={quote.sayer_name} />
                </div>
              ) : (
                <div className="quote-image-placeholder">
                  <div className="placeholder-icon">💬</div>
                </div>
              )}
              
              <div className="quote-content">
                {quote.editor_pick && (
                  <div style={{ 
                    fontSize: '1.2rem', 
                    marginBottom: '0.5rem',
                    color: '#fbbf24'
                  }}>
                    ⭐ Editor's Pick
                  </div>
                )}
                
                <p className="quote-text">"{quote.quote_text}"</p>
                
                <div className="quote-attribution">
                  <span className="sayer-name">{quote.sayer_name}</span>
                  {quote.sayer_title && (
                    <span className="sayer-title">{quote.sayer_title}</span>
                  )}
                </div>
                
                <div className="quote-meta">
                  <span className={`status-badge ${quote.active ? 'active' : 'inactive'}`}>
                    {quote.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="date-badge">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="quote-actions">
                {canPublish && (
                  <>
                    <button 
                      className={`action-btn toggle-btn ${quote.active ? 'deactivate' : 'activate'}`}
                      onClick={() => toggleQuoteStatus(quote.quote_id, quote.active)}
                      title={quote.active ? 'Deactivate' : 'Activate'}
                      type="button"
                    >
                      {quote.active ? '👁️ Deactivate' : '✅ Activate'}
                    </button>
                    
                    <button 
                      className={`action-btn toggle-btn ${quote.editor_pick ? 'deactivate' : 'activate'}`}
                      onClick={() => toggleEditorPick(quote.quote_id, quote.editor_pick)}
                      title={quote.editor_pick ? 'Remove Editor Pick' : 'Set as Editor Pick'}
                      type="button"
                    >
                      {quote.editor_pick ? '⭐ Remove Pick' : '⭐ Set Pick'}
                    </button>
                  </>
                )}
                
                <button 
                  className="action-btn delete-btn"
                  onClick={() => openDeleteModal(quote)}
                  title="Delete"
                  type="button"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteModal.show && deleteModal.quote && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Quote</h3>
              <button className="close-btn" onClick={closeDeleteModal} type="button">×</button>
            </div>
            
            <div className="modal-body">
              <div className="quote-preview">
                <p className="preview-text">"{deleteModal.quote.quote_text}"</p>
                <p className="preview-attribution">— {deleteModal.quote.sayer_name}</p>
              </div>
              
              <p className="warning-text">Are you sure you want to delete this quote?</p>
              <div className="warning-message">
                ⚠️ This action cannot be undone. The quote will be permanently removed from the database.
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                type="button"
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={isDeleting}
                type="button"
              >
                {isDeleting ? 'Deleting...' : 'Delete Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuotes;