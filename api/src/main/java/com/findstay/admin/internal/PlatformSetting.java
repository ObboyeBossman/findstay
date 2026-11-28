package com.findstay.admin.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA mapping of {@code admin.platform_setting} ({@code V1_03__lookup_tables.sql}, seeded by
 * {@code V1_13__seed_reference_lists.sql}). Extension Seam 7 — Settings &amp; Feature Flags.
 */
@Entity
@Table(name = "platform_setting", schema = "admin")
class PlatformSetting {

    @Id
    @Column(name = "key", nullable = false, updatable = false)
    private String key;

    @Column(name = "value", nullable = false, columnDefinition = "text")
    private String value;

    @Column(name = "description")
    private String description;

    @Column(name = "is_feature_flag", nullable = false)
    private boolean featureFlag;

    @Column(name = "updated_by_user_id")
    private UUID updatedByUserId;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected PlatformSetting() {
    }

    PlatformSetting(
            String key,
            String value,
            String description,
            boolean featureFlag,
            UUID updatedByUserId,
            Instant updatedAt
    ) {
        this.key = key;
        this.value = value;
        this.description = description;
        this.featureFlag = featureFlag;
        this.updatedByUserId = updatedByUserId;
        this.updatedAt = updatedAt;
    }

    String getKey() {
        return key;
    }

    String getValue() {
        return value;
    }

    String getDescription() {
        return description;
    }

    boolean isFeatureFlag() {
        return featureFlag;
    }

    UUID getUpdatedByUserId() {
        return updatedByUserId;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    void updateValue(String newValue, UUID actorUserId, Instant now) {
        this.value = newValue;
        this.updatedByUserId = actorUserId;
        this.updatedAt = now;
    }
}
