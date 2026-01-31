'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from '@/components/includes/Session';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'analytics' | 'system' | 'users' | 'communication' | 'workflow';
}

interface UserRole {
  admin_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'moderator';
  permissions: Record<string, boolean>;
  status: 'active' | 'suspended';
  last_login: string;
  created_at: string;
}

const PERMISSIONS: Permission[] = [
  { id: 'view_all_posts', name: 'View All Posts', description: 'Access all posts regardless of author', category: 'content' },
  { id: 'edit_articles', name: 'Edit Articles', description: 'Modify article content and metadata', category: 'content' },
  { id: 'approve_articles', name: 'Approve/Disapprove', description: 'Approve or reject article submissions', category: 'content' },
  { id: 'hold_articles', name: 'Hold Articles', description: 'Place articles on hold for review', category: 'content' },
  { id: 'boost_articles', name: 'Boost Articles', description: 'Promote articles for increased visibility', category: 'content' },
  { id: 'use_chapter_system', name: 'Chapter System', description: 'Access chapter organization system', category: 'content' },
  { id: 'manage_media', name: 'Manage Media', description: 'Upload and manage media files', category: 'content' },
  { id: 'manage_comments', name: 'Manage Comments', description: 'Moderate and manage user comments', category: 'content' },
  
  { id: 'add_user', name: 'Add Users', description: 'Create new admin users', category: 'users' },
  { id: 'delete_user', name: 'Delete Users', description: 'Remove admin users from system', category: 'users' },
  { id: 'view_user_activity', name: 'User Activity', description: 'View user activity logs', category: 'users' },
  
  { id: 'view_analytics', name: 'View Analytics', description: 'Access analytics dashboard', category: 'analytics' },
  { id: 'view_reports', name: 'View Reports', description: 'Access system reports and logs', category: 'analytics' },
  { id: 'export_data', name: 'Export Data', description: 'Export system data and reports', category: 'analytics' },
  
  { id: 'view_system_services', name: 'System Services', description: 'Access system configuration', category: 'system' },
  { id: 'manage_categories', name: 'Manage Categories', description: 'Create, edit, and delete categories', category: 'system' },
  { id: 'manage_settings', name: 'Manage Settings', description: 'Configure system settings', category: 'system' },
  
  { id: 'receive_post_notifications', name: 'Post Notifications', description: 'Receive alerts for new posts', category: 'communication' },
  { id: 'admin_chat_access', name: 'Admin Chat', description: 'Access real-time admin chat system', category: 'communication' },
  { id: 'broadcast_messages', name: 'Broadcast Messages', description: 'Send announcements to all admins', category: 'communication' },

  { id: 'approve_posts', name: 'Approve Posts', description: 'Approve posts for publication', category: 'workflow' },
  { id: 'view_pending_approvals', name: 'View Pending', description: 'View posts pending approval', category: 'workflow' },
];

const ROLE_PRESETS = {
  super_admin: PERMISSIONS.reduce((acc, perm) => ({ ...acc, [perm.id]: true }), {}),
  admin: {
    view_all_posts: true,
    edit_articles: true,
    approve_articles: true,
    hold_articles: true,
    boost_articles: true,
    use_chapter_system: true,
    manage_media: true,
    manage_comments: true,
    add_user: true,
    delete_user: true,
    view_user_activity: true,
    view_analytics: true,
    view_reports: true,
    export_data: true,
    view_system_services: true,
    manage_categories: true,
    manage_settings: false,
    receive_post_notifications: true,
    admin_chat_access: true,
    broadcast_messages: false,
    approve_posts: true,
    view_pending_approvals: true,
  },
  editor: {
    view_all_posts: true,
    edit_articles: true,
    approve_articles: true,
    hold_articles: true,
    boost_articles: true,
    use_chapter_system: true,
    manage_media: true,
    manage_comments: true,
    add_user: false,
    delete_user: false,
    view_user_activity: false,
    view_analytics: true,
    view_reports: false,
    export_data: false,
    view_system_services: false,
    manage_categories: false,
    manage_settings: false,
    receive_post_notifications: true,
    admin_chat_access: true,
    broadcast_messages: false,
    approve_posts: false,
    view_pending_approvals: true,
  },
  moderator: {
    view_all_posts: false,
    edit_articles: false,
    approve_articles: false,
    hold_articles: false,
    boost_articles: false,
    use_chapter_system: true,
    manage_media: false,
    manage_comments: true,
    add_user: false,
    delete_user: false,
    view_user_activity: false,
    view_analytics: false,
    view_reports: false,
    export_data: false,
    view_system_services: false,
    manage_categories: false,
    manage_settings: false,
    receive_post_notifications: false,
    admin_chat_access: true,
    broadcast_messages: false,
    approve_posts: false,
    view_pending_approvals: false,
  },
};

const ROLE_HIERARCHY = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  moderator: 1
};

const UserRoles: React.FC = () => {
  const { user, csrfToken } = useSession();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<UserRole | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  const canManageRole = (targetRole: string): boolean => {
    if (!user?.role) return false;
    const userLevel = ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY] || 0;
    return userLevel > targetLevel;
  };

  const canViewUser = (targetUser: UserRole): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (user.role === 'admin') return targetUser.role !== 'super_admin';
    if (user.role === 'editor') return !['super_admin', 'admin'].includes(targetUser.role);
    return user.admin_id === targetUser.admin_id;
  };

  const canEditUser = (targetUser: UserRole): boolean => {
    if (!user) return false;
    if (user.admin_id === targetUser.admin_id) return false;
    if (user.role === 'super_admin') return true;
    if (user.role === 'admin') return !['super_admin', 'admin'].includes(targetUser.role);
    return false;
  };

  const canDeleteUser = (targetUser: UserRole): boolean => {
    if (!user) return false;
    if (user.admin_id === targetUser.admin_id) return false;
    if (user.role === 'super_admin') return targetUser.role !== 'super_admin';
    if (user.role === 'admin') return !['super_admin', 'admin'].includes(targetUser.role);
    return false;
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/userroles', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        const visibleUsers = (data.users || []).filter(canViewUser);
        setUsers(visibleUsers);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch users');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditPermissions = (userRole: UserRole) => {
    if (!canEditUser(userRole)) {
      setError('You do not have permission to edit this user');
      return;
    }

    setEditingUser({
      ...userRole,
      permissions: userRole.permissions || ROLE_PRESETS[userRole.role] || {}
    });
    setShowPermissionsModal(true);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!editingUser) return;
    
    setEditingUser({
      ...editingUser,
      permissions: {
        ...editingUser.permissions,
        [permissionId]: !editingUser.permissions[permissionId]
      }
    });
  };

  const handleRoleChange = (newRole: UserRole['role']) => {
    if (!editingUser) return;

    if (!canManageRole(newRole)) {
      setError('You cannot assign a role equal to or higher than yours');
      return;
    }
    
    setEditingUser({
      ...editingUser,
      role: newRole,
      permissions: ROLE_PRESETS[newRole]
    });
  };

  const handleSavePermissions = async () => {
    if (!editingUser) return;

    if (!canEditUser(editingUser)) {
      setError('You do not have permission to edit this user');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/userroles/${editingUser.admin_id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          role: editingUser.role,
          permissions: editingUser.permissions
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchUsers();
        setShowPermissionsModal(false);
        setEditingUser(null);
      } else {
        setError(data.message || 'Failed to update permissions');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    const targetUser = users.find(u => u.admin_id === userId);
    if (!targetUser || !canDeleteUser(targetUser)) {
      setError('You do not have permission to delete this user');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/userroles/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchUsers();
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const targetUser = users.find(u => u.admin_id === userId);
    if (!targetUser || !canEditUser(targetUser)) {
      setError('You do not have permission to modify this user');
      return;
    }

    if (!confirm(`Are you sure you want to ${currentStatus === 'active' ? 'suspend' : 'activate'} this user?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/userroles/${userId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          status: currentStatus === 'active' ? 'suspended' : 'active'
        })
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      setError('Failed to update user status');
    }
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

  const groupedPermissions = useMemo(() => {
    return PERMISSIONS.reduce((acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, []);

  const categoryLabels = {
    content: 'Content Management',
    analytics: 'Analytics & Reports',
    system: 'System Administration',
    users: 'User Management',
    communication: 'Communication',
    workflow: 'Approval Workflow'
  };

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: 'var(--african-red)',
      admin: 'var(--primary-color)',
      editor: 'var(--african-green)',
      moderator: 'var(--african-yellow)'
    };
    return colors[role as keyof typeof colors] || 'var(--text-muted)';
  };

  const availableRoles = useMemo(() => {
    if (!user?.role) return [];
    const userLevel = ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] || 0;
    return Object.entries(ROLE_HIERARCHY)
      .filter(([_, level]) => level < userLevel)
      .map(([role]) => role);
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="retrieve-loading">
        <div className="loading-spinner"></div>
        <p>Loading user roles...</p>
      </div>
    );
  }

  return (
    <div className="user-roles-container">
      <div className="roles-header">
        <div className="header-content">
          <h1>User Roles Management</h1>
          <p className="header-subtitle">
            Manage admin permissions and access levels across the platform
          </p>
        </div>
        <button 
          className="refresh-btn" 
          onClick={fetchUsers}
          disabled={isLoading}
          aria-label="Refresh user data">
          {isLoading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Close error">✕</button>
        </div>
      )}

      <div className="roles-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          aria-label="View users">
          👥 Users ({users.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
          aria-label="View role presets">
          🛡️ Role Presets
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="roles-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search by name, email, or role..."
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

          <div className="roles-grid">
            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No users found</h3>
                <p>Try adjusting your filters or search term</p>
              </div>
            ) : (
              filteredUsers.map(userRole => (
                <div key={userRole.admin_id} className="role-card">
                  <div className="role-card-header">
                    <div className="user-avatar">
                      {userRole.first_name.charAt(0).toUpperCase()}
                      {userRole.last_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h3>
                        {userRole.first_name} {userRole.last_name}
                        {user?.admin_id === userRole.admin_id && (
                          <span className="current-user-badge">You</span>
                        )}
                      </h3>
                      <p className="user-email">{userRole.email}</p>
                      <span 
                        className={`role-badge role-${userRole.role}`}
                        style={{ backgroundColor: getRoleColor(userRole.role) }}
                      >
                        {userRole.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="role-card-body">
                    <div className="permission-summary">
                      <h4>Permissions Summary</h4>
                      <div className="permission-tags">
                        {Object.entries(userRole.permissions || {})
                          .filter(([, value]) => value)
                          .slice(0, 5)
                          .map(([key]) => (
                            <span key={key} className="permission-tag">
                              {key.replace('_', ' ')}
                            </span>
                          ))}
                        {Object.values(userRole.permissions || {}).filter(Boolean).length > 5 && (
                          <span className="permission-tag more">
                            +{Object.values(userRole.permissions || {}).filter(Boolean).length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="role-meta">
                      <div className="meta-item">
                        <span className="meta-label">Status</span>
                        <span className={`status-badge status-${userRole.status}`}>
                          {userRole.status}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Last Login</span>
                        <span className="meta-value">
                          {userRole.last_login ? new Date(userRole.last_login).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Joined</span>
                        <span className="meta-value">
                          {new Date(userRole.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Permissions</span>
                        <span className="meta-value">
                          {Object.values(userRole.permissions || {}).filter(Boolean).length} enabled
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="role-card-actions">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEditPermissions(userRole)}
                      disabled={!canEditUser(userRole)}
                      title={canEditUser(userRole) ? "Edit permissions" : "Insufficient permissions"}
                      aria-label="Manage user permissions">
                      ⚙️ Manage
                    </button>
                    <button 
                      className="action-btn status-btn"
                      onClick={() => handleToggleUserStatus(userRole.admin_id, userRole.status)}
                      disabled={!canEditUser(userRole)}
                      aria-label="Toggle user status">
                      {userRole.status === 'active' ? '⏸️ Suspend' : '▶️ Activate'}
                    </button>
                    {canDeleteUser(userRole) && (
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteUser(userRole.admin_id, `${userRole.first_name} ${userRole.last_name}`)}
                        aria-label="Delete user">
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'roles' && (
        <div className="role-presets-container">
          <div className="presets-grid">
            {Object.entries(ROLE_PRESETS).map(([role, permissions]) => (
              <div key={role} className="preset-card">
                <div className="preset-header">
                  <h3>{role.replace('_', ' ').toUpperCase()}</h3>
                  <span 
                    className="preset-badge"
                    style={{ backgroundColor: getRoleColor(role) }}
                  >
                    {Object.values(permissions).filter(Boolean).length} permissions
                  </span>
                </div>
                <div className="preset-permissions">
                  {Object.entries(permissions)
                    .filter(([, value]) => value)
                    .slice(0, 6)
                    .map(([key]) => (
                      <span key={key} className="permission-chip">
                        {key.replace('_', ' ')}
                      </span>
                    ))}
                  {Object.values(permissions).filter(Boolean).length > 6 && (
                    <span className="more-chip">
                      +{Object.values(permissions).filter(Boolean).length - 6} more
                    </span>
                  )}
                </div>
                <div className="preset-description">
                  {role === 'super_admin' && 'Full system access and control'}
                  {role === 'admin' && 'Full content management with approval rights'}
                  {role === 'editor' && 'Content creation and editing with view-only workflow'}
                  {role === 'moderator' && 'Basic content moderation with approval required'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPermissionsModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
          <div className="permissions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Permissions</h2>
              <button className="close-btn" onClick={() => setShowPermissionsModal(false)} aria-label="Close modal">✕</button>
            </div>

            <div className="modal-user-info">
              <div className="user-avatar-large">
                {editingUser.first_name.charAt(0)}{editingUser.last_name.charAt(0)}
              </div>
              <div>
                <h3>{editingUser.first_name} {editingUser.last_name}</h3>
                <p>{editingUser.email}</p>
              </div>
            </div>

            <div className="role-selector">
              <label>User Role</label>
              <div className="role-options">
                {(['moderator', 'editor', 'admin', 'super_admin'] as const).map(role => {
                  const canAssign = canManageRole(role);
                  return (
                    <label key={role} className="radio-option">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={editingUser.role === role}
                        onChange={(e) => handleRoleChange(e.target.value as UserRole['role'])}
                        disabled={!canAssign}
                      />
                      <span className="radio-label">
                        {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {!canAssign && ' (Locked)'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="permissions-list">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="permission-category">
                  <h4 className="category-title">{categoryLabels[category as keyof typeof categoryLabels]}</h4>
                  <div className="permission-items">
                    {perms.map(permission => (
                      <label key={permission.id} className="permission-item">
                        <input
                          type="checkbox"
                          checked={editingUser.permissions[permission.id] || false}
                          onChange={() => handlePermissionToggle(permission.id)}
                          disabled={editingUser.role === 'super_admin'}
                        />
                        <div className="permission-details">
                          <span className="permission-name">{permission.name}</span>
                          <span className="permission-description">{permission.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowPermissionsModal(false)}
                disabled={isSaving}
                aria-label="Cancel changes">
                Cancel
              </button>
              <button 
                type="button"
                className="save-btn"
                onClick={handleSavePermissions}
                disabled={isSaving || editingUser.role === 'super_admin'}
                aria-label="Save changes">
                {isSaving ? '🔄 Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;