import { apiFetch } from '../../lib/api';
import type {
  AdminDashboardResponse,
  AdminUserItem,
  AdminUserPageResponse,
  CreateAdminUserPayload,
  PlatformSettingItem,
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

export function fetchAdminDashboard(accessToken: string): Promise<AdminDashboardResponse> {
  return apiFetch<AdminDashboardResponse>('/admin/dashboard', { accessToken });
}

export function fetchAdminUsers(
  accessToken: string,
  options: { q?: string; status?: string; limit?: number; offset?: number } = {},
): Promise<AdminUserPageResponse> {
  const params = new URLSearchParams();
  if (options.q && options.q.trim()) params.set('q', options.q.trim());
  if (options.status && options.status !== 'ALL') params.set('status', options.status);
  params.set('limit', String(options.limit ?? 20));
  params.set('offset', String(options.offset ?? 0));
  return apiFetch<AdminUserPageResponse>(`/admin/users?${params.toString()}`, { accessToken });
}

export function createAdminUser(
  accessToken: string,
  payload: CreateAdminUserPayload,
): Promise<AdminUserItem> {
  return apiFetch<AdminUserItem>('/admin/users', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function suspendAdminUser(
  accessToken: string,
  userId: string,
  reason: string,
): Promise<AdminUserItem> {
  return apiFetch<AdminUserItem>(`/admin/users/${encodeURIComponent(userId)}/suspend`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ reason }),
  });
}

export function restoreAdminUser(
  accessToken: string,
  userId: string,
  note?: string,
): Promise<AdminUserItem> {
  return apiFetch<AdminUserItem>(`/admin/users/${encodeURIComponent(userId)}/restore`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ note: note?.trim() || undefined }),
  });
}

export function fetchPlatformSettings(accessToken: string): Promise<PlatformSettingItem[]> {
  return apiFetch<PlatformSettingItem[]>('/admin/settings', { accessToken });
}

export function updatePlatformSetting(
  accessToken: string,
  key: string,
  value: string,
): Promise<PlatformSettingItem> {
  return apiFetch<PlatformSettingItem>(`/admin/settings/${encodeURIComponent(key)}`, {
    method: 'PUT',
    accessToken,
    body: JSON.stringify({ value }),
  });
}
