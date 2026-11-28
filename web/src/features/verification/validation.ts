import type {
  VerificationDocumentStatus,
  VerificationDocumentType,
} from './types';

export const GHANA_CARD_REGEX = /^GHA-\d{9}-\d$/;

export const REQUIRED_VERIFICATION_DOCS: readonly VerificationDocumentType[] = [
  'GHANA_CARD',
  'OWNERSHIP_PROOF',
  'GTA_LICENCE',
] as const;

export function normalizeGhanaCardNumber(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidGhanaCardNumber(raw: string): boolean {
  return GHANA_CARD_REGEX.test(normalizeGhanaCardNumber(raw));
}

export function maskGhanaCardNumber(raw: string): string {
  const normalized = normalizeGhanaCardNumber(raw);
  if (!GHANA_CARD_REGEX.test(normalized)) {
    return normalized;
  }
  const middle = normalized.slice(4, 13);
  const check = normalized.slice(14);
  return `GHA-******${middle.slice(-3)}-${check}`;
}

export function getDocumentLabel(type: VerificationDocumentType): string {
  switch (type) {
    case 'GHANA_CARD':
      return 'Ghana Card (National ID)';
    case 'OWNERSHIP_PROOF':
      return 'Proof of Property Ownership / Management';
    case 'GTA_LICENCE':
      return 'Ghana Tourism Authority (GTA) Licence';
  }
}

export function getDocumentDescription(type: VerificationDocumentType): string {
  switch (type) {
    case 'GHANA_CARD':
      return 'Clear photo or PDF scan of your valid Ghana Card matching the number above.';
    case 'OWNERSHIP_PROOF':
      return 'Indenture, land title, or signed property management authorisation letter.';
    case 'GTA_LICENCE':
      return 'Valid Ghana Tourism Authority accommodation registration certificate or licence.';
  }
}

/**
 * Checks whether all rejected documents have fresh replacements uploaded before allowing
 * resubmission (`S1-12-T5`).
 */
export function getMissingResubmissionTypes(
  existingDocs: readonly { documentType: VerificationDocumentType; status: VerificationDocumentStatus }[],
  uploadedUpdates: Partial<Record<VerificationDocumentType, unknown>>,
): VerificationDocumentType[] {
  return existingDocs
    .filter((doc) => doc.status === 'REJECTED' && !uploadedUpdates[doc.documentType])
    .map((doc) => doc.documentType);
}
