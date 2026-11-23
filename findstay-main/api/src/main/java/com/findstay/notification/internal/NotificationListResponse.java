package com.findstay.notification.internal;

import java.util.List;

public record NotificationListResponse(
    List<NotificationResponse> items,
    long total,
    long unreadCount
) {}
