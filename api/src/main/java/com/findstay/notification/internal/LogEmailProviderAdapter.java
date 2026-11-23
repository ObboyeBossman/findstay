package com.findstay.notification.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

public class LogEmailProviderAdapter implements EmailProviderAdapter {

    private static final Logger log = LoggerFactory.getLogger(LogEmailProviderAdapter.class);

    @Override
    public EmailDispatchResult sendEmail(String to, String subject, String body) {
        String messageId = "log-email-" + UUID.randomUUID();
        log.info("[LogEmailProvider] Outbound Email to='{}', subject='{}', messageId='{}'", to, subject, messageId);
        log.debug("[LogEmailProvider] Email Body: {}", body);
        return EmailDispatchResult.success(messageId);
    }

    @Override
    public String providerName() {
        return "log";
    }
}
