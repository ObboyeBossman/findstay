package com.findstay.notification.api;

import java.util.Map;
import java.util.UUID;

/**
 * Public notification request payload for Extension Seam 4 (NotificationSender).
 * Allows cross-module callers to trigger in-app, email, and SMS notifications.
 */
public record NotificationRequest(
    UUID recipientId,
    String eventType,
    String title,
    String message,
    Map<String, Object> data,
    String recipientEmail,
    String recipientPhone
) {
    public NotificationRequest(UUID recipientId, String eventType, String title, String message, Map<String, Object> data) {
        this(recipientId, eventType, title, message, data, null, null);
    }

    public NotificationRequest(UUID recipientId, String eventType, String title, String message) {
        this(recipientId, eventType, title, message, Map.of(), null, null);
    }

    public NotificationRequest withEmail(String email) {
        return new NotificationRequest(recipientId, eventType, title, message, data, email, recipientPhone);
    }

    public NotificationRequest withPhone(String phone) {
        return new NotificationRequest(recipientId, eventType, title, message, data, recipientEmail, phone);
    }
}
