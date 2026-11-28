package com.findstay.notification.api;

import java.util.UUID;

/**
 * Public cross-module entry point for sending in-app, email, and SMS notifications (Extension Seam 4,
 * {@code S1-10-T3}). Other modules call this interface instead of touching notification internals.
 */
public interface NotificationSender {

    /**
     * Persists the in-app notification (if enabled) and dispatches configured outbound channels
     * (email, and SMS when enabled), logging delivery attempts and scheduling retries on failure.
     *
     * @return the persisted in-app notification ID, or {@code null} if IN_APP was opted out.
     */
    UUID send(NotificationRequest request);
}
