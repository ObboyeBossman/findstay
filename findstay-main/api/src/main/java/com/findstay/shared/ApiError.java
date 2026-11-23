package com.findstay.shared;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/**
 * Standard API error response shape adhering to FindStay platform conventions.
 * Uses ISO-8601 UTC timestamps (TIMESTAMPTZ).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
    @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "UTC")
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> details
) {
    public ApiError(int status, String error, String message, String path) {
        this(Instant.now(), status, error, message, path, null);
    }
}
