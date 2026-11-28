package com.findstay.listing.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "property_amenity", schema = "listing")
class PropertyAmenity {

    @EmbeddedId
    private PropertyAmenityId id;

    protected PropertyAmenity() {
    }

    PropertyAmenity(UUID propertyId, UUID amenityId) {
        this.id = new PropertyAmenityId(propertyId, amenityId);
    }

    UUID getPropertyId() {
        return id.getPropertyId();
    }

    UUID getAmenityId() {
        return id.getAmenityId();
    }

    @Embeddable
    static class PropertyAmenityId implements Serializable {
        @Column(name = "property_id", nullable = false)
        private UUID propertyId;

        @Column(name = "amenity_id", nullable = false)
        private UUID amenityId;

        protected PropertyAmenityId() {
        }

        PropertyAmenityId(UUID propertyId, UUID amenityId) {
            this.propertyId = propertyId;
            this.amenityId = amenityId;
        }

        UUID getPropertyId() {
            return propertyId;
        }

        UUID getAmenityId() {
            return amenityId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof PropertyAmenityId that)) return false;
            return Objects.equals(propertyId, that.propertyId) && Objects.equals(amenityId, that.amenityId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(propertyId, amenityId);
        }
    }
}
