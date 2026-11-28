package com.findstay.notification.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, UUID> {

    List<NotificationDelivery> findByNotificationId(UUID notificationId);

    List<NotificationDelivery> findByStatusAndAttemptsLessThanAndNextRetryAtLessThanEqualOrderByNextRetryAtAsc(
            String status,
            int maxAttempts,
            Instant now);
}
