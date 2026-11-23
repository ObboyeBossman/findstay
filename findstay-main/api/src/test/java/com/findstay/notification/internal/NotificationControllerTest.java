package com.findstay.notification.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.shared.GlobalExceptionHandler;
import com.findstay.shared.Req;
import com.findstay.shared.ResourceNotFoundException;
import com.findstay.shared.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    private static final UUID USER_A = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID USER_B = UUID.fromString("22222222-2222-2222-2222-222222222222");

    private SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor callerJwt(UUID userId) {
        return jwt().jwt(builder -> builder.subject(userId.toString()));
    }

    @Test
    @Req("NFR-24")
    @DisplayName("Unauthenticated GET to /api/v1/me/notifications returns 401 Unauthorized")
    void unauthenticatedInboxReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/me/notifications"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @Req("NFR-24")
    @DisplayName("Unauthenticated POST to /api/v1/me/notifications/{id}/read returns 401 Unauthorized")
    void unauthenticatedMarkReadReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/me/notifications/" + UUID.randomUUID() + "/read"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @Req("FR-71")
    @DisplayName("GET /api/v1/me/notifications returns paginated alerts scoped to caller")
    void getInboxReturnsCallerNotifications() throws Exception {
        NotificationResponse item = new NotificationResponse(
                UUID.randomUUID(),
                USER_A,
                "VERIFICATION_STATUS_CHANGED",
                "Verification Approved",
                "Your document review is complete.",
                "{}",
                null,
                Instant.parse("2026-11-22T20:00:00Z")
        );
        NotificationListResponse response = new NotificationListResponse(List.of(item), 1, 1);

        when(notificationService.getInbox(eq(USER_A), eq(20), eq(0))).thenReturn(response);

        mockMvc.perform(get("/api/v1/me/notifications")
                        .with(callerJwt(USER_A)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.unreadCount").value(1))
                .andExpect(jsonPath("$.items[0].eventType").value("VERIFICATION_STATUS_CHANGED"))
                .andExpect(jsonPath("$.items[0].recipientId").value(USER_A.toString()))
                .andExpect(jsonPath("$.items[0].createdAt").value("2026-11-22T20:00:00Z"));

        verify(notificationService).getInbox(USER_A, 20, 0);
    }

    @Test
    @Req("FR-71")
    @DisplayName("POST /api/v1/me/notifications/{id}/read marks caller's notification as read")
    void markAsReadSucceedsForOwner() throws Exception {
        UUID notificationId = UUID.randomUUID();
        Instant readTime = Instant.parse("2026-11-22T21:00:00Z");
        NotificationResponse response = new NotificationResponse(
                notificationId,
                USER_A,
                "ACCOUNT_ACTIVITY",
                "New Login",
                "Login detected",
                null,
                readTime,
                Instant.parse("2026-11-22T20:30:00Z")
        );

        when(notificationService.markAsRead(eq(USER_A), eq(notificationId))).thenReturn(response);

        mockMvc.perform(post("/api/v1/me/notifications/" + notificationId + "/read")
                        .with(callerJwt(USER_A)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(notificationId.toString()))
                .andExpect(jsonPath("$.readAt").value("2026-11-22T21:00:00Z"));

        verify(notificationService).markAsRead(USER_A, notificationId);
    }

    @Test
    @Req("NFR-24")
    @DisplayName("POST /api/v1/me/notifications/{id}/read for another user's alert returns 404 NOT_FOUND")
    void markAsReadForAnotherUserReturns404() throws Exception {
        UUID otherUserNotificationId = UUID.randomUUID();

        when(notificationService.markAsRead(eq(USER_A), eq(otherUserNotificationId)))
                .thenThrow(new ResourceNotFoundException("Notification not found"));

        mockMvc.perform(post("/api/v1/me/notifications/" + otherUserNotificationId + "/read")
                        .with(callerJwt(USER_A)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Notification not found"));

        verify(notificationService).markAsRead(USER_A, otherUserNotificationId);
    }

    @Test
    @Req("FR-71")
    @DisplayName("POST /api/v1/me/notifications/read-all marks all unread alerts for caller")
    void markAllAsReadSucceeds() throws Exception {
        when(notificationService.markAllAsRead(eq(USER_A)))
                .thenReturn(new NotificationReadAllResponse(4));

        mockMvc.perform(post("/api/v1/me/notifications/read-all")
                        .with(callerJwt(USER_A)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.updatedCount").value(4));

        verify(notificationService).markAllAsRead(USER_A);
    }

    @Test
    @Req("FR-68")
    @DisplayName("GET /api/v1/me/notifications/preferences returns channel preferences")
    void getPreferencesSucceeds() throws Exception {
        NotificationPreferencesResponse response = new NotificationPreferencesResponse(List.of(
                new NotificationPreferenceDto("VERIFICATION_STATUS_CHANGED", true, true, true),
                new NotificationPreferenceDto("ACCOUNT_ACTIVITY", true, false, true)
        ));

        when(notificationService.getPreferences(eq(USER_A))).thenReturn(response);

        mockMvc.perform(get("/api/v1/me/notifications/preferences")
                        .with(callerJwt(USER_A)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferences.length()").value(2))
                .andExpect(jsonPath("$.preferences[0].eventType").value("VERIFICATION_STATUS_CHANGED"))
                .andExpect(jsonPath("$.preferences[0].emailEnabled").value(true))
                .andExpect(jsonPath("$.preferences[0].smsEnabled").value(true));

        verify(notificationService).getPreferences(USER_A);
    }

    @Test
    @Req("FR-69")
    @Req("FR-70")
    @DisplayName("PUT /api/v1/me/notifications/preferences updates caller channel preferences")
    void updatePreferencesSucceeds() throws Exception {
        UpdatePreferencesRequest request = new UpdatePreferencesRequest(List.of(
                new NotificationPreferenceDto("VERIFICATION_STATUS_CHANGED", false, true, true)
        ));

        NotificationPreferencesResponse response = new NotificationPreferencesResponse(List.of(
                new NotificationPreferenceDto("VERIFICATION_STATUS_CHANGED", false, true, true)
        ));

        when(notificationService.updatePreferences(eq(USER_A), any(UpdatePreferencesRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/me/notifications/preferences")
                        .with(callerJwt(USER_A))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferences[0].eventType").value("VERIFICATION_STATUS_CHANGED"))
                .andExpect(jsonPath("$.preferences[0].emailEnabled").value(false))
                .andExpect(jsonPath("$.preferences[0].smsEnabled").value(true));

        verify(notificationService).updatePreferences(eq(USER_A), any(UpdatePreferencesRequest.class));
    }
}
