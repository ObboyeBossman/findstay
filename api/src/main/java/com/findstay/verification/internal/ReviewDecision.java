package com.findstay.verification.internal;

import com.findstay.verification.api.ReviewDecisionType;
import com.findstay.verification.api.ReviewEntityKind;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "review_decision", schema = "verification")
class ReviewDecision {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_kind", nullable = false, length = 32)
    private ReviewEntityKind entityKind;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision", nullable = false, length = 32)
    private ReviewDecisionType decision;

    @Column(name = "reason", length = 1000)
    private String reason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "corrections", columnDefinition = "jsonb")
    private List<String> corrections;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rejected_document_types", columnDefinition = "jsonb")
    private List<String> rejectedDocumentTypes;

    @Column(name = "decided_by_user_id", nullable = false)
    private UUID decidedByUserId;

    @Column(name = "decided_at", nullable = false)
    private Instant decidedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ReviewDecision() {
    }

    ReviewDecision(
            UUID id,
            ReviewEntityKind entityKind,
            UUID entityId,
            ReviewDecisionType decision,
            String reason,
            List<String> corrections,
            List<String> rejectedDocumentTypes,
            UUID decidedByUserId,
            Instant now
    ) {
        this.id = id;
        this.entityKind = entityKind;
        this.entityId = entityId;
        this.decision = decision;
        this.reason = reason;
        this.corrections = corrections;
        this.rejectedDocumentTypes = rejectedDocumentTypes;
        this.decidedByUserId = decidedByUserId;
        this.decidedAt = now;
        this.createdAt = now;
    }

    UUID getId() {
        return id;
    }

    ReviewEntityKind getEntityKind() {
        return entityKind;
    }

    UUID getEntityId() {
        return entityId;
    }

    ReviewDecisionType getDecision() {
        return decision;
    }

    String getReason() {
        return reason;
    }

    List<String> getCorrections() {
        return corrections;
    }

    List<String> getRejectedDocumentTypes() {
        return rejectedDocumentTypes;
    }

    UUID getDecidedByUserId() {
        return decidedByUserId;
    }

    Instant getDecidedAt() {
        return decidedAt;
    }

    Instant getCreatedAt() {
        return createdAt;
    }
}
