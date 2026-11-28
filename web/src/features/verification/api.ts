import { apiFetch } from '../../lib/api';
import type {
  OwnerVerificationStatusResponse,
  SubmittedDocumentInput,
  VerificationCaseView,
  VerificationDocumentType,
  VerificationPresignResponse,
  VerificationSignedUrl,
} from './types';

export function fetchOwnerVerificationStatus(
  accessToken: string,
): Promise<OwnerVerificationStatusResponse> {
  return apiFetch<OwnerVerificationStatusResponse>('/owner/verification', {
    accessToken,
  });
}

export function presignVerificationDocument(
  accessToken: string,
  input: {
    documentType: VerificationDocumentType;
    filename: string;
    contentType: string;
    sizeBytes: number;
  },
): Promise<VerificationPresignResponse> {
  return apiFetch<VerificationPresignResponse>('/owner/verification/presign', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function submitOwnerVerification(
  accessToken: string,
  input: {
    ghanaCardNumber: string;
    documents: SubmittedDocumentInput[];
  },
): Promise<VerificationCaseView> {
  return apiFetch<VerificationCaseView>('/owner/verification/submit', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function resubmitOwnerVerification(
  accessToken: string,
  input: {
    ghanaCardNumber?: string;
    documents: SubmittedDocumentInput[];
  },
): Promise<VerificationCaseView> {
  return apiFetch<VerificationCaseView>('/owner/verification/resubmit', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function fetchVerificationDocumentSignedUrl(
  accessToken: string,
  assetId: string,
): Promise<VerificationSignedUrl> {
  return apiFetch<VerificationSignedUrl>(
    `/owner/verification/documents/${encodeURIComponent(assetId)}/signed-url`,
    { accessToken },
  );
}
