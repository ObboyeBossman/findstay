package com.findstay.notification.internal;

import com.findstay.shared.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller exposing authenticated inbox, read status, and preference endpoints.
 * Scoped strictly to the authenticated caller's JWT sub identity.
 */
@RestController
@RequestMapping("/api/v1/me/notifications")
@Validated
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * GET /api/v1/me/notifications
     * Paginated inbox for the signed-in caller, ordered newest first.
     */
    @GetMapping
    public ResponseEntity<NotificationListResponse> getInbox(
            Authentication authentication,
            @RequestParam(name = "limit", defaultValue = "20") @Min(1) @Max(100) int limit,
            @RequestParam(name = "offset", defaultValue = "0") @Min(0) int offset) {
        UUID callerId = SecurityUtils.getRequiredUserId(authentication);
        NotificationListResponse response = notificationService.getInbox(callerId, limit, offset);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/me/notifications/{id}/read
     * Marks a single notification as read if it belongs to the caller.
     * Returns 404 NOT_FOUND if missing or owned by another user.
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            Authentication authentication,
            @PathVariable("id") UUID id) {
        UUID callerId = SecurityUtils.getRequiredUserId(authentication);
        NotificationResponse response = notificationService.markAsRead(callerId, id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/me/notifications/read-all
     * Marks all unread alerts for the signed-in caller as read.
     */
    @PostMapping("/read-all")
    public ResponseEntity<NotificationReadAllResponse> markAllAsRead(
            Authentication authentication) {
        UUID callerId = SecurityUtils.getRequiredUserId(authentication);
        NotificationReadAllResponse response = notificationService.markAllAsRead(callerId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/me/notifications/preferences
     * Returns caller's notification channel preferences.
     */
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferencesResponse> getPreferences(
            Authentication authentication) {
        UUID callerId = SecurityUtils.getRequiredUserId(authentication);
        NotificationPreferencesResponse response = notificationService.getPreferences(callerId);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/me/notifications/preferences
     * Updates caller's notification channel preferences.
     */
    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferencesResponse> updatePreferences(
            Authentication authentication,
            @Valid @RequestBody UpdatePreferencesRequest request) {
        UUID callerId = SecurityUtils.getRequiredUserId(authentication);
        NotificationPreferencesResponse response = notificationService.updatePreferences(callerId, request);
        return ResponseEntity.ok(response);
    }
}
