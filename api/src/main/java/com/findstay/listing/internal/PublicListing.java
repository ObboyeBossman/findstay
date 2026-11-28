package com.findstay.listing.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "listing", schema = "listing")
class PublicListing {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "property_id", nullable = false, unique = true, updatable = false)
    private UUID propertyId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "town", nullable = false)
    private String town;

    @Column(name = "area_name")
    private String areaName;

    @Column(name = "address")
    private String address;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "accommodation_type_code", nullable = false)
    private String accommodationTypeCode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "amenities", nullable = false, columnDefinition = "jsonb")
    private List<String> amenities;

    @Column(name = "house_rules", nullable = false, columnDefinition = "text")
    private String houseRules;

    @Column(name = "cover_photo_url", columnDefinition = "text")
    private String coverPhotoUrl;

    @Column(name = "from_price_pesewas", nullable = false)
    private long fromPricePesewas;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "owner_verified", nullable = false)
    private boolean ownerVerified;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected PublicListing() {
    }

    PublicListing(
            UUID id,
            UUID propertyId,
            String name,
            String description,
            String town,
            String areaName,
            String address,
            BigDecimal latitude,
            BigDecimal longitude,
            String accommodationTypeCode,
            List<String> amenities,
            String houseRules,
            String coverPhotoUrl,
            long fromPricePesewas,
            boolean ownerVerified,
            String status,
            Instant now
    ) {
        this.id = id;
        this.propertyId = propertyId;
        this.name = name;
        this.description = description;
        this.town = town;
        this.areaName = areaName;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.accommodationTypeCode = accommodationTypeCode;
        this.amenities = amenities;
        this.houseRules = houseRules;
        this.coverPhotoUrl = coverPhotoUrl;
        this.fromPricePesewas = fromPricePesewas;
        this.currency = "GHS";
        this.ownerVerified = ownerVerified;
        this.status = status;
        this.publishedAt = now;
        this.updatedAt = now;
    }

    void refresh(
            String name,
            String description,
            String town,
            String areaName,
            String address,
            BigDecimal latitude,
            BigDecimal longitude,
            String accommodationTypeCode,
            List<String> amenities,
            String houseRules,
            String coverPhotoUrl,
            long fromPricePesewas,
            boolean ownerVerified,
            String status,
            Instant now
    ) {
        this.name = name;
        this.description = description;
        this.town = town;
        this.areaName = areaName;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.accommodationTypeCode = accommodationTypeCode;
        this.amenities = amenities;
        this.houseRules = houseRules;
        this.coverPhotoUrl = coverPhotoUrl;
        this.fromPricePesewas = fromPricePesewas;
        this.ownerVerified = ownerVerified;
        this.status = status;
        this.updatedAt = now;
    }

    void updateStatus(String status, Instant now) {
        this.status = status;
        this.updatedAt = now;
    }

    UUID getId() {
        return id;
    }

    UUID getPropertyId() {
        return propertyId;
    }

    String getName() {
        return name;
    }

    String getDescription() {
        return description;
    }

    String getTown() {
        return town;
    }

    String getAreaName() {
        return areaName;
    }

    String getAddress() {
        return address;
    }

    BigDecimal getLatitude() {
        return latitude;
    }

    BigDecimal getLongitude() {
        return longitude;
    }

    String getAccommodationTypeCode() {
        return accommodationTypeCode;
    }

    List<String> getAmenities() {
        return amenities;
    }

    String getHouseRules() {
        return houseRules;
    }

    String getCoverPhotoUrl() {
        return coverPhotoUrl;
    }

    long getFromPricePesewas() {
        return fromPricePesewas;
    }

    String getCurrency() {
        return currency;
    }

    boolean isOwnerVerified() {
        return ownerVerified;
    }

    String getStatus() {
        return status;
    }

    Instant getPublishedAt() {
        return publishedAt;
    }
}
