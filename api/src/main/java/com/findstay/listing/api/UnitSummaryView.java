package com.findstay.listing.api;

import java.util.UUID;

/** Public projection of a rentable unit for {@code availability} ({@code S1-14}) and Sprint 2 booking. */
public record UnitSummaryView(
        UUID unitId,
        UUID propertyId,
        UUID organizationId,
        String name,
        String category,
        int maxGuests,
        int quantity,
        long nightlyRatePesewas,
        String currency
) {
}
