package com.findstay.notification.internal;

import com.findstay.shared.Clock;
import com.findstay.shared.job.BackgroundJobs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Scheduled background processor that retries due failed notification deliveries
 * with exponential backoff up to the configured max-attempts limit.
 */
@Component
public class NotificationRetryProcessor {

    private static final Logger log = LoggerFactory.getLogger(NotificationRetryProcessor.class);
    private static final long INITIAL_BACKOFF_SECONDS = 60L; // 1 minute

    private final NotificationDeliveryRepository deliveryRepository;
    private final EmailProviderAdapter emailProviderAdapter;
    private final SmsProviderAdapter smsProviderAdapter;
    private final Clock clock;
    private final BackgroundJobs backgroundJobs;

    public NotificationRetryProcessor(
            NotificationDeliveryRepository deliveryRepository,
            EmailProviderAdapter emailProviderAdapter,
            SmsProviderAdapter smsProviderAdapter,
            Clock clock,
            BackgroundJobs backgroundJobs) {
        this.deliveryRepository = deliveryRepository;
        this.emailProviderAdapter = emailProviderAdapter;
        this.smsProviderAdapter = smsProviderAdapter;
        this.clock = clock;
        this.backgroundJobs = backgroundJobs;
    }

    @Scheduled(fixedDelayString = "${findstay.notification.retry.fixed-delay:60000}")
    public void scheduleRetrySweep() {
        backgroundJobs.run("notification-delivery-retry", this::processDueRetries);
    }

    @Transactional
    public int processDueRetries() {
        Instant now = clock.now();
        List<NotificationDelivery> dueDeliveries = deliveryRepository
                .findByStatusAndNextRetryAtLessThanEqual(DeliveryStatus.FAILED, now);

        if (dueDeliveries.isEmpty()) {
            return 0;
        }

        log.info("Processing {} due notification delivery retries", dueDeliveries.size());
        int processedCount = 0;

        for (NotificationDelivery delivery : dueDeliveries) {
            if (delivery.getAttempts() >= delivery.getMaxAttempts()) {
                log.warn("Delivery id={} reached maximum attempts ({}/{}); marking permanently exhausted",
                        delivery.getId(), delivery.getAttempts(), delivery.getMaxAttempts());
                delivery.setNextRetryAt(null);
                deliveryRepository.save(delivery);
                continue;
            }

            delivery.setAttempts(delivery.getAttempts() + 1);
            delivery.setLastAttemptAt(now);

            boolean success = false;
            String messageId = null;
            String error = null;

            if (delivery.getChannel() == DeliveryChannel.EMAIL) {
                EmailDispatchResult result = emailProviderAdapter.sendEmail(
                        delivery.getDestination(),
                        delivery.getSubject(),
                        delivery.getBody()
                );
                success = result.success();
                messageId = result.providerMessageId();
                error = result.error();
            } else if (delivery.getChannel() == DeliveryChannel.SMS) {
                SmsDispatchResult result = smsProviderAdapter.sendSms(
                        delivery.getDestination(),
                        delivery.getBody()
                );
                success = result.success();
                messageId = result.providerMessageId();
                error = result.error();
            }

            if (success) {
                log.info("Retry succeeded for delivery id={}, channel={}, messageId={}",
                        delivery.getId(), delivery.getChannel(), messageId);
                delivery.setStatus(DeliveryStatus.SENT);
                delivery.setProviderMessageId(messageId);
                delivery.setLastError(null);
                delivery.setNextRetryAt(null);
            } else {
                log.warn("Retry failed for delivery id={}, attempt {}/{}: {}",
                        delivery.getId(), delivery.getAttempts(), delivery.getMaxAttempts(), error);
                delivery.setLastError(error);
                if (delivery.getAttempts() < delivery.getMaxAttempts()) {
                    long delaySeconds = (long) Math.pow(2, delivery.getAttempts()) * INITIAL_BACKOFF_SECONDS;
                    delivery.setNextRetryAt(now.plusSeconds(delaySeconds));
                } else {
                    delivery.setNextRetryAt(null);
                }
            }

            deliveryRepository.save(delivery);
            processedCount++;
        }

        return processedCount;
    }
}
