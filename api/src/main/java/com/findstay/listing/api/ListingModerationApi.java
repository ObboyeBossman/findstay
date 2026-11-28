package com.findstay.listing.api;

import java.util.List;
import java.util.UUID;

/**
 * Public moderation seam of the {@code listing} module, consumed by {@code admin} ({@code S1-15})
 * to approve, request corrections, reject, suspend, or restore listings without importing
 * {@code listing.internal}.
 */
public interface ListingModerationApi {

    List<ListingReviewItemView> listPropertiesForReview(PropertyStatus status);

    ListingReviewItemView getPropertyForReview(UUID propertyId);

    ListingReviewItemView approveAndPublish(UUID propertyId, UUID adminUserId, String note);

    ListingReviewItemView requestCorrections(UUID propertyId, UUID adminUserId, String reason);

    ListingReviewItemView rejectListing(UUID propertyId, UUID adminUserId, String reason);

    ListingReviewItemView suspendListing(UUID propertyId, UUID adminUserId, String reason);

    ListingReviewItemView restoreListing(UUID propertyId, UUID adminUserId, String reason);
}
