package com.findstay.notification.internal;

/**
 * Swappable SPI interface for outbound email delivery (Resend, SMTP, Log/Dev).
 */
public interface EmailProviderAdapter {

    EmailDispatchResult sendEmail(String to, String subject, String body);

    String providerName();
}
