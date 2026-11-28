import type { AccessRequirement, PlatformRole, SessionContext } from './types';

const OWNER_PORTAL_PERMISSIONS = [
  'org.read',
  'listing.read',
  'availability.read',
  'verification.read',
] as const;

const ADMIN_PORTAL_PERMISSIONS = [
  'admin.dashboard.read',
  'admin.review.read',
  'admin.user.read',
  'admin.setting.read',
  'admin.audit.read',
] as const;

/**
 * Resolves the user's primary platform role from the API session context.
 * Prefers the canonical top-level `role` field added in S1-06-T2, falling back
 * to organisation memberships for backward compatibility.
 */
export function getEffectiveRole(context: SessionContext | null): PlatformRole | null {
  if (!context) return null;
  if (context.role) return context.role;
  const roles = context.memberships.map((m) => m.role);
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('OWNER')) return 'OWNER';
  if (roles.includes('STAFF')) return 'STAFF';
  return 'GUEST';
}

/**
 * Returns true if the signed-in user holds at least one of the allowed roles
 * (either as their platform role or via an active organisation membership).
 */
export function hasRole(
  context: SessionContext | null,
  allowedRoles: readonly PlatformRole[],
): boolean {
  if (!context || allowedRoles.length === 0) return false;
  if (context.role && allowedRoles.includes(context.role)) {
    return true;
  }
  return context.memberships.some((m) => allowedRoles.includes(m.role));
}

/**
 * Returns true if the signed-in user's permission list from GET /api/v1/me
 * includes the named permission code.
 */
export function hasPermission(
  context: SessionContext | null,
  permission: string,
): boolean {
  if (!context || !Array.isArray(context.permissions)) return false;
  return context.permissions.includes(permission);
}

/**
 * Returns true if the user holds at least one of the specified permissions.
 */
export function hasAnyPermission(
  context: SessionContext | null,
  permissions: readonly string[],
): boolean {
  if (!context || permissions.length === 0) return false;
  return permissions.some((code) => hasPermission(context, code));
}

/**
 * Returns true if the user holds every specified permission.
 */
export function hasAllPermissions(
  context: SessionContext | null,
  permissions: readonly string[],
): boolean {
  if (!context || permissions.length === 0) return false;
  return permissions.every((code) => hasPermission(context, code));
}

/**
 * Evaluates a combined role + permission requirement against the session context.
 * Client-side checks improve UX only; the Spring API enforces every permission
 * on the server via @RequiresPermission and OrgScope.
 */
export function meetsAccessRequirement(
  context: SessionContext | null,
  requirement: AccessRequirement,
): boolean {
  const { requiredRoles, requiredPermissions, requireAllPermissions = false } = requirement;
  const needsRoles = Boolean(requiredRoles && requiredRoles.length > 0);
  const needsPermissions = Boolean(requiredPermissions && requiredPermissions.length > 0);

  if (!needsRoles && !needsPermissions) {
    return true;
  }

  if (!context) {
    return false;
  }

  if (needsRoles && requiredRoles && !hasRole(context, requiredRoles)) {
    return false;
  }

  if (needsPermissions && requiredPermissions) {
    const ok = requireAllPermissions
      ? hasAllPermissions(context, requiredPermissions)
      : hasAnyPermission(context, requiredPermissions);
    if (!ok) return false;
  }

  return true;
}

/**
 * True when the user can enter the Owner Portal (/owner/*).
 */
export function canAccessOwnerPortal(context: SessionContext | null): boolean {
  if (!context) return false;
  return (
    hasRole(context, ['OWNER', 'STAFF']) ||
    hasAnyPermission(context, OWNER_PORTAL_PERMISSIONS)
  );
}

/**
 * True when the user can enter the Admin Portal (/admin/*).
 */
export function canAccessAdminPortal(context: SessionContext | null): boolean {
  if (!context) return false;
  return (
    hasRole(context, ['ADMIN']) ||
    hasAnyPermission(context, ADMIN_PORTAL_PERMISSIONS)
  );
}

/**
 * Filters a list of navigation items so unauthorised routes are hidden from
 * menus (S1-06-T4).
 */
export function filterNavItems<T extends AccessRequirement>(
  items: readonly T[],
  context: SessionContext | null,
): T[] {
  return items.filter((item) => meetsAccessRequirement(context, item));
}
