package com.findstay.shared.security;

import com.findstay.shared.error.AppException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Shared multi-tenant isolation helper ({@code S1-07-T5}, {@code J-06}, {@code BRL-04}).
 *
 * <p>Security rules enforced:
 * <ol>
 *   <li>Never trusts a client-supplied {@code organizationId} as authority — always derives
 *       memberships from PostgreSQL using the verified JWT {@code sub} UUID.</li>
 *   <li>Throws {@code 403 FORBIDDEN} when the authenticated caller has no active organisation
 *       membership.</li>
 *   <li>Throws {@code 404 NOT_FOUND} when a caller with an active organisation attempts to read
 *       or mutate a record belonging to another organisation (preventing existence leaks).</li>
 *   <li>For {@code STAFF} memberships, enforces per-property access from
 *       {@code organization.membership_permission}.</li>
 * </ol>
 */
@Component
public class OrgScope {

    private final OrgMembershipResolver membershipResolver;

    public OrgScope(OrgMembershipResolver membershipResolver) {
        this.membershipResolver = membershipResolver;
    }

    public static UUID requireUserId(Jwt jwt) {
        String sub = jwt != null ? jwt.getSubject() : null;
        if (sub == null || sub.isBlank()) {
            throw AppException.unauthenticated("Missing token subject");
        }
        try {
            return UUID.fromString(sub);
        } catch (IllegalArgumentException ex) {
            throw AppException.unauthenticated("Invalid token subject");
        }
    }

    public List<OrgMembership> listMemberships(Jwt jwt) {
        return listMemberships(requireUserId(jwt));
    }

    public List<OrgMembership> listMemberships(UUID userId) {
        return membershipResolver.findMembershipsForUser(userId);
    }

    /**
     * Resolves the caller's primary active organisation membership from PostgreSQL, or throws
     * {@code 403 FORBIDDEN} if the caller does not belong to any organisation.
     */
    public OrgMembership requireActive(Jwt jwt) {
        return requireActive(requireUserId(jwt));
    }

    public OrgMembership requireActive(UUID userId) {
        List<OrgMembership> memberships = membershipResolver.findMembershipsForUser(userId);
        if (memberships.isEmpty()) {
            throw AppException.forbidden("You do not belong to an active organization");
        }
        return memberships.getFirst();
    }

    /**
     * Resolves the caller's active membership and requires {@link OrgRole#OWNER} role
     * ({@code 403 FORBIDDEN} if {@code STAFF} or not a member).
     */
    public OrgMembership requireOwner(Jwt jwt) {
        return requireOwner(requireUserId(jwt));
    }

    public OrgMembership requireOwner(UUID userId) {
        OrgMembership membership = requireActive(userId);
        membership.requireOwner();
        return membership;
    }

    /**
     * Verifies the caller belongs to {@code targetOrganizationId}. Throws {@code 403 FORBIDDEN}
     * if the caller has no organisation membership at all, or {@code 404 NOT_FOUND} if the caller
     * belongs to a different organisation.
     */
    public OrgMembership requireOrganization(Jwt jwt, UUID targetOrganizationId) {
        return requireOrganization(requireUserId(jwt), targetOrganizationId);
    }

    public OrgMembership requireOrganization(UUID userId, UUID targetOrganizationId) {
        List<OrgMembership> memberships = membershipResolver.findMembershipsForUser(userId);
        if (memberships.isEmpty()) {
            throw AppException.forbidden("You do not belong to an active organization");
        }
        if (targetOrganizationId == null) {
            throw AppException.notFound("Organization", "null");
        }
        return memberships.stream()
                .filter(m -> targetOrganizationId.equals(m.organizationId()))
                .findFirst()
                .orElseThrow(() -> AppException.notFound("Organization", targetOrganizationId));
    }

    /**
     * Verifies that a property-scoped resource belongs to the caller's organisation
     * ({@code 404 NOT_FOUND} on cross-org access) and that the caller has permission for
     * {@code propertyId} ({@code 403 FORBIDDEN} if a staff member is not granted that property).
     */
    public OrgMembership requirePropertyAccess(
            Jwt jwt,
            UUID resourceOrganizationId,
            UUID propertyId,
            String resourceName) {
        return requirePropertyAccess(requireUserId(jwt), resourceOrganizationId, propertyId, resourceName);
    }

    public OrgMembership requirePropertyAccess(
            UUID userId,
            UUID resourceOrganizationId,
            UUID propertyId,
            String resourceName) {
        OrgMembership membership = requireOrganization(userId, resourceOrganizationId);
        membership.verifyResourceOrganization(resourceOrganizationId, resourceName, propertyId);
        membership.requirePropertyAccess(propertyId);
        return membership;
    }
}
