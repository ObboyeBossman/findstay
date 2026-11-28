package com.findstay.audit.api;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Immutable read view of one {@code audit.audit_log} record ({@code S1-08-T4}, {@code SCR-21C}).
 */
public record AuditEntryView(
        UUID id,
        UUID actorId,
        String actorName,
        UUID orgId,
        String action,
        String entityType,
        String entityId,
        Map<String, Object> metadata,
        Instant createdAt
) {
}
