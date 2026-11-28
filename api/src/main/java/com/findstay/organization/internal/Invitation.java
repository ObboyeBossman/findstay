package com.findstay.organization.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Pending, accepted, expired, or revoked staff invitation in {@code organization.invitation}
 * ({@code V1_05__organization.sql}, {@code S1-07-T4}). Only the SHA-256 hex digest of the
 * acceptance token is persisted; the raw token is returned once when created.
 */
@Entity
@Table(schema = "organization", name = "invitation")
class Invitation {

    static final String STATUS_PENDING = "PENDING";
    static final String STATUS_ACCEPTED = "ACCEPTED";
    static final String STATUS_EXPIRED = "EXPIRED";
    static final String STATUS_REVOKED = "REVOKED";
    static final String ROLE_STAFF = "STAFF";

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "email", nullable = false, updatable = false)
    private String email;

    @Column(name = "role", nullable = false, updatable = false)
    private String role;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "token_hash", nullable = false, updatable = false, length = 64, columnDefinition = "bpchar(64)")
    private String tokenHash;

    @Column(name = "invited_by_user_id", nullable = false, updatable = false)
    private UUID invitedByUserId;

    @Column(name = "expires_at", nullable = false, updatable = false)
    private Instant expiresAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "accepted_by_user_id")
    private UUID acceptedByUserId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Invitation() {
    }

    Invitation(
            UUID id,
            UUID organizationId,
            String email,
            String tokenHash,
            UUID invitedByUserId,
            Instant expiresAt,
            Instant createdAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.email = email;
        this.role = ROLE_STAFF;
        this.status = STATUS_PENDING;
        this.tokenHash = tokenHash;
        this.invitedByUserId = invitedByUserId;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    UUID getId() {
        return id;
    }

    UUID getOrganizationId() {
        return organizationId;
    }

    String getEmail() {
        return email;
    }

    String getRole() {
        return role;
    }

    String getStatus() {
        return status;
    }

    String getTokenHash() {
        return tokenHash;
    }

    UUID getInvitedByUserId() {
        return invitedByUserId;
    }

    Instant getExpiresAt() {
        return expiresAt;
    }

    Instant getAcceptedAt() {
        return acceptedAt;
    }

    UUID getAcceptedByUserId() {
        return acceptedByUserId;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    boolean isPending() {
        return STATUS_PENDING.equals(status);
    }

    void markExpired() {
        this.status = STATUS_EXPIRED;
    }

    void markRevoked() {
        this.status = STATUS_REVOKED;
    }

    void markAccepted(UUID userId, Instant now) {
        this.status = STATUS_ACCEPTED;
        this.acceptedByUserId = userId;
        this.acceptedAt = now;
    }
}
