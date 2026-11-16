package com.findstay.shared.error;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * The one shape every error response has:
 *
 * <pre>
 * {
 *   "code": "VALIDATION_FAILED",
 *   "message": "Validation failed",
 *   "status": 400,
 *   "timestamp": "2026-11-15T21:17:00Z",
 *   "path": "/api/orders",
 *   "details": [ { "field": "amount", "message": "must be greater than 0" } ]
 * }
 * </pre>
 *
 * {@code timestamp} is UTC. {@code details} is omitted when empty.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(
        String code,
        String message,
        int status,
        Instant timestamp,
        String path,
        List<Detail> details) {

    public record Detail(String field, String message) {
    }

    public static ApiError of(ErrorCode code, int status, String message, Instant timestamp,
                              String path, List<Detail> details) {
        return new ApiError(code.name(), message, status, timestamp, path,
                details == null ? List.of() : List.copyOf(details));
    }
}
