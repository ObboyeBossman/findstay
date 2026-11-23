package com.findstay.notification.internal;

public record EmailDispatchResult(
    boolean success,
    String providerMessageId,
    String error
) {
    public static EmailDispatchResult success(String messageId) {
        return new EmailDispatchResult(true, messageId, null);
    }

    public static EmailDispatchResult failure(String errorMessage) {
        return new EmailDispatchResult(false, null, errorMessage);
    }
}
