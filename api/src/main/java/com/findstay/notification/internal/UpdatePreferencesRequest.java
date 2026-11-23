package com.findstay.notification.internal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdatePreferencesRequest(
    @NotNull(message = "preferences must not be null")
    @Valid
    List<NotificationPreferenceDto> preferences
) {}
