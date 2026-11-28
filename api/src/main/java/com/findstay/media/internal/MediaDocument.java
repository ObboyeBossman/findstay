package com.findstay.media.internal;

import com.findstay.media.api.MediaOwnerType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "document", schema = "media")
class MediaDocument {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_type", nullable = false, length = 32)
    private MediaOwnerType ownerType;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "media_asset_id", nullable = false)
    private UUID mediaAssetId;

    @Column(name = "storage_key", nullable = false, length = 512)
    private String storageKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected MediaDocument() {
    }

    MediaDocument(
            UUID id,
            MediaOwnerType ownerType,
            UUID ownerId,
            UUID mediaAssetId,
            String storageKey,
            Instant createdAt
    ) {
        this.id = id;
        this.ownerType = ownerType;
        this.ownerId = ownerId;
        this.mediaAssetId = mediaAssetId;
        this.storageKey = storageKey;
        this.createdAt = createdAt;
    }

    UUID getId() {
        return id;
    }

    MediaOwnerType getOwnerType() {
        return ownerType;
    }

    UUID getOwnerId() {
        return ownerId;
    }

    UUID getMediaAssetId() {
        return mediaAssetId;
    }

    String getStorageKey() {
        return storageKey;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    void updateStorageKey(String newStorageKey) {
        this.storageKey = newStorageKey;
    }
}
