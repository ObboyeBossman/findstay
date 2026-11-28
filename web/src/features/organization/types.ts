export type VerificationStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING'
  | 'PARTIALLY_REJECTED'
  | 'REJECTED'
  | 'APPROVED';

export type OrganizationProfile = {
  id: string;
  name: string;
  displayName: string;
  contactEmail: string;
  contactPhone: string | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
};

export type UpdateOrganizationPayload = {
  name?: string;
  displayName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export type StaffInvitation = {
  id: string;
  organizationId: string;
  organizationDisplayName: string;
  email: string;
  role: 'STAFF';
  status: InvitationStatus;
  propertyIds: string[];
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

export type CreatedStaffInvitation = Omit<StaffInvitation, 'acceptedAt'> & {
  acceptToken: string;
};

export type StaffMember = {
  membershipId: string;
  userId: string;
  role: 'OWNER' | 'STAFF';
  isPrimaryOwner: boolean;
  propertyIds: string[];
  joinedAt: string;
};
