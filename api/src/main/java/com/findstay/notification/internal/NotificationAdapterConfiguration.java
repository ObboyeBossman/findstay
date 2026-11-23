package com.findstay.notification.internal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NotificationAdapterConfiguration {

    @Bean
    @ConditionalOnMissingBean(EmailProviderAdapter.class)
    public EmailProviderAdapter emailProviderAdapter(
            @Value("${findstay.notification.email.provider:log}") String provider,
            @Value("${findstay.notification.email.from:noreply@findstay.com}") String fromEmail,
            @Value("${findstay.notification.email.smtp-host:localhost}") String host,
            @Value("${findstay.notification.email.smtp-port:587}") int port) {
        if ("smtp".equalsIgnoreCase(provider) || "resend".equalsIgnoreCase(provider)) {
            return new SmtpEmailProviderAdapter(fromEmail, host, port);
        }
        return new LogEmailProviderAdapter();
    }

    @Bean
    @ConditionalOnMissingBean(SmsProviderAdapter.class)
    public SmsProviderAdapter smsProviderAdapter(
            @Value("${findstay.notification.sms.enabled:false}") boolean smsEnabled,
            @Value("${findstay.notification.sms.sender-id:FindStay}") String senderId,
            @Value("${findstay.notification.sms.api-key:}") String apiKey) {
        if (smsEnabled) {
            return new GhanaSmsProviderAdapter(senderId, apiKey);
        }
        // Settled Decision P-08: Default email-only fallback mode
        return new NoopSmsProviderAdapter();
    }
}
