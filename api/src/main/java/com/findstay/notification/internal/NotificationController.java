package com.findstay.notification.internal;

import com.findstay.notification.internal.NotificationDtos.NotificationItemResponse;
import com.findstay.notification.internal.NotificationDtos.NotificationListResponse;
import com.findstay.notification.internal.NotificationDtos.PreferencesResponse;
import com.findstay.notification.internal.NotificationDtos.ReadAllResponse;
import com.findstay.notification.internal.NotificationDtos.UpdatePreferencesRequest;
import com.findstay.shared.security.OrgScope;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Authenticated notification inbox, read-state, and channel preference endpoints ({@code S1-10-T5}).
 * Every query and mutation is strictly scoped to the caller's JWT {@code sub}.
 */
@RestController
@RequestMapping("/api/v1/me/notifications")
@Validated
class NotificationController {

    private final NotificationService notificationService;

    NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    ResponseEntity<NotificationListResponse> getInbox(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(name = "limit", defaultValue = "20") @Min(1) @Max(100) int limit,
            @RequestParam(name = "offset", defaultValue = "0") @Min(0) int offset) {
        UUID callerId = OrgScope.requireUserId(jwt);
        return ResponseEntity.ok(notificationService.getInbox(callerId, limit, offset));
    }

    @PostMapping("/{id}/read")
    ResponseEntity<NotificationItemResponse> markAsRead(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID callerId = OrgScope.requireUserId(jwt);
        return ResponseEntity.ok(notificationService.markAsRead(callerId, id));
    }

    @PostMapping("/read-all")
    ResponseEntity<ReadAllResponse> markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        UUID callerId = OrgScope.requireUserId(jwt);
        return ResponseEntity.ok(notificationService.markAllAsRead(callerId));
    }

    @GetMapping("/preferences")
    ResponseEntity<PreferencesResponse> getPreferences(@AuthenticationPrincipal Jwt jwt) {
        UUID callerId = OrgScope.requireUserId(jwt);
        return ResponseEntity.ok(notificationService.getPreferences(callerId));
    }

    @PutMapping("/preferences")
    ResponseEntity<PreferencesResponse> updatePreferences(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdatePreferencesRequest request) {
        UUID callerId = OrgScope.requireUserId(jwt);
        return ResponseEntity.ok(notificationService.updatePreferences(callerId, request));
    }
}
