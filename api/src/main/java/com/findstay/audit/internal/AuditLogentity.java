package com.findstay.audit.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Immutable
@Table(name = "audit_log", schema = "audit")
class AuditLogEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "actor_id", nullable = false, updatable = false)
    private UUID actorId;

    @Column(name = "org_id", updatable = false)
    private UUID orgId;

    @Column(name = "action", nullable = false, length = 64, updatable = false)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 64, updatable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 64, updatable = false)
    private String entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata_json", nullable = false, columnDefinition = "jsonb", updatable = false)
    private Map<String, Object> metadataJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AuditLogEntity() {}

    AuditLogEntity(UUID id, UUID actorId, UUID orgId, String action,
                   String entityType, String entityId,
                   Map<String, Object> metadataJson, Instant createdAt) {
        this.id = id;
        this.actorId = actorId;
        this.orgId = orgId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.metadataJson = metadataJson;
        this.createdAt = createdAt;
    }

    // Getters only — no setters
    UUID getId() { return id; }
    UUID getActorId() { return actorId; }
    UUID getOrgId() { return orgId; }
    String getAction() { return action; }
    String getEntityType() { return entityType; }
    String getEntityId() { return entityId; }
    Map<String, Object> getMetadataJson() { return metadataJson; }
    Instant getCreatedAt() { return createdAt; }
}
