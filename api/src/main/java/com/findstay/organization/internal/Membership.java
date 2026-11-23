package com.findstay.organization.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "organization", name = "membership")
class Membership {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "is_primary_owner", nullable = false)
    private boolean primaryOwner;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    protected Membership() {
    }

    Membership(
            UUID id,
            UUID organizationId,
            UUID userId,
            String role,
            boolean primaryOwner,
            Instant joinedAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.userId = userId;
        this.role = role;
        this.primaryOwner = primaryOwner;
        this.joinedAt = joinedAt;
    }

    UUID getId() {
        return id;
    }

    UUID getOrganizationId() {
        return organizationId;
    }

    UUID getUserId() {
        return userId;
    }

    String getRole() {
        return role;
    }

    boolean isPrimaryOwner() {
        return primaryOwner;
    }

    Instant getJoinedAt() {
        return joinedAt;
    }
}
