import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../identity';
import {
  fetchNotifications,
  formatBadgeCount,
  NOTIFICATIONS_CHANGED_EVENT,
} from './api';

/**
 * Live Notification Bell with unread count badge (`S1-10-T6`).
 * Hidden for unauthenticated users or accounts without `notification.read`.
 */
export const NotificationBell: React.FC = () => {
  const { session, hasPermission } = useAuth();
  const token = session?.access_token ?? '';
  const canRead = Boolean(token) && hasPermission('notification.read');

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!canRead) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    const refresh = () => {
      fetchNotifications(token, 1, 0)
        .then((res) => {
          if (!cancelled) setUnreadCount(res.unreadCount);
        })
        .catch(() => {
          // Keep last known count on transient network issues
        });
    };

    refresh();

    const handleChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ unreadCount?: number }>).detail;
      if (typeof detail?.unreadCount === 'number') {
        setUnreadCount(detail.unreadCount);
      } else {
        refresh();
      }
    };

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleChanged);
    };
  }, [canRead, token]);

  if (!canRead) {
    return null;
  }

  const badgeText = formatBadgeCount(unreadCount);
  const ariaLabel =
    unreadCount > 99
      ? 'Notifications (more than 99 unread)'
      : unreadCount > 0
        ? `Notifications (${unreadCount} unread)`
        : 'Notifications';

  return (
    <NavLink
      to="/notifications"
      aria-label={ariaLabel}
      className={({ isActive }) =>
        `group relative inline-flex min-h-touch min-w-touch items-center justify-center rounded-2xl transition-colors lg:min-h-rail lg:min-w-rail ${
          isActive
            ? 'bg-olive text-ivory'
            : 'text-earth/70 hover:bg-surface-hover/50 hover:text-earth'
        }`
      }
    >
      <Bell className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden="true" />
      {badgeText ? (
        <span className="absolute right-1 top-1 rounded-full bg-terracotta-dark px-1.5 py-0.5 text-nano font-bold text-ivory">
          {badgeText}
        </span>
      ) : null}
      <span className="sr-only">{ariaLabel}</span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        Notifications{badgeText ? ` (${badgeText})` : ''}
      </span>
    </NavLink>
  );
};
