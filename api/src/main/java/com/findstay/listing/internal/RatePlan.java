package com.findstay.listing.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rate_plan", schema = "listing")
class RatePlan {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "unit_id", nullable = false, updatable = false)
    private UUID unitId;

    @Column(name = "billing_period_id", nullable = false, updatable = false)
    private UUID billingPeriodId;

    @Column(name = "rate_pesewas", nullable = false)
    private long ratePesewas;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RatePlan() {
    }

    RatePlan(
            UUID id,
            UUID unitId,
            UUID billingPeriodId,
            long ratePesewas,
            Instant now
    ) {
        this.id = id;
        this.unitId = unitId;
        this.billingPeriodId = billingPeriodId;
        this.ratePesewas = ratePesewas;
        this.currency = "GHS";
        this.createdAt = now;
        this.updatedAt = now;
    }

    UUID getId() {
        return id;
    }

    UUID getUnitId() {
        return unitId;
    }

    UUID getBillingPeriodId() {
        return billingPeriodId;
    }

    long getRatePesewas() {
        return ratePesewas;
    }

    void updateRatePesewas(long ratePesewas, Instant now) {
        this.ratePesewas = ratePesewas;
        this.updatedAt = now;
    }

    String getCurrency() {
        return currency;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }
}
