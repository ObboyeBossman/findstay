package com.findstay.notification.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.notification.api.NotificationRequest;
import com.findstay.shared.Req;
import com.findstay.shared.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private NotificationService notificationService;

    private static final UUID USER_A = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID USER_B = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository, preferenceRepository, objectMapper);
    }

    @Test
    @Req("FR-71")
    @DisplayName("getInbox retrieves only notifications for the requested caller")
    void getInboxFiltersByRecipientId() {
        Notification notification = new Notification(USER_A, "ACCOUNT_ACTIVITY", "Login", "Welcome", null);
        notification.setId(UUID.randomUUID());
        notification.setCreatedAt(Instant.now());

        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(eq(USER_A), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(notification)));
        when(notificationRepository.countByRecipientIdAndReadAtIsNull(USER_A))
                .thenReturn(1L);

        NotificationListResponse inbox = notificationService.getInbox(USER_A, 20, 0);

        assertThat(inbox.total()).isEqualTo(1);
        assertThat(inbox.unreadCount()).isEqualTo(1);
        assertThat(inbox.items()).hasSize(1);
        assertThat(inbox.items().get(0).recipientId()).isEqualTo(USER_A);
    }

    @Test
    @Req("FR-71")
    @DisplayName("markAsRead updates read_at timestamp when alert belongs to caller")
    void markAsReadSucceedsForOwner() {
        UUID notificationId = UUID.randomUUID();
        Notification notification = new Notification(USER_A, "VERIFICATION_STATUS_CHANGED", "Approved", "Done", null);
        notification.setId(notificationId);
        notification.setReadAt(null);

        when(notificationRepository.findByIdAndRecipientId(notificationId, USER_A))
                .thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(USER_A, notificationId);

        assertThat(response.readAt()).isNotNull();
        verify(notificationRepository).save(notification);
    }

    @Test
    @Req("NFR-24")
    @DisplayName("markAsRead for another user's alert throws ResourceNotFoundException (cross-user isolation)")
    void markAsReadCrossUserIsolationReturns404() {
        UUID userBNotificationId = UUID.randomUUID();

        // Repository returns empty because user B's alert cannot be found with recipientId = user A
        when(notificationRepository.findByIdAndRecipientId(userBNotificationId, USER_A))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(USER_A, userBNotificationId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Notification not found");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @Req("FR-71")
    @DisplayName("markAllAsRead triggers bulk update for caller only")
    void markAllAsReadUpdatesCallerAlerts() {
        when(notificationRepository.markAllAsRead(eq(USER_A), any(Instant.class)))
                .thenReturn(5);

        NotificationReadAllResponse response = notificationService.markAllAsRead(USER_A);

        assertThat(response.updatedCount()).isEqualTo(5);
        verify(notificationRepository).markAllAsRead(eq(USER_A), any(Instant.class));
    }

    @Test
    @Req("FR-68")
    @DisplayName("getPreferences returns defaults when no custom preferences stored")
    void getPreferencesReturnsDefaults() {
        when(preferenceRepository.findByUserIdOrderByEventTypeAsc(USER_A))
                .thenReturn(List.of());

        NotificationPreferencesResponse response = notificationService.getPreferences(USER_A);

        assertThat(response.preferences()).isNotEmpty();
        assertThat(response.preferences().get(0).emailEnabled()).isTrue();
        assertThat(response.preferences().get(0).smsEnabled()).isFalse();
    }

    @Test
    @Req("FR-69")
    @Req("FR-70")
    @DisplayName("updatePreferences saves channel toggles per event type")
    void updatePreferencesSavesChannels() {
        UpdatePreferencesRequest request = new UpdatePreferencesRequest(List.of(
                new NotificationPreferenceDto("VERIFICATION_STATUS_CHANGED", true, true, false)
        ));

        when(preferenceRepository.findByUserIdAndEventType(USER_A, "VERIFICATION_STATUS_CHANGED"))
                .thenReturn(Optional.empty());
        when(preferenceRepository.save(any(NotificationPreference.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationPreferencesResponse response = notificationService.updatePreferences(USER_A, request);

        assertThat(response.preferences()).hasSize(1);
        assertThat(response.preferences().get(0).emailEnabled()).isTrue();
        assertThat(response.preferences().get(0).smsEnabled()).isTrue();
        assertThat(response.preferences().get(0).inAppEnabled()).isFalse();

        ArgumentCaptor<NotificationPreference> captor = ArgumentCaptor.forClass(NotificationPreference.class);
        verify(preferenceRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(USER_A);
        assertThat(captor.getValue().getEventType()).isEqualTo("VERIFICATION_STATUS_CHANGED");
    }

    @Test
    @Req("FR-68")
    @DisplayName("send creates and persists in-app notification")
    void sendDispatchesInAppNotification() {
        NotificationRequest request = new NotificationRequest(
                USER_A,
                "LISTING_STATUS_CHANGED",
                "Listing Published",
                "Your listing is now live.",
                Map.of("listingId", "test-listing-1")
        );

        notificationService.send(request);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification>captorClass());
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();
        assertThat(saved.getRecipientId()).isEqualTo(USER_A);
        assertThat(saved.getEventType()).isEqualTo("LISTING_STATUS_CHANGED");
        assertThat(saved.getTitle()).isEqualTo("Listing Published");
        assertThat(saved.getData()).contains("test-listing-1");
    }

    @SuppressWarnings("unchecked")
    private static Class<Notification> captorClass() {
        return Notification.class;
    }
}
