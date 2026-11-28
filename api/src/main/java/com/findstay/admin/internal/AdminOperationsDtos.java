package com.findstay.admin.internal;

import com.findstay.audit.api.AuditEntryView;
import com.findstay.shared.validation.SafeText;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

final class AdminOperationsDtos {

    private AdminOperationsDtos() {
    }

    record AdminDashboardResponse(
            long pendingVerificationsCount,
            long pendingListingsCount,
            long publishedListingsCount,
            long suspendedListingsCount,
            long totalUsersCount,
            long activeUsersCount,
            long suspendedUsersCount,
            List<AuditEntryView> recentActivity
    ) {
    }

    record CreateAdminUserRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            @Size(max = 254)
            String email,

            @NotBlank(message = "Full name is required")
            @Size(max = 150)
            @SafeText
            String displayName,

            @Size(max = 20)
            @SafeText
            String phone,

            @Size(max = 32)
            String role
    ) {
    }

    record SuspendUserRequest(
            @Size(max = 500)
            @SafeText
            String reason
    ) {
    }

    record RestoreUserRequest(
            @Size(max = 500)
            @SafeText
            String note
    ) {
    }

    record PlatformSettingResponse(
            String key,
            String value,
            String description,
            boolean isFeatureFlag,
            UUID updatedByUserId,
            Instant updatedAt
    ) {
    }

    record UpdateSettingValueRequest(
            @NotBlank(message = "value is required")
            @Size(max = 1000)
            String value
    ) {
    }

    record PatchSettingItem(
            @NotBlank(message = "key is required")
            @Size(max = 120)
            String key,

            @NotBlank(message = "value is required")
            @Size(max = 1000)
            String value
    ) {
    }
}
