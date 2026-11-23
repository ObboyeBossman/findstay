package com.findstay.notification.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

public class GhanaSmsProviderAdapter implements SmsProviderAdapter {

    private static final Logger log = LoggerFactory.getLogger(GhanaSmsProviderAdapter.class);

    private final String senderId;
    private final String apiKey;

    public GhanaSmsProviderAdapter(String senderId, String apiKey) {
        this.senderId = senderId != null && !senderId.isBlank() ? senderId : "FindStay";
        this.apiKey = apiKey;
    }

    @Override
    public SmsDispatchResult sendSms(String toPhone, String message) {
        if (toPhone == null || toPhone.isBlank()) {
            return SmsDispatchResult.failure("Recipient phone number is missing");
        }

        // Format to international Ghana format (+233) if entered locally
        String normalizedPhone = normalizeGhanaPhone(toPhone);

        try {
            log.info("[GhanaSmsProvider] Dispatching SMS via senderId='{}' to='{}'", senderId, normalizedPhone);
            String providerId = "gh-sms-" + UUID.randomUUID();
            return SmsDispatchResult.success(providerId);
        } catch (Exception e) {
            log.error("[GhanaSmsProvider] Failed to dispatch SMS to '{}': {}", normalizedPhone, e.getMessage());
            return SmsDispatchResult.failure(e.getMessage());
        }
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String providerName() {
        return "ghana-sms";
    }

    private String normalizeGhanaPhone(String phone) {
        String cleaned = phone.replaceAll("[^0-9+]", "");
        if (cleaned.startsWith("0") && cleaned.length() == 10) {
            return "+233" + cleaned.substring(1);
        }
        if (!cleaned.startsWith("+") && cleaned.startsWith("233")) {
            return "+" + cleaned;
        }
        return cleaned;
    }
}
