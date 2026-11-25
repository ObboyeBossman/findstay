package com.findstay.identity.internal;

import com.findstay.shared.security.PermissionLookup;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Database-backed {@link PermissionLookup} (S1-06-T2). Reads the account's status, role and
 * permission codes from {@code identity.user_account}, {@code identity.role} and
 * {@code identity.role_permission} on each call, so changes take effect without a restart.
 */
@Component
class PermissionLookupAdapter implements PermissionLookup {

    private final UserAccountRepository accounts;

    PermissionLookupAdapter(UserAccountRepository accounts) {
        this.accounts = accounts;
    }

    @Override
    public Optional<AccountAccess> accessFor(UUID userId) {
        return accounts.findById(userId).map(account -> new AccountAccess(
                account.getRole().getCode(),
                account.isSuspended(),
                Set.copyOf(accounts.findPermissionCodes(userId))));
    }
}
