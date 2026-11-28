package com.findstay.audit.api;

import java.time.Instant;
import java.util.UUID;

/**
 * Filter criteria for paginated {@code audit.audit_log} searches ({@code S1-08-T4}).
 */
public record AuditQuery(
        UUID actorId,
        UUID orgId,
        String action,
        String entityType,
        String entityId,
        Instant from,
        Instant to,
        int limit,
        int offset
) {
    public static final int DEFAULT_LIMIT = 25;
    public static final int MAX_LIMIT = 100;

    public AuditQuery {
        if (limit <= 0) {
            limit = DEFAULT_LIMIT;
        } else if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }
        if (offset < 0) {
            offset = 0;
        }
    }
}
