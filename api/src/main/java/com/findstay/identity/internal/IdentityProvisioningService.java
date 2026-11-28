package com.findstay.identity.internal;

import com.findstay.identity.api.UserRegisteredEvent;
import com.findstay.identity.internal.IdentityDtos.AccountLookupResponse;
import com.findstay.identity.internal.IdentityDtos.ConsentStateResponse;
import com.findstay.identity.internal.IdentityDtos.ProfileResponse;
import com.findstay.identity.internal.IdentityDtos.ProfileUpdateRequest;
import com.findstay.identity.internal.IdentityDtos.RoleMembershipResponse;
import com.findstay.identity.internal.IdentityDtos.SessionContextResponse;
import com.findstay.organization.api.OrganizationAccessApi;
import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.event.DomainEventPublisher;
import com.findstay.shared.security.OrgMembership;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Provisions and serves local {@code identity.user_account} and {@code identity.user_profile}
 * records for Supabase-authenticated users ({@code DEC-S1-01/A}, {@code DEC-S1-04/B}, {@code S1-04-T5},
 * {@code S1-07-T3}).
 */
@Service
class IdentityProvisioningService {

    private static final String DEFAULT_ROLE_CODE = "GUEST";
    private static final String OWNER_ROLE_CODE = "OWNER";
    private static final String DEFAULT_LANGUAGE = "en";
    private static final String DEFAULT_PRIVACY_POLICY_VERSION = "1";
    private static final String DEFAULT_PRIVACY_POLICY_URL = "/privacy";
    private static final Pattern GHANA_E164 = Pattern.compile("^\\+233\\d{9}$");

    private final UserAccountRepository accounts;
    private final UserProfileRepository profiles;
    private final RoleRepository roles;
    private final DomainEventPublisher events;
    private final SupabaseAuthLookupClient supabaseAuthLookup;
    private final OrganizationAccessApi organizationAccess;
    private final Clock clock;

    IdentityProvisioningService(
            UserAccountRepository accounts,
            UserProfileRepository profiles,
            RoleRepository roles,
            DomainEventPublisher events,
            SupabaseAuthLookupClient supabaseAuthLookup,
            OrganizationAccessApi organizationAccess,
            Clock clock) {
        this.accounts = accounts;
        this.profiles = profiles;
        this.roles = roles;
        this.events = events;
        this.supabaseAuthLookup = supabaseAuthLookup;
        this.organizationAccess = organizationAccess;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    AccountLookupResponse lookupAccount(String rawEmail) {
        String normalized = rawEmail.trim().toLowerCase(Locale.ROOT);
        return accounts.findByEmailIgnoreCase(normalized)
                .map(account -> {
                    String displayName = profiles.findById(account.getId())
                            .map(UserProfile::getFullName)
                            .orElse(null);
                    return new AccountLookupResponse(true, displayName);
                })
                .or(() -> supabaseAuthLookup.findByEmail(normalized)
                        .map(authUser -> new AccountLookupResponse(true, authUser.displayName())))
                .orElseGet(() -> new AccountLookupResponse(false, null));
    }

    @Transactional
    SessionContextResponse provisionOrGet(Jwt jwt) {
        UUID userId = parseSubject(jwt);

        UserAccount existing = accounts.findById(userId).orElse(null);
        if (existing != null) {
            ensureActive(existing);
            UserProfile profile = profiles.findById(userId)
                    .orElseGet(() -> createDefaultProfile(userId, jwt, existing.getEmail(), clock.instant()));
            maybeAutoCreateOwnerOrg(existing, profile, jwt);
            return toSessionContext(existing, profile);
        }

        return provisionNewAccount(userId, jwt);
    }

    @Transactional
    ProfileResponse updateProfile(Jwt jwt, ProfileUpdateRequest request) {
        UUID userId = parseSubject(jwt);
        UserAccount account = accounts.findById(userId).orElse(null);
        if (account == null) {
            provisionNewAccount(userId, jwt);
            account = accounts.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR, "Provisioned account not found"));
        } else {
            ensureActive(account);
        }

        final UserAccount resolvedAccount = account;
        UserProfile profile = profiles.findById(userId)
                .orElseGet(() -> createDefaultProfile(userId, jwt, resolvedAccount.getEmail(), clock.instant()));

        if (request.fullName() != null) {
            String trimmed = request.fullName().trim();
            if (trimmed.isEmpty()) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Full name cannot be blank");
            }
            profile.setFullName(trimmed);
        }
        if (request.phone() != null) {
            profile.setPhone(request.phone().trim());
        }
        if (request.preferredLanguage() != null) {
            profile.setPreferredLanguage(request.preferredLanguage().trim());
        }
        if (request.avatarUrl() != null) {
            String trimmedAvatar = request.avatarUrl().trim();
            profile.setAvatarUrl(trimmedAvatar.isEmpty() ? null : trimmedAvatar);
        }
        profile.setUpdatedAt(clock.instant());
        profiles.save(profile);

        return toProfileResponse(resolvedAccount, profile);
    }

    private SessionContextResponse provisionNewAccount(UUID userId, Jwt jwt) {
        String email = extractEmail(jwt);
        Instant now = clock.instant();
        String desiredRoleCode = isOwnerOnboardingRequested(jwt) ? OWNER_ROLE_CODE : DEFAULT_ROLE_CODE;
        Role accountRole = roles.findByCode(desiredRoleCode)
                .or(() -> roles.findByCode(DEFAULT_ROLE_CODE))
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR, "Default GUEST role is not seeded"));

        UserAccount newAccount = new UserAccount(userId, email, accountRole, now);
        UserProfile newProfile = new UserProfile(
                userId,
                extractFullName(jwt, email),
                extractPhone(jwt),
                DEFAULT_LANGUAGE,
                now);

        try {
            accounts.saveAndFlush(newAccount);
            profiles.saveAndFlush(newProfile);
        } catch (DataIntegrityViolationException ex) {
            UserAccount raceAccount = accounts.findById(userId).orElse(null);
            if (raceAccount != null) {
                ensureActive(raceAccount);
                UserProfile raceProfile = profiles.findById(userId)
                        .orElseGet(() -> createDefaultProfile(userId, jwt, raceAccount.getEmail(), now));
                maybeAutoCreateOwnerOrg(raceAccount, raceProfile, jwt);
                return toSessionContext(raceAccount, raceProfile);
            }
            throw new AppException(ErrorCode.CONFLICT, "An account with this email already exists");
        }

        events.publish(new UserRegisteredEvent(events.newMeta(), userId, email));
        maybeAutoCreateOwnerOrg(newAccount, newProfile, jwt);
        return toSessionContext(newAccount, newProfile);
    }

    private void maybeAutoCreateOwnerOrg(UserAccount account, UserProfile profile, Jwt jwt) {
        boolean isOwnerRole = account.getRole() != null && OWNER_ROLE_CODE.equals(account.getRole().getCode());
        if (isOwnerRole || isOwnerOnboardingRequested(jwt)) {
            organizationAccess.ensureOwnerOrganization(
                    account.getId(),
                    account.getEmail(),
                    profile.getFullName(),
                    profile.getPhone());
        }
    }

    private static boolean isOwnerOnboardingRequested(Jwt jwt) {
        Map<String, Object> metadata = jwt.getClaimAsMap("user_metadata");
        if (metadata == null) {
            return false;
        }
        for (String key : List.of("role", "account_type", "portal")) {
            Object val = metadata.get(key);
            if (val instanceof String s && OWNER_ROLE_CODE.equalsIgnoreCase(s.trim())) {
                return true;
            }
        }
        return false;
    }

    private UserProfile createDefaultProfile(UUID userId, Jwt jwt, String email, Instant now) {
        UserProfile profile = new UserProfile(
                userId,
                extractFullName(jwt, email),
                extractPhone(jwt),
                DEFAULT_LANGUAGE,
                now);
        return profiles.save(profile);
    }

    private static void ensureActive(UserAccount account) {
        if (account.isSuspended()) {
            throw new AppException(ErrorCode.FORBIDDEN, "This account has been suspended");
        }
    }

    private static UUID parseSubject(Jwt jwt) {
        String sub = jwt != null ? jwt.getSubject() : null;
        if (sub == null || sub.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED, "Missing token subject");
        }
        try {
            return UUID.fromString(sub);
        } catch (IllegalArgumentException ex) {
            throw new AppException(ErrorCode.UNAUTHENTICATED, "Invalid token subject");
        }
    }

    private static String extractEmail(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Authenticated token is missing an email claim");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String extractFullName(Jwt jwt, String email) {
        Map<String, Object> metadata = jwt.getClaimAsMap("user_metadata");
        if (metadata != null) {
            for (String key : List.of("full_name", "name")) {
                Object val = metadata.get(key);
                if (val instanceof String str && !str.isBlank()) {
                    String trimmed = str.trim();
                    return trimmed.length() > 100 ? trimmed.substring(0, 100) : trimmed;
                }
            }
        }
        int at = email.indexOf('@');
        if (at > 0) {
            return email.substring(0, at);
        }
        return "FindStay User";
    }

    private static String extractPhone(Jwt jwt) {
        Map<String, Object> metadata = jwt.getClaimAsMap("user_metadata");
        Object metaPhone = metadata != null ? metadata.get("phone") : null;
        String candidate = metaPhone instanceof String str ? str : jwt.getClaimAsString("phone");
        if (candidate == null) {
            return null;
        }
        String trimmed = candidate.trim();
        return GHANA_E164.matcher(trimmed).matches() ? trimmed : null;
    }

    private SessionContextResponse toSessionContext(UserAccount account, UserProfile profile) {
        List<String> permissions = accounts.findPermissionCodes(account.getId()).stream().sorted().toList();
        List<OrgMembership> orgMemberships = organizationAccess.findMembershipsByUserId(account.getId());
        List<RoleMembershipResponse> membershipResponses = orgMemberships.stream()
                .map(m -> new RoleMembershipResponse(
                        m.role().name(),
                        m.organizationId(),
                        m.organizationName(),
                        List.copyOf(m.propertyIds())))
                .toList();
        UUID activeOrgId = orgMemberships.size() == 1 ? orgMemberships.getFirst().organizationId() : null;

        return new SessionContextResponse(
                toProfileResponse(account, profile),
                membershipResponses,
                new ConsentStateResponse(DEFAULT_PRIVACY_POLICY_VERSION, DEFAULT_PRIVACY_POLICY_URL, null),
                activeOrgId,
                account.getRole().getCode(),
                permissions);
    }

    private static ProfileResponse toProfileResponse(UserAccount account, UserProfile profile) {
        return new ProfileResponse(
                account.getId(),
                profile.getFullName(),
                account.getEmail(),
                profile.getPhone(),
                profile.getAvatarUrl(),
                profile.getPreferredLanguage(),
                account.getCreatedAt());
    }
}
