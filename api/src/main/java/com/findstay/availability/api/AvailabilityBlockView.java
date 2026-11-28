package com.findstay.availability.api;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Public read projection of a unit availability block ({@code S1-14-T3}).
 */
public record AvailabilityBlockView(
        UUID id,
        UUID unitId,
        Instant start,
        Instant end,
        LocalDate startDate,
        LocalDate endDate,
        AvailabilityBlockReason reason,
        UUID createdByUserId,
        Instant createdAt
) {
}
