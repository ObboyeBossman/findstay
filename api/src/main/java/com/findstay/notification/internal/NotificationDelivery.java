package com.findstay.notification.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "notification", name = "notification_delivery")
class NotificationDelivery {

    static final String CHANNEL_EMAIL = "EMAIL";
    static final String CHANNEL_SMS = "SMS";
    static final String STATUS_QUEUED = "QUEUED";
    static final String STATUS_SENT = "SENT";
    static final String STATUS_FAILED = "FAILED";

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "notification_id", nullable = false, updatable = false)
    private UUID notificationId;

    @Column(name = "channel", nullable = false, length = 16, updatable = false)
    private String channel;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "attempts", nullable = false)
    private int attempts;

    @Column(name = "last_attempt_at")
    private Instant lastAttemptAt;

    @Column(name = "next_retry_at")
    private Instant nextRetryAt;

    @Column(name = "provider_message_id")
    private String providerMessageId;

    @Column(name = "last_error", columnDefinition = "text")
    private String lastError;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected NotificationDelivery() {
    }

    NotificationDelivery(UUID id, UUID notificationId, String channel, Instant now) {
        this.id = id;
        this.notificationId = notificationId;
        this.channel = channel;
        this.status = STATUS_QUEUED;
        this.attempts = 0;
        this.createdAt = now;
        this.updatedAt = now;
    }

    UUID getId() {
        return id;
    }

    UUID getNotificationId() {
        return notificationId;
    }

    String getChannel() {
        return channel;
    }

    String getStatus() {
        return status;
    }

    int getAttempts() {
        return attempts;
    }

    Instant getLastAttemptAt() {
        return lastAttemptAt;
    }

    Instant getNextRetryAt() {
        return nextRetryAt;
    }

    String getProviderMessageId() {
        return providerMessageId;
    }

    String getLastError() {
        return lastError;
    }

    void recordSuccess(String providerMessageId, Instant now) {
        this.attempts += 1;
        this.status = STATUS_SENT;
        this.lastAttemptAt = now;
        this.nextRetryAt = null;
        this.providerMessageId = providerMessageId;
        this.lastError = null;
        this.updatedAt = now;
    }

    void recordFailure(String errorMessage, Instant nextRetryAt, Instant now) {
        this.attempts += 1;
        this.status = STATUS_FAILED;
        this.lastAttemptAt = now;
        this.nextRetryAt = nextRetryAt;
        this.lastError = errorMessage;
        this.updatedAt = now;
    }
}
