import type { AuditFilterParams } from './types';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const AUDIT_ENTITY_TYPES = [
  'USER',
  'ORGANIZATION',
  'VERIFICATION_CASE',
  'PROPERTY',
  'UNIT',
  'AVAILABILITY_BLOCK',
  'PLATFORM_SETTING',
] as const;

export const COMMON_AUDIT_ACTIONS = [
  'verification.approved',
  'verification.rejected',
  'verification.corrections_requested',
  'listing.approved',
  'listing.rejected',
  'listing.corrections_requested',
  'listing.suspended',
  'listing.restored',
  'user.suspended',
  'user.restored',
  'setting.updated',
] as const;

/** Formats a UTC ISO timestamp in Ghana time (`Africa/Accra`, GMT+0). */
export function formatAuditGhanaTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return `${new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(dt)} GMT`;
}

/** Extracts a concise human-readable reason or note from `metadata`, if present. */
export function extractAuditReason(metadata: Record<string, unknown> | null | undefined): string | null {
  if (!metadata) return null;
  for (const key of ['reason', 'notes', 'note', 'message']) {
    const val = metadata[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
  }
  return null;
}

/** Converts canonical dot-delimited audit actions into readable labels and status styling. */
export function getAuditActionMeta(action: string): { label: string; toneClass: string } {
  const normalized = action.toLowerCase();
  const label = normalized
    .split(/[._]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  if (normalized.includes('approved') || normalized.includes('restored')) {
    return {
      label,
      toneClass: 'bg-status-success-bg text-status-success-fg border-status-success-border',
    };
  }
  if (normalized.includes('rejected') || normalized.includes('suspended') || normalized.includes('deleted')) {
    return {
      label,
      toneClass: 'bg-status-error-bg text-status-error-fg border-status-error-border',
    };
  }
  if (normalized.includes('correction') || normalized.includes('paused')) {
    return {
      label,
      toneClass: 'bg-status-warning-bg text-status-warning-fg border-status-warning-border',
    };
  }
  return {
    label,
    toneClass: 'bg-status-info-bg text-status-info-fg border-status-info-border',
  };
}

/**
 * Builds query string parameters for `GET /api/v1/admin/audit-logs`, validating optional UUID
 * and converting Ghana calendar dates (`Africa/Accra`, GMT+0) to inclusive UTC instants.
 */
export function buildAuditSearchParams(
  filters: AuditFilterParams,
): { params: URLSearchParams; error: string | null } {
  const params = new URLSearchParams();

  if (filters.actorId && filters.actorId.trim()) {
    const cleanActor = filters.actorId.trim();
    if (!UUID_REGEX.test(cleanActor)) {
      return { params, error: 'Actor ID must be a valid UUID.' };
    }
    params.set('actorId', cleanActor);
  }

  if (filters.action && filters.action.trim()) {
    params.set('action', filters.action.trim());
  }

  if (filters.entityType && filters.entityType.trim()) {
    params.set('entityType', filters.entityType.trim());
  }

  if (filters.fromDate && filters.fromDate.trim()) {
    if (!DATE_REGEX.test(filters.fromDate.trim())) {
      return { params, error: 'From date must be in YYYY-MM-DD format.' };
    }
    params.set('from', `${filters.fromDate.trim()}T00:00:00Z`);
  }

  if (filters.toDate && filters.toDate.trim()) {
    if (!DATE_REGEX.test(filters.toDate.trim())) {
      return { params, error: 'To date must be in YYYY-MM-DD format.' };
    }
    params.set('to', `${filters.toDate.trim()}T23:59:59.999Z`);
  }

  if (filters.fromDate && filters.toDate && filters.toDate < filters.fromDate) {
    return { params, error: 'End date must be on or after start date.' };
  }

  params.set('limit', String(filters.limit ?? 25));
  params.set('offset', String(filters.offset ?? 0));

  return { params, error: null };
}
