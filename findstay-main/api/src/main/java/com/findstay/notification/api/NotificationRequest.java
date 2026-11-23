package com.findstay.notification.api;

import java.util.Map;
import java.util.UUID;

public record NotificationRequest(
    UUID recipientId,
    String eventType,
    String title,
    String message,
    Map<String, Object> data
) {
    public NotificationRequest(UUID recipientId, String eventType, String title, String message) {
        this(recipientId, eventType, title, message, Map.of());
    }
}
