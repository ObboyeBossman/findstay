package com.findstay.shared.security;

import com.findstay.shared.error.AppException;
import com.findstay.shared.security.PermissionLookup.AccountAccess;

import java.util.Objects;
import java.util.UUID;

/**
 * Object-level ownership checks (S1-06-T2). A permission code says what a role may do in general;
 * these checks say whether the caller may act on one particular record.
 *
 * <p>Call them after loading the record, before acting on it:
 *
 * <pre>{@code
 * ObjectAccess.requireSelfOrAdmin(record.getOwnerUserId());
 * }</pre>
 *
 * <p>A mismatch is a 403 with a generic message, so the response does not reveal whether another
 * user's record exists.
 */
public final class ObjectAccess {

    private ObjectAccess() {
    }

    /**
     * Requires that the signed-in user is the record's owner, or an administrator.
     *
     * @throws AppException forbidden (403) when neither holds
     */
    public static void requireSelfOrAdmin(UUID ownerUserId) {
        if (isSelf(ownerUserId) || isAdmin()) {
            return;
        }
        throw AppException.forbidden("You do not have access to this record");
    }

    /**
     * Requires that the signed-in user is the record's owner. Administrators are not exempt here;
     * use {@link #requireSelfOrAdmin(UUID)} where an admin may act too.
     *
     * @throws AppException forbidden (403) when they differ or either id is missing
     */
    public static void requireOwner(UUID currentUserId, UUID ownerId) {
        if (currentUserId == null || ownerId == null || !Objects.equals(currentUserId, ownerId)) {
            throw AppException.forbidden("You do not have access to this record");
        }
    }

    private static boolean isSelf(UUID ownerUserId) {
        return CurrentUser.id().filter(current -> current.equals(ownerUserId)).isPresent();
    }

    private static boolean isAdmin() {
        return CurrentUser.access().map(AccountAccess::isAdmin).orElse(false);
    }
}
