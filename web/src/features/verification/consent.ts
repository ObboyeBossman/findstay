import { apiFetch } from '../../lib/api';

export interface PrivacyNoticeMetadata {
  policyVersion: string;
  effectiveDate: string;
  governingLaw: string;
  supervisoryAuthority: string;
  dpoEmail: string;
  policyUrl: string;
}

export interface ConsentRecordItem {
  id: string;
  userId: string;
  policyVersion: string;
  consentedAt: string;
  ipAddress: string;
}

export interface ConsentStateResponse {
  policyVersion: string;
  policyUrl: string;
  acceptedAt: string | null;
  requiresConsent: boolean;
  history: ConsentRecordItem[];
}

export function fetchPrivacyNoticeMetadata(): Promise<PrivacyNoticeMetadata> {
  return apiFetch<PrivacyNoticeMetadata>('/privacy-notice');
}

export function fetchLatestConsentState(accessToken: string): Promise<ConsentStateResponse> {
  return apiFetch<ConsentStateResponse>('/consents/latest', { accessToken });
}

export function recordPrivacyConsent(
  accessToken: string,
  policyVersion: string,
): Promise<ConsentRecordItem> {
  return apiFetch<ConsentRecordItem>('/consents', {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ accepted: true, policyVersion }),
  });
}

export { formatConsentGhanaTime, isConsentCurrent } from './consentHelpers';
