package com.findstay.listing.api;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Extension Seam 2 — Listing Lookup Seam ({@code docs/rules/module-boundaries.md}, {@code S1-13-T4}).
 *
 * <p>Provides read-only access to published listings and unit ownership metadata for
 * {@code availability} ({@code S1-14}) and Sprint 2 {@code search}/{@code booking} without touching
 * {@code listing.internal}.
 */
public interface CatalogQuery {

    /** Returns published {@code ACTIVE} listings filtered by optional town, area, and GHS pesewa band. */
    List<PublicListingProjection> listActiveListings(
            String town,
            String areaName,
            Long minPesewas,
            Long maxPesewas
    );

    /** Returns an {@code ACTIVE} public listing projection by property ID, if published. */
    Optional<PublicListingProjection> findActiveListingByPropertyId(UUID propertyId);

    /** Resolves a unit and its owning {@code organizationId}/{@code propertyId} for {@code OrgScope} checks. */
    Optional<UnitSummaryView> findUnitById(UUID unitId);

    /** Lists all units belonging to a property with their active nightly GHS pesewa rate. */
    List<UnitSummaryView> listUnitsForProperty(UUID propertyId);
}
