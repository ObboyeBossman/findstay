package com.findstay.notification.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, UUID> {

    List<NotificationDelivery> findByStatusAndNextRetryAtLessThanEqual(DeliveryStatus status, Instant now);

    List<NotificationDelivery> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);

    List<NotificationDelivery> findByStatus(DeliveryStatus status);
}
