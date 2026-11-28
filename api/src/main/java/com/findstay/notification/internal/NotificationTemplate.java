package com.findstay.notification.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "notification", name = "notification_template")
class NotificationTemplate {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Column(name = "channel", nullable = false, length = 16)
    private String channel;

    @Column(name = "title_template", nullable = false)
    private String titleTemplate;

    @Column(name = "body_template", nullable = false, columnDefinition = "text")
    private String bodyTemplate;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected NotificationTemplate() {
    }

    UUID getId() {
        return id;
    }

    String getEventType() {
        return eventType;
    }

    String getChannel() {
        return channel;
    }

    String getTitleTemplate() {
        return titleTemplate;
    }

    String getBodyTemplate() {
        return bodyTemplate;
    }

    boolean isActive() {
        return active;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }
}
