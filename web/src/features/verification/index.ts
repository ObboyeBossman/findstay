export { OwnerVerificationPage } from './OwnerVerificationPage';
export { PrivacyNoticePage } from './PrivacyNoticePage';
export {
  fetchLatestConsentState,
  fetchPrivacyNoticeMetadata,
  formatConsentGhanaTime,
  isConsentCurrent,
  recordPrivacyConsent,
} from './consent';
export type {
  ConsentRecordItem,
  ConsentStateResponse,
  PrivacyNoticeMetadata,
} from './consent';
export {
  fetchOwnerVerificationStatus,
  fetchVerificationDocumentSignedUrl,
  presignVerificationDocument,
  resubmitOwnerVerification,
  submitOwnerVerification,
} from './api';
export {
  getDocumentDescription,
  getDocumentLabel,
  getMissingResubmissionTypes,
  GHANA_CARD_REGEX,
  isValidGhanaCardNumber,
  maskGhanaCardNumber,
  normalizeGhanaCardNumber,
  REQUIRED_VERIFICATION_DOCS,
} from './validation';
export type {
  OwnerVerificationStatusResponse,
  ReviewDecisionType,
  ReviewDecisionView,
  SubmittedDocumentInput,
  VerificationCaseStatus,
  VerificationCaseView,
  VerificationDocumentStatus,
  VerificationDocumentType,
  VerificationDocumentView,
  VerificationPresignResponse,
} from './types';
