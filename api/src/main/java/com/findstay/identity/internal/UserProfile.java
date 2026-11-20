package com.findstay.identity.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * 1:1 user profile in {@code identity.user_profile}.
 * {@code userId} matches {@link UserAccount#getId()}.
 */
@Entity
@Table(name = "user_profile", schema = "identity")
class UserProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "preferred_language", nullable = false, length = 16)
    private String preferredLanguage;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserProfile() {
    }

    UserProfile(UUID userId, String fullName, String phone, String preferredLanguage, Instant now) {
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
        this.preferredLanguage = preferredLanguage;
        this.updatedAt = now;
    }

    UUID getUserId() {
        return userId;
    }

    String getFullName() {
        return fullName;
    }

    void setFullName(String fullName) {
        this.fullName = fullName;
    }

    String getPhone() {
        return phone;
    }

    void setPhone(String phone) {
        this.phone = phone;
    }

    String getAvatarUrl() {
        return avatarUrl;
    }

    void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    String getPreferredLanguage() {
        return preferredLanguage;
    }

    void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
