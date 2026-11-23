package com.findstay.notification.internal;

import jakarta.validation.constraints.NotBlank;

public record NotificationPreferenceDto(
    @NotBlank(message = "eventType must not be blank")
    String eventType,
    boolean emailEnabled,
    boolean smsEnabled,
    boolean inAppEnabled
) {
    public static NotificationPreferenceDto from(NotificationPreference preference) {
        return new NotificationPreferenceDto(
            preference.getEventType(),
            preference.isEmailEnabled(),
            preference.isSmsEnabled(),
            preference.isInAppEnabled()
        );
    }
}
