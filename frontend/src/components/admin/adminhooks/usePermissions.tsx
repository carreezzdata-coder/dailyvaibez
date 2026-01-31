import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/components/includes/Session';

interface Permissions {
  role: string;
  can_publish_directly: boolean;
  can_approve_posts: boolean;
  can_hard_delete: boolean;
  can_archive: boolean;
  can_edit_any: boolean;
  can_manage_users: boolean;
  can_create_posts: boolean;
  can_create_quotes: boolean;
  can_feature: boolean;
  can_set_breaking: boolean;
  can_set_pinned: boolean;
  requires_approval: boolean;
  can_view_users: boolean;
  can_create_users: boolean;
  can_edit_users: boolean;
  can_delete_users: boolean;
  can_change_own_password: boolean;
  can_reset_others_password: boolean;
  can_manage_roles: boolean;
  assignable_roles: string[];
}

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  moderator: 1
};

const getAssignableRoles = (role?: string): string[] => {
  const normalizedRole = (role || 'moderator').toLowerCase();
  const userLevel = ROLE_HIERARCHY[normalizedRole] || 0;
  
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level < userLevel)
    .map(([roleName]) => roleName)
    .sort((a, b) => ROLE_HIERARCHY[a] - ROLE_HIERARCHY[b]);
};

const getDefaultPermissions = (role?: string): Permissions => {
  const normalizedRole = (role || 'moderator').toLowerCase();
  
  const isSuperAdmin = normalizedRole === 'super_admin';
  const isAdmin = normalizedRole === 'admin' || isSuperAdmin;
  const isEditor = normalizedRole === 'editor' || isAdmin;
  const isModerator = normalizedRole === 'moderator' || isEditor;

  return {
    role: normalizedRole,
    can_publish_directly: isEditor,
    can_approve_posts: isEditor,
    can_hard_delete: isAdmin,
    can_archive: isModerator,
    can_edit_any: isEditor,
    can_manage_users: isAdmin,
    can_create_posts: isModerator,
    can_create_quotes: isModerator,
    can_feature: isEditor,
    can_set_breaking: isAdmin,
    can_set_pinned: isAdmin,
    requires_approval: !isEditor,
    can_view_users: isModerator,
    can_create_users: isAdmin,
    can_edit_users: isAdmin,
    can_delete_users: isAdmin,
    can_change_own_password: isModerator,
    can_reset_others_password: isAdmin,
    can_manage_roles: isAdmin,
    assignable_roles: getAssignableRoles(normalizedRole)
  };
};

export const usePermissions = () => {
  const { user, isAuthenticated, csrfToken } = useSession();
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPermissions(getDefaultPermissions('moderator'));
      setIsLoading(false);
      return;
    }

    if (user.role) {
      const fallbackPermissions = getDefaultPermissions(user.role);
      setPermissions(fallbackPermissions);
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/permissions?endpoint=me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        if (user.role) {
          setPermissions(getDefaultPermissions(user.role));
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.permissions) {
        setPermissions(data.permissions);
      } else {
        if (user.role) {
          setPermissions(getDefaultPermissions(user.role));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      if (user?.role) {
        setPermissions(getDefaultPermissions(user.role));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, csrfToken]);

  const checkPermission = useCallback(async (action: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    if (permissions) {
      const permissionMap: Record<string, boolean> = {
        'publish': permissions.can_publish_directly,
        'approve': permissions.can_approve_posts,
        'delete': permissions.can_hard_delete,
        'archive': permissions.can_archive,
        'edit_any': permissions.can_edit_any,
        'manage_users': permissions.can_manage_users,
        'create_posts': permissions.can_create_posts,
        'create_quotes': permissions.can_create_quotes,
        'feature': permissions.can_feature,
        'breaking': permissions.can_set_breaking,
        'pinned': permissions.can_set_pinned,
        'view_users': permissions.can_view_users,
        'create_users': permissions.can_create_users,
        'edit_users': permissions.can_edit_users,
        'delete_users': permissions.can_delete_users,
        'reset_passwords': permissions.can_reset_others_password,
        'manage_roles': permissions.can_manage_roles
      };

      if (action in permissionMap) {
        return permissionMap[action];
      }
    }

    try {
      const response = await fetch(`/api/admin/permissions?endpoint=check&action=${action}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.success && data.has_permission;
    } catch {
      return false;
    }
  }, [isAuthenticated, user, csrfToken, permissions]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const canPublish = permissions?.can_publish_directly ?? false;
  const canApprove = permissions?.can_approve_posts ?? false;
  const canDelete = permissions?.can_hard_delete ?? false;
  const canArchive = permissions?.can_archive ?? false;
  const canEditAny = permissions?.can_edit_any ?? false;
  const canManageUsers = permissions?.can_manage_users ?? false;
  const canCreatePosts = permissions?.can_create_posts ?? true;
  const canCreateQuotes = permissions?.can_create_quotes ?? false;
  const canFeature = permissions?.can_feature ?? false;
  const canSetBreaking = permissions?.can_set_breaking ?? false;
  const canSetPinned = permissions?.can_set_pinned ?? false;
  const requiresApproval = permissions?.requires_approval ?? true;
  const canViewUsers = permissions?.can_view_users ?? false;
  const canCreateUsers = permissions?.can_create_users ?? false;
  const canEditUsers = permissions?.can_edit_users ?? false;
  const canDeleteUsers = permissions?.can_delete_users ?? false;
  const canChangeOwnPassword = permissions?.can_change_own_password ?? true;
  const canResetPasswords = permissions?.can_reset_others_password ?? false;
  const canManageRoles = permissions?.can_manage_roles ?? false;
  const assignableRoles = permissions?.assignable_roles ?? [];

  return {
    permissions,
    isLoading,
    error,
    refetch: fetchPermissions,
    checkPermission,
    canPublish,
    canApprove,
    canDelete,
    canArchive,
    canEditAny,
    canManageUsers,
    canCreatePosts,
    canCreateQuotes,
    canFeature,
    canSetBreaking,
    canSetPinned,
    requiresApproval,
    canViewUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canChangeOwnPassword,
    canResetPasswords,
    canManageRoles,
    assignableRoles
  };
};