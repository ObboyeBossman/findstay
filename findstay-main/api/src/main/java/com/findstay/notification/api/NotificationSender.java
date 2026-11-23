package com.findstay.notification.api;

/**
 * Public extension seam for cross-module notification dispatching.
 * Allows other Sprint 1 and future Sprint modules to trigger notifications
 * without depending on notification internals.
 */
public interface NotificationSender {
    void send(NotificationRequest request);
}
