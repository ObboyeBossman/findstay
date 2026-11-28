package com.findstay.availability.internal;

import com.findstay.availability.api.AvailabilityBlockReason;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA mapping of {@code availability.availability_block} ({@code V1_09__availability.sql}).
 * Non-overlapping half-open UTC intervals {@code [start_at, end_at)} per {@code unit_id} are
 * enforced by PostgreSQL's {@code btree_gist} exclusion constraint {@code availability_block_no_overlap}.
 */
@Entity
@Table(name = "availability_block", schema = "availability")
class AvailabilityBlock {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "unit_id", nullable = false, updatable = false)
    private UUID unitId;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 32)
    private AvailabilityBlockReason reason;

    @Column(name = "created_by_user_id", nullable = false, updatable = false)
    private UUID createdByUserId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AvailabilityBlock() {
    }

    AvailabilityBlock(
            UUID id,
            UUID unitId,
            Instant startAt,
            Instant endAt,
            AvailabilityBlockReason reason,
            UUID createdByUserId,
            Instant createdAt
    ) {
        this.id = id;
        this.unitId = unitId;
        this.startAt = startAt;
        this.endAt = endAt;
        this.reason = reason;
        this.createdByUserId = createdByUserId;
        this.createdAt = createdAt;
    }

    UUID getId() {
        return id;
    }

    UUID getUnitId() {
        return unitId;
    }

    Instant getStartAt() {
        return startAt;
    }

    Instant getEndAt() {
        return endAt;
    }

    AvailabilityBlockReason getReason() {
        return reason;
    }

    UUID getCreatedByUserId() {
        return createdByUserId;
    }

    Instant getCreatedAt() {
        return createdAt;
    }
}
