package com.findstay.identity.internal;

import com.findstay.audit.api.AuditActorNameProvider;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Resolves actor display names for the {@code audit} module without introducing a reverse module
 * dependency ({@code identity} → {@code audit.api} is downward-only).
 */
@Component
class IdentityAuditActorNameProvider implements AuditActorNameProvider {

    private final UserProfileRepository profileRepository;
    private final UserAccountRepository accountRepository;

    IdentityAuditActorNameProvider(
            UserProfileRepository profileRepository,
            UserAccountRepository accountRepository
    ) {
        this.profileRepository = profileRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<UUID, String> resolveDisplayNames(Collection<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        Map<UUID, String> result = new HashMap<>();
        for (UserAccount account : accountRepository.findAllById(userIds)) {
            result.put(account.getId(), account.getEmail());
        }
        for (UserProfile profile : profileRepository.findAllById(userIds)) {
            if (profile.getFullName() != null && !profile.getFullName().isBlank()) {
                result.put(profile.getUserId(), profile.getFullName());
            }
        }
        return result;
    }
}
