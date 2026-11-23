package com.findstay.notification.internal;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    UUID recipientId,
    String eventType,
    String title,
    String message,
    String data,
    @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "UTC")
    Instant readAt,
    @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "UTC")
    Instant createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getRecipientId(),
            notification.getEventType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getData(),
            notification.getReadAt(),
            notification.getCreatedAt()
        );
    }
}
