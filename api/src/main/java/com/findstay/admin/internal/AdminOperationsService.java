package com.findstay.admin.internal;

import com.findstay.admin.internal.AdminOperationsDtos.AdminDashboardResponse;
import com.findstay.admin.internal.AdminOperationsDtos.CreateAdminUserRequest;
import com.findstay.admin.internal.AdminOperationsDtos.PatchSettingItem;
import com.findstay.admin.internal.AdminOperationsDtos.PlatformSettingResponse;
import com.findstay.admin.internal.AdminOperationsDtos.RestoreUserRequest;
import com.findstay.admin.internal.AdminOperationsDtos.SuspendUserRequest;
import com.findstay.audit.api.AuditEntryView;
import com.findstay.audit.api.AuditQuery;
import com.findstay.audit.api.AuditRecord;
import com.findstay.audit.api.AuditRecorder;
import com.findstay.identity.api.AdminUserPage;
import com.findstay.identity.api.AdminUserStats;
import com.findstay.identity.api.AdminUserView;
import com.findstay.identity.api.IdentityAdminApi;
import com.findstay.listing.api.ListingModerationApi;
import com.findstay.listing.api.PropertyStatus;
import com.findstay.notification.api.NotificationRequest;
import com.findstay.notification.api.NotificationSender;
import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import com.findstay.verification.api.VerificationCaseStatus;
import com.findstay.verification.api.VerificationReviewApi;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Admin Dashboard, User Management, and Platform Settings orchestration ({@code S1-16-T2},
 * {@code S1-16-T3}, {@code S1-16-T4}).
 */
@Service
class AdminOperationsService {

    private final VerificationReviewApi verificationReviewApi;
    private final ListingModerationApi listingModerationApi;
    private final IdentityAdminApi identityAdminApi;
    private final PlatformSettingRepository settingRepository;
    private final AuditRecorder auditRecorder;
    private final NotificationSender notificationSender;
    private final Clock clock;

    AdminOperationsService(
            VerificationReviewApi verificationReviewApi,
            ListingModerationApi listingModerationApi,
            IdentityAdminApi identityAdminApi,
            PlatformSettingRepository settingRepository,
            AuditRecorder auditRecorder,
            NotificationSender notificationSender,
            Clock clock
    ) {
        this.verificationReviewApi = verificationReviewApi;
        this.listingModerationApi = listingModerationApi;
        this.identityAdminApi = identityAdminApi;
        this.settingRepository = settingRepository;
        this.auditRecorder = auditRecorder;
        this.notificationSender = notificationSender;
        this.clock = clock;
    }

    // -------------------------------------------------------------------------
    // Dashboard Summary (S1-16-T2)
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    AdminDashboardResponse getDashboardSummary() {
        long pendingVerifications = verificationReviewApi.listCasesForReview(VerificationCaseStatus.PENDING).size();
        long pendingListings = listingModerationApi.listPropertiesForReview(PropertyStatus.PENDING_REVIEW).size();
        long publishedListings = listingModerationApi.listPropertiesForReview(PropertyStatus.ACTIVE).size();
        long suspendedListings = listingModerationApi.listPropertiesForReview(PropertyStatus.SUSPENDED).size();
        AdminUserStats userStats = identityAdminApi.getUserStats();
        List<AuditEntryView> recentActivity = auditRecorder
                .search(new AuditQuery(null, null, null, null, null, null, null, 8, 0))
                .items();

        return new AdminDashboardResponse(
                pendingVerifications,
                pendingListings,
                publishedListings,
                suspendedListings,
                userStats.totalUsers(),
                userStats.activeUsers(),
                userStats.suspendedUsers(),
                recentActivity
        );
    }

    // -------------------------------------------------------------------------
    // User Management (S1-16-T3)
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    AdminUserPage listUsers(String query, String status, int limit, int offset) {
        return identityAdminApi.searchUsers(query, status, limit, offset);
    }

    @Transactional
    AdminUserView createUser(UUID adminUserId, CreateAdminUserRequest request) {
        AdminUserView created = identityAdminApi.createUser(
                request.email(),
                request.displayName(),
                request.phone(),
                request.role()
        );

        auditRecorder.record(new AuditRecord(
                adminUserId,
                null,
                "user.admin_created",
                "USER",
                created.id().toString(),
                Map.of(
                        "email", created.email(),
                        "displayName", created.displayName(),
                        "role", created.roleCode()
                )
        ));

        notificationSender.send(new NotificationRequest(
                created.id(),
                "ACCOUNT_WELCOME",
                "Welcome to FindStay",
                "An administrator created your FindStay account (" + created.roleCode() + ").",
                Map.of("fullName", created.displayName(), "role", created.roleCode()),
                created.email(),
                created.phone()
        ));

        return created;
    }

    @Transactional
    AdminUserView suspendUser(UUID adminUserId, UUID userId, SuspendUserRequest request) {
        String reason = request != null && request.reason() != null ? request.reason().trim() : "";
        AdminUserView suspended = identityAdminApi.suspendUser(userId, adminUserId, reason);

        auditRecorder.record(new AuditRecord(
                adminUserId,
                null,
                "user.suspended",
                "USER",
                suspended.id().toString(),
                Map.of(
                        "email", suspended.email(),
                        "reason", reason
                )
        ));

        notificationSender.send(new NotificationRequest(
                suspended.id(),
                "USER_SUSPENDED",
                "Your FindStay account has been suspended",
                "Your account was suspended by an administrator. Reason: " + reason,
                Map.of("fullName", suspended.displayName(), "reason", reason),
                suspended.email(),
                suspended.phone()
        ));

        return suspended;
    }

    @Transactional
    AdminUserView restoreUser(UUID adminUserId, UUID userId, RestoreUserRequest request) {
        String note = request != null && request.note() != null ? request.note().trim() : "";
        AdminUserView restored = identityAdminApi.restoreUser(userId, adminUserId);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("email", restored.email());
        if (!note.isBlank()) {
            meta.put("reason", note);
        }

        auditRecorder.record(new AuditRecord(
                adminUserId,
                null,
                "user.restored",
                "USER",
                restored.id().toString(),
                meta
        ));

        notificationSender.send(new NotificationRequest(
                restored.id(),
                "USER_RESTORED",
                "Your FindStay account has been restored",
                "Your FindStay account has been restored by an administrator and you can sign in again.",
                Map.of("fullName", restored.displayName(), "notes", note),
                restored.email(),
                restored.phone()
        ));

        return restored;
    }

    // -------------------------------------------------------------------------
    // Platform Settings & Feature Flags (S1-16-T4)
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    List<PlatformSettingResponse> listSettings() {
        return settingRepository.findAllByOrderByFeatureFlagAscKeyAsc().stream()
                .map(AdminOperationsService::toSettingResponse)
                .toList();
    }

    @Transactional
    PlatformSettingResponse updateSetting(UUID adminUserId, String key, String rawValue) {
        String cleanKey = key != null ? key.trim() : "";
        PlatformSetting setting = settingRepository.findById(cleanKey)
                .orElseThrow(() -> AppException.notFound("PlatformSetting", cleanKey));

        String normalizedNewValue = validateAndNormalizeSettingValue(setting, rawValue);
        String oldValue = setting.getValue();

        Instant now = clock.instant();
        setting.updateValue(normalizedNewValue, adminUserId, now);
        settingRepository.saveAndFlush(setting);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("key", setting.getKey());
        meta.put("oldValue", oldValue);
        meta.put("newValue", normalizedNewValue);
        meta.put("isFeatureFlag", setting.isFeatureFlag());

        auditRecorder.record(new AuditRecord(
                adminUserId,
                null,
                "platform.setting_updated",
                "PLATFORM_SETTING",
                setting.getKey(),
                meta
        ));

        return toSettingResponse(setting);
    }

    @Transactional
    PlatformSettingResponse patchSetting(UUID adminUserId, PatchSettingItem item) {
        return updateSetting(adminUserId, item.key(), item.value());
    }

    private static String validateAndNormalizeSettingValue(PlatformSetting setting, String rawValue) {
        String trimmed = rawValue != null ? rawValue.trim() : "";
        if (trimmed.isBlank()) {
            throw AppException.validation(
                    "Setting value must not be empty",
                    List.of(new ApiError.Detail("value", "Provide a non-empty value"))
            );
        }
        if (setting.isFeatureFlag()) {
            String lower = trimmed.toLowerCase(Locale.ROOT);
            if (!"true".equals(lower) && !"false".equals(lower)) {
                throw AppException.validation(
                        "Feature flags must be 'true' or 'false'",
                        List.of(new ApiError.Detail("value", "Expected 'true' or 'false' for " + setting.getKey()))
                );
            }
            return lower;
        }
        if ("privacy.policy_version".equals(setting.getKey())) {
            try {
                int parsed = Integer.parseInt(trimmed);
                if (parsed <= 0) {
                    throw new NumberFormatException();
                }
                return String.valueOf(parsed);
            } catch (NumberFormatException ex) {
                throw AppException.validation(
                        "privacy.policy_version must be a positive integer",
                        List.of(new ApiError.Detail("value", "Enter a positive integer version number"))
                );
            }
        }
        return trimmed;
    }

    private static PlatformSettingResponse toSettingResponse(PlatformSetting s) {
        return new PlatformSettingResponse(
                s.getKey(),
                s.getValue(),
                s.getDescription(),
                s.isFeatureFlag(),
                s.getUpdatedByUserId(),
                s.getUpdatedAt()
        );
    }
}
