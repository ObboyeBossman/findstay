package com.findstay.listing.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "property_photo", schema = "listing")
class PropertyPhoto {

    @EmbeddedId
    private PropertyPhotoId id;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "is_cover", nullable = false)
    private boolean cover;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PropertyPhoto() {
    }

    PropertyPhoto(UUID propertyId, UUID documentId, int position, boolean cover, Instant createdAt) {
        this.id = new PropertyPhotoId(propertyId, documentId);
        this.position = position;
        this.cover = cover;
        this.createdAt = createdAt;
    }

    UUID getPropertyId() {
        return id.getPropertyId();
    }

    UUID getDocumentId() {
        return id.getDocumentId();
    }

    int getPosition() {
        return position;
    }

    boolean isCover() {
        return cover;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    @Embeddable
    static class PropertyPhotoId implements Serializable {
        @Column(name = "property_id", nullable = false)
        private UUID propertyId;

        @Column(name = "document_id", nullable = false)
        private UUID documentId;

        protected PropertyPhotoId() {
        }

        PropertyPhotoId(UUID propertyId, UUID documentId) {
            this.propertyId = propertyId;
            this.documentId = documentId;
        }

        UUID getPropertyId() {
            return propertyId;
        }

        UUID getDocumentId() {
            return documentId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof PropertyPhotoId that)) return false;
            return Objects.equals(propertyId, that.propertyId) && Objects.equals(documentId, that.documentId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(propertyId, documentId);
        }
    }
}
