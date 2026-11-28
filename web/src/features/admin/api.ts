import { apiFetch } from '../../lib/api';
import type {
  ReviewDecisionPayload,
  ReviewDetailResponse,
  ReviewEntityKind,
  ReviewQueueItem,
  ReviewQueueStatusTab,
} from './types';

export function fetchAdminReviewQueue(
  accessToken: string,
  options: { kind?: 'ALL' | ReviewEntityKind; status?: ReviewQueueStatusTab } = {},
): Promise<ReviewQueueItem[]> {
  const params = new URLSearchParams();
  if (options.kind && options.kind !== 'ALL') {
    params.set('kind', options.kind);
  }
  params.set('status', options.status ?? 'PENDING');
  return apiFetch<ReviewQueueItem[]>(`/admin/reviews?${params.toString()}`, { accessToken });
}

export function fetchAdminReviewDetail(
  accessToken: string,
  kind: ReviewEntityKind,
  id: string,
): Promise<ReviewDetailResponse> {
  return apiFetch<ReviewDetailResponse>(
    `/admin/reviews/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`,
    { accessToken },
  );
}

export function submitAdminReviewDecision(
  accessToken: string,
  kind: ReviewEntityKind,
  id: string,
  payload: ReviewDecisionPayload,
): Promise<ReviewDetailResponse> {
  return apiFetch<ReviewDetailResponse>(
    `/admin/reviews/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/decision`,
    {
      method: 'POST',
      accessToken,
      body: JSON.stringify(payload),
    },
  );
}

export function suspendAdminListing(
  accessToken: string,
  propertyId: string,
  reason: string,
): Promise<ReviewDetailResponse> {
  return apiFetch<ReviewDetailResponse>(
    `/admin/listings/${encodeURIComponent(propertyId)}/suspend`,
    {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ reason }),
    },
  );
}

export function restoreAdminListing(
  accessToken: string,
  propertyId: string,
  reason: string,
): Promise<ReviewDetailResponse> {
  return apiFetch<ReviewDetailResponse>(
    `/admin/listings/${encodeURIComponent(propertyId)}/restore`,
    {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ reason }),
    },
  );
}
