package com.findstay.notification.internal;

public record SmsDispatchResult(
    boolean success,
    String providerMessageId,
    String error
) {
    public static SmsDispatchResult success(String messageId) {
        return new SmsDispatchResult(true, messageId, null);
    }

    public static SmsDispatchResult failure(String errorMessage) {
        return new SmsDispatchResult(false, null, errorMessage);
    }
}
