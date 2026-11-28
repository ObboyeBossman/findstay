package com.findstay.listing.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Denormalised public listing projection returned by Extension Seam 2 ({@link CatalogQuery}) so
 * Sprint 2 search/booking never joins across {@code listing.internal}.
 */
public record PublicListingProjection(
        UUID listingId,
        UUID propertyId,
        String name,
        String description,
        String town,
        String areaName,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        String accommodationTypeCode,
        List<String> amenities,
        String houseRules,
        String coverPhotoUrl,
        long fromPricePesewas,
        String currency,
        boolean ownerVerified,
        String status,
        Instant publishedAt
) {
}
