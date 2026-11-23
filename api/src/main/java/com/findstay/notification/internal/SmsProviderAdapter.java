package com.findstay.notification.internal;

/**
 * Swappable SPI interface for SMS alert delivery.
 * Supports Ghana +233 SMS providers and safe fallback when disabled (P-08).
 */
public interface SmsProviderAdapter {

    SmsDispatchResult sendSms(String toPhone, String message);

    boolean isEnabled();

    String providerName();
}
