import type { ReviewDecisionType } from './types';

/**
 * Validates admin review decisions client-side before sending to `POST /api/v1/admin/reviews/{kind}/{id}/decision`.
 * Mirrors server-side `422 BUSINESS_RULE_VIOLATION` rules (`FR-88`, `S1-15`).
 */
export function validateReviewDecision(
  decision: ReviewDecisionType,
  reason: string,
  correctionLines: string[],
): string | null {
  const cleanReason = reason.trim();
  const cleanCorrections = correctionLines.map((c) => c.trim()).filter(Boolean);

  if (decision === 'REJECT' && cleanReason.length === 0) {
    return 'A written reason is required when rejecting a submission.';
  }
  if (decision === 'REQUEST_CORRECTIONS' && cleanReason.length === 0 && cleanCorrections.length === 0) {
    return 'Specify a written reason or at least one fix item when requesting corrections.';
  }
  return null;
}

/** Validates mandatory written reason for listing suspension or restoration. */
export function validateModerationReason(reason: string): string | null {
  if (!reason.trim()) {
    return 'A written reason is mandatory for listing suspension or restoration.';
  }
  return null;
}

/** Splits newline-separated admin fix instructions into clean items. */
export function parseCorrectionLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getReviewStatusBadge(status: string): { label: string; badgeClass: string } {
  switch (status) {
    case 'APPROVED':
    case 'ACTIVE':
      return {
        label: status === 'ACTIVE' ? 'Published' : 'Approved',
        badgeClass: 'bg-status-success-bg text-status-success-fg border-status-success-border',
      };
    case 'PENDING':
    case 'PENDING_REVIEW':
      return {
        label: 'Pending Review',
        badgeClass: 'bg-status-info-bg text-status-info-fg border-status-info-border',
      };
    case 'PARTIALLY_REJECTED':
    case 'CORRECTIONS_REQUESTED':
      return {
        label: 'Corrections Requested',
        badgeClass: 'bg-status-warning-bg text-status-warning-fg border-status-warning-border',
      };
    case 'REJECTED':
    case 'SUSPENDED':
      return {
        label: status === 'SUSPENDED' ? 'Suspended' : 'Rejected',
        badgeClass: 'bg-status-error-bg text-status-error-fg border-status-error-border',
      };
    case 'PAUSED':
      return {
        label: 'Paused',
        badgeClass: 'bg-sand/40 text-earth border-border-subtle',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-surface-muted text-earth border-border-subtle',
      };
  }
}
