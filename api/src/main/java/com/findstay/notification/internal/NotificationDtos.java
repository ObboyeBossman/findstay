package com.findstay.notification.internal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Request and response payloads for {@code /api/v1/me/notifications} ({@code S1-10-T5}). */
final class NotificationDtos {

    private NotificationDtos() {
    }

    record NotificationItemResponse(
            UUID id,
            String eventType,
            String title,
            String body,
            Map<String, Object> data,
            Instant readAt,
            Instant createdAt
    ) {
    }

    record NotificationListResponse(
            List<NotificationItemResponse> items,
            long unreadCount,
            long total,
            int limit,
            int offset
    ) {
    }

    record ReadAllResponse(
            int updatedCount,
            long unreadCount
    ) {
    }

    record PreferenceItem(
            @NotBlank(message = "eventType is required")
            String eventType,
            @NotBlank(message = "channel is required")
            @Pattern(regexp = "^(IN_APP|EMAIL|SMS)$", message = "channel must be IN_APP, EMAIL, or SMS")
            String channel,
            @NotNull(message = "enabled is required")
            Boolean enabled
    ) {
    }

    record PreferencesResponse(
            List<PreferenceItem> preferences,
            boolean smsChannelActive
    ) {
    }

    record UpdatePreferencesRequest(
            @NotNull(message = "preferences list is required")
            @Valid
            List<PreferenceItem> preferences
    ) {
    }
}
