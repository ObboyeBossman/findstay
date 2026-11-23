package com.findstay.notification.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

public class SmtpEmailProviderAdapter implements EmailProviderAdapter {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailProviderAdapter.class);

    private final String fromEmail;
    private final String host;
    private final int port;

    public SmtpEmailProviderAdapter(String fromEmail, String host, int port) {
        this.fromEmail = fromEmail != null ? fromEmail : "noreply@findstay.com";
        this.host = host;
        this.port = port;
    }

    @Override
    public EmailDispatchResult sendEmail(String to, String subject, String body) {
        try {
            log.info("[SmtpEmailProvider] Dispatching email via {}:{} from='{}' to='{}' subject='{}'",
                    host, port, fromEmail, to, subject);
            // Simulated / basic SMTP dispatch hook (expandable with JavaMail / Resend SMTP)
            String messageId = "smtp-" + UUID.randomUUID();
            return EmailDispatchResult.success(messageId);
        } catch (Exception e) {
            log.error("[SmtpEmailProvider] Failed to dispatch email to {}: {}", to, e.getMessage());
            return EmailDispatchResult.failure(e.getMessage());
        }
    }

    @Override
    public String providerName() {
        return "smtp";
    }
}
