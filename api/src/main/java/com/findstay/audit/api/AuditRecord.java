package com.findstay.audit.api;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Input payload for appending a permanent entry to {@code audit.audit_log} ({@code S1-08-T3}).
 *
 * @param actorId    mandatory user UUID who performed the action
 * @param orgId      optional organisation UUID ({@code null} for platform-wide or pre-org actions)
 * @param action     mandatory dot-delimited event code (e.g. {@code listing.approved}, {@code user.suspended})
 * @param entityType mandatory entity kind (e.g. {@code PROPERTY}, {@code USER}, {@code VERIFICATION_CASE})
 * @param entityId   mandatory entity identifier (typically UUID string or setting key)
 * @param metadata   optional structured context (reasons, old/new values, notes) stored as {@code jsonb}
 */
public record AuditRecord(
        UUID actorId,
        UUID orgId,
        String action,
        String entityType,
        String entityId,
        Map<String, Object> metadata
) {

    public AuditRecord {
        metadata = metadata == null
                ? Map.of()
                : Collections.unmodifiableMap(new LinkedHashMap<>(metadata));
    }

    /** Convenience factory attaching a human-readable {@code reason} into {@code metadata}. */
    public static AuditRecord withReason(
            UUID actorId,
            UUID orgId,
            String action,
            String entityType,
            String entityId,
            String reason
    ) {
        Map<String, Object> meta = new LinkedHashMap<>();
        if (reason != null && !reason.isBlank()) {
            meta.put("reason", reason.trim());
        }
        return new AuditRecord(actorId, orgId, action, entityType, entityId, meta);
    }
}
