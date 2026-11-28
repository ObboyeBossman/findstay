package com.findstay.media.internal;

import com.findstay.media.api.MediaAssetStatus;
import com.findstay.media.api.MediaBucket;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "media_asset", schema = "media")
class MediaAsset {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "bucket", nullable = false, length = 32)
    private MediaBucket bucket;

    @Column(name = "storage_key", nullable = false, unique = true, length = 512)
    private String storageKey;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private MediaAssetStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    protected MediaAsset() {
    }

    MediaAsset(
            UUID id,
            UUID organizationId,
            MediaBucket bucket,
            String storageKey,
            String contentType,
            long sizeBytes,
            MediaAssetStatus status,
            Instant createdAt
    ) {
        this.id = id;
        this.organizationId = organizationId;
        this.bucket = bucket;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.status = status;
        this.createdAt = createdAt;
    }

    UUID getId() {
        return id;
    }

    UUID getOrganizationId() {
        return organizationId;
    }

    MediaBucket getBucket() {
        return bucket;
    }

    String getStorageKey() {
        return storageKey;
    }

    String getContentType() {
        return contentType;
    }

    long getSizeBytes() {
        return sizeBytes;
    }

    MediaAssetStatus getStatus() {
        return status;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUploadedAt() {
        return uploadedAt;
    }

    void markReady(Instant uploadedAt) {
        this.status = MediaAssetStatus.READY;
        if (this.uploadedAt == null) {
            this.uploadedAt = uploadedAt;
        }
    }

    void promoteKey(String publicKey, Instant promotedAt) {
        this.bucket = MediaBucket.PUBLIC_IMAGES;
        this.storageKey = publicKey;
        this.status = MediaAssetStatus.READY;
        if (this.uploadedAt == null) {
            this.uploadedAt = promotedAt;
        }
    }

    void markDeleted() {
        this.status = MediaAssetStatus.DELETED;
    }
}
