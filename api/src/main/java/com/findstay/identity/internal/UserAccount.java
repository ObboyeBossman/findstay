package com.findstay.identity.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Local user account in {@code identity.user_account}.
 * {@code id} is the Supabase Auth user UUID ({@code DEC-S1-01/A}, {@code DEC-S1-04/B}).
 */
@Entity
@Table(name = "user_account", schema = "identity")
class UserAccount {

    static final String STATUS_ACTIVE = "ACTIVE";
    static final String STATUS_SUSPENDED = "SUSPENDED";

    @Id
    private UUID id;

    @Column(nullable = false)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(nullable = false)
    private String status;

    @Column(name = "suspended_at")
    private Instant suspendedAt;

    @Column(name = "suspension_reason")
    private String suspensionReason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserAccount() {
    }

    UserAccount(UUID id, String email, Role role, Instant now) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.status = STATUS_ACTIVE;
        this.createdAt = now;
        this.updatedAt = now;
    }

    UUID getId() {
        return id;
    }

    String getEmail() {
        return email;
    }

    Role getRole() {
        return role;
    }

    String getStatus() {
        return status;
    }

    boolean isSuspended() {
        return STATUS_SUSPENDED.equals(status);
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }
}
