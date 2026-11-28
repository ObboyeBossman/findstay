package com.findstay.identity.internal;

import com.findstay.identity.api.AdminUserPage;
import com.findstay.identity.api.AdminUserStats;
import com.findstay.identity.api.AdminUserView;
import com.findstay.identity.api.IdentityAdminApi;
import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.id.IdGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
class IdentityAdminService implements IdentityAdminApi {

    private static final int MIN_SUSPENSION_REASON_LEN = 10;

    private final UserAccountRepository accountRepository;
    private final UserProfileRepository profileRepository;
    private final RoleRepository roleRepository;
    private final IdGenerator idGenerator;
    private final Clock clock;

    IdentityAdminService(
            UserAccountRepository accountRepository,
            UserProfileRepository profileRepository,
            RoleRepository roleRepository,
            IdGenerator idGenerator,
            Clock clock
    ) {
        this.accountRepository = accountRepository;
        this.profileRepository = profileRepository;
        this.roleRepository = roleRepository;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserStats getUserStats() {
        List<UserAccount> all = accountRepository.findAll();
        long suspended = all.stream().filter(UserAccount::isSuspended).count();
        long total = all.size();
        return new AdminUserStats(total, total - suspended, suspended);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserPage searchUsers(String query, String status, int limit, int offset) {
        int safeLimit = limit <= 0 ? 20 : Math.min(limit, 100);
        int safeOffset = Math.max(0, offset);
        String needle = query != null ? query.trim().toLowerCase(Locale.ROOT) : "";
        String normalizedStatus = status != null ? status.trim().toUpperCase(Locale.ROOT) : "ALL";

        List<UserAccount> accounts = accountRepository.findAll();
        Map<UUID, UserProfile> profilesByUserId = new HashMap<>();
        for (UserProfile p : profileRepository.findAll()) {
            profilesByUserId.put(p.getUserId(), p);
        }

        List<AdminUserView> matched = accounts.stream()
                .filter(acc -> "ALL".equals(normalizedStatus) || normalizedStatus.isBlank()
                        || acc.getStatus().equalsIgnoreCase(normalizedStatus))
                .map(acc -> toView(acc, profilesByUserId.get(acc.getId())))
                .filter(v -> needle.isEmpty()
                        || v.email().toLowerCase(Locale.ROOT).contains(needle)
                        || v.displayName().toLowerCase(Locale.ROOT).contains(needle))
                .sorted(Comparator.comparing(AdminUserView::createdAt).reversed())
                .toList();

        long total = matched.size();
        int fromIndex = Math.min(safeOffset, matched.size());
        int toIndex = Math.min(fromIndex + safeLimit, matched.size());
        return new AdminUserPage(matched.subList(fromIndex, toIndex), total, safeLimit, safeOffset);
    }

    @Override
    @Transactional
    public AdminUserView createUser(String email, String displayName, String phone, String roleCode) {
        String cleanEmail = email != null ? email.trim().toLowerCase(Locale.ROOT) : "";
        String cleanName = displayName != null ? displayName.trim() : "";
        String cleanRole = roleCode != null && !roleCode.isBlank()
                ? roleCode.trim().toUpperCase(Locale.ROOT)
                : "GUEST";

        if (cleanEmail.isBlank() || !cleanEmail.contains("@")) {
            throw AppException.validation(
                    "A valid email address is required",
                    List.of(new ApiError.Detail("email", "Enter a valid email address"))
            );
        }
        if (cleanName.isBlank()) {
            throw AppException.validation(
                    "Full name is required",
                    List.of(new ApiError.Detail("displayName", "Enter the user's full name"))
            );
        }
        if (accountRepository.findByEmailIgnoreCase(cleanEmail).isPresent()) {
            throw AppException.conflict("An account with email " + cleanEmail + " already exists");
        }

        Role role = roleRepository.findByCode(cleanRole)
                .orElseThrow(() -> AppException.validation(
                        "Invalid user role",
                        List.of(new ApiError.Detail("role", "Unsupported role: " + cleanRole))
                ));

        Instant now = clock.instant();
        UUID userId = idGenerator.newId();
        UserAccount account = accountRepository.saveAndFlush(new UserAccount(userId, cleanEmail, role, now));
        String cleanPhone = (phone != null && !phone.isBlank()) ? phone.trim() : null;
        UserProfile profile = profileRepository.saveAndFlush(
                new UserProfile(userId, cleanName, cleanPhone, "en", now)
        );
        return toView(account, profile);
    }

    @Override
    @Transactional
    public AdminUserView suspendUser(UUID userId, UUID adminUserId, String reason) {
        if (userId.equals(adminUserId)) {
            throw new AppException(
                    ErrorCode.BUSINESS_RULE_VIOLATION,
                    "You cannot suspend your own administrator account",
                    List.of(new ApiError.Detail("userId", "Self-suspension is prohibited"))
            );
        }
        String cleanReason = reason != null ? reason.trim() : "";
        if (cleanReason.length() < MIN_SUSPENSION_REASON_LEN) {
            throw new AppException(
                    ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Enter a suspension reason (at least " + MIN_SUSPENSION_REASON_LEN + " characters)",
                    List.of(new ApiError.Detail("reason", "Minimum 10 characters required"))
            );
        }

        UserAccount account = accountRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User", userId));
        if (account.isSuspended()) {
            throw AppException.conflict("User account is already suspended");
        }

        account.suspend(cleanReason, clock.instant());
        accountRepository.saveAndFlush(account);

        UserProfile profile = profileRepository.findById(userId).orElse(null);
        return toView(account, profile);
    }

    @Override
    @Transactional
    public AdminUserView restoreUser(UUID userId, UUID adminUserId) {
        UserAccount account = accountRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User", userId));
        if (!account.isSuspended()) {
            throw AppException.conflict("Only suspended accounts can be restored");
        }

        account.restore(clock.instant());
        accountRepository.saveAndFlush(account);

        UserProfile profile = profileRepository.findById(userId).orElse(null);
        return toView(account, profile);
    }

    private static AdminUserView toView(UserAccount account, UserProfile profile) {
        String name = (profile != null && profile.getFullName() != null && !profile.getFullName().isBlank())
                ? profile.getFullName()
                : account.getEmail();
        String phone = profile != null ? profile.getPhone() : null;
        return new AdminUserView(
                account.getId(),
                account.getEmail(),
                name,
                phone,
                account.getRole().getCode(),
                account.getStatus(),
                account.getSuspendedAt(),
                account.getSuspensionReason(),
                account.getCreatedAt()
        );
    }
}
