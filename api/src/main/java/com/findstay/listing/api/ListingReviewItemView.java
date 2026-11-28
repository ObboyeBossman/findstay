package com.findstay.listing.api;

import java.time.Instant;
import java.util.UUID;

/** Summary projection of a property used by the Admin Review Queue ({@code S1-15}). */
public record ListingReviewItemView(
        UUID propertyId,
        UUID organizationId,
        String name,
        String description,
        String town,
        String areaName,
        String address,
        String accommodationTypeCode,
        String houseRules,
        PropertyStatus status,
        int unitCount,
        Long fromPricePesewas,
        int photoCount,
        String coverPhotoUrl,
        Instant updatedAt
) {
}
