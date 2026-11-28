package com.findstay.shared.security;

import com.findstay.shared.error.AppException;

import java.util.Set;
import java.util.UUID;

/**
 * Resolved organisation membership context for an authenticated caller ({@code S1-07-T5}, {@code J-06}).
 *
 * @param organizationId   the caller's verified organisation UUID from PostgreSQL
 * @param organizationName the organisation's display name
 * @param role             {@link OrgRole#OWNER} or {@link OrgRole#STAFF}
 * @param primaryOwner     true when this membership is the primary owner of the organisation
 * @param propertyIds      granted property UUIDs for {@code STAFF} memberships (empty/unused for {@code OWNER})
 */
public record OrgMembership(
        UUID organizationId,
        String organizationName,
        OrgRole role,
        boolean primaryOwner,
        Set<UUID> propertyIds
) {

    public OrgMembership {
        propertyIds = propertyIds == null ? Set.of() : Set.copyOf(propertyIds);
    }

    public boolean isOwner() {
        return role == OrgRole.OWNER;
    }

    /**
     * Owners may access every property in their organisation; staff may access only properties
     * explicitly granted in {@code organization.membership_permission} ({@code UR-PS01}, {@code UR-PM03}).
     */
    public boolean canAccessProperty(UUID propertyId) {
        return isOwner() || (propertyId != null && propertyIds.contains(propertyId));
    }

    public void requireOwner() {
        if (!isOwner()) {
            throw AppException.forbidden("Only an organization owner may perform this action");
        }
    }

    public void requirePropertyAccess(UUID propertyId) {
        if (!canAccessProperty(propertyId)) {
            throw AppException.forbidden("You do not have permission to access this property");
        }
    }

    /**
     * Enforces cross-organisation tenant isolation ({@code BRL-04}, {@code NFR-24}):
     * returns {@code 404 NOT_FOUND} when a record belongs to another organisation so existence is never leaked.
     */
    public void verifyResourceOrganization(UUID resourceOrganizationId, String resourceName, Object resourceId) {
        if (resourceOrganizationId == null || !organizationId.equals(resourceOrganizationId)) {
            throw AppException.notFound(resourceName, resourceId);
        }
    }
}
