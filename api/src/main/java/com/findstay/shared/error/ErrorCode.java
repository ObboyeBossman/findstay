package com.findstay.shared.error;

/**
 * Stable, machine-readable error categories. Clients switch on {@code code}, never on the
 * human-readable message, so these names are part of the public API: add, don't rename.
 */
public enum ErrorCode {

    BAD_REQUEST(400),
    VALIDATION_FAILED(400),
    UNAUTHENTICATED(401),
    FORBIDDEN(403),
    NOT_FOUND(404),
    METHOD_NOT_ALLOWED(405),
    CONFLICT(409),
    UNSUPPORTED_MEDIA_TYPE(415),
    BUSINESS_RULE_VIOLATION(422),
    RATE_LIMITED(429),
    INTERNAL_ERROR(500);

    private final int httpStatus;

    ErrorCode(int httpStatus) {
        this.httpStatus = httpStatus;
    }

    public int httpStatus() {
        return httpStatus;
    }

    /** Picks the category for an HTTP status that came from the framework rather than our code. */
    public static ErrorCode forStatus(int status) {
        return switch (status) {
            case 400 -> VALIDATION_FAILED;
            case 401 -> UNAUTHENTICATED;
            case 403 -> FORBIDDEN;
            case 404 -> NOT_FOUND;
            case 405 -> METHOD_NOT_ALLOWED;
            case 409 -> CONFLICT;
            case 415 -> UNSUPPORTED_MEDIA_TYPE;
            case 422 -> BUSINESS_RULE_VIOLATION;
            case 429 -> RATE_LIMITED;
            default -> status >= 500 ? INTERNAL_ERROR : BAD_REQUEST;
        };
    }
}
