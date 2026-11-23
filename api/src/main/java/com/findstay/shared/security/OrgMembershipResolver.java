package com.findstay.shared.security;

import java.util.List;
import java.util.UUID;

/**
 * SPI implemented by the {@code organization} module to resolve an authenticated user's
 * organisation memberships and property permissions from PostgreSQL without exposing
 * {@code organization.internal} to other modules ({@code S1-07-T5}, {@code C5}).
 */
public interface OrgMembershipResolver {

    List<OrgMembership> findMembershipsForUser(UUID userId);
}
