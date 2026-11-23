package com.findstay.notification.internal;

import java.util.List;

public record NotificationPreferencesResponse(
    List<NotificationPreferenceDto> preferences
) {}
