package com.findstay.identity.api;

import java.time.Instant;
import java.util.UUID;

/**
 * Public admin projection of a user account + profile ({@code S1-16-T3}).
 */
public record AdminUserView(
        UUID id,
        String email,
        String displayName,
        String phone,
        String roleCode,
        String status,
        Instant suspendedAt,
        String suspensionReason,
        Instant createdAt
) {
}
