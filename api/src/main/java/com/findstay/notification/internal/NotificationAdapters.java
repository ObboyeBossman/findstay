package com.findstay.notification.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.UUID;

/**
 * Swappable email and SMS delivery adapters ({@code S1-10-T3}, {@code NFR-60}, {@code P-08}).
 * Providers can be swapped via {@code findstay.notifications.email.provider} and
 * {@code findstay.notifications.sms.provider} without touching calling modules.
 */
final class NotificationAdapters {

    private NotificationAdapters() {
    }

    interface EmailProviderAdapter {
        String providerName();

        /** Sends an email and returns the provider message ID, throwing on delivery failure. */
        String sendEmail(String toEmail, String subject, String body);
    }

    interface SmsProviderAdapter {
        String providerName();

        /** Sends an SMS and returns the provider message ID, throwing on delivery failure. */
        String sendSms(String toPhone, String body);
    }

    static class LogEmailProviderAdapter implements EmailProviderAdapter {
        private static final Logger log = LoggerFactory.getLogger(LogEmailProviderAdapter.class);

        @Override
        public String providerName() {
            return "log";
        }

        @Override
        public String sendEmail(String toEmail, String subject, String body) {
            String messageId = "log-email-" + UUID.randomUUID();
            log.info("Email dispatched via log adapter [id={}, to={}, subject={}]", messageId, toEmail, subject);
            return messageId;
        }
    }

    static class NoopSmsProviderAdapter implements SmsProviderAdapter {
        private static final Logger log = LoggerFactory.getLogger(NoopSmsProviderAdapter.class);

        @Override
        public String providerName() {
            return "noop";
        }

        @Override
        public String sendSms(String toPhone, String body) {
            String messageId = "noop-sms-" + UUID.randomUUID();
            log.info("SMS dispatched via noop fallback adapter [id={}, to={}]", messageId, toPhone);
            return messageId;
        }
    }

    static class GhanaSmsProviderAdapter implements SmsProviderAdapter {
        private static final Logger log = LoggerFactory.getLogger(GhanaSmsProviderAdapter.class);

        @Override
        public String providerName() {
            return "ghana";
        }

        @Override
        public String sendSms(String toPhone, String body) {
            if (toPhone == null || !toPhone.startsWith("+233")) {
                throw new IllegalArgumentException("Ghana SMS provider requires a +233 E.164 phone number");
            }
            String messageId = "ghana-sms-" + UUID.randomUUID();
            log.info("SMS dispatched via Ghana SMS adapter [id={}, to={}]", messageId, toPhone);
            return messageId;
        }
    }

    @Configuration
    static class NotificationAdapterConfig {

        @Bean
        @ConditionalOnMissingBean(EmailProviderAdapter.class)
        EmailProviderAdapter defaultEmailProviderAdapter() {
            return new LogEmailProviderAdapter();
        }

        @Bean
        @ConditionalOnProperty(name = "findstay.notifications.sms.provider", havingValue = "ghana")
        @ConditionalOnMissingBean(SmsProviderAdapter.class)
        SmsProviderAdapter ghanaSmsProviderAdapter() {
            return new GhanaSmsProviderAdapter();
        }

        @Bean
        @ConditionalOnMissingBean(SmsProviderAdapter.class)
        SmsProviderAdapter noopSmsProviderAdapter() {
            return new NoopSmsProviderAdapter();
        }
    }
}
