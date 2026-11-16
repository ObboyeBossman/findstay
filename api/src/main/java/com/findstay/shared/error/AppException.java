package com.findstay.shared.error;

import java.util.List;

/**
 * Throw this from feature code to produce a standard error response. The message is shown to
 * the client, so write it for a person and never include secrets or internals.
 *
 * <pre>
 * throw AppException.notFound("Order", orderId);
 * throw AppException.businessRule("Wallet balance is too low for this transfer");
 * </pre>
 */
public class AppException extends RuntimeException {

    private final ErrorCode code;
    private final List<ApiError.Detail> details;

    public AppException(ErrorCode code, String message) {
        this(code, message, List.of());
    }

    public AppException(ErrorCode code, String message, List<ApiError.Detail> details) {
        super(message);
        this.code = code;
        this.details = List.copyOf(details);
    }

    public ErrorCode code() {
        return code;
    }

    public List<ApiError.Detail> details() {
        return details;
    }

    public static AppException notFound(String what, Object id) {
        return new AppException(ErrorCode.NOT_FOUND, what + " " + id + " was not found");
    }

    public static AppException validation(String message, List<ApiError.Detail> details) {
        return new AppException(ErrorCode.VALIDATION_FAILED, message, details);
    }

    public static AppException conflict(String message) {
        return new AppException(ErrorCode.CONFLICT, message);
    }

    public static AppException businessRule(String message) {
        return new AppException(ErrorCode.BUSINESS_RULE_VIOLATION, message);
    }

    public static AppException unauthenticated(String message) {
        return new AppException(ErrorCode.UNAUTHENTICATED, message);
    }

    public static AppException forbidden(String message) {
        return new AppException(ErrorCode.FORBIDDEN, message);
    }
}
