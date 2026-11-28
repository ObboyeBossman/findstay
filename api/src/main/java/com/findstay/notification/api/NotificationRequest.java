package com.findstay.notification.api;

import java.util.Map;
import java.util.UUID;

/**
 * Cross-module notification payload for Extension Seam 4 ({@link NotificationSender}, {@code S1-10-T3}).
 * Callers pass an {@code eventType} matching {@code notification.notification_template} and template
 * variables; fallback title/body are used if no active template exists.
 */
public record NotificationRequest(
        UUID recipientId,
        String eventType,
        String fallbackTitle,
        String fallbackBody,
        Map<String, Object> variables,
        Map<String, Object> data,
        String recipientEmail,
        String recipientPhone
) {
    public NotificationRequest(
            UUID recipientId,
            String eventType,
            String fallbackTitle,
            String fallbackBody,
            Map<String, Object> variables,
            String recipientEmail,
            String recipientPhone) {
        this(
                recipientId,
                eventType,
                fallbackTitle,
                fallbackBody,
                variables == null ? Map.of() : Map.copyOf(variables),
                variables == null ? Map.of() : Map.copyOf(variables),
                recipientEmail,
                recipientPhone);
    }

    public NotificationRequest(
            UUID recipientId,
            String eventType,
            String fallbackTitle,
            String fallbackBody) {
        this(recipientId, eventType, fallbackTitle, fallbackBody, Map.of(), Map.of(), null, null);
    }
}
