package com.findstay.organization.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "organization", name = "organization")
class Organization {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Organization() {
    }

    Organization(
            UUID id,
            String name,
            String displayName,
            String contactEmail,
            String contactPhone,
            String verificationStatus,
            Instant now) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.verificationStatus = verificationStatus;
        this.createdAt = now;
        this.updatedAt = now;
    }

    UUID getId() {
        return id;
    }

    String getName() {
        return name;
    }

    void setName(String name) {
        this.name = name;
    }

    String getDisplayName() {
        return displayName;
    }

    void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    String getContactEmail() {
        return contactEmail;
    }

    void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    String getContactPhone() {
        return contactPhone;
    }

    void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    String getVerificationStatus() {
        return verificationStatus;
    }

    void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
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
