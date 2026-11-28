package com.findstay.organization.api;

import com.findstay.shared.security.OrgMembership;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Public API boundary of the {@code organization} module ({@code S1-07-T3}, {@code S1-07-T5}, {@code C5}).
 *
 * <p>Allows {@code identity} (e.g. {@code GET /api/v1/me} or owner onboarding) and other modules to
 * ensure an owner's company space exists or read memberships without importing {@code organization.internal}.
 */
public interface OrganizationAccessApi {

    /**
     * Idempotently ensures the owner has an active company space ({@code organization.organization})
     * and primary {@code OWNER} membership ({@code organization.membership}).
     */
    OrganizationSummary ensureOwnerOrganization(UUID userId, String email, String fullName, String phone);

    /**
     * Returns all active organisation memberships and granted property IDs for the given user.
     */
    List<OrgMembership> findMembershipsByUserId(UUID userId);

    /** Looks up an organisation summary by its ID. */
    Optional<OrganizationSummary> findOrganizationById(UUID organizationId);

    /** Updates the denormalised {@code organization.verification_status} after submission or admin review. */
    void updateVerificationStatus(UUID organizationId, String verificationStatus);

    /** Returns the primary OWNER user ID of an organisation for lifecycle notifications. */
    Optional<UUID> findPrimaryOwnerUserId(UUID organizationId);
}
