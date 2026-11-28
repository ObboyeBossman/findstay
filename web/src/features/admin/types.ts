import type { VerificationCaseView, VerificationDocumentType } from '../verification';
import type { MediaAssetSummary } from '../media';

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
