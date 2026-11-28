import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, RefreshCw, Sliders } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState, SkeletonList, useToast } from '../../components/ui';
import { ApiClientError } from '../../lib/api';
import { useAuth } from '../identity';
import { formatAccraDateTime } from '../organization';
import {
  emitNotificationsChanged,
  fetchNotificationPreferences,
  fetchNotifications,
  formatEventLabel,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from './api';
import type {
  NotificationChannel,
  NotificationItem,
  NotificationPreferenceItem,
} from './types';

type Tab = 'all' | 'unread' | 'preferences';

const CHANNELS: readonly NotificationChannel[] = ['IN_APP', 'EMAIL', 'SMS'];

/**
 * Notification Inbox & Channel Preferences screen (`/notifications`) — S1-10-T6.
 * Strictly uses FindStay design tokens and formats timestamps in `Africa/Accra`.
 */
export const NotificationsPage: React.FC = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const token = session?.access_token ?? '';

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<NotificationPreferenceItem[]>([]);
  const [smsChannelActive, setSmsChannelActive] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [inbox, prefs] = await Promise.all([
        fetchNotifications(token, 50, 0),
        fetchNotificationPreferences(token),
      ]);
      setItems(inbox.items);
      setUnreadCount(inbox.unreadCount);
      setPreferences(prefs.preferences);
      setSmsChannelActive(prefs.smsChannelActive);
      emitNotificationsChanged(inbox.unreadCount);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Unable to load notifications right now.',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedItems = useMemo(
    () => (activeTab === 'unread' ? items.filter((item) => item.readAt === null) : items),
    [activeTab, items],
  );

  const groupedPreferences = useMemo(() => {
    const map = new Map<string, Map<NotificationChannel, NotificationPreferenceItem>>();
    for (const pref of preferences) {
      const row = map.get(pref.eventType) ?? new Map<NotificationChannel, NotificationPreferenceItem>();
      row.set(pref.channel, pref);
      map.set(pref.eventType, row);
    }
    return Array.from(map.entries());
  }, [preferences]);

  const handleMarkOne = async (id: string) => {
    if (!token) return;
    setMarkingId(id);
    try {
      const updated = await markNotificationRead(token, id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      const nextUnread = Math.max(0, unreadCount - 1);
      setUnreadCount(nextUnread);
      emitNotificationsChanged(nextUnread);
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Could not update alert',
        message: err instanceof ApiClientError ? err.message : 'Please try again.',
      });
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAll = async () => {
    if (!token || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      const res = await markAllNotificationsRead(token);
      const nowIso = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) => (item.readAt ? item : { ...item, readAt: nowIso })),
      );
      setUnreadCount(res.unreadCount);
      emitNotificationsChanged(res.unreadCount);
      showToast({
        variant: 'success',
        title: 'All notifications marked as read',
      });
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Could not mark all as read',
        message: err instanceof ApiClientError ? err.message : 'Please try again.',
      });
    } finally {
      setMarkingAll(false);
    }
  };

  const handleTogglePreference = async (
    eventType: string,
    channel: NotificationChannel,
    currentEnabled: boolean,
  ) => {
    if (!token) return;
    setSavingPrefs(true);
    try {
      const updated = await updateNotificationPreferences(token, [
        { eventType, channel, enabled: !currentEnabled },
      ]);
      setPreferences(updated.preferences);
      setSmsChannelActive(updated.smsChannelActive);
      showToast({
        variant: 'success',
        title: 'Preference saved',
        message: `${formatEventLabel(eventType)} (${channel}) ${!currentEnabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Could not save preference',
        message: err instanceof ApiClientError ? err.message : 'Please try again.',
      });
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading notifications">
        <SkeletonList count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-2xl border border-status-error-border bg-surface-card p-6">
        <StatusBadge variant="error" label="Could not load notifications" />
        <p className="text-body-2 text-earth/80">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex min-h-touch items-center gap-2 rounded-lg bg-olive px-4 py-2 text-caption font-semibold text-ivory hover:bg-olive-hover"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-olive">
            Alerts &amp; Inbox
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-heading-3 font-bold text-earth">
              Notifications
            </h1>
            <StatusBadge
              variant={unreadCount > 0 ? 'info' : 'success'}
              label={unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up'}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={unreadCount === 0 || markingAll}
          onClick={handleMarkAll}
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-card px-4 py-2 text-caption font-semibold text-earth transition-colors hover:bg-surface-hover disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" aria-hidden="true" />
          <span>{markingAll ? 'Marking…' : 'Mark all as read'}</span>
        </button>
      </header>

      <div
        role="tablist"
        aria-label="Notification views"
        className="flex flex-wrap gap-2 border-b border-border-subtle pb-3"
      >
        {(
          [
            { id: 'all', label: `All (${items.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'preferences', label: 'Channel Preferences' },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-h-touch items-center gap-1.5 rounded-xl px-4 py-2 text-caption font-semibold transition-colors ${
                active
                  ? 'bg-olive text-ivory'
                  : 'bg-surface-muted text-earth hover:bg-surface-hover'
              }`}
            >
              {tab.id === 'preferences' ? (
                <Sliders className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Bell className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'preferences' ? (
        <section
          aria-label="Notification channel preferences"
          className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6"
        >
          {!smsChannelActive ? (
            <div className="rounded-xl border border-status-info-border bg-status-info-bg p-4 text-caption text-status-info-fg">
              SMS alerts are currently in fallback mode pending sender-ID activation; alerts are
              delivered reliably via In-App Inbox and Email.
            </div>
          ) : null}

          <div className="space-y-3">
            {groupedPreferences.map(([eventType, channelMap]) => (
              <div
                key={eventType}
                className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-earth">{formatEventLabel(eventType)}</p>
                  <p className="font-mono text-micro text-earth/60">{eventType}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((channel) => {
                    const item = channelMap.get(channel);
                    if (!item) return null;
                    return (
                      <button
                        key={channel}
                        type="button"
                        disabled={savingPrefs}
                        aria-pressed={item.enabled}
                        onClick={() =>
                          handleTogglePreference(eventType, channel, item.enabled)
                        }
                        className={`inline-flex min-h-touch items-center gap-1.5 rounded-lg border px-3 py-1.5 text-caption font-semibold transition-colors disabled:opacity-60 ${
                          item.enabled
                            ? 'border-olive bg-olive text-ivory hover:bg-olive-hover'
                            : 'border-border-subtle bg-surface-card text-earth hover:bg-surface-hover'
                        }`}
                      >
                        <span>{channel === 'IN_APP' ? 'In-App' : channel}</span>
                        <span>{item.enabled ? 'On' : 'Off'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : displayedItems.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description={
            activeTab === 'unread'
              ? 'You have no unread notifications right now.'
              : 'Account, verification, listing, and team alerts will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {displayedItems.map((item) => {
            const isUnread = item.readAt === null;
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
                  isUnread
                    ? 'border-olive bg-surface-card shadow-sm'
                    : 'border-border-subtle bg-surface-muted/50'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {isUnread ? (
                        <StatusBadge variant="info" label="Unread" />
                      ) : (
                        <StatusBadge variant="success" label="Read" />
                      )}
                      <span className="text-caption font-medium text-earth/70">
                        {formatEventLabel(item.eventType)}
                      </span>
                    </div>
                    <h2 className="font-display text-subtitle font-bold text-earth">
                      {item.title}
                    </h2>
                    <p className="text-body-2 text-earth/80">{item.body}</p>
                    <p className="text-caption text-earth/60">
                      {formatAccraDateTime(item.createdAt)}
                    </p>
                  </div>

                  {isUnread ? (
                    <button
                      type="button"
                      disabled={markingId === item.id}
                      onClick={() => handleMarkOne(item.id)}
                      className="inline-flex min-h-touch shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-3.5 py-2 text-caption font-semibold text-earth hover:bg-surface-hover disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>{markingId === item.id ? 'Saving…' : 'Mark as read'}</span>
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
