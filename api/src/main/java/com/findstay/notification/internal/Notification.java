package com.findstay.notification.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(schema = "notification", name = "notification")
class Notification {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "event_type", nullable = false, length = 64, updatable = false)
    private String eventType;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", columnDefinition = "jsonb")
    private Map<String, Object> data;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Notification() {
    }

    Notification(
            UUID id,
            UUID userId,
            String eventType,
            String title,
            String body,
            Map<String, Object> data,
            Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.eventType = eventType;
        this.title = title;
        this.body = body;
        this.data = data;
        this.createdAt = createdAt;
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

    String getTitle() {
        return title;
    }

    String getBody() {
        return body;
    }

    Map<String, Object> getData() {
        return data;
    }

    Instant getReadAt() {
        return readAt;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    void markRead(Instant now) {
        if (this.readAt == null) {
            this.readAt = now;
        }
    }
}
