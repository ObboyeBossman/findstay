package com.findstay.listing.api;

/** Matches {@code listing.property.status}. */
public enum PropertyStatus {
    DRAFT,
    PENDING_REVIEW,
    CORRECTIONS_REQUESTED,
    ACTIVE,
    PAUSED,
    SUSPENDED,
    REJECTED
}
