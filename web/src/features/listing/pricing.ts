import type { PropertyStatus } from './types';

const CEDI_INPUT_PATTERN = /^\d+(?:\.(\d{1,2}))?$/;

/**
 * Deterministically converts a decimal GHS cedi string (e.g. `"450.50"`, `"320"`, `"12.5"`)
 * into integer pesewas without floating-point rounding drift (`NFR-08`).
 * Returns `null` if the string is invalid, negative, zero, or has > 2 decimal places.
 */
export function parseCedisToPesewas(raw: string): number | null {
  const trimmed = raw.trim();
  const match = CEDI_INPUT_PATTERN.exec(trimmed);
  if (!match) {
    return null;
  }
  const [wholePart, fracPart = ''] = trimmed.split('.');
  const paddedFrac = (fracPart + '00').slice(0, 2);
  const pesewas = Number(wholePart) * 100 + Number(paddedFrac);
  if (!Number.isSafeInteger(pesewas) || pesewas <= 0) {
    return null;
  }
  return pesewas;
}

/** Converts integer pesewas to an exact 2-decimal cedi string suitable for form inputs. */
export function pesewasToCedisInput(pesewas: number): string {
  if (!Number.isFinite(pesewas) || pesewas <= 0) return '';
  const whole = Math.floor(pesewas / 100);
  const rem = Math.abs(Math.trunc(pesewas) % 100);
  return `${whole}.${String(rem).padStart(2, '0')}`;
}

/** Formats integer GHS pesewas for display (e.g. `45050` -> `"GH₵450.50"`). */
export function formatGhsPesewas(pesewas: number | null | undefined): string {
  if (pesewas === null || pesewas === undefined || !Number.isFinite(pesewas)) {
    return 'Price not set';
  }
  const negative = pesewas < 0;
  const abs = Math.abs(Math.trunc(pesewas));
  const whole = Math.floor(abs / 100);
  const rem = abs % 100;
  const formattedWhole = whole.toLocaleString('en-GH');
  return `${negative ? '-' : ''}GH₵${formattedWhole}.${String(rem).padStart(2, '0')}`;
}

export interface SubmissionCheckInput {
  description: string | null | undefined;
  areaId: string | null | undefined;
  address: string | null | undefined;
  houseRules: string | null | undefined;
  units: Array<{ maxGuests: number; nightlyRatePesewas: number }>;
  photos: Array<{ documentId: string }>;
}

export interface SubmissionCheckItem {
  id: string;
  label: string;
  complete: boolean;
}

/**
 * Mirrors server-side `BR-03` / `FR-16` submission completeness rules so owners get instant
 * live checklist feedback before submitting a listing for review.
 */
export function evaluateSubmissionChecklist(input: SubmissionCheckInput): SubmissionCheckItem[] {
  const hasDescription = Boolean(input.description && input.description.trim().length > 0);
  const hasArea = Boolean(input.areaId);
  const hasAddress = Boolean(input.address && input.address.trim().length > 0);
  const hasRules = Boolean(input.houseRules && input.houseRules.trim().length > 0);
  const hasValidUnits =
    input.units.length > 0 &&
    input.units.every((u) => u.maxGuests >= 1 && u.nightlyRatePesewas > 0);
  const hasPhotos = input.photos.length > 0;

  return [
    { id: 'description', label: 'Property description added', complete: hasDescription },
    { id: 'area', label: 'Takoradi pilot area selected', complete: hasArea },
    { id: 'address', label: 'Street address or landmark provided', complete: hasAddress },
    { id: 'rules', label: 'House rules provided', complete: hasRules },
    { id: 'units', label: 'At least one unit with capacity and nightly GHS price', complete: hasValidUnits },
    { id: 'photos', label: 'At least one property photo uploaded', complete: hasPhotos },
  ];
}

export function getPropertyStatusMeta(status: PropertyStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Active',
        badgeClass: 'bg-status-success-bg text-status-success-fg border-status-success-border',
      };
    case 'PENDING_REVIEW':
      return {
        label: 'Pending Review',
        badgeClass: 'bg-status-info-bg text-status-info-fg border-status-info-border',
      };
    case 'CORRECTIONS_REQUESTED':
      return {
        label: 'Corrections Requested',
        badgeClass: 'bg-status-warning-bg text-status-warning-fg border-status-warning-border',
      };
    case 'PAUSED':
      return {
        label: 'Paused',
        badgeClass: 'bg-sand/40 text-earth border-border-subtle',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        badgeClass: 'bg-status-error-bg text-status-error-fg border-status-error-border',
      };
    case 'SUSPENDED':
      return {
        label: 'Suspended',
        badgeClass: 'bg-status-error-bg text-status-error-fg border-status-error-border',
      };
    default:
      return {
        label: 'Draft',
        badgeClass: 'bg-surface-muted text-earth border-border-subtle',
      };
  }
}
