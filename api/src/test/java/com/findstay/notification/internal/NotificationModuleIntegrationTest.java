package com.findstay.notification.internal;

import com.findstay.notification.api.NotificationRequest;
import com.findstay.notification.api.NotificationSender;
import com.findstay.notification.internal.NotificationAdapters.EmailProviderAdapter;
import com.findstay.notification.internal.NotificationAdapters.GhanaSmsProviderAdapter;
import com.findstay.notification.internal.NotificationAdapters.NoopSmsProviderAdapter;
import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack PostgreSQL verification for Story {@code S1-10} ({@code T3}, {@code T4}, {@code T5},
 * {@code T7}): V1_17 templates, {@link NotificationSender} dispatch, failure retry logging and
 * automatic retry execution, swappable SMS fallback adapters, and {@code /api/v1/me/notifications}
 * inbox/preferences endpoints.
 */
@Req("FR-68")
@AutoConfigureMockMvc
@Import(NotificationModuleIntegrationTest.TestAdapterConfig.class)
class NotificationModuleIntegrationTest extends AbstractIntegrationTest {

    @TestConfiguration
    static class TestAdapterConfig {
        @Bean
        @Primary
        ToggleableEmailAdapter toggleableEmailAdapter() {
            return new ToggleableEmailAdapter();
        }
    }

    static class ToggleableEmailAdapter implements EmailProviderAdapter {
        final AtomicBoolean shouldFail = new AtomicBoolean(false);
        final AtomicInteger calls = new AtomicInteger(0);

        @Override
        public String providerName() {
            return "test-toggle";
        }

        @Override
        public String sendEmail(String toEmail, String subject, String body) {
            calls.incrementAndGet();
            if (shouldFail.get()) {
                throw new RuntimeException("Simulated SMTP timeout");
            }
            return "test-msg-" + UUID.randomUUID();
        }

        void reset() {
            shouldFail.set(false);
            calls.set(0);
        }
    }

    @Autowired
    private NotificationSender notificationSender;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationDeliveryRepository deliveries;

    @Autowired
    private ToggleableEmailAdapter emailAdapter;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @BeforeEach
    void resetAdapter() {
        emailAdapter.reset();
    }

    @Test
    @Req("FR-69")
    void v117SeedsAllTenSprint1LifecycleEventsIdempotently() {
        Integer templateCount = jdbc.queryForObject(
                "SELECT count(*) FROM notification.notification_template WHERE is_active", Integer.class);
        assertThat(templateCount).isGreaterThanOrEqualTo(24);

        List<String> eventTypes = jdbc.queryForList(
                "SELECT DISTINCT event_type FROM notification.notification_template WHERE is_active ORDER BY event_type",
                String.class);
        assertThat(eventTypes).contains(
                "ORG_STAFF_INVITED",
                "VERIFICATION_SUBMITTED",
                "VERIFICATION_APPROVED",
                "VERIFICATION_REJECTED",
                "LISTING_SUBMITTED",
                "LISTING_APPROVED",
                "LISTING_CORRECTIONS_REQUESTED",
                "LISTING_REJECTED",
                "ACCOUNT_SUSPENDED",
                "ACCOUNT_RESTORED");
    }

    @Test
    @Req("NFR-60")
    void sendDispatchesEmailLogsFailureAndRetriesAutomaticallyToSuccess() {
        UUID userId = UUID.randomUUID();
        emailAdapter.shouldFail.set(true);

        // 1. Send while email provider fails -> in-app created, EMAIL delivery logged as FAILED with next_retry_at.
        UUID notifId = notificationSender.send(new NotificationRequest(
                userId,
                "LISTING_APPROVED",
                "Fallback Title",
                "Fallback Body",
                Map.of("propertyName", "Harbour View Lodge", "ownerName", "Ama", "listingUrl", "https://findstay.gh/l/1"),
                "ama@example.com",
                "+233241234567"));

        assertThat(notifId).isNotNull();
        List<NotificationDelivery> logged = deliveries.findByNotificationId(notifId);
        // SMS is disabled by default -> graceful fallback: only EMAIL outbound delivery row created.
        assertThat(logged).hasSize(1);
        NotificationDelivery emailDelivery = logged.getFirst();
        assertThat(emailDelivery.getChannel()).isEqualTo("EMAIL");
        assertThat(emailDelivery.getStatus()).isEqualTo("FAILED");
        assertThat(emailDelivery.getAttempts()).isEqualTo(1);
        assertThat(emailDelivery.getLastError()).contains("Simulated SMTP timeout");
        assertThat(emailDelivery.getNextRetryAt()).isNotNull();

        // 2. Move next_retry_at into the past, restore adapter health, and run retry processor.
        jdbc.update("UPDATE notification.notification_delivery SET next_retry_at = ? WHERE id = ?",
                Timestamp.from(Instant.now().minus(1, ChronoUnit.MINUTES)), emailDelivery.getId());
        entityManager.flush();
        entityManager.clear();

        emailAdapter.shouldFail.set(false);
        int retried = notificationService.processDueRetries();
        assertThat(retried).isGreaterThanOrEqualTo(1);

        NotificationDelivery refreshed = deliveries.findById(emailDelivery.getId()).orElseThrow();
        assertThat(refreshed.getStatus()).isEqualTo("SENT");
        assertThat(refreshed.getAttempts()).isEqualTo(2);
        assertThat(refreshed.getProviderMessageId()).startsWith("test-msg-");
        assertThat(refreshed.getLastError()).isNull();
        assertThat(refreshed.getNextRetryAt()).isNull();
    }

    @Test
    @Req("NFR-60")
    void smsProviderAdaptersAreSwappableAndValidateGhanaNumbers() {
        NoopSmsProviderAdapter noop = new NoopSmsProviderAdapter();
        GhanaSmsProviderAdapter ghana = new GhanaSmsProviderAdapter();

        assertThat(noop.providerName()).isEqualTo("noop");
        assertThat(noop.sendSms("+233241234567", "Test")).startsWith("noop-sms-");

        assertThat(ghana.providerName()).isEqualTo("ghana");
        assertThat(ghana.sendSms("+233241234567", "Test")).startsWith("ghana-sms-");
        assertThatThrownBy(() -> ghana.sendSms("+14155551234", "Test"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @Req("FR-70")
    void inboxMarkReadReadAllPreferencesAndCrossUserIsolationWorkEndToEnd() throws Exception {
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();

        UUID notifA1 = notificationSender.send(new NotificationRequest(
                userA,
                "VERIFICATION_APPROVED",
                "Fallback",
                "Fallback",
                Map.of("ownerName", "Kofi", "notes", "All documents verified."),
                "kofi@example.com",
                null));
        UUID notifA2 = notificationSender.send(new NotificationRequest(
                userA,
                "ORG_STAFF_INVITED",
                "Fallback",
                "Fallback",
                Map.of("companyName", "Takoradi Suites", "invitationLink", "https://findstay.gh/inv/1"),
                "kofi@example.com",
                null));
        notificationSender.send(new NotificationRequest(
                userB,
                "ACCOUNT_RESTORED",
                "Fallback",
                "Fallback",
                Map.of("userName", "User B"),
                "userb@example.com",
                null));

        // 1. User A sees strictly User A's 2 unread notifications (rendered from V1_17 templates).
        mockMvc.perform(get("/api/v1/me/notifications?limit=10&offset=0")
                        .with(jwt().jwt(b -> b.subject(userA.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.unreadCount").value(2))
                .andExpect(jsonPath("$.total").value(2));

        // 2. Cross-user IDOR: User B cannot mark User A's notification read (404).
        mockMvc.perform(post("/api/v1/me/notifications/" + notifA1 + "/read")
                        .with(jwt().jwt(b -> b.subject(userB.toString()))))
                .andExpect(status().isNotFound());

        // 3. User A marks notifA1 read -> unreadCount drops to 1.
        mockMvc.perform(post("/api/v1/me/notifications/" + notifA1 + "/read")
                        .with(jwt().jwt(b -> b.subject(userA.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(notifA1.toString()))
                .andExpect(jsonPath("$.readAt").isNotEmpty());

        mockMvc.perform(get("/api/v1/me/notifications")
                        .with(jwt().jwt(b -> b.subject(userA.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(1));

        // 4. User A marks all as read -> remaining unreadCount = 0.
        mockMvc.perform(post("/api/v1/me/notifications/read-all")
                        .with(jwt().jwt(b -> b.subject(userA.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.updatedCount").value(1))
                .andExpect(jsonPath("$.unreadCount").value(0));

        // 5. User A opts out of EMAIL for LISTING_APPROVED -> next dispatch suppresses EMAIL delivery.
        mockMvc.perform(put("/api/v1/me/notifications/preferences")
                        .with(jwt().jwt(b -> b.subject(userA.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "preferences": [
                                    { "eventType": "LISTING_APPROVED", "channel": "EMAIL", "enabled": false }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.smsChannelActive").value(false));

        int callsBefore = emailAdapter.calls.get();
        UUID notifA3 = notificationSender.send(new NotificationRequest(
                userA,
                "LISTING_APPROVED",
                "Fallback",
                "Fallback",
                Map.of("propertyName", "Anaji Villa", "ownerName", "Kofi", "listingUrl", "https://findstay.gh/l/2"),
                "kofi@example.com",
                null));

        assertThat(notifA3).isNotEqualTo(notifA2);
        assertThat(emailAdapter.calls.get()).isEqualTo(callsBefore);
        assertThat(deliveries.findByNotificationId(notifA3)).isEmpty();
    }
}
