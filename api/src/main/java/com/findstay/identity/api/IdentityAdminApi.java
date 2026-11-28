package com.findstay.identity.api;

import java.util.UUID;

/**
 * Public user-management seam of {@code identity} consumed by {@code admin} ({@code S1-16-T2},
 * {@code S1-16-T3}) without accessing {@code identity.internal}.
 */
public interface IdentityAdminApi {

    AdminUserStats getUserStats();

    AdminUserPage searchUsers(String query, String status, int limit, int offset);

    AdminUserView createUser(String email, String displayName, String phone, String roleCode);

    AdminUserView suspendUser(UUID userId, UUID adminUserId, String reason);

    AdminUserView restoreUser(UUID userId, UUID adminUserId);
}
