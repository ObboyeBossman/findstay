export type PlatformRole = 'GUEST' | 'OWNER' | 'STAFF' | 'ADMIN';

/**
 * Canonical module-prefixed permission codes seeded in Flyway V1_16__seed_permissions.sql
 * (S1-06-T1) and returned by GET /api/v1/me (S1-06-T2).
 */
export type PermissionCode =
  | 'profile.read'
  | 'profile.write'
  | 'notification.read'
  | 'notification.write'
  | 'consent.read'
  | 'consent.write'
  | 'org.read'
  | 'org.write'
  | 'org.staff.manage'
  | 'verification.read'
  | 'verification.submit'
  | 'listing.read'
  | 'listing.write'
  | 'listing.submit'
  | 'availability.read'
  | 'availability.write'
  | 'media.upload'
  | 'admin.dashboard.read'
  | 'admin.review.read'
  | 'admin.review.decide'
  | 'admin.user.read'
  | 'admin.user.manage'
  | 'admin.listing.moderate'
  | 'admin.setting.read'
  | 'admin.setting.write'
  | 'admin.audit.read'
  | 'media.private.read';

export type AccessRequirement = {
  /** User must hold at least one of these roles (if provided). */
  requiredRoles?: readonly PlatformRole[];
  /** User must hold these permissions (any by default, or all when requireAllPermissions is true). */
  requiredPermissions?: readonly (PermissionCode | string)[];
  /** When true, every code in requiredPermissions must be present. Defaults to false (any). */
  requireAllPermissions?: boolean;
};

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  preferredLanguage: string | null;
  createdAt: string;
};

export type RoleMembership = {
  role: PlatformRole;
  organizationId: string;
  organizationName?: string;
  propertyIds?: string[];
};

export type ConsentState = {
  policyVersion: string;
  policyUrl?: string;
  acceptedAt: string | null;
};

export type SessionContext = {
  profile: Profile;
  memberships: RoleMembership[];
  consent: ConsentState;
  activeOrganizationId: string | null;
  role?: PlatformRole;
  permissions?: string[];
};
