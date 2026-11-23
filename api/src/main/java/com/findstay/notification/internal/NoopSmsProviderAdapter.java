package com.findstay.notification.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Disabled / No-op SMS adapter implementing the Settled Decision P-08 fallback.
 * When SMS sender-ID approval is pending or switched off via configuration,
 * this adapter ensures email and in-app alerts succeed cleanly without throwing errors.
 */
public class NoopSmsProviderAdapter implements SmsProviderAdapter {

    private static final Logger log = LoggerFactory.getLogger(NoopSmsProviderAdapter.class);

    @Override
    public SmsDispatchResult sendSms(String toPhone, String message) {
        log.info("[P-08 Fallback] SMS delivery disabled by configuration; skipping dispatch to '{}'", toPhone);
        return SmsDispatchResult.success("noop-p08-fallback");
    }

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public String providerName() {
        return "noop-fallback";
    }
}
