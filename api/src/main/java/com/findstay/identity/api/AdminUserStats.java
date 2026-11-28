package com.findstay.identity.api;

public record AdminUserStats(
        long totalUsers,
        long activeUsers,
        long suspendedUsers
) {
}
