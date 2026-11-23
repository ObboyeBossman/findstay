package com.findstay.notification.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.notification.api.NotificationRequest;
import com.findstay.shared.Clock;
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

    @Mock
    private NotificationTemplateRepository templateRepository;

    @Mock
    private NotificationDeliveryRepository deliveryRepository;

    @Mock
    private EmailProviderAdapter emailProviderAdapter;

    @Mock
    private SmsProviderAdapter smsProviderAdapter;

    private final TemplateRenderer templateRenderer = new TemplateRenderer();
    private final Clock clock = new Clock();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private NotificationService notificationService;

    private static final UUID USER_A = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID USER_B = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(
                notificationRepository,
                preferenceRepository,
                templateRepository,
                deliveryRepository,
                emailProviderAdapter,
                smsProviderAdapter,
                templateRenderer,
                clock,
                objectMapper
        );
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
    @Req("NFR-60")
    @DisplayName("send records in-app alert and dispatches outbound email via adapter")
    void sendDispatchesInAppAndOutboundEmail() {
        when(emailProviderAdapter.sendEmail(eq("owner@findstay.com"), anyString(), anyString()))
                .thenReturn(EmailDispatchResult.success("resend-12345"));
        when(deliveryRepository.save(any(NotificationDelivery.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationRequest request = new NotificationRequest(
                USER_A,
                "VERIFICATION_APPROVED",
                "Verification Approved",
                "Your identity documents have been approved.",
                Map.of("notes", "All valid"),
                "owner@findstay.com",
                null
        );

        notificationService.send(request);

        // Verify in-app saved
        verify(notificationRepository).save(any(Notification.class));

        // Verify email adapter invoked
        verify(emailProviderAdapter).sendEmail(eq("owner@findstay.com"), anyString(), anyString());

        // Verify delivery record updated to SENT
        ArgumentCaptor<NotificationDelivery> captor = ArgumentCaptor.forClass(NotificationDelivery.class);
        verify(deliveryRepository, atLeastOnce()).save(captor.capture());
        NotificationDelivery delivery = captor.getValue();
        assertThat(delivery.getStatus()).isEqualTo(DeliveryStatus.SENT);
        assertThat(delivery.getProviderMessageId()).isEqualTo("resend-12345");
        assertThat(delivery.getAttempts()).isEqualTo(1);
    }

    @Test
    @Req("NFR-60")
    @DisplayName("send records FAILED delivery and schedules next_retry_at when email adapter fails")
    void sendHandlesEmailAdapterFailureAndSchedulesRetry() {
        when(emailProviderAdapter.sendEmail(eq("owner@findstay.com"), anyString(), anyString()))
                .thenReturn(EmailDispatchResult.failure("SMTP connection timeout"));
        when(deliveryRepository.save(any(NotificationDelivery.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationRequest request = new NotificationRequest(
                USER_A,
                "ACCOUNT_ACTIVITY",
                "Security Alert",
                "New sign-in from unusual IP.",
                Map.of(),
                "owner@findstay.com",
                null
        );

        notificationService.send(request);

        ArgumentCaptor<NotificationDelivery> captor = ArgumentCaptor.forClass(NotificationDelivery.class);
        verify(deliveryRepository, atLeastOnce()).save(captor.capture());
        NotificationDelivery delivery = captor.getValue();
        assertThat(delivery.getStatus()).isEqualTo(DeliveryStatus.FAILED);
        assertThat(delivery.getLastError()).isEqualTo("SMTP connection timeout");
        assertThat(delivery.getAttempts()).isEqualTo(1);
        assertThat(delivery.getNextRetryAt()).isNotNull();
    }

    @Test
    @Req("P-08")
    @DisplayName("P-08 Fallback: When SMS adapter is disabled, in-app and email succeed cleanly without error")
    void sendHandlesDisabledSmsCleanlyPerDecisionP08() {
        when(smsProviderAdapter.isEnabled()).thenReturn(false);
        when(smsProviderAdapter.providerName()).thenReturn("noop-fallback");

        // Set user preference to enable SMS
        NotificationPreference preference = new NotificationPreference(USER_A, "VERIFICATION_STATUS_CHANGED", true, true, true);
        when(preferenceRepository.findByUserIdAndEventType(USER_A, "VERIFICATION_STATUS_CHANGED"))
                .thenReturn(Optional.of(preference));

        when(emailProviderAdapter.sendEmail(eq("user@findstay.com"), anyString(), anyString()))
                .thenReturn(EmailDispatchResult.success("email-999"));
        when(deliveryRepository.save(any(NotificationDelivery.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationRequest request = new NotificationRequest(
                USER_A,
                "VERIFICATION_STATUS_CHANGED",
                "Status Changed",
                "Your status is now approved.",
                Map.of(),
                "user@findstay.com",
                "+233241234567"
        );

        notificationService.send(request);

        // In-app and email should succeed
        verify(notificationRepository).save(any(Notification.class));
        verify(emailProviderAdapter).sendEmail(eq("user@findstay.com"), anyString(), anyString());

        // SMS adapter should NOT be called since it is disabled
        verify(smsProviderAdapter, never()).sendSms(anyString(), anyString());
    }

    @Test
    @Req("P-08")
    @DisplayName("When SMS adapter is enabled, dispatches outbound SMS to recipient phone")
    void sendDispatchesOutboundSmsWhenEnabled() {
        when(smsProviderAdapter.isEnabled()).thenReturn(true);
        when(smsProviderAdapter.sendSms(eq("+233241234567"), anyString()))
                .thenReturn(SmsDispatchResult.success("hubtel-msg-001"));

        NotificationPreference preference = new NotificationPreference(USER_A, "LISTING_APPROVED", false, true, true);
        when(preferenceRepository.findByUserIdAndEventType(USER_A, "LISTING_APPROVED"))
                .thenReturn(Optional.of(preference));
        when(deliveryRepository.save(any(NotificationDelivery.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationRequest request = new NotificationRequest(
                USER_A,
                "LISTING_APPROVED",
                "Listing Approved",
                "Your listing is live.",
                Map.of(),
                null,
                "+233241234567"
        );

        notificationService.send(request);

        verify(smsProviderAdapter).sendSms(eq("+233241234567"), anyString());
        // Email should be skipped because emailEnabled is false in preference
        verify(emailProviderAdapter, never()).sendEmail(anyString(), anyString(), anyString());
    }
}
