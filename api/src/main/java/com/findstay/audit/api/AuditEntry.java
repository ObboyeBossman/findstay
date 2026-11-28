package com.findstay.audit.api;

import java.util.Map;
import java.util.UUID;

public record AuditEntry(
        UUID actorId,
        UUID orgId,
        String action,
        String entityType,
        String entityId,
        Map<String, Object> metadata
) {
    public AuditEntry {
        if (actorId == null) {
            throw new IllegalArgumentException("actorId is mandatory");
        }
        if (action == null || action.isBlank() || action.length() > 64) {
            throw new IllegalArgumentException("action must be non-blank and at most 64 characters");
        }
        if (entityType == null || entityType.isBlank() || entityType.length() > 64) {
            throw new IllegalArgumentException("entityType must be non-blank and at most 64 characters");
        }
        if (entityId == null || entityId.isBlank() || entityId.length() > 64) {
            throw new IllegalArgumentException("entityId must be non-blank and at most 64 characters");
        }
        metadata = (metadata == null) ? Map.of() : Map.copyOf(metadata);
    }

    public static AuditEntry of(UUID actorId, String action, String entityType, String entityId) {
        return new AuditEntry(actorId, null, action, entityType, entityId, Map.of());
    }
}
