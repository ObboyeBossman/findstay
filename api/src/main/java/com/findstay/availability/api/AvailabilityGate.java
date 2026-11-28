package com.findstay.availability.api;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Extension Seam 1 — Availability Gate ({@code docs/rules/module-boundaries.md}, {@code S1-14-T3}).
 *
 * <p>Allows Sprint 2 {@code search} and {@code booking} modules to check unit availability without
 * touching {@code availability.internal}.
 */
public interface AvailabilityGate {

    /**
     * Returns {@code true} when {@code unitId} has no overlapping availability blocks in the
     * half-open UTC interval {@code [startAt, endAt)}.
     */
    boolean isUnitAvailable(UUID unitId, Instant startAt, Instant endAt);

    /**
     * Lists all availability blocks on {@code unitId} overlapping {@code [rangeStart, rangeEnd)}.
     */
    List<AvailabilityBlockView> listBlocksInRange(UUID unitId, Instant rangeStart, Instant rangeEnd);

    /**
     * Returns the subset of {@code unitIds} that have at least one overlapping block in
     * {@code [startAt, endAt)}.
     */
    Set<UUID> findBlockedUnitIds(Collection<UUID> unitIds, Instant startAt, Instant endAt);
}
