'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from '@/components/includes/Session';
import { usePermissions } from '@/components/admin/adminhooks/usePermissions';
import { UserRegistrationModal } from './users/UserRegistrationModal';
import { UserPasswordModal } from './users/UserPasswordModal';

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

interface EditUserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
}

const Users: React.FC = () => {
  const { user, isAuthenticated, isLoading: sessionLoading, csrfToken } = useSession();
  const { 
    canViewUsers, 
    canCreateUsers, 
    canEditUsers, 
    canDeleteUsers, 
    canResetPasswords,
    canManageRoles,
    assignableRoles,
    isLoading: permissionsLoading 
  } = usePermissions();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editForm, setEditForm] = useState<EditUserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'moderator'
  });

  useEffect(() => {
    if (!sessionLoading && !permissionsLoading && isAuthenticated && canViewUsers) {
      fetchUsers();
    }
  }, [sessionLoading, permissionsLoading, isAuthenticated, canViewUsers]);

  const fetchUsers = async () => {
    if (sessionLoading || permissionsLoading) return;
    if (!isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setError(errorData.message || `Failed to fetch users: ${response.status}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Network error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !editingUser) return;

    if (!canEditUsers) {
      setError('You do not have permission to edit users');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users?id=${editingUser.admin_id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowEditModal(false);
        setEditingUser(null);
        await fetchUsers();
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error updating user: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!canDeleteUsers) {
      setError('You do not have permission to delete users');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchUsers();
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error deleting user: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (userToEdit: AdminUser) => {
    if (!canEditUsers) {
      setError('You do not have permission to edit users');
      return;
    }

    if (user?.admin_id === userToEdit.admin_id) {
      setError('You cannot edit your own account from here');
      return;
    }

    setEditingUser(userToEdit);
    setEditForm({
      first_name: userToEdit.first_name,
      last_name: userToEdit.last_name,
      email: userToEdit.email,
      phone: userToEdit.phone || '',
      role: userToEdit.role
    });
    setShowEditModal(true);
    setError('');
  };

  const openPasswordModal = (userToReset: AdminUser) => {
    if (!canResetPasswords) {
      setError('You do not have permission to reset passwords');
      return;
    }

    if (user?.admin_id === userToReset.admin_id) {
      setError('Use profile settings to change your own password');
      return;
    }

    setResetPasswordUser(userToReset);
    setShowPasswordModal(true);
    setError('');
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setError('');
    setEditingUser(null);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin': return 'role-super-admin';
      case 'admin': return 'role-admin';
      case 'editor': return 'role-editor';
      case 'moderator': return 'role-moderator';
      default: return 'role-editor';
    }
  };

  const formatRoleDisplay = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleViewUserArticles = (userId: number) => {
    window.open(`/admin/posts?author=${userId}`, '_blank');
  };

  const canEditThisUser = (targetUser: AdminUser): boolean => {
    if (!canEditUsers) return false;
    if (user?.admin_id === targetUser.admin_id) return false;
    return true;
  };

  const canDeleteThisUser = (targetUser: AdminUser): boolean => {
    if (!canDeleteUsers) return false;
    if (user?.admin_id === targetUser.admin_id) return false;
    return true;
  };

  const canResetThisPassword = (targetUser: AdminUser): boolean => {
    if (!canResetPasswords) return false;
    if (user?.admin_id === targetUser.admin_id) return false;
    return true;
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      const matchesSearch = searchTerm === '' || 
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, filterRole, searchTerm]);

  if (sessionLoading || permissionsLoading) {
    return (
      <div className="retrieve-loading">
        <div className="loading-spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="retrieve-posts">
        <div className="error-message" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Authentication Required</h3>
          <p>Please log in to access user management.</p>
        </div>
      </div>
    );
  }

  if (!canViewUsers) {
    return (
      <div className="retrieve-posts">
        <div className="error-message" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Access Denied</h3>
          <p>You do not have permission to view users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="retrieve-posts">
      <div className="retrieve-header">
        <div className="header-left">
          <h1>Admin Users</h1>
          <div className="quick-stats">
            <div className="stat-item">Total: {users.length}</div>
            <div className="stat-item">Active: {users.filter(u => u.status === 'active').length}</div>
            <div className="stat-item">Your Role: {formatRoleDisplay(user?.role || '')}</div>
          </div>
        </div>
        
        <div className="header-actions">
          {canCreateUsers && (
            <button 
              className="new-post-btn" 
              onClick={() => setShowCreateModal(true)}
              disabled={isSubmitting}
              aria-label="Create new user">
              ➕ Create User
            </button>
          )}
          <button 
            className="refresh-btn" 
            onClick={fetchUsers}
            disabled={isLoading || isSubmitting}
            aria-label="Refresh user list">
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      <div className="roles-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="role-filter">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => { setError(''); fetchUsers(); }} aria-label="Retry operation">Retry</button>
        </div>
      )}

      {isLoading && (
        <div className="retrieve-loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      )}

      {!isLoading && (
        <div className="posts-table">
          <div className="table-header">
            <div className="column-content">User Details</div>
            <div className="column-stats">Role & Activity</div>
            <div className="column-actions">Actions</div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No users found</h3>
              <p>No users match your current filters.</p>
            </div>
          ) : (
            filteredUsers.map(item => (
              <div key={item.admin_id} className="post-row">
                <div className="column-content">
                  <div className="post-image">
                    <div className="image-placeholder">
                      {item.first_name.charAt(0).toUpperCase()}
                      {item.last_name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="post-details">
                    <h3 className="post-title">
                      {item.first_name} {item.last_name}
                      {user?.admin_id === item.admin_id && (
                        <span className="current-user-badge">You</span>
                      )}
                    </h3>
                    <p className="post-excerpt">{item.email}</p>
                    
                    <div className="post-meta">
                      <div className="author-info">
                        {item.phone && <span>📱 {item.phone}</span>}
                        <span className="date">
                          Joined: {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="column-stats">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className={`status-badge ${getRoleBadgeClass(item.role)}`}>
                        {formatRoleDisplay(item.role)}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{item.posts_count}</span>
                      <span className="stat-label">Posts</span>
                    </div>
                    {item.last_login && (
                      <div className="stat-item">
                        <span className="stat-label">Last Login</span>
                        <span className="stat-value" style={{ fontSize: '0.7rem' }}>
                          {new Date(item.last_login).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="column-actions">
                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn" 
                      title="View User Articles"
                      onClick={() => handleViewUserArticles(item.admin_id)}
                      disabled={isSubmitting}
                      aria-label="View user posts">
                      📰 Posts
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      title="Edit User Profile"
                      onClick={() => openEditModal(item)}
                      disabled={isSubmitting || !canEditThisUser(item)}
                      aria-label="Edit user">
                      ✏️ Edit
                    </button>
                    {canResetThisPassword(item) && (
                      <button 
                        className="action-btn password-btn" 
                        title="Reset Password"
                        onClick={() => openPasswordModal(item)}
                        disabled={isSubmitting}
                        aria-label="Reset password">
                        🔑 Password
                      </button>
                    )}
                    {canDeleteThisUser(item) && (
                      <button 
                        className="action-btn delete-btn" 
                        title="Delete User"
                        disabled={isSubmitting}
                        onClick={() => handleDeleteUser(item.admin_id, `${item.first_name} ${item.last_name}`)}
                        aria-label="Delete user">
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <UserRegistrationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchUsers}
        availableRoles={assignableRoles}
        csrfToken={csrfToken}
      />

      <UserPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {}}
        user={resetPasswordUser}
        csrfToken={csrfToken}
      />

      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeEditModal()}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Admin User</h3>
              <button 
                className="close-btn"
                onClick={closeEditModal}
                disabled={isSubmitting}
                aria-label="Close modal">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditUser}>
              <div className="form-grid">
                <div className="form-field">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-field">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-field">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-field">
                  <label>Role *</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    required
                    disabled={isSubmitting || !canManageRoles}
                  >
                    {assignableRoles.map(role => (
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
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                  aria-label="Cancel">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="confirm-btn"
                  disabled={isSubmitting}
                  aria-label="Update user">
                  {isSubmitting ? 'Updating...' : '💾 Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;