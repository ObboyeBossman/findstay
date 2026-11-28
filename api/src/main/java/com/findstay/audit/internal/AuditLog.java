package com.findstay.audit.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Append-only JPA mapping of {@code audit.audit_log} ({@code V1_10__audit.sql}, {@code S1-08-T2}).
 * Annotated {@link Immutable} so Hibernate never emits {@code UPDATE} statements; PostgreSQL
 * further enforces immutability via {@code findstay_app} grants ({@code V1_12}).
 */
@Entity
@Immutable
@Table(name = "audit_log", schema = "audit")
class AuditLog {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "actor_id", nullable = false, updatable = false)
    private UUID actorId;

    @Column(name = "org_id", updatable = false)
    private UUID orgId;

    @Column(name = "action", nullable = false, updatable = false, length = 64)
    private String action;

    @Column(name = "entity_type", nullable = false, updatable = false, length = 64)
    private String entityType;

    @Column(name = "entity_id", nullable = false, updatable = false, length = 64)
    private String entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata_json", nullable = false, updatable = false, columnDefinition = "jsonb")
    private Map<String, Object> metadataJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AuditLog() {
    }

    AuditLog(
            UUID id,
            UUID actorId,
            UUID orgId,
            String action,
            String entityType,
            String entityId,
            Map<String, Object> metadataJson,
            Instant createdAt
    ) {
        this.id = id;
        this.actorId = actorId;
        this.orgId = orgId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.metadataJson = metadataJson == null ? Map.of() : new LinkedHashMap<>(metadataJson);
        this.createdAt = createdAt;
    }

    UUID getId() {
        return id;
    }

    UUID getActorId() {
        return actorId;
    }

    UUID getOrgId() {
        return orgId;
    }

    String getAction() {
        return action;
    }

    String getEntityType() {
        return entityType;
    }

    String getEntityId() {
        return entityId;
    }

    Map<String, Object> getMetadataJson() {
        return metadataJson;
    }

    Instant getCreatedAt() {
        return createdAt;
    }
}
