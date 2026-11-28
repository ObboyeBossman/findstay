package com.findstay.availability.api;

/**
 * Reason codes for {@code availability.availability_block} (Extension Seam 1).
 *
 * <p>Sprint 1 persists only {@link #OWNER_BLOCK}; Sprint 2 widens the database CHECK constraint
 * additively to add {@code HOLD} and {@code BOOKING}.
 */
public enum AvailabilityBlockReason {
    OWNER_BLOCK
}
