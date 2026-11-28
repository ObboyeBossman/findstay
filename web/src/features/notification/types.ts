export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS';

export type NotificationItem = {
  id: string;
  eventType: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListResponse = {
  items: NotificationItem[];
  unreadCount: number;
  total: number;
  limit: number;
  offset: number;
};

export type ReadAllResponse = {
  updatedCount: number;
  unreadCount: number;
};

export type NotificationPreferenceItem = {
  eventType: string;
  channel: NotificationChannel;
  enabled: boolean;
};

export type NotificationPreferencesResponse = {
  preferences: NotificationPreferenceItem[];
  smsChannelActive: boolean;
};
