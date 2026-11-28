import type { VerificationCaseView, VerificationDocumentType } from '../verification';
import type { MediaAssetSummary } from '../media';
import type { AuditLogEntry } from '../audit';

export type ReviewEntityKind = 'VERIFICATION' | 'LISTING';
export type ReviewDecisionType = 'APPROVE' | 'REQUEST_CORRECTIONS' | 'REJECT';
export type ReviewQueueStatusTab = 'PENDING' | 'LIVE' | 'DECIDED' | 'ALL';

export interface ReviewQueueItem {
  id: string;
  kind: ReviewEntityKind;
  organizationId: string;
  organizationName: string;
  title: string;
  subtitle: string;
  status: string;
  updatedAt: string | null;
}

export interface ListingReviewItem {
  propertyId: string;
  organizationId: string;
  name: string;
  description: string | null;
  town: string;
  areaName: string | null;
  address: string | null;
  accommodationTypeCode: string | null;
  houseRules: string | null;
  status: string;
  unitCount: number;
  fromPricePesewas: number | null;
  photoCount: number;
  coverPhotoUrl: string | null;
  updatedAt: string;
}

export interface ReviewUnitSummary {
  unitId: string;
  propertyId: string;
  organizationId: string;
  name: string;
  category: string | null;
  maxGuests: number;
  quantity: number;
  nightlyRatePesewas: number;
  currency: string;
}

export interface ReviewDecisionRecord {
  id: string;
  entityKind: ReviewEntityKind;
  entityId: string;
  decision: ReviewDecisionType;
  reason: string | null;
  corrections: string[];
  decidedByUserId: string;
  decidedAt: string;
}

export interface ReviewDetailResponse {
  id: string;
  kind: ReviewEntityKind;
  organizationId: string;
  organizationName: string;
  status: string;
  verificationCase: VerificationCaseView | null;
  listing: ListingReviewItem | null;
  units: ReviewUnitSummary[];
  listingPhotos: MediaAssetSummary[];
  decisions: ReviewDecisionRecord[];
}

export interface ReviewDecisionPayload {
  decision: ReviewDecisionType;
  reason: string;
  corrections?: string[];
  rejectedDocumentTypes?: VerificationDocumentType[];
}

export interface AdminDashboardResponse {
  pendingVerificationsCount: number;
  pendingListingsCount: number;
  publishedListingsCount: number;
  suspendedListingsCount: number;
  totalUsersCount: number;
  activeUsersCount: number;
  suspendedUsersCount: number;
  recentActivity: AuditLogEntry[];
}

export interface AdminUserItem {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  roleCode: string;
  status: 'ACTIVE' | 'SUSPENDED' | string;
  suspendedAt: string | null;
  suspensionReason: string | null;
  createdAt: string;
}

export interface AdminUserPageResponse {
  items: AdminUserItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateAdminUserPayload {
  email: string;
  displayName: string;
  phone?: string;
  role: 'GUEST' | 'OWNER' | 'ADMIN';
}

export interface PlatformSettingItem {
  key: string;
  value: string;
  description: string | null;
  isFeatureFlag: boolean;
  updatedByUserId: string | null;
  updatedAt: string;
}
