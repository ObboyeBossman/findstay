package com.findstay.shared.security;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * SPI through which the shared guard reads a signed-in user's account state from the database
 * (S1-06-T2). Implemented in {@code identity.internal}, so {@code shared} never imports identity.
 */
public interface PermissionLookup {

    /** The account's current role, status and permission codes, or empty when no local account exists. */
    Optional<AccountAccess> accessFor(UUID userId);

    /**
     * Account state resolved from {@code identity.user_account}, {@code identity.role} and
     * {@code identity.role_permission} on every request. Never taken from the client.
     */
    record AccountAccess(String roleCode, boolean suspended, Set<String> permissions) {

        public static final String ADMIN_ROLE = "ADMIN";

        public AccountAccess {
            permissions = Set.copyOf(permissions);
        }

        public boolean isAdmin() {
            return ADMIN_ROLE.equals(roleCode);
        }

        public boolean has(String permissionCode) {
            return permissions.contains(permissionCode);
        }
    }
}
