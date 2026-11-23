package com.findstay.organization.api;

import java.time.Instant;
import java.util.UUID;

/**
 * Public projection of an owner organisation ({@code S1-07-T3}, {@code J-06}).
 */
public record OrganizationSummary(
        UUID id,
        String name,
        String displayName,
        String contactEmail,
        String contactPhone,
        String verificationStatus,
        Instant createdAt
) {
}
