package com.findstay.verification.internal;

import com.findstay.verification.api.VerificationDocumentStatus;
import com.findstay.verification.api.VerificationDocumentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "verification_document", schema = "verification")
class VerificationDocument {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "verification_case_id", nullable = false, updatable = false)
    private UUID verificationCaseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 32)
    private VerificationDocumentType documentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private VerificationDocumentStatus status;

    @Column(name = "fix_note", length = 1000)
    private String fixNote;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected VerificationDocument() {
    }

    VerificationDocument(
            UUID id,
            UUID verificationCaseId,
            VerificationDocumentType documentType,
            VerificationDocumentStatus status,
            Instant now
    ) {
        this.id = id;
        this.verificationCaseId = verificationCaseId;
        this.documentType = documentType;
        this.status = status;
        this.submittedAt = now;
        this.createdAt = now;
    }

    UUID getId() {
        return id;
    }

    UUID getVerificationCaseId() {
        return verificationCaseId;
    }

    VerificationDocumentType getDocumentType() {
        return documentType;
    }

    VerificationDocumentStatus getStatus() {
        return status;
    }

    String getFixNote() {
        return fixNote;
    }

    Instant getSubmittedAt() {
        return submittedAt;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    void markResubmitted(Instant now) {
        this.status = VerificationDocumentStatus.PENDING;
        this.fixNote = null;
        this.submittedAt = now;
    }

    void markApproved() {
        this.status = VerificationDocumentStatus.APPROVED;
        this.fixNote = null;
    }

    void markRejected(String note) {
        this.status = VerificationDocumentStatus.REJECTED;
        this.fixNote = note;
    }
}
