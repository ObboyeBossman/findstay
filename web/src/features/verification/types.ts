import type { PresignedUploadResponse, SignedDownloadResponse } from '../media';

export type VerificationCaseStatus =
  | 'PENDING'
  | 'PARTIALLY_REJECTED'
  | 'REJECTED'
  | 'APPROVED';

export type VerificationDocumentType =
  | 'GHANA_CARD'
  | 'OWNERSHIP_PROOF'
  | 'GTA_LICENCE';

export type VerificationDocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ReviewDecisionType = 'APPROVE' | 'REQUEST_CORRECTIONS' | 'REJECT';

export type VerificationDocumentView = {
  id: string;
  documentType: VerificationDocumentType;
  status: VerificationDocumentStatus;
  fixNote: string | null;
  mediaAssetId: string | null;
  submittedAt: string;
};

export type ReviewDecisionView = {
  id: string;
  entityKind: 'VERIFICATION' | 'LISTING';
  entityId: string;
  decision: ReviewDecisionType;
  reason: string | null;
  corrections: string[];
  rejectedDocumentTypes: VerificationDocumentType[];
  decidedByUserId: string;
  decidedAt: string;
};

export type VerificationCaseView = {
  id: string;
  organizationId: string;
  status: VerificationCaseStatus;
  maskedGhanaCardNumber: string;
  submittedAt: string;
  decidedAt: string | null;
  documents: VerificationDocumentView[];
  decisions: ReviewDecisionView[];
};

export type OwnerVerificationStatusResponse = {
  organizationId: string;
  organizationVerificationStatus: string;
  verificationCase: VerificationCaseView | null;
};

export type VerificationPresignResponse = {
  documentType: VerificationDocumentType;
  documentId: string;
  upload: PresignedUploadResponse;
};

export type SubmittedDocumentInput = {
  documentType: VerificationDocumentType;
  documentId: string;
  assetId: string;
};

export type VerificationSignedUrl = SignedDownloadResponse;
