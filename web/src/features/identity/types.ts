export type PlatformRole = 'GUEST' | 'OWNER' | 'STAFF' | 'ADMIN';

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
};
