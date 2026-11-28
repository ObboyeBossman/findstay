package com.findstay.admin.internal;

import com.findstay.admin.internal.AdminOperationsDtos.AdminDashboardResponse;
import com.findstay.admin.internal.AdminOperationsDtos.CreateAdminUserRequest;
import com.findstay.admin.internal.AdminOperationsDtos.PatchSettingItem;
import com.findstay.admin.internal.AdminOperationsDtos.PlatformSettingResponse;
import com.findstay.admin.internal.AdminOperationsDtos.RestoreUserRequest;
import com.findstay.admin.internal.AdminOperationsDtos.SuspendUserRequest;
import com.findstay.admin.internal.AdminOperationsDtos.UpdateSettingValueRequest;
import com.findstay.identity.api.AdminUserPage;
import com.findstay.identity.api.AdminUserView;
import com.findstay.shared.security.OrgScope;
import com.findstay.shared.security.RequiresPermission;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Administrator dashboard, user management, and platform settings endpoints ({@code S1-16-T2},
 * {@code S1-16-T3}, {@code S1-16-T4}).
 */
@RestController
@RequestMapping("/api/v1/admin")
class AdminOperationsController {

    private final AdminOperationsService service;

    AdminOperationsController(AdminOperationsService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    @RequiresPermission("admin.dashboard.read")
    AdminDashboardResponse getDashboard() {
        return service.getDashboardSummary();
    }

    @GetMapping("/users")
    @RequiresPermission("admin.user.read")
    AdminUserPage listUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        return service.listUsers(q, status, limit, offset);
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    @RequiresPermission("admin.user.manage")
    AdminUserView createUser(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateAdminUserRequest request
    ) {
        return service.createUser(OrgScope.requireUserId(jwt), request);
    }

    @PostMapping("/users/{userId}/suspend")
    @RequiresPermission("admin.user.manage")
    AdminUserView suspendUser(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID userId,
            @Valid @RequestBody(required = false) SuspendUserRequest request
    ) {
        return service.suspendUser(OrgScope.requireUserId(jwt), userId, request);
    }

    @PostMapping("/users/{userId}/restore")
    @RequiresPermission("admin.user.manage")
    AdminUserView restoreUser(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID userId,
            @Valid @RequestBody(required = false) RestoreUserRequest request
    ) {
        return service.restoreUser(OrgScope.requireUserId(jwt), userId, request);
    }

    @GetMapping("/settings")
    @RequiresPermission("admin.setting.read")
    List<PlatformSettingResponse> listSettings() {
        return service.listSettings();
    }

    @PatchMapping("/settings")
    @RequiresPermission("admin.setting.write")
    PlatformSettingResponse patchSetting(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody PatchSettingItem request
    ) {
        return service.patchSetting(OrgScope.requireUserId(jwt), request);
    }

    @PutMapping("/settings/{key}")
    @RequiresPermission("admin.setting.write")
    PlatformSettingResponse updateSettingByKey(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String key,
            @Valid @RequestBody UpdateSettingValueRequest request
    ) {
        return service.updateSetting(OrgScope.requireUserId(jwt), key, request.value());
    }
}
