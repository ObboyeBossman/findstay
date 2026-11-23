package com.findstay.notification.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {

    Optional<NotificationTemplate> findByEventTypeAndChannelAndActiveTrue(String eventType, String channel);

    List<NotificationTemplate> findByEventType(String eventType);

    List<NotificationTemplate> findByActiveTrue();
}
