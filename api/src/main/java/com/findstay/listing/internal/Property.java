package com.findstay.listing.internal;

import com.findstay.listing.api.PropertyStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "property", schema = "listing")
class Property {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "accommodation_type_id", nullable = false)
    private UUID accommodationTypeId;

    @Column(name = "town", nullable = false)
    private String town;

    @Column(name = "area_id")
    private UUID areaId;

    @Column(name = "address")
    private String address;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "house_rules", columnDefinition = "text")
    private String houseRules;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private PropertyStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Property() {
    }

    Property(
            UUID id,
            UUID organizationId,
            String name,
            UUID accommodationTypeId,
            String town,
            Instant now
    ) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.accommodationTypeId = accommodationTypeId;
        this.town = town;
        this.status = PropertyStatus.DRAFT;
        this.createdAt = now;
        this.updatedAt = now;
    }

    UUID getId() {
        return id;
    }

    UUID getOrganizationId() {
        return organizationId;
    }

    String getName() {
        return name;
    }

    void setName(String name) {
        this.name = name;
    }

    String getDescription() {
        return description;
    }

    void setDescription(String description) {
        this.description = description;
    }

    UUID getAccommodationTypeId() {
        return accommodationTypeId;
    }

    void setAccommodationTypeId(UUID accommodationTypeId) {
        this.accommodationTypeId = accommodationTypeId;
    }

    String getTown() {
        return town;
    }

    void setTown(String town) {
        this.town = town;
    }

    UUID getAreaId() {
        return areaId;
    }

    void setAreaId(UUID areaId) {
        this.areaId = areaId;
    }

    String getAddress() {
        return address;
    }

    void setAddress(String address) {
        this.address = address;
    }

    BigDecimal getLatitude() {
        return latitude;
    }

    void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    BigDecimal getLongitude() {
        return longitude;
    }

    void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    String getHouseRules() {
        return houseRules;
    }

    void setHouseRules(String houseRules) {
        this.houseRules = houseRules;
    }

    PropertyStatus getStatus() {
        return status;
    }

    void setStatus(PropertyStatus status) {
        this.status = status;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
