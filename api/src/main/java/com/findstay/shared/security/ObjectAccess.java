package com.findstay.shared.security;

import com.findstay.shared.error.AppException;

import java.util.Objects;
import java.util.UUID;

/**
 * Object-level ownership checks (S1-06-T2). A permission code says what a role may do in
 * general; these checks say whether the caller may do it to one particular record.
 *
 * <p>Call them after loading the record, before acting on it:
 *
 * <pre>{@code
 * ObjectAccess.requireOwner(currentUserId, property.getOwnerId());
 * }</pre>
 *
 * <p>A mismatch is a 403 with a generic message, so the response never reveals whether
 * another user's record exists beyond what the caller already knows.
 */
public final class ObjectAccess {

    private ObjectAccess() {
    }

    /**
     * Requires that the caller is the record's owner.
     *
     * @throws AppException forbidden (403) when either id is missing or they differ
     */
    public static void requireOwner(UUID currentUserId, UUID ownerId) {
        if (currentUserId == null || ownerId == null || !Objects.equals(currentUserId, ownerId)) {
            throw AppException.forbidden("You do not have access to this record");
        }
    }
}
