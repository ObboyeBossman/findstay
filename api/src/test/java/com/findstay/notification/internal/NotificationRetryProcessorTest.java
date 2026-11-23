package com.findstay.notification.internal;

import com.findstay.shared.Clock;
import com.findstay.shared.Req;
import com.findstay.shared.job.BackgroundJobs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationRetryProcessorTest {

    @Mock
    private NotificationDeliveryRepository deliveryRepository;

    @Mock
    private EmailProviderAdapter emailProviderAdapter;

    @Mock
    private SmsProviderAdapter smsProviderAdapter;

    private final Clock clock = new Clock();
    private final BackgroundJobs backgroundJobs = new BackgroundJobs();

    private NotificationRetryProcessor retryProcessor;

    @BeforeEach
    void setUp() {
        retryProcessor = new NotificationRetryProcessor(
                deliveryRepository,
                emailProviderAdapter,
                smsProviderAdapter,
                clock,
                backgroundJobs
        );
    }

    @Test
    @Req("NFR-60")
    @DisplayName("Due FAILED email delivery is retried and marked SENT upon success")
    void retriesDueEmailDeliverySuccessfully() {
        Instant now = clock.now();
        NotificationDelivery delivery = new NotificationDelivery(
                UUID.randomUUID(),
                UUID.randomUUID(),
                DeliveryChannel.EMAIL,
                "owner@findstay.com",
                "Subject",
                "Body",
                3
        );
        delivery.setId(UUID.randomUUID());
        delivery.setStatus(DeliveryStatus.FAILED);
        delivery.setAttempts(1);
        delivery.setNextRetryAt(now.minusSeconds(10));

        when(deliveryRepository.findByStatusAndNextRetryAtLessThanEqual(eq(DeliveryStatus.FAILED), any(Instant.class)))
                .thenReturn(List.of(delivery));
        when(emailProviderAdapter.sendEmail(eq("owner@findstay.com"), eq("Subject"), eq("Body")))
                .thenReturn(EmailDispatchResult.success("retry-msg-id-123"));

        int processed = retryProcessor.processDueRetries();

        assertThat(processed).isEqualTo(1);
        assertThat(delivery.getStatus()).isEqualTo(DeliveryStatus.SENT);
        assertThat(delivery.getProviderMessageId()).isEqualTo("retry-msg-id-123");
        assertThat(delivery.getNextRetryAt()).isNull();
        assertThat(delivery.getAttempts()).isEqualTo(2);

        verify(deliveryRepository).save(delivery);
    }

    @Test
    @Req("NFR-60")
    @DisplayName("Continued failure increments attempts and calculates exponential backoff")
    void continuedFailureIncrementsAttemptsAndAppliesBackoff() {
        Instant now = clock.now();
        NotificationDelivery delivery = new NotificationDelivery(
                UUID.randomUUID(),
                UUID.randomUUID(),
                DeliveryChannel.EMAIL,
                "owner@findstay.com",
                "Subject",
                "Body",
                3
        );
        delivery.setId(UUID.randomUUID());
        delivery.setStatus(DeliveryStatus.FAILED);
        delivery.setAttempts(1);
        delivery.setNextRetryAt(now.minusSeconds(10));

        when(deliveryRepository.findByStatusAndNextRetryAtLessThanEqual(eq(DeliveryStatus.FAILED), any(Instant.class)))
                .thenReturn(List.of(delivery));
        when(emailProviderAdapter.sendEmail(eq("owner@findstay.com"), eq("Subject"), eq("Body")))
                .thenReturn(EmailDispatchResult.failure("Provider still down"));

        int processed = retryProcessor.processDueRetries();

        assertThat(processed).isEqualTo(1);
        assertThat(delivery.getStatus()).isEqualTo(DeliveryStatus.FAILED);
        assertThat(delivery.getAttempts()).isEqualTo(2);
        assertThat(delivery.getLastError()).isEqualTo("Provider still down");
        assertThat(delivery.getNextRetryAt()).isAfter(now);

        verify(deliveryRepository).save(delivery);
    }

    @Test
    @Req("NFR-60")
    @DisplayName("Deliveries that reached max attempts are marked permanent and not retried")
    void deliveryReachingMaxAttemptsStopsRetrying() {
        Instant now = clock.now();
        NotificationDelivery delivery = new NotificationDelivery(
                UUID.randomUUID(),
                UUID.randomUUID(),
                DeliveryChannel.EMAIL,
                "owner@findstay.com",
                "Subject",
                "Body",
                3
        );
        delivery.setId(UUID.randomUUID());
        delivery.setStatus(DeliveryStatus.FAILED);
        delivery.setAttempts(3); // already at maxAttempts
        delivery.setMaxAttempts(3);
        delivery.setNextRetryAt(now.minusSeconds(10));

        when(deliveryRepository.findByStatusAndNextRetryAtLessThanEqual(eq(DeliveryStatus.FAILED), any(Instant.class)))
                .thenReturn(List.of(delivery));

        int processed = retryProcessor.processDueRetries();

        assertThat(processed).isEqualTo(0);
        assertThat(delivery.getNextRetryAt()).isNull();

        verify(emailProviderAdapter, never()).sendEmail(anyString(), anyString(), anyString());
        verify(deliveryRepository).save(delivery);
    }
}
