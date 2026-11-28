package com.findstay.notification.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "notification", name = "notification_preference")
class NotificationPreference {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "event_type", nullable = false, length = 64, updatable = false)
    private String eventType;

    @Column(name = "channel", nullable = false, length = 16, updatable = false)
    private String channel;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected NotificationPreference() {
    }

    NotificationPreference(UUID id, UUID userId, String eventType, String channel, boolean enabled, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.eventType = eventType;
        this.channel = channel;
        this.enabled = enabled;
        this.updatedAt = updatedAt;
    }

    UUID getId() {
        return id;
    }

    UUID getUserId() {
        return userId;
    }

    String getEventType() {
        return eventType;
    }

    String getChannel() {
        return channel;
    }

    boolean isEnabled() {
        return enabled;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    void setEnabled(boolean enabled, Instant now) {
        this.enabled = enabled;
        this.updatedAt = now;
    }
}
