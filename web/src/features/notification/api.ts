import { apiFetch } from '../../lib/api';
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationPreferenceItem,
  NotificationPreferencesResponse,
  ReadAllResponse,
} from './types';

export const NOTIFICATIONS_CHANGED_EVENT = 'findstay-notifications-changed';

export function emitNotificationsChanged(unreadCount?: number): void {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, { detail: { unreadCount } }),
  );
}

export function fetchNotifications(
  accessToken: string,
  limit = 20,
  offset = 0,
): Promise<NotificationListResponse> {
  return apiFetch<NotificationListResponse>(
    `/me/notifications?limit=${limit}&offset=${offset}`,
    { accessToken },
  );
}

export function markNotificationRead(
  accessToken: string,
  id: string,
): Promise<NotificationItem> {
  return apiFetch<NotificationItem>(`/me/notifications/${encodeURIComponent(id)}/read`, {
    method: 'POST',
    accessToken,
  });
}

export function markAllNotificationsRead(accessToken: string): Promise<ReadAllResponse> {
  return apiFetch<ReadAllResponse>('/me/notifications/read-all', {
    method: 'POST',
    accessToken,
  });
}

export function fetchNotificationPreferences(
  accessToken: string,
): Promise<NotificationPreferencesResponse> {
  return apiFetch<NotificationPreferencesResponse>('/me/notifications/preferences', {
    accessToken,
  });
}

export function updateNotificationPreferences(
  accessToken: string,
  preferences: NotificationPreferenceItem[],
): Promise<NotificationPreferencesResponse> {
  return apiFetch<NotificationPreferencesResponse>('/me/notifications/preferences', {
    method: 'PUT',
    accessToken,
    body: JSON.stringify({ preferences }),
  });
}

export { formatBadgeCount, formatEventLabel } from './formatters';
