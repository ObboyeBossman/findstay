package com.findstay.verification.internal;

import com.findstay.verification.api.VerificationCaseStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "verification_case", schema = "verification")
class VerificationCase {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private VerificationCaseStatus status;

    @Column(name = "ghana_card_number_encrypted", nullable = false, columnDefinition = "bytea")
    private byte[] ghanaCardNumberEncrypted;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected VerificationCase() {
    }

    VerificationCase(
            UUID id,
            UUID organizationId,
            VerificationCaseStatus status,
            byte[] ghanaCardNumberEncrypted,
            Instant now
    ) {
        this.id = id;
        this.organizationId = organizationId;
        this.status = status;
        this.ghanaCardNumberEncrypted = ghanaCardNumberEncrypted.clone();
        this.submittedAt = now;
        this.createdAt = now;
        this.updatedAt = now;
    }

    UUID getId() {
        return id;
    }

    UUID getOrganizationId() {
        return organizationId;
    }

    VerificationCaseStatus getStatus() {
        return status;
    }

    byte[] getGhanaCardNumberEncrypted() {
        return ghanaCardNumberEncrypted.clone();
    }

    Instant getSubmittedAt() {
        return submittedAt;
    }

    Instant getDecidedAt() {
        return decidedAt;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    void resubmit(byte[] updatedEncryptedCard, Instant now) {
        if (updatedEncryptedCard != null) {
            this.ghanaCardNumberEncrypted = updatedEncryptedCard.clone();
        }
        this.status = VerificationCaseStatus.PENDING;
        this.submittedAt = now;
        this.decidedAt = null;
        this.updatedAt = now;
    }

    void markDecided(VerificationCaseStatus newStatus, Instant now) {
        this.status = newStatus;
        this.decidedAt = now;
        this.updatedAt = now;
    }
}
